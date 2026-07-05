import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../shared/store/AuthContext";
import type { Conversation } from "../features/chat/types";

export function useConversations() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load conversations");
        return res.json() as Promise<Conversation[]>;
      })
      .then((data) => { if (!cancelled) { setConversations(data); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token, version]);

  const refetch = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  return { conversations, loading, error, refetch };
}
