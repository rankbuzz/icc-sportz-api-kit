import { CLIENT_ID, BASE_V1, LIVE_JSON } from "./config.js";

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

export async function getV1(path, params = {}) {
  const url = `${BASE_V1}${path}?${qs(params)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, url, json, text };
}

export async function getLiveJson(matchFile) {
  const url = `${LIVE_JSON}/${matchFile}.json`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, url, json, text };
}
