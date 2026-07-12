import https from 'https';

const RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const LIMIT = 100;

interface DatastoreResponse {
  success: boolean;
  result: {
    total: number;
    records: Record<string, string | null>[];
  };
}

export class CityService {
  private cache: string[] | null = null;

  private httpsGet(url: string): Promise<DatastoreResponse> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        })
        .on('error', reject);
    });
  }

  private toTitleCase(s: string): string {
    return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private baseUrl(offset: number): string {
    return `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=${LIMIT}&offset=${offset}`;
  }

  /** English name if present (title-cased), Hebrew otherwise; deduplicated. */
  private recordsToNames(
    records: Record<string, string | null>[],
    seen: Set<string>,
  ): string[] {
    const names: string[] = [];
    for (const r of records) {
      const en = (r['שם_ישוב_לועזי'] || '').trim();
      const he = (r['שם_ישוב'] || '').trim();
      const name = en ? this.toTitleCase(en) : he;
      if (name && !seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
    return names;
  }

  private async fetchAllCities(): Promise<string[]> {
    const first = await this.httpsGet(this.baseUrl(0));
    if (!first.success) return [];

    const total = first.result.total;
    const pages = Math.ceil(total / LIMIT);

    const offsets = Array.from({ length: pages - 1 }, (_, i) => (i + 1) * LIMIT);
    const rest = await Promise.all(offsets.map((o) => this.httpsGet(this.baseUrl(o))));

    const seen = new Set<string>();
    const all = [
      ...this.recordsToNames(first.result.records, seen),
      ...rest.flatMap((d) =>
        d.success ? this.recordsToNames(d.result.records, seen) : [],
      ),
    ];

    return all.sort((a, b) => a.localeCompare(b));
  }

  /** Fill the cache at startup so the first request is instant. */
  prewarm(): void {
    this.fetchAllCities()
      .then((cities) => {
        this.cache = cities;
        console.log(`Cities cache ready (${cities.length})`);
      })
      .catch((err) => console.error('Cities pre-warm failed:', err.message));
  }

  async getCities(): Promise<string[]> {
    if (!this.cache) this.cache = await this.fetchAllCities();
    return this.cache;
  }
}
