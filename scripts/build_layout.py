"""
Generates a fixed, reproducible force-directed-style layout for the
Connections board, now structured as a true song-word bipartite network
(closer to the Palladio reference): word nodes are hubs, song postcards
gather around the words they share, and there are no song-to-song edges
at all -- a song connects only to its own words, and two songs appear
near each other only because they happen to share gravitational pull
toward the same word hubs.

This intentionally does NOT use a real physics library (networkx/etc
aren't worth the dependency for a one-time static layout) -- a small
hand-rolled Fruchterman-Reingold-style spring embedder is enough, and
being hand-rolled keeps the output 100% reproducible across machines/
Python versions, which matters since this layout is committed as data.

Run: python3 scripts/build_layout.py
Outputs: src/data/map-layout.json
"""
import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data"

random.seed(7)

songs = json.load(open(OUT / "songs.json", encoding="utf-8"))
song_words = json.load(open(OUT / "song-words.json", encoding="utf-8"))

network_songs = [s for s in songs if not s["isInterlude"]]
interlude_songs = [s for s in songs if s["isInterlude"]]

# ---- build the bipartite node/edge set -----------------------------------

# word -> stats
word_song_ids: dict[str, set[str]] = {}
word_freq: dict[str, int] = {}
for sid, entries in song_words.items():
    for e in entries:
        word_song_ids.setdefault(e["word"], set()).add(sid)
        word_freq[e["word"]] = word_freq.get(e["word"], 0) + e["frequencyInSong"]

words = sorted(word_song_ids.keys())
word_degree = {w: len(word_song_ids[w]) for w in words}

# Node ids: songs keep their existing id; words are prefixed so the two
# id spaces never collide.
def word_node_id(word: str) -> str:
    return f"w:{word}"

nodes: list[str] = [s["id"] for s in network_songs] + [word_node_id(w) for w in words]
node_index = {nid: i for i, nid in enumerate(nodes)}

edges: list[tuple[str, str]] = []
for sid, entries in song_words.items():
    for e in entries:
        edges.append((sid, word_node_id(e["word"])))

# ---- spring embedder (Fruchterman-Reingold, fixed iteration count) -------

CANVAS_W = 5200
CANVAS_H = 3700
AREA = CANVAS_W * CANVAS_H
N = len(nodes)
K = math.sqrt(AREA / max(N, 1)) * 0.6  # ideal edge length

pos = {nid: [random.uniform(CANVAS_W * 0.35, CANVAS_W * 0.65), random.uniform(CANVAS_H * 0.35, CANVAS_H * 0.65)] for nid in nodes}

# Minimum center-to-center distance each node type needs so its rendered
# shape doesn't overlap a neighbor's. Postcards are the biggest visual
# footprint (188x~150px at native scale) so they get the largest personal
# space; word circles scale with degree, approximated by their eventual
# rendered radius (see WordNode.tsx's own radius formula, mirrored here).
SONG_RADIUS = 165


def word_radius(degree: int) -> float:
    # Mirrors WordNode.tsx's font-size curve so collision-avoidance uses
    # the word's actual rendered text footprint, not an arbitrary circle.
    font_size = min(84, 15 + (degree ** 0.85) * 7.6)
    # Words are 1-3 JP/EN characters wide on average; approximate the
    # half-width of the rendered label (not just its height) since word
    # nodes are now plain text with no padding circle around them.
    return font_size * 0.9


ITERATIONS = 500
temp = K * 1.2

