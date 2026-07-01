import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../shared/store/AuthContext";
import type { Listing } from "../features/listings/types";

export function useMyListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch("/api/apartments/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load your listings");
        return res.json() as Promise<Listing[]>;
      })
      .then((data) => { if (!cancelled) { setListings(data); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token, version]);

  const refetch = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  return { listings, loading, error, refetch };
}
