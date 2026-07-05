import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import { useUnreadConversationIds } from "../../../shared/store/SocketContext";
import { useConversations } from "../../../hooks/useConversations";
import { useMessages } from "../../../hooks/useMessages";
import "../../listings/views/styles/CreatePage.css";
import "./styles/MessagesPage.css";

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations, loading: convLoading, error: convError } = useConversations();
  const unreadConversationIds = useUnreadConversationIds();
  const { messages, loading: msgLoading, error: msgError, sendMessage } =
    useMessages(conversationId ?? null);
  const [draft, setDraft] = useState("");

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

  const activeConversation = conversations.find((c) => c._id === conversationId);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="messages-page">
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
        {!conversationId && (
          <p className="messages-empty-state">Select a conversation to start chatting.</p>
        )}

        {conversationId && (
          <>
            {activeConversation && (
              <div className="messages-thread-header">
                {activeConversation.apartment.title}
              </div>
            )}

            <div className="messages-thread-body">
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
            </div>

            <form className="messages-input-row" onSubmit={handleSend}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
              />
              <button className="btn-submit" type="submit">
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
