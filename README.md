# ICC Sportz API Kit

Reverse-engineered notes + small Node helper for the **official ICC Sportz Interactive JSON feeds** used by [icc-cricket.com](https://www.icc-cricket.com).

**Important:** Unofficial use of public widget endpoints. They can change without notice. Use responsibly.

## What this is

ICC’s site loads cricket data from:

```
https://assets-icc.sportz.io/cricket/v1/...
https://assets-icc.sportz.io/cricket/live/json/{match_file}.json
```

Not HTML scraping — real JSON for schedule, rankings, scorecard, commentary, players, teams, standings.

## Flow

```
1) /v1/schedule          → match_id + match_file + live scores strip
2) /v1/game/scorecard    → full scorecard (or live/json/{match_file}.json)
3) /v1/game/commentary   → ball-by-ball commentary
4) /v1/ranking           → bat/bowl/allrounder/team × formats
```

## Client ID

Public widget key from Sportz `clientConfig.json` (not a private secret):

```
tPZJbRgIub3Vua93/DWtyQ==
```

URL-encoded: `tPZJbRgIub3Vua93%2FDWtyQ%3D%3D`

Source:

```
https://assets-icc.sportz.io/static-assets/buildv3-stg/js/clientConfig.json
```

## Quick start

Node 18+ (built-in `fetch`, no deps).

```bash
npm run live
npm run match -- 274141
npm run score -- 274141
npm run comm -- 274141 1
npm run ranking -- bat test
npm run series -- 2026
```

## Coverage (probed)

| Area | Status |
|------|--------|
| Schedule (live / recent / upcoming / year) | ~12k+ matches from ~2014 |
| Rankings (men + women) | full matrix |
| Live scorecard + XI | yes |
| Commentary / OBO / batsman-split / H2H | yes |
| Player / team / venue / series | yes |
| Series & championship standings | yes (tournament / WTC ids) |
| Predictors (WTC / ranking calculator) | POST + scenario body — optional |

## Docs

See [docs/APIS.md](docs/APIS.md) for the full endpoint map.

Related: [cricbuzz-api-kit](https://github.com/rankbuzz/cricbuzz-api-kit) (Cricbuzz HTML + mcenter).

## License

MIT
