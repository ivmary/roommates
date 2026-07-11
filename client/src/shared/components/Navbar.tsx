import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import { useUnreadMessageCount } from "../store/SocketContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const unreadCount = useUnreadMessageCount();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          🏠 RooMates
        </Link>
        <div className="navbar-actions">
          <Link to="/search" className="navbar-link">
            Search
          </Link>
          <Link to="/create" className="navbar-link">
            Create Listing
          </Link>
          {user ? (
            <div className="navbar-menu" ref={menuRef}>
              <button
                className="navbar-trigger"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={open}
              >
                <div className="navbar-avatar">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                  {unreadCount > 0 && <span className="navbar-unread-dot" />}
                </div>
                <span className="navbar-user">{user.name.split(" ")[0]}</span>
              </button>
              {open && (
                <div className="navbar-dropdown" role="menu">
                  <Link className="navbar-dropdown-item" to="/profile" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                  <Link className="navbar-dropdown-item" to="/my-listings" onClick={() => setOpen(false)}>
                    My Listings
                  </Link>
                  <Link className="navbar-dropdown-item" to="/messages" onClick={() => setOpen(false)}>
                    Messages
                    {unreadCount > 0 && (
                      <span className="navbar-unread-badge">{unreadCount}</span>
                    )}
                  </Link>
                  <button className="navbar-dropdown-item" onClick={() => { setOpen(false); logout(); }}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
