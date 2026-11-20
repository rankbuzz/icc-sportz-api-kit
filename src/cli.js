#!/usr/bin/env node
import {
  getCommentary,
  getLiveFeed,
  getMatch,
  getRanking,
  getSchedule,
  getScorecard,
  getStory,
  getVideo,
  listNews,
  listSeries,
  summarizeMatch,
  summarizeStoryParts,
} from "./client.js";
import { COMP_TYPES, RANK_TYPES } from "./config.js";

function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case "live": {
      const data = await getSchedule({
        live: true,
        upcoming: true,
        recent: false,
        pageSize: 30,
      });
      const matches = (data?.data?.matches || [])
        .filter((m) => m.live || m.match_display_status === "Live" || m.is_match_on_break)
        .map(summarizeMatch);
      out({ count: data?.meta?.count, live: matches });
      break;
    }
    case "match": {
      const id = args[0];
      if (!id) throw new Error("usage: match <matchId>");
      const { match } = await getMatch(id);
      out(summarizeMatch(match) || { error: "not found", matchId: id });
      break;
    }
    case "score": {
      const id = args[0];
      if (!id) throw new Error("usage: score <matchId>  (optional: uses match_file live json if resolvable)");
      const { match } = await getMatch(id);
      if (match?.match_file) {
        const feed = await getLiveFeed(match.match_file);
        out({
          summary: summarizeMatch(match),
          equation: feed?.Matchequation || null,
          status: feed?.Matchdetail?.Status,
          message: feed?.Matchdetail?.Current_status_message,
          innings: (feed?.Innings || []).map((inn) => ({
            number: inn.Number,
            battingTeamId: inn.Battingteam,
            total: inn.Total,
            wickets: inn.Wickets,
            overs: inn.Overs,
            declared: inn.Isdeclared || false,
          })),
        });
      } else {
        const sc = await getScorecard(id);
        out(sc);
      }
      break;
    }
    case "comm": {
      const id = args[0];
      const inn = args[1] || "1";
      if (!id) throw new Error("usage: comm <matchId> [inning]");
      const data = await getCommentary(id, inn);
      const balls = data?.data?.Commentary || data?.Commentary || [];
      out({
        inning: data?.data?.InningNo || inn,
        equation: data?.data?.Equation,
        count: Array.isArray(balls) ? balls.length : null,
        sample: Array.isArray(balls) ? balls.slice(0, 5) : data,
      });
      break;
    }
    case "ranking": {
      const type = args[0] || "bat";
      const comp = args[1] || "test";
      if (!RANK_TYPES.includes(type) || !COMP_TYPES.includes(comp)) {
        throw new Error(`usage: ranking <${RANK_TYPES.join("|")}> <${COMP_TYPES.join("|")}>`);
      }
      const data = await getRanking(type, comp);
      const rank = data?.data?.["bat-rank"];
      out({
        rankType: rank?.["rank-type"],
        updated: rank?.last_updated,
        top10: (rank?.rank || []).slice(0, 10).map((r) => ({
          no: r.no,
          name: r["Player-name"] || r.team_name,
          country: r.Country || r.country,
          points: r.Points || r.points,
          rating: r.Rating || r.rating,
        })),
      });
      break;
    }
    case "series": {
      const year = args[0] || "2026";
      const data = await listSeries({ year: Number(year) });
      out({
        count: data?.meta?.count,
        series: (data?.data || []).slice(0, 15).map((s) => ({
          id: s.id,
          name: s.name,
          start: s.start_date,
          end: s.end_date,
        })),
      });
      break;
    }
    case "news": {
      const limit = Number(args[0] || 10);
      const data = await listNews({ limit });
      const items = data?.items || data?.data || [];
      out({
        count: items.length,
        stories: items.map((s) => ({
          slug: s.slug,
          title: s.title || s.headline,
          date: s.contentDate,
          entityId: s._entityId,
        })),
      });
      break;
    }
    case "story": {
      const slug = args[0];
      if (!slug) throw new Error("usage: story <slug>");
      const story = await getStory(slug);
      out(summarizeStoryParts(story));
      break;
    }
    case "video": {
      const slug = args[0];
      if (!slug) throw new Error("usage: video <video-slug>");
      const video = await getVideo(slug);
      out({
        slug: video?.slug,
        title: video?.title || video?.headline,
        videoId: video?.fields?.videoId || video?.videoId,
        mezzanineUrl: video?.fields?.mezzanineUrl,
        duration: video?.fields?.videoDuration,
      });
      break;
    }
    default:
      console.error(`Usage:
  npm run live
  npm run match -- <matchId>
  npm run score -- <matchId>
  npm run comm -- <matchId> [inning]
  npm run ranking -- <bat|bowl|allrounder|team> <test|odi|t20|odiw|t20w>
  npm run series -- [year]
  npm run news -- [limit]
  npm run story -- <slug>
  npm run video -- <video-slug>`);
      process.exit(cmd ? 1 : 0);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
