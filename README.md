# Leonida Legend — GTA VI Trophy Guide & Tracker

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Apizairdrop/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Apizairdrop/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden until earned). Entry for the [make.fun competition `gta6-trophy-guide-01`](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

An offline static web app under `app/` — open `app/index.html` in desktop Chrome with the network off and it just works. It loads nothing from outside: no fonts, scripts, images or requests beyond its own files.

- **Tracker:** a checklist of all 55 trophies with their official name, description and grade exactly as PlayStation publishes them. Progress saves in localStorage, and can be exported to a JSON file and imported back.
- **Guides:** every trophy has a guide written in our own words, naming its sources beside the guide (Exophase / PSNProfiles for the official list, Planet GTA 6, Output Lag, GTA Vice City Hub and PowerPyx for method and warnings). Where no method is confirmed at launch, the guide says so plainly instead of inventing steps.
- **Roadmap to the platinum:** an 8-stage plan (~200 hours) built from the official descriptions — story first with a manual save per chapter, then collectibles, then activities and the long grinds, ending with 100% completion.
- **Missables:** 30 trophies flagged missable, with their own view. The game has no mission replay and no New Game Plus, so the guide's one rule is: keep a manual save at the start of every chapter and one before the final mission. The worst missable is Positive Mental Attitude — Lucia's balcony meditation spot in Chapter 1 disappears after that chapter.
- **Filters & spoiler setting:** filter by kind (story, missable, collectibles, activities, online — the official list has no online trophies), by grade, by earned/not-earned, plus text search. The spoiler setting hides the names and descriptions of story trophies until they are earned. Search matches trophy names, descriptions and guide text.
- **Own look:** a dark Vice City neon/sunset theme. No Rockstar logo, official artwork, box art or game screenshots anywhere.

## How to run it

Serve `app/` with any static server, for example:

```sh
node serve.ts
# then open http://localhost:8080
```

Or `python3 -m http.server` inside `app/`. `main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Exophase / PSNProfiles — the official PS5 trophy list (names, descriptions, grades, hidden flags, counts), reported 2026-11-18 and cross-checked with TrueAchievements.
- Planet GTA 6 — GTA 6 trophies: all 55 trophies and Xbox achievements (https://www.planetgta6.com/en/gta-6-trophies/).
- Output Lag — GTA 6 trophy list guide (https://outputlag.com/guides/gta-6-trophy-list/): no mission replay, the Chapter 1 meditation warning, ~200-hour platinum estimate.
- GTA Vice City Hub — GTA 6 achievements (https://www.gtavicecityhub.com/achievements).
- PowerPyx — cheats disable trophies and saving.

## Files

- `app/index.html` — the guide's page: tracker, roadmap, missables and sources views.
- `app/app.js` — checklist, localStorage, export/import, filters, search, spoiler setting, roadmap and missable rendering.
- `app/style.css` — the Vice City neon theme.
- `app/data/trophies.json` — the 55 official trophies with guides, sources, kinds, counts and missable flags.
- `screenshots/` — 4 renders of the app: cover (checklist + guide open), roadmap, missables, spoiler mode.
- `main.ts` — builds `/output` with `dossier.json`.
- `LICENSE` — MIT.

## License

MIT. See `LICENSE`.
