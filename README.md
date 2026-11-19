[![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/adiznth/gta6-trophy-guide-01-adiznth/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/adiznth/gta6-trophy-guide-01-adiznth/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, all 55 PS5 trophies

An offline guide and tracker for the trophies of Grand Theft Auto VI on
PlayStation 5. It covers every one of the 55 trophies — 1 platinum, 2 gold,
6 silver, 46 bronze; 27 visible, 28 hidden — each with its official name,
description and grade as PlayStation publishes them, a guide written in our
own words, and the sources that guide rests on.

## What it does

- **Tracker:** tick a trophy off and it stays ticked. Progress is saved in
  the browser (localStorage), with export to a `.json` file and import back.
- **Filters:** by kind (story, missable, collectibles, activities, online),
  by grade, by earned-only, plus a search box.
- **Spoiler setting:** on by default, it hides the names and descriptions of
  the 28 hidden story trophies until you earn them.
- **Platinum roadmap:** seven stages in the order to play them, from the
  first manual save to the platinum, *Vice Got a Price!*
- **Missable flags:** exactly one trophy is flagged missable —
  *Positive Mental Attitude* — because one meditation spot (Lucia's balcony
  in Chapter 1) disappears after that chapter and the game has no mission
  replay. Every other flag in the guide is built the same way, from the
  official descriptions and the sources cited beside each trophy.
- **Cited guides:** every trophy's guide names its sources beside it. Eight
  hidden trophies had no confirmed unlock method at launch, so their guides
  say so plainly and stick to what the official description says instead of
  inventing a method.

## Run it

The app is plain static files under `app/` — no build step, no network.
Serve it and open it in a desktop browser:

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly from a static server of your choice. It
works with the network off: every file it loads is under `app/`, and the
only thing it fetches at run time is its own `app/data/trophies.json`.

## Hand it in

`main.ts` at the repository root copies `app/` and `screenshots/` to the
output directory and writes `dossier.json` there:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Data and sources

The trophy list is the official 55 as published on PlayStation Network on
18 November 2026, as Exophase and PSNProfiles listed it, cross-checked
against each other. The guides draw on Planet GTA 6, Output Lag, KeenGamer,
EGamers and GTA Vice City Hub, each cited beside the trophy it supports.
Names, descriptions and grades are PlayStation's own words; the guides are
ours.

This is an unofficial fan guide. Grand Theft Auto, GTA and Leonida are
trademarks of their owners; the guide uses no Rockstar logo, artwork or game
screenshots.
