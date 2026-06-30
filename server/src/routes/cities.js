const express = require("express");
const https = require("https");
const router = express.Router();

const RESOURCE_ID = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";
const LIMIT = 100;

let cache = null;

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

function baseUrl(offset) {
  return `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=${LIMIT}&offset=${offset}`;
}

function recordsToNames(records, seen) {
  const names = [];
  for (const r of records) {
    const en = (r["שם_ישוב_לועזי"] || "").trim();
    const he = (r["שם_ישוב"] || "").trim();
    const name = en ? toTitleCase(en) : he;
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

async function fetchAllCities() {
  const first = await httpsGet(baseUrl(0));
  if (!first.success) return [];

  const total = first.result.total;
  const pages = Math.ceil(total / LIMIT);

  const offsets = Array.from({ length: pages - 1 }, (_, i) => (i + 1) * LIMIT);
  const rest = await Promise.all(offsets.map((o) => httpsGet(baseUrl(o))));

  const seen = new Set();
  const all = [
    ...recordsToNames(first.result.records, seen),
    ...rest.flatMap((d) =>
      d.success ? recordsToNames(d.result.records, seen) : [],
    ),
  ];

  return all.sort((a, b) => a.localeCompare(b));
}

// Pre-warm cache on server start
fetchAllCities()
  .then((cities) => {
    cache = cities;
    console.log(`Cities cache ready (${cities.length})`);
  })
  .catch((err) => console.error("Cities pre-warm failed:", err.message));

router.get("/", async (req, res) => {
  try {
    if (!cache) cache = await fetchAllCities();
    res.json(cache);
  } catch (err) {
    console.error("Failed to fetch cities:", err.message);
    res.status(502).json({ error: "Could not load cities" });
  }
});

module.exports = router;
