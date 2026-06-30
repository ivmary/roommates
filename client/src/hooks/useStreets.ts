import { useState, useEffect } from "react";

const clientCache = new Map<string, string[]>();

export function useStreets(city: string) {
  const [streets, setStreets] = useState<string[]>(
    city ? (clientCache.get(city) ?? []) : []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) {
      setStreets([]);
      return;
    }
    if (clientCache.has(city)) {
      setStreets(clientCache.get(city)!);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/streets?city=${encodeURIComponent(city)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Streets unavailable");
        return res.json() as Promise<string[]>;
      })
      .then((data) => {
        clientCache.set(city, data);
        if (!cancelled) {
          setStreets(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return { streets, loading };
}
