import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../shared/store/AuthContext";
import type { Listing } from "../features/listings/types";

export function useMyListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(() => {
    if (!token) {
      setListings([]);
      setLoading(false);
      return () => {};
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/apartments/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load your listings");
        return res.json() as Promise<Listing[]>;
      })
      .then((data) => { if (!cancelled) setListings(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => fetchListings(), [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}
