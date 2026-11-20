# ICC Sportz API Kit

Reverse-engineered notes + small Node helper for the **official ICC Sportz Interactive JSON feeds** and **ICC Distribution (news) API** used by [icc-cricket.com](https://www.icc-cricket.com).

**Important:** Unofficial use of public widget endpoints. They can change without notice. Use responsibly.

## What this is

ICC’s site loads cricket **match data** from Sportz:

```
https://assets-icc.sportz.io/cricket/v1/...
https://assets-icc.sportz.io/cricket/live/json/{match_file}.json
```

And **news / stories / videos** from the Distribution API (not Sportz):

```
https://dapi.icc-cricket.com/v2/content/en-GB/stories
https://dapi.icc-cricket.com/v2/content/en-GB/stories/{slug}
https://dapi.icc-cricket.com/v2/content/en-GB/videos/{slug}
```

Not HTML scraping — real JSON for schedule, rankings, scorecard, commentary, players, teams, standings, and news articles (with Instagram embeds + ICC video parts).

## Flow

```
1) /v1/schedule          → match_id + match_file + live scores strip
2) /v1/game/scorecard    → full scorecard (or live/json/{match_file}.json)
3) /v1/game/commentary   → ball-by-ball commentary
4) /v1/ranking           → bat/bowl/allrounder/team × formats
5) dapi .../stories      → news list + single article by slug
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
npm run news -- 10
npm run story -- england-batting-ace-makes-whopping-34-spot-rise-on-rankings
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
| News / stories (dapi) | list + single by **slug**; embeds + videos in `parts[]` |
| Predictors (WTC / ranking calculator) | POST + scenario body — optional |

## News (quick)

- Use **slug** for single article (`/stories/{slug}`). UUID in the path → 404.
- Site URL `/news/{slug}` maps 1:1 to the API slug.
- Article body is `parts[]`: `markdown`, Instagram/X/Spotify `oembed`, ICC `customentity:video` (`mezzanineUrl` on `media.icc-cricket.com`), quotes, tables.

## Docs

See [docs/APIS.md](docs/APIS.md) for the full endpoint map.

Related: [cricbuzz-api-kit](https://github.com/rankbuzz/cricbuzz-api-kit) (Cricbuzz HTML + mcenter).

## License

MIT
