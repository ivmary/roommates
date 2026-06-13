import './SearchPage.css';

const LISTINGS = [
  {
    id: 1,
    title: 'Sunny room in shared flat',
    price: 2200,
    city: 'Tel Aviv',
    neighborhood: 'Florentin',
    rooms: 3,
    available: 1,
    gender: 'Mixed',
    pets: true,
    smoking: false,
    desc: 'Bright room in a well-maintained apartment, 5 min walk from Carmelit market. Furnished, high-speed Wi-Fi.',
    posted: '2 days ago',
    badge: 'New',
  },
  {
    id: 2,
    title: 'Large room near university',
    price: 1800,
    city: 'Haifa',
    neighborhood: 'Neve Shaanan',
    rooms: 4,
    available: 2,
    gender: 'Female only',
    pets: false,
    smoking: false,
    desc: 'Two rooms available in a quiet 4-bedroom apartment. Close to Technion and public transport.',
    posted: '5 days ago',
    badge: null,
  },
  {
    id: 3,
    title: 'Modern flat, sea view',
    price: 3100,
    city: 'Tel Aviv',
    neighborhood: 'Old North',
    rooms: 2,
    available: 1,
    gender: 'Mixed',
    pets: true,
    smoking: false,
    desc: 'Stylish apartment with a rooftop terrace and sea views. Looking for one quiet roommate.',
    posted: '1 week ago',
    badge: null,
  },
  {
    id: 4,
    title: 'Cozy studio share',
    price: 1600,
    city: 'Jerusalem',
    neighborhood: 'Katamon',
    rooms: 2,
    available: 1,
    gender: 'Male only',
    pets: false,
    smoking: false,
    desc: 'Peaceful apartment in a central Jerusalem neighborhood. Strong student community in the building.',
    posted: '3 days ago',
    badge: 'Popular',
  },
  {
    id: 5,
    title: 'Penthouse room with terrace',
    price: 3800,
    city: 'Tel Aviv',
    neighborhood: 'Neve Tzedek',
    rooms: 3,
    available: 1,
    gender: 'Mixed',
    pets: true,
    smoking: true,
    desc: 'Top-floor apartment with a private terrace. Recently renovated kitchen and bathroom.',
    posted: '1 day ago',
    badge: 'New',
  },
  {
    id: 6,
    title: 'Budget-friendly shared house',
    price: 1400,
    city: 'Be\'er Sheva',
    neighborhood: 'Dalet',
    rooms: 5,
    available: 3,
    gender: 'Mixed',
    pets: false,
    smoking: false,
    desc: 'Large house near Ben-Gurion University. Ideal for students looking to save on rent.',
    posted: '2 weeks ago',
    badge: null,
  },
];

const ICONS: Record<string, string> = {
  'Tel Aviv': '🏙️',
  'Haifa': '⛰️',
  'Jerusalem': '🕍',
  "Be'er Sheva": '🌵',
};

export default function SearchPage() {
  return (
    <div className="search-page">
      {/* Filters */}
      <div className="search-bar">
        <div className="search-bar-inner">
          <div className="search-field search-field--wide">
            <label>City or neighborhood</label>
            <input type="text" placeholder="e.g. Tel Aviv, Florentin…" />
          </div>

          <div className="search-field">
            <label>Min price (₪)</label>
            <input type="number" placeholder="1 000" min={0} />
          </div>

          <div className="search-field">
            <label>Max price (₪)</label>
            <input type="number" placeholder="5 000" min={0} />
          </div>

          <div className="search-field">
            <label>Rooms</label>
            <select>
              <option value="">Any</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5+</option>
            </select>
          </div>

          <div className="search-field">
            <label>Gender</label>
            <select>
              <option value="">Any</option>
              <option>Mixed</option>
              <option>Female only</option>
              <option>Male only</option>
            </select>
          </div>

          <button className="search-btn">Search</button>
        </div>
      </div>

      {/* Results header */}
      <div className="results-header">
        <p className="results-count">
          Showing <strong>{LISTINGS.length} listings</strong> across Israel
        </p>
        <select className="sort-select">
          <option>Sort: Newest first</option>
          <option>Price: Low to high</option>
          <option>Price: High to low</option>
        </select>
      </div>

      {/* Cards */}
      <div className="results-grid">
        {LISTINGS.map((l) => (
          <div className="listing-card" key={l.id}>
            <div className="listing-img">
              <span>{ICONS[l.city] ?? '🏠'}</span>
              {l.badge && <span className="listing-badge">{l.badge}</span>}
            </div>

            <div className="listing-body">
              <div className="listing-price">
                ₪{l.price.toLocaleString()}
                <span> / month</span>
              </div>

              <div className="listing-location">
                📍 {l.neighborhood}, {l.city}
              </div>

              <div className="listing-title">{l.title}</div>

              <p className="listing-desc">{l.desc}</p>

              <div className="listing-tags">
                <span className="tag">{l.rooms} rooms</span>
                <span className="tag">{l.available} available</span>
                <span className="tag">{l.gender}</span>
                {l.pets && <span className="tag">Pets OK</span>}
                {l.smoking && <span className="tag">Smoking OK</span>}
              </div>
            </div>

            <div className="listing-footer">
              <span className="listing-posted">{l.posted}</span>
              <button className="btn-view">View listing</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
