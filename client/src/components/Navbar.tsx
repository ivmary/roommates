import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo">
          🏠 PartDorms
        </a>
        <div className="navbar-actions">
          <a href="/login" className="btn btn-ghost">Log in</a>
          <a href="/register" className="btn btn-primary">Sign up</a>
        </div>
      </div>
    </nav>
  );
}
