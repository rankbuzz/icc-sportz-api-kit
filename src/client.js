import { getLiveJson, getV1 } from "./http.js";

/** Live + upcoming (+ optional recent) schedule strip / pages. */
export async function getSchedule(opts = {}) {
  const {
    page = 1,
    pageSize = 20,
    live = true,
    upcoming = true,
    recent = false,
    matchId,
    seriesIds,
    year,
    fromDate,
    toDate,
    leagueIds,
  } = opts;

  const params = {
    is_deleted: "false",
    pagination: "true",
    page_number: String(page),
    page_size: String(pageSize),
    is_live: String(live),
    is_upcoming: String(upcoming),
    is_recent: String(recent),
  };
  if (matchId) params.match_id = String(matchId);
  if (seriesIds) params.series_ids = String(seriesIds);
  if (year) params.year = String(year);
  if (fromDate) params.from_date = String(fromDate);
  if (toDate) params.to_date = String(toDate);
  if (leagueIds) params.league_ids = String(leagueIds);

  const { status, json, url } = await getV1("/schedule", params);
  if (status !== 200) throw new Error(`schedule failed: ${status} ${url}`);
  return json;
}

export async function getMatch(matchId) {
  const data = await getSchedule({
    matchId,
    live: true,
    upcoming: true,
    recent: true,
    pageSize: 5,
  });
  const match = data?.data?.matches?.[0] || null;
  return { meta: data?.meta, match };
}

/** ICC rankings — type: bat|bowl|allrounder|team ; comp: test|odi|t20|odiw|t20w */
export async function getRanking(type = "bat", compType = "test") {
  const { status, json, url } = await getV1("/ranking", {
    type,
    comp_type: compType,
  });
  if (status !== 200) throw new Error(`ranking failed: ${status} ${url}`);
  return json;
}

export async function getScorecard(gameId) {
  const { status, json, url } = await getV1("/game/scorecard", {
    game_id: String(gameId),
  });
  if (status !== 200) throw new Error(`scorecard failed: ${status} ${url}`);
  return json;
}

/** Prefer match_file from schedule when available (no client_id needed). */
export async function getLiveFeed(matchFile) {
  const { status, json, url } = await getLiveJson(matchFile);
  if (status !== 200) throw new Error(`live json failed: ${status} ${url}`);
  return json;
}

export async function getCommentary(gameId, inning = 1, { keyEvent = false } = {}) {
  const params = {
    game_id: String(gameId),
    inning: String(inning),
    pagination: "false",
    type: "all",
  };
  if (keyEvent) params.key_event = "true";
  const { status, json, url } = await getV1("/game/commentary", params);
  if (status !== 200) throw new Error(`commentary failed: ${status} ${url}`);
  return json;
}

export async function getOverByOver(gameId, inning = 1) {
  const { status, json, url } = await getV1("/game/over-by-over", {
    game_id: String(gameId),
    inning: String(inning),
  });
  if (status !== 200) throw new Error(`over-by-over failed: ${status} ${url}`);
  return json;
}

export async function getBatsmanSplit(gameId, inning = 1) {
  const { status, json, url } = await getV1("/game/batsman-split", {
    game_id: String(gameId),
    inning: String(inning),
  });
  if (status !== 200) throw new Error(`batsman-split failed: ${status} ${url}`);
  return json;
}

export async function getHeadToHead(gameId) {
  const { status, json, url } = await getV1("/game/head-to-head", {
    game_id: String(gameId),
  });
  if (status !== 200) throw new Error(`head-to-head failed: ${status} ${url}`);
  return json;
}

export async function getPlayer(playerId) {
  const { status, json, url } = await getV1("/player", {
    player_id: String(playerId),
  });
  if (status !== 200) throw new Error(`player failed: ${status} ${url}`);
  return json;
}

export async function getTeam(teamId) {
  const { status, json, url } = await getV1("/team", {
    team_id: String(teamId),
  });
  if (status !== 200) throw new Error(`team failed: ${status} ${url}`);
  return json;
}

export async function listSeries(opts = {}) {
  const { page = 1, pageSize = 20, year = 2026, leagueId = 1 } = opts;
  const { status, json, url } = await getV1("/series", {
    league_id: String(leagueId),
    year: String(year),
    pagination: "true",
    page_number: String(page),
    page_size: String(pageSize),
  });
  if (status !== 200) throw new Error(`series failed: ${status} ${url}`);
  return json;
}

export async function getSeriesStanding(seriesId) {
  const { status, json, url } = await getV1("/series/standing", {
    series_id: String(seriesId),
  });
  if (status !== 200) throw new Error(`series standing failed: ${status} ${url}`);
  return json;
}

export async function getChampionshipStanding(championshipId) {
  const { status, json, url } = await getV1("/championship_standing", {
    championship_id: String(championshipId),
  });
  if (status !== 200) {
    throw new Error(`championship standing failed: ${status} ${url}`);
  }
  return json;
}

/** Compact summary from a schedule match object. */
export function summarizeMatch(m) {
  if (!m) return null;
  const scores = (m.scores || []).map((s) => ({
    inn: s.inning_no,
    team: s.team_short_name || s.team_name,
    runs: s.team_runs,
    wickets: s.team_wickets,
    overs: s.team_overs,
    declared: !!s.is_declare,
    target: s.target || null,
  }));
  return {
    matchId: m.match_id,
    matchFile: m.match_file,
    series: m.series_name,
    number: m.match_number,
    teams: [m.teama, m.teamb],
    venue: m.venue,
    status: m.match_status,
    display: m.match_display_status,
    message: m.current_status_message,
    live: m.live,
    onBreak: m.is_match_on_break,
    day: m.day,
    session: m.session,
    scores,
  };
}
