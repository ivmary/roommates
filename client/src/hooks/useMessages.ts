import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../shared/store/AuthContext";
import { useSocket } from "../shared/store/SocketContext";
import type { ChatMessage } from "../features/chat/types";

export function useMessages(conversationId: string | null) {
  const { token } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !conversationId) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load messages");
        return res.json() as Promise<ChatMessage[]>;
      })
      .then((data) => { if (!cancelled) { setMessages(data); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token, conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join:conversation", conversationId);

    const handleNew = (message: ChatMessage) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on("message:new", handleNew);

    return () => {
      socket.off("message:new", handleNew);
    };
  }, [socket, conversationId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket || !conversationId || !text.trim()) return;
      socket.emit("message:send", { conversationId, text: text.trim() });
    },
    [socket, conversationId],
  );

  return { messages, loading, error, sendMessage };
}
