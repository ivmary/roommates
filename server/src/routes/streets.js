const express = require("express");
const https = require("https");
const router = express.Router();

const RESOURCE_ID = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b";
const LIMIT = 1000;
const cache = new Map();

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function toTitleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildUrl(cityUpper, offset) {
  const filters = encodeURIComponent(
    JSON.stringify({ "שם_ישוב_לועזי": cityUpper })
  );
  return `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&filters=${filters}&limit=${LIMIT}&offset=${offset}`;
}

function recordsToStreetNames(records, seen) {
  const names = [];
  for (const r of records) {
    const en = (r["שם_רחוב_לועזי"] || "").trim();
    const he = (r["שם_רחוב"] || "").trim();
    const name = en ? toTitleCase(en) : he;
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

async function fetchStreetsForCity(cityName) {
  const cityUpper = cityName.toUpperCase();
  const first = await httpsGet(buildUrl(cityUpper, 0));
  if (!first.success) return [];

  const total = first.result.total;
  const pages = Math.ceil(total / LIMIT);
  const offsets = Array.from({ length: pages - 1 }, (_, i) => (i + 1) * LIMIT);
  const rest = await Promise.all(offsets.map((o) => httpsGet(buildUrl(cityUpper, o))));

  const seen = new Set();
  const all = [
    ...recordsToStreetNames(first.result.records, seen),
    ...rest.flatMap((d) =>
      d.success ? recordsToStreetNames(d.result.records, seen) : []
    ),
  ];

  return all.sort((a, b) => a.localeCompare(b));
}

router.get("/", async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) return res.status(400).json({ error: "city required" });

  try {
    if (!cache.has(city)) {
      cache.set(city, await fetchStreetsForCity(city));
    }
    res.json(cache.get(city));
  } catch (err) {
    console.error("Failed to fetch streets:", err.message);
    res.status(502).json({ error: "Could not load streets" });
  }
});

module.exports = router;
