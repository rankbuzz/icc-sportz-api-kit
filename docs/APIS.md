# ICC Sportz API map

Base: `https://assets-icc.sportz.io`

Common query params:

| Param | Value |
|-------|--------|
| `client_id` | `tPZJbRgIub3Vua93/DWtyQ==` (URL-encode `/` and `=`) |
| `feed_format` | `json` |
| `lang` | `en` |

Config sources:

- `https://assets-icc.sportz.io/static-assets/buildv3-stg/js/clientConfig.json`
- `https://assets-icc.sportz.io/static-assets/buildv3-stg/js/config.json` → `siFileVersion`

---

## Schedule / fixtures

```
GET /cricket/v1/schedule
```

Useful filters:

| Param | Notes |
|-------|--------|
| `match_id` | single match |
| `series_ids` | comma-separated |
| `league_ids` | e.g. `1` ICC, `10` women |
| `year` | e.g. `2026` |
| `from_date` / `to_date` | `YYYYMMDD` |
| `is_live` / `is_upcoming` / `is_recent` | booleans |
| `is_deleted` | usually `false` |
| `pagination` / `page_number` / `page_size` | paging (`meta.count` = total) |
| `date_list=true` | returns match dates only |

Response highlights per match: `match_id`, `match_file`, `teama`/`teamb`, `scores[]`, `match_status`, `match_display_status`, `current_status_message`, `live`, `is_match_on_break`, `day`, `session`, venue/series fields.

Probed catalog size: **~12,457** matches (~2014 → present + upcoming).

---

## Rankings

```
GET /cricket/v1/ranking?type={TYPE}&comp_type={COMP}
```

| `type` | `comp_type` |
|--------|-------------|
| `bat` \| `bowl` \| `allrounder` \| `team` | Men: `test` \| `odi` \| `t20` |
| | Women: `odiw` \| `t20w` |

Notes:

- Use `bat` not `batting`; use `t20` not `t20i`.
- Payload path: `data["bat-rank"].rank[]` (`Player-name` / team fields, `Points`, `Rating`).

Site routes mirror this under `/rankings/...` on icc-cricket.com.

---

## Live match detail

### Scorecard (API)

```
GET /cricket/v1/game/scorecard?game_id={match_id}
```

Same shape as live JSON: `Matchdetail`, `Innings[]`, `Teams`, `Matchequation`, `Notes`, …

### Live JSON file (no client_id)

```
GET /cricket/live/json/{match_file}.json
```

`match_file` comes from schedule (e.g. `pksl11172026274141`).

Also available: `/cricket/live/xml/{match_file}.xml`.

### Commentary

```
GET /cricket/v1/game/commentary?game_id={id}&inning={n}&pagination=false&type=all
GET /cricket/v1/game/commentary?game_id={id}&inning={n}&key_event=true
```

### Over-by-over / splits / H2H

```
GET /cricket/v1/game/over-by-over?game_id={id}&inning={n}
GET /cricket/v1/game/batsman-split?game_id={id}&inning={n}
GET /cricket/v1/game/head-to-head?game_id={id}
```

---

## Entities

```
GET /cricket/v1/player?player_id={id}
GET /cricket/v1/player?is_international=true&pagination=true&page_size=20&page_number=1

GET /cricket/v1/team?team_id={id}
GET /cricket/v1/team?is_international=true&pagination=false

GET /cricket/v1/venue?venue_id={id}
GET /cricket/v1/venue?pagination=true&page_size=20&page_number=1

GET /cricket/v1/series?series_id={id}
GET /cricket/v1/series?league_id=1&year=2026&pagination=true&page_number=1&page_size=20
```

Static team lists:

```
GET /cricket/static/json/iccteamlist/mens_international_teamlist.json
GET /cricket/static/json/iccteamlist/womens_international_teamlist.json
```

Images (templates in clientConfig):

- Teams: `/static-assets/buildv3-stg/images/teams/{TEAM_ID}.png`
- Players: ICC CDN headshots under `images.icc-cricket.com/.../{{PLAYER_ID}}.png`

---

## Standings

```
GET /cricket/v1/series/standing?series_id={id}
```

Works for tournament series (e.g. T20 World Cup). Bilateral series may 404.

```
GET /cricket/v1/championship_standing?championship_id={id}
```

WTC / championship tables (valid championship ids required).

```
GET /cricket/v1/championship/tracker?championship_id={id}&series_id={id}&team_id={id}
```

---

## Stats / records

```
GET /cricket/v1/stats/parent?type=0&parent_id={id}&pagination=true&page_size=20&page_number=1
GET /cricket/v2/stats/series?...
GET /cricket/v2/stats/championship?...
```

Notes:

- Prefer **`parent_id`** (from series object), not bare `series_id`, for `/stats/parent`.
- `type` selects stat category; wrong params → 400/404.

---

## Predictors (special)

These power ICC “what if” tools. **POST**, not GET (GET → 405).

| Endpoint | Role |
|----------|------|
| `/cricket/v1/predictor` | WTC standing predictor |
| `/cricket/v1/standing/predictor` | series standing predictor |
| `/cricket/v1/team_ranking_automation_predictor` | ranking predictor |

Empty/wrong body → 400 / invalid params. Capture request body from the site widget if you need this feature. Skip for normal live scores / rankings.

---

## Typical live match flow

```
schedule (is_live / match_id)
  → match_id, match_file, scores, break/lunch status
  → scorecard OR live/json/{match_file}.json
  → commentary / over-by-over / batsman-split
```

Example (probed): Pakistan vs Sri Lanka 2nd Test `274141` — Day 1 Lunch, `is_match_on_break=true`.

---

## Site ↔ API

| Site | Feed |
|------|------|
| `/rankings/...` | `/v1/ranking` |
| `/matches/{id}/...` | schedule + `/v1/game/*` + live JSON |
| Fixtures widgets | `/v1/schedule` |
| WTC standings / predictors | championship_standing + POST predictor |

Widget bootstrap: `icc-init.js` → `clientConfig.json` + `init.js?v={siFileVersion}`.