for it in range(ITERATIONS):
    disp = {nid: [0.0, 0.0] for nid in nodes}

    # repulsive force between every pair: standard FR repulsion, k^2/d,
    # PLUS an explicit hard collision push once two nodes' visual
    # footprints would actually overlap -- this is what keeps postcards
    # from sitting on top of each other regardless of how the spring
    # forces alone would have settled.
    for i in range(N):
        for j in range(i + 1, N):
            a, b = nodes[i], nodes[j]
            dx = pos[a][0] - pos[b][0]
            dy = pos[a][1] - pos[b][1]
            dist = math.sqrt(dx * dx + dy * dy) or 0.01
            ux, uy = dx / dist, dy / dist

            force = (K * K) / dist
            disp[a][0] += ux * force
            disp[a][1] += uy * force
            disp[b][0] -= ux * force
            disp[b][1] -= uy * force

            a_r = SONG_RADIUS if not a.startswith("w:") else word_radius(word_degree[a[2:]])
            b_r = SONG_RADIUS if not b.startswith("w:") else word_radius(word_degree[b[2:]])
            min_dist = a_r + b_r
            if dist < min_dist:
                push = (min_dist - dist) * 0.5
                disp[a][0] += ux * push
                disp[a][1] += uy * push
                disp[b][0] -= ux * push
                disp[b][1] -= uy * push

    # attractive force along edges: standard FR attraction, d^2/k, but the
    # target rest-length grows with a word's degree so high-degree hubs
    # (e.g. "君" with 19 songs) naturally claim more surrounding space
    # instead of every song collapsing onto the exact same point.
    for sid, wid in edges:
        dx = pos[sid][0] - pos[wid][0]
        dy = pos[sid][1] - pos[wid][1]
        dist = math.sqrt(dx * dx + dy * dy) or 0.01
        degree = word_degree[wid[2:]]
        rest_k = K * (0.7 + 0.16 * math.sqrt(degree))
        force = (dist * dist) / rest_k * 1.4
        ux, uy = dx / dist, dy / dist
        disp[sid][0] -= ux * force
        disp[sid][1] -= uy * force
        disp[wid][0] += ux * force
        disp[wid][1] += uy * force

    # apply displacement, capped by current temperature, cool down linearly
    for nid in nodes:
        dx, dy = disp[nid]
        dlen = math.sqrt(dx * dx + dy * dy) or 0.01
        capped = min(dlen, temp)
        pos[nid][0] += (dx / dlen) * capped
        pos[nid][1] += (dy / dlen) * capped
        # soft margin: nodes can approach the edge but not sit flush on it
        pos[nid][0] = max(260, min(CANVAS_W - 260, pos[nid][0]))
        pos[nid][1] = max(240, min(CANVAS_H - 240, pos[nid][1]))

    temp *= 0.985

# ---- final collision-only relaxation pass ---------------------------------
# A handful of extra passes with ONLY the hard-collision push (no springs,
# no generic repulsion) to clean up any remaining overlap after the main
# simulated-annealing loop has otherwise settled and cooled.
for _ in range(120):
    disp = {nid: [0.0, 0.0] for nid in nodes}
    for i in range(N):
        for j in range(i + 1, N):
            a, b = nodes[i], nodes[j]
            dx = pos[a][0] - pos[b][0]
            dy = pos[a][1] - pos[b][1]
            dist = math.sqrt(dx * dx + dy * dy) or 0.01
            a_r = SONG_RADIUS if not a.startswith("w:") else word_radius(word_degree[a[2:]])
            b_r = SONG_RADIUS if not b.startswith("w:") else word_radius(word_degree[b[2:]])
            min_dist = a_r + b_r
            if dist < min_dist:
                ux, uy = dx / dist, dy / dist
                push = (min_dist - dist) * 0.5
                disp[a][0] += ux * push
                disp[a][1] += uy * push
                disp[b][0] -= ux * push
                disp[b][1] -= uy * push
    moved = False
    for nid in nodes:
        dx, dy = disp[nid]
        if dx or dy:
            moved = True
        pos[nid][0] = max(260, min(CANVAS_W - 260, pos[nid][0] + dx))
        pos[nid][1] = max(240, min(CANVAS_H - 240, pos[nid][1] + dy))
    if not moved:
        break

# ---- interlude "paper scrap" songs: scattered loosely along the edges ----
# They have no word edges, so they'd otherwise sit wherever random init
# left them. Spread them deliberately around the outer margin instead,
# like scraps tucked at the border of the notebook page.
interlude_positions: dict[str, dict] = {}
n_int = len(interlude_songs)
for i, s in enumerate(interlude_songs):
    angle = (2 * math.pi * i) / max(n_int, 1) + 0.4
    rx, ry = CANVAS_W * 0.46, CANVAS_H * 0.46
    cx, cy = CANVAS_W / 2, CANVAS_H / 2
    x = cx + math.cos(angle) * rx
    y = cy + math.sin(angle) * ry
    interlude_positions[s["id"]] = {
        "x": round(x),
        "y": round(y),
        "rotation": round(random.uniform(-8, 8), 1),
    }

# ---- assemble output -------------------------------------------------------

song_positions = {}
for s in network_songs:
    p = pos[s["id"]]
    song_positions[s["id"]] = {
        "x": round(p[0]),
        "y": round(p[1]),
        "rotation": round(random.uniform(-6, 6), 1),
    }

word_positions = {}
for w in words:
    p = pos[word_node_id(w)]
    word_positions[w] = {
        "x": round(p[0]),
        "y": round(p[1]),
        "degree": word_degree[w],
        "frequency": word_freq[w],
    }

layout = {
    "canvasWidth": CANVAS_W,
    "canvasHeight": CANVAS_H,
    "songPositions": song_positions,
    "wordPositions": word_positions,
    "interludePositions": interlude_positions,
}

with open(OUT / "map-layout.json", "w", encoding="utf-8") as f:
    json.dump(layout, f, ensure_ascii=False, indent=2)

print(
    f"Wrote bipartite layout: {len(song_positions)} songs, {len(word_positions)} words, "
    f"{len(interlude_positions)} interludes -> {OUT / 'map-layout.json'}"
)
