import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const features = [
  {
    icon: '🎯',
    title: 'Smart Matching',
    desc: 'Filter by smoking, pets, noise level, guests, and more — find roommates who actually fit your lifestyle.',
  },
  {
    icon: '🗺️',
    title: 'Map & List View',
    desc: 'Browse available rooms on an interactive map or as a list. Sort by price, location, or match score.',
  },
  {
    icon: '💬',
    title: 'Built-in Chat',
    desc: "Message the current tenants directly through the app. No Facebook groups, no Instagram DMs.",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Find your next home</span>
          <h1>Find Roommates<br />Who Actually Fit</h1>
          <p className="hero-sub">
            No more scrolling through Facebook groups. Match by price, location,
            and lifestyle — and chat directly with future roommates.
          </p>
          <div className="hero-actions">
            <a href="/search" className="btn-cta">Find a Room</a>
            <a href="/create" className="btn-cta-outline">List Your Room</a>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="features-title">Everything you need to find the right fit</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to find your next roommate?</h2>
        <p>Join hundreds of people who found their perfect match.</p>
        {user ? (
          <Link to="/search" className="btn-cta">Browse Rooms</Link>
        ) : (
          <Link to="/register" className="btn-cta">Get Started — It's Free</Link>
        )}
      </section>
    </main>
  );
}
