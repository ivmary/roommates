import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import type { ChatMessage } from "../../features/chat/types";

// In dev, connect same-origin through the Vite proxy (see vite.config.ts) so
// this doesn't depend on VITE_API_URL being set correctly, same as /api calls.
const SOCKET_URL = import.meta.env.DEV ? undefined : import.meta.env.VITE_API_URL;

interface SocketContextValue {
  socket: Socket | null;
  unreadConversationIds: Set<string>;
  setActiveConversationId: (id: string | null) => void;
  markConversationRead: (id: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  unreadConversationIds: new Set(),
  setActiveConversationId: () => {},
  markConversationRead: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadConversationIds, setUnreadConversationIds] = useState<Set<string>>(
    new Set(),
  );
  const activeConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setUnreadConversationIds(new Set());
      return;
    }

    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNew = (message: ChatMessage) => {
      if (message.sender._id === user.id) return;
      if (message.conversation === activeConversationIdRef.current) return;
      setUnreadConversationIds((prev) => new Set(prev).add(message.conversation));
    };

    socket.on("message:new", handleNew);
    return () => {
      socket.off("message:new", handleNew);
    };
  }, [socket, user]);

  const setActiveConversationId = useCallback((id: string | null) => {
    activeConversationIdRef.current = id;
  }, []);

  const markConversationRead = useCallback((id: string) => {
    setUnreadConversationIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, unreadConversationIds, setActiveConversationId, markConversationRead }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext).socket;
}

export function useUnreadMessageCount() {
  return useContext(SocketContext).unreadConversationIds.size;
}

export function useChatPresence() {
  const { setActiveConversationId, markConversationRead } = useContext(SocketContext);
  return { setActiveConversationId, markConversationRead };
}
