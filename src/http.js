import { CLIENT_ID, BASE_V1, LIVE_JSON, DAPI_CONTENT } from "./config.js";

function qs(params = {}) {
  const p = new URLSearchParams({
    client_id: CLIENT_ID,
    feed_format: "json",
    lang: "en",
    ...Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ),
  });
  return p.toString();
}

async function parseJsonResponse(res, url) {
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, url, json, text };
}

export async function getV1(path, params = {}) {
  const url = `${BASE_V1}${path}?${qs(params)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  return parseJsonResponse(res, url);
}

export async function getLiveJson(matchFile) {
  const url = `${LIVE_JSON}/${matchFile}.json`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonResponse(res, url);
}

/** ICC dapi (Distribution API) — stories / videos. No Sportz client_id. */
export async function getDapi(path, params = {}) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const q = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();
  const url = `${DAPI_CONTENT}${clean}${q ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return parseJsonResponse(res, url);
}
