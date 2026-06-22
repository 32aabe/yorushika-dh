"""
Converts song_concept.xlsx + yoursika_word_network_outputs.xlsx into the
JSON data files consumed by the Next.js app.

Run: python3 scripts/build_songs.py
Outputs into src/data/
"""
import json
import re
import sys
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data"
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(Path(__file__).resolve().parent))

from translations import TITLES_EN, TITLES_KR, REP_LYRIC_EN, REP_LYRIC_KR  # noqa: E402
from word_glosses import WORD_GLOSSES  # noqa: E402
from motif_clusters import CLUSTER_DEFS, SONG_CLUSTER  # noqa: E402
from interview_excerpts import INTERVIEW_EXCERPTS  # noqa: E402

SONG_CONCEPT_XLSX = "/mnt/project/song_concept.xlsx"
WORD_NETWORK_XLSX = "/mnt/project/yoursika_word_network_outputs.xlsx"

# Korean color-name -> faded/washed hex, matched to the project's
# "rain gray / coffee brown / fountain pen blue / washed indigo" palette.
# Kept deliberately desaturated -- nothing should read as a pure primary.
COLOR_MAP = {
    "갈색": "#8C6A4F",        # coffee brown
    "검은색": "#3A3530",      # black paper (warm near-black, never pure #000)
    "남색": "#3E4C6B",        # indigo / navy
    "노란색": "#D9B65B",      # muted yellow, ochre-leaning
    "달빛색": "#C9C2A8",      # moonlight, pale warm gray
    "베이지": "#D8C8AE",      # beige
    "아이보리": "#EDE3CC",    # ivory / cream paper
    "연녹색": "#A8BD93",      # pale green
    "연두색": "#B7C9A0",      # light yellow-green
    "연분홍": "#E3BFB4",      # pale pink
    "연회색": "#C7C2B8",      # light warm gray
    "주황색": "#C97B4A",      # burnt orange
    "짙은 남색": "#2B3650",   # deep navy
    "청록색": "#5E8C82",      # teal
    "초록색": "#6F8F6A",      # green
    "푸른색": "#4A6B8A",      # fountain pen blue
    "흰색": "#F4EFE2",        # paper white (never pure white)
    "보라색": "#6E5A7A",      # dusk purple
    "빨간색": "#A4503F",      # muted red
    "주황빛": "#CC9466",      # orange light
    "회색": "#A8A296",        # gray
    "푸른빛": "#7E9CB0",      # blue light
}

INTERLUDE_TITLES = {"8/31", "7/13", "5/6", "4/10", "車窓", "湖の街", "森の教会", "海底、月明かり"}


def slugify(jp_title: str) -> str:
    """Stable, readable id from the JP title."""
    overrides = {
        "8/31": "0831",
        "7/13": "0713",
        "5/6": "0506",
        "4/10": "0410",
        "藍二乗": "ai-nijou",
        "八月、某、月明かり": "hachigatsu-nanika-tsukiakari",
        "詩書きとコーヒー": "shikaki-to-coffee",
        "踊ろうぜ": "odorou-ze",
        "六月は雨上がりの街を書く": "rokugatsu-amaagari",
        "五月は花緑青の窓辺から": "gogatsu-hanarokushou",
        "夜紛い": "yoru-magai",
        "パレード": "parade",
        "エルマ": "elma",
        "だから僕は音楽を辞めた": "dakara-boku-wa-ongaku-wo-yameta",
        "車窓": "shasou",
        "憂一乗": "yuu-ichijou",
        "夕凪、某、花惑い": "yuunagi-nanika-hanamadoi",
        "雨とカプチーノ": "ame-to-cappuccino",
        "湖の街": "mizuumi-no-machi",
        "神様のダンス": "kamisama-no-dance",
        "雨晴るる": "ame-haruru",
        "歩く": "aruku",
        "心に穴が空いた": "kokoro-ni-ana-ga-aita",
        "森の教会": "mori-no-kyoukai",
        "声": "koe",
        "エイミー": "amy",
        "海底、月明かり": "kaitei-tsukiakari",
        "ノーチラス": "nautilus",
    }
    return overrides.get(jp_title, re.sub(r"[^a-z0-9]+", "-", jp_title.lower()).strip("-"))


