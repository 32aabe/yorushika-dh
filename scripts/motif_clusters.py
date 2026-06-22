# -*- coding: utf-8 -*-
"""
Six motif clusters used to lay out the Connections board, in place of the
old "two album columns" arrangement. Every non-interlude song is assigned
to exactly one primary cluster based on its mood / water-motif / keyword
metadata from song_concept.xlsx, read alongside its lyrics.

Cluster centers are board-canvas coordinates (canvas is CANVAS_W x CANVAS_H,
defined in build_layout.py) that song positions scatter around.
"""

CLUSTER_DEFS = {
    "rain-water": {
        "label": {"jp": "雨と水", "en": "Rain & Water", "kr": "비와 물"},
        "color": "#5E7C99",
        "center": {"x": 480, "y": 380},
    },
    "writing-words": {
        "label": {"jp": "言葉と詩", "en": "Writing & Words", "kr": "글과 말"},
        "color": "#8C6A4F",
        "center": {"x": 1480, "y": 250},
    },
    "memory-loss": {
        "label": {"jp": "記憶と喪失", "en": "Memory & Loss", "kr": "기억과 상실"},
        "color": "#6E5A7A",
        "center": {"x": 2380, "y": 470},
    },
    "city-travel": {
        "label": {"jp": "街と旅", "en": "City & Travel", "kr": "거리와 여행"},
        "color": "#A8783F",
        "center": {"x": 340, "y": 1380},
    },
    "amy-elma": {
        "label": {"jp": "エイミーとエルマ", "en": "Amy & Elma", "kr": "에이미와 엘마"},
        "color": "#A4503F",
        "center": {"x": 1380, "y": 1500},
    },
    "music-silence": {
        "label": {"jp": "音楽と沈黙", "en": "Music & Silence", "kr": "음악과 침묵"},
        "color": "#4A6B5E",
        "center": {"x": 2400, "y": 1380},
    },
}

# song id -> cluster id, for every networked (non-interlude) song.
SONG_CLUSTER = {
    # rain / water
    "rokugatsu-amaagari": "rain-water",
    "ame-to-cappuccino": "rain-water",
    "ame-haruru": "rain-water",
    # writing / words
    "shikaki-to-coffee": "writing-words",
    "gogatsu-hanarokushou": "writing-words",
    "koe": "writing-words",
    # memory / loss
    "hachigatsu-nanika-tsukiakari": "memory-loss",
    "yoru-magai": "memory-loss",
    "kokoro-ni-ana-ga-aita": "memory-loss",
    "parade": "memory-loss",
    # city / travel
    "yuu-ichijou": "city-travel",
    "yuunagi-nanika-hanamadoi": "city-travel",
    "aruku": "city-travel",
    # amy / elma
    "elma": "amy-elma",
    "amy": "amy-elma",
    "ai-nijou": "amy-elma",
    "nautilus": "amy-elma",
    # music / silence
    "odorou-ze": "music-silence",
    "dakara-boku-wa-ongaku-wo-yameta": "music-silence",
    "kamisama-no-dance": "music-silence",
}
