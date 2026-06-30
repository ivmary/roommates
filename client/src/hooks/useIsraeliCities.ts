import { useState, useEffect } from "react";

let clientCache: string[] | null = null;

export function useIsraeliCities() {
  const [cities, setCities] = useState<string[]>(clientCache ?? []);
  const [loading, setLoading] = useState(clientCache === null);

  useEffect(() => {
    if (clientCache !== null) return;

    let cancelled = false;

    fetch("/api/cities")
      .then((res) => {
        const ct = res.headers.get("content-type") ?? "";
        if (!res.ok || ct.includes("text/html")) throw new Error("Cities endpoint unavailable");
        return res.json() as Promise<string[]>;
      })
      .then((data) => {
        clientCache = data;
        if (!cancelled) { setCities(data); setLoading(false); }
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { cities, loading };
}
