# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Daniikhwan/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Daniikhwan/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Sunset Platinum** — an offline GTA VI trophy guide and tracker for PS5. All 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with their official names and descriptions, a guide in our own words for each one with cited sources, a saved-progress checklist, a 3-stage roadmap to platinum (~200 hours, difficulty 4/10, 0 online trophies), a missables page led by the one missable trophy, and a Next-up planner. No account, no network requests at runtime — progress and notes live in your browser's localStorage.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Package it for the judge:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Features

- **Full tracker** — all 55 trophies with official name, description, grade, hidden flag (28 hidden, verified against PSNProfiles/Exophase), kind, roadmap stage and progress target; ticks and personal notes per trophy saved in localStorage; export progress to a file and import it back.
- **Filters + search** — by kind (story, missable, collectibles, activities, robbery, exploration, misc), by grade, by text, and hide-earned.
- **Spoiler setting** — hides hidden story trophy names and descriptions until you earn them.
- **Guide pane** — click any trophy for its full guide, missable warning, progress target and source links (PowerPyx, PSNProfiles, Exophase, OutputLag). The five trophies whose method is still unconfirmed at launch say so plainly instead of inventing steps.
- **Roadmap** — 3 stages to platinum with hours and per-stage progress.
- **Missables** — Positive Mental Attitude first, with the Chapter 1 balcony-meditation warning and a save-slot plan.
- **Next-up planner** — your next 5 unearned trophies in roadmap order.
- **Light "paper" theme and dark theme**; `?demo=1` seeds 13 of 55 earned for a quick look; `?view=roadmap|missables|planner` deep-links to each page.

## Sources

Guides are written in our own words from the official trophy list and the cited guides: PowerPyx's GTA 6 Trophy Guide & Roadmap, PSNProfiles, Exophase and OutputLag. Unofficial fan guide, not affiliated with Rockstar Games.

---

Built for make.fun — [try it yourself with my referral link](https://make.fun/?ref=vnsny7za) (code `vnsny7za`).
