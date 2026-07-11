import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import {
  useSocket,
  useUnreadConversationIds,
} from "../../../shared/store/SocketContext";
import { useConversations } from "../../../hooks/useConversations";
import { useMessages } from "../../../hooks/useMessages";
import type { Listing } from "../../listings/types";
import "../../listings/views/styles/CreatePage.css";
import "./styles/MessagesPage.css";

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversationId, apartmentId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const {
    conversations,
    loading: convLoading,
    error: convError,
  } = useConversations();
  const unreadConversationIds = useUnreadConversationIds();
  const {
    messages,
    loading: msgLoading,
    error: msgError,
    sendMessage,
  } = useMessages(conversationId ?? null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const matchedConversation = apartmentId
    ? conversations.find((c) => c.apartment._id === apartmentId)
    : undefined;

  useEffect(() => {
    if (matchedConversation) {
      navigate(`/messages/${matchedConversation._id}`, { replace: true });
    }
  }, [matchedConversation, navigate]);

  const isDraft = Boolean(apartmentId) && !matchedConversation;

  const [draftApartment, setDraftApartment] = useState<Listing | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDraft || convLoading) return;

    fetch(`/api/apartments/${apartmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Listing not found");
        return res.json();
      })
      .then((apartment: Listing) => {
        if (apartment.owner._id === user?.id) {
          throw new Error("You can't message yourself about your own listing.");
        }
        setDraftApartment(apartment);
      })
      .catch((e) => setDraftError(e.message));
  }, [isDraft, convLoading, apartmentId, user?.id]);

  if (!user) {
    return (
      <div className="create-page">
        <div className="create-guest">
          <div className="create-guest-icon">🔒</div>
          <h2>Sign in to see your messages</h2>
          <p>You need an account to message other users.</p>
          <div className="create-guest-actions">
            <Link className="btn-submit" to="/login">
              Log in
            </Link>
            <Link className="btn-cancel" to="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeConversation = conversations.find(
    (c) => c._id === conversationId,
  );
  const hasThread = Boolean(conversationId) || isDraft;

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    if (isDraft) {
      if (!socket || !apartmentId) return;
      setSending(true);
      socket.emit(
        "message:send",
        { apartmentId, text },
        (res: { conversationId?: string; error?: string }) => {
          setSending(false);
          if (res?.conversationId) {
            navigate(`/messages/${res.conversationId}`, { replace: true });
          } else if (res?.error) {
            setDraftError(res.error);
          }
        },
      );
    } else {
      sendMessage(text);
    }
    setDraft("");
  };

  return (
    <div className={`messages-page${hasThread ? " has-thread" : ""}`}>
      <aside className="messages-sidebar">
        <h2>Messages</h2>
        {convLoading && <p>Loading…</p>}
        {convError && <p className="create-error">{convError}</p>}
        {!convLoading && !convError && conversations.length === 0 && (
          <p>No conversations yet.</p>
        )}
        <ul className="messages-conversation-list">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p._id !== user.id);
            const unread = unreadConversationIds.has(c._id);
            return (
              <li key={c._id}>
                <button
                  type="button"
                  className={`messages-conversation-item${
                    c._id === conversationId ? " active" : ""
                  }`}
                  onClick={() => navigate(`/messages/${c._id}`)}
                >
                  <div className="messages-conversation-thumb-wrap">
                    <img
                      src={c.apartment.images?.[0] ?? "/no-photo.svg"}
                      alt=""
                      className="messages-conversation-thumb"
                    />
                    {unread && <span className="messages-unread-dot" />}
                  </div>
                  <div className="messages-conversation-meta">
                    <div
                      className={`messages-conversation-name${unread ? " unread" : ""}`}
                    >
                      {other?.name ?? "Unknown"}
                    </div>
                    <div className="messages-conversation-listing">
                      {c.apartment.title}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="messages-thread">
        {!conversationId && !isDraft && (
          <p className="messages-empty-state">
            Select a conversation to start chatting.
          </p>
        )}

        {isDraft && convLoading && <p>Loading…</p>}
        {isDraft && !convLoading && draftError && (
          <p className="create-error">{draftError}</p>
        )}

        {(conversationId ||
          (isDraft && !convLoading && !draftError && draftApartment)) && (
          <>
            {conversationId && activeConversation && (
              <div className="messages-thread-header">
                <Link
                  to="/messages"
                  className="messages-thread-back"
                  aria-label="Back to conversations"
                >
                  ‹
                </Link>
                {activeConversation.apartment.title}
              </div>
            )}
            {isDraft && draftApartment && (
              <div className="messages-thread-header">
                <Link
                  to="/messages"
                  className="messages-thread-back"
                  aria-label="Back to conversations"
                >
                  ‹
                </Link>
                {draftApartment.title}
              </div>
            )}

            <div className="messages-thread-body">
              {isDraft ? (
                <p className="messages-empty-state">
                  Say hello to start the conversation about this listing.
                </p>
              ) : (
                <>
                  {msgLoading && <p>Loading…</p>}
                  {msgError && <p className="create-error">{msgError}</p>}
                  {messages.map((m) => (
                    <div
                      key={m._id}
                      className={`messages-bubble${
                        m.sender._id === user.id ? " mine" : " theirs"
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                </>
              )}
            </div>

            <form className="messages-input-row" onSubmit={handleSend}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                disabled={sending}
              />
              <button className="btn-submit" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
