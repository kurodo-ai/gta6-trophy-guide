# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kurodo-ai/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kurodo-ai/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend — an offline trophy guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy carries its official name, description and grade, plus a guide written for this app in our own words that names its sources (the official PlayStation trophy list, the PSNProfiles trophy guide and the Exophase trophy list). It includes a six-stage roadmap to the platinum built from the official descriptions, five missable trophies flagged with the reasoning for each flag, a checklist whose progress is saved in the browser (localStorage) and can be exported to a file and imported back, filters by kind (story, missable, collectibles, activities, online) and grade, and a spoiler setting that hides story trophies until they are earned. The app is plain static files under `app/` with no build step and makes no network requests at run time.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
# hand-in (what the grader runs): mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=gzzxjh8r&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