def nz(v):
    """None/NaN -> None, else value."""
    if v is None:
        return None
    if isinstance(v, float) and pd.isna(v):
        return None
    s = str(v).strip()
    return s if s and s.lower() != "nan" else None


def split_list(v):
    s = nz(v)
    if not s:
        return []
    return [x.strip() for x in re.split(r"[;,、]", s) if x.strip()]


def main():
    df = pd.read_excel(SONG_CONCEPT_XLSX)

    songs = []
    id_by_title = {}

    for _, row in df.iterrows():
        jp = nz(row["song_jp"])
        if not jp:
            continue
        sid = slugify(jp)
        id_by_title[jp] = sid

    for _, row in df.iterrows():
        jp = nz(row["song_jp"])
        if not jp:
            continue
        sid = id_by_title[jp]
        album_jp = nz(row["album"])
        is_interlude = jp in INTERLUDE_TITLES

        corresponding_jp = nz(row["corresponding_song"])
        corresponding_id = id_by_title.get(corresponding_jp) if corresponding_jp else None

        main_color_name = nz(row["main_color"])
        secondary_color_name = nz(row["secondary_color"])

        rep_jp = nz(row["representative_lyric"])

        song = {
            "id": sid,
            "album": "dakara" if album_jp == "だから僕は音楽を辞めた" else "elma",
            "trackNo": int(row["track_no"]),
            "isInterlude": is_interlude,
            "title": {
                "jp": jp,
                "kr": TITLES_KR.get(sid) or nz(row["song_kr"]) or jp,
                "en": TITLES_EN.get(sid) or jp,
            },
            "correspondingSongId": corresponding_id,
            "motifCluster": SONG_CLUSTER.get(sid),
            "color": {
                "main": COLOR_MAP.get(main_color_name, "#C7C2B8"),
                "mainName": main_color_name,
                "secondary": COLOR_MAP.get(secondary_color_name, "#EDE3CC") if secondary_color_name else None,
                "secondaryName": secondary_color_name,
            },
            "mainObject": nz(row["main_object"]),
            "secondaryObjects": split_list(row["secondary_objects"]),
            "mood": nz(row["main_mood"]),
            "movementFeeling": nz(row["movement_feeling"]),
            "weather": nz(row["weather"]),
            "lighting": nz(row["lighting"]),
            "paperCondition": nz(row["paper_condition"]),
            "waterMotif": nz(row["water_motif"]),
            "keywords": split_list(row["main_keywords"]),
            "representativeLyric": {
                "jp": rep_jp,
                "en": REP_LYRIC_EN.get(sid),
                "kr": REP_LYRIC_KR.get(sid),
            },
            "mvSceneNotes": nz(row["mv_scene_notes"]),
            "hiddenObjectNotes": nz(row["hidden_object_notes"]),
            # filled in later from lyrics workbook / by hand
            "summary": {"jp": None, "en": None, "kr": None},
            "description": {"jp": None, "en": None, "kr": None},
            "interviewExcerpts": INTERVIEW_EXCERPTS.get(sid, []),
            "youtubeUrl": None,
            "youtubeMusicUrl": None,
            "mvThumbnail": None,  # asset slot, filled later
            "postcardImage": None,  # asset slot, filled later
        }
        songs.append(song)

    songs.sort(key=lambda s: (s["album"], s["trackNo"]))

    with open(OUT / "songs.json", "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(songs)} songs -> {OUT/'songs.json'}")

    # ---- Word network data ----
    xl = pd.ExcelFile(WORD_NETWORK_XLSX)

    lyrics_df = xl.parse("parsed_song_lyrics")
    lyrics_by_title = {}
    for _, r in lyrics_df.iterrows():
        title = nz(r["song"])
        if title:
            lyrics_by_title[title] = nz(r["lyrics"])

    # attach full lyrics onto songs where available, write a separate file
    # (kept separate from songs.json so songs.json stays light for list views)
    # NOTE: only the Japanese original is transcribed from the source lyrics.
    # en/kr are left null placeholders -- translating full lyrics is a
    # separate, deliberate editorial task, not something to fabricate here.
    lyrics_out = {}
    for jp, sid in id_by_title.items():
        if jp in lyrics_by_title:
            lyrics_out[sid] = {"jp": lyrics_by_title[jp], "en": None, "kr": None}
    with open(OUT / "lyrics.json", "w", encoding="utf-8") as f:
        json.dump(lyrics_out, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(lyrics_out)} lyrics -> {OUT/'lyrics.json'}")

    # selected_song_words -> per-song bridge/signature word list for the map
    sel_df = xl.parse("selected_song_words")
    song_words = {}
    for _, r in sel_df.iterrows():
        title = nz(r["song"])
        sid = id_by_title.get(title)
        if not sid:
            continue
        song_words.setdefault(sid, []).append({
            "word": nz(r["word"]),
            "role": nz(r["role"]),  # "bridge" | "signature"
            "roleRank": int(r["role_rank"]) if not pd.isna(r["role_rank"]) else None,
            "frequencyInSong": int(r["frequency_in_song"]) if not pd.isna(r["frequency_in_song"]) else 0,
            "sharedSongCount": int(r["shared_song_count"]) if not pd.isna(r["shared_song_count"]) else 0,
        })
    with open(OUT / "song-words.json", "w", encoding="utf-8") as f:
        json.dump(song_words, f, ensure_ascii=False, indent=2)
    print(f"Wrote song-words for {len(song_words)} songs -> {OUT/'song-words.json'}")

    # song_song_edges_display -> for drawing ink connection lines between postcards
    sse_df = xl.parse("song_song_edges_display")
    song_edges = []
    for _, r in sse_df.iterrows():
        s_id = id_by_title.get(nz(r["source"]))
        t_id = id_by_title.get(nz(r["target"]))
        if not s_id or not t_id:
            continue
        song_edges.append({
            "source": s_id,
            "target": t_id,
            "sharedWordCount": int(r["shared_word_count"]),
            "sharedWords": split_list(r["shared_words"]),
            "weight": int(r["weight"]),
            "featured": False,
        })

    # Curate a small "featured" subset for the default board view: each
    # song's single strongest connection (by weight, tie-broken by shared
    # word count). This keeps the board legible -- a mind-map of a few
    # deliberate threads -- while every edge stays available once a song
    # is selected.
    best_for_song: dict[str, int] = {}
    for i, e in enumerate(song_edges):
        for sid in (e["source"], e["target"]):
            cur = best_for_song.get(sid)
            if cur is None:
                best_for_song[sid] = i
            else:
                cur_e = song_edges[cur]
                if (e["weight"], e["sharedWordCount"]) > (cur_e["weight"], cur_e["sharedWordCount"]):
                    best_for_song[sid] = i
    for i in set(best_for_song.values()):
        song_edges[i]["featured"] = True

    with open(OUT / "song-edges.json", "w", encoding="utf-8") as f:
        json.dump(song_edges, f, ensure_ascii=False, indent=2)
    featured_count = sum(1 for e in song_edges if e["featured"])
    print(f"Wrote {len(song_edges)} song-song edges ({featured_count} featured) -> {OUT/'song-edges.json'}")

    # word_word_edges -> optional secondary word-to-word graph (kept for future "word view")
    wwe_df = xl.parse("word_word_edges")
    word_edges = []
    for _, r in wwe_df.iterrows():
        word_edges.append({
            "source": nz(r["source"]),
            "target": nz(r["target"]),
            "sharedSongCount": int(r["shared_song_count"]),
            "sharedSongs": [id_by_title.get(t, t) for t in split_list(r["shared_songs"])],
            "weight": int(r["weight"]),
        })
    with open(OUT / "word-edges.json", "w", encoding="utf-8") as f:
        json.dump(word_edges, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(word_edges)} word-word edges -> {OUT/'word-edges.json'}")

    # word glosses: short EN/KR gloss per JP network word
    with open(OUT / "word-glosses.json", "w", encoding="utf-8") as f:
        json.dump(WORD_GLOSSES, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(WORD_GLOSSES)} word glosses -> {OUT/'word-glosses.json'}")

    # motif cluster definitions (labels + board center points)
    clusters_out = [{"id": cid, **d} for cid, d in CLUSTER_DEFS.items()]
    with open(OUT / "motif-clusters.json", "w", encoding="utf-8") as f:
        json.dump(clusters_out, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(clusters_out)} motif clusters -> {OUT/'motif-clusters.json'}")

    # id map, handy for debugging / future scripts
    with open(OUT / "_id-map.json", "w", encoding="utf-8") as f:
        json.dump(id_by_title, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
