import { useState, useEffect } from "react";
import { useIsraeliCities } from "../../../hooks/useIsraeliCities";
import { useAuth } from "../../../shared/store/AuthContext";
import { useStartConversation } from "../../../hooks/useStartConversation";
import ListingDetailsModal from "../components/ListingDetailsModal";
import type { Listing } from "../types";
import "./styles/SearchPage.css";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default function SearchPage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { startConversation, error: messageError } = useStartConversation();
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const { cities, loading: citiesLoading } = useIsraeliCities();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch(`/api/apartments`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load listings");
        return r.json();
      })
      .then(setAllListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const listings = allListings
    .filter((l) => {
      const q = query.toLowerCase();
      if (
        q &&
        !l.street?.toLowerCase().includes(q) &&
        !l.title.toLowerCase().includes(q)
      )
        return false;
      if (
        city &&
        l.city !== city &&
        !l.city.toLowerCase().includes(city.toLowerCase())
      )
        return false;
      if (minPrice && l.price < Number(minPrice)) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      if (rooms && l.rooms !== rooms) return false;
      if (gender && l.gender !== gender) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleMessage = async (apartmentId: string) => {
    setMessagingId(apartmentId);
    await startConversation(apartmentId);
    setMessagingId(null);
  };

  return (
    <div className="search-page">
      {/* Filters */}
      <div className="search-bar">
        <div className="search-bar-inner">
          <div className="search-field">
            <label>City</label>
            <input
              type="text"
              list="cities-list"
              placeholder={citiesLoading ? "Loading…" : "Any city"}
              disabled={citiesLoading}
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                setCity(e.target.value);
              }}
            />
            <datalist id="cities-list">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="search-field search-field--wide">
            <label>Neighborhood or keyword</label>
            <input
              type="text"
              placeholder="e.g. Florentin, quiet room…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Min price (₪)</label>
            <input
              type="number"
              placeholder="1 000"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Max price (₪)</label>
            <input
              type="number"
              placeholder="5 000"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Rooms</label>
            <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
              <option value="">Any</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6+</option>
            </select>
          </div>

          <div className="search-field">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Any</option>
              <option>Mixed</option>
              <option>Female only</option>
              <option>Male only</option>
            </select>
          </div>

          <button className="search-btn" onClick={() => {}}>
            Search
          </button>
        </div>
      </div>

      {/* Results header */}
      <div className="results-header">
        <p className="results-count">
          {loading ? (
            "Loading…"
          ) : error ? (
            ""
          ) : (
            <>
              Showing{" "}
              <strong>
                {listings.length} listing{listings.length !== 1 ? "s" : ""}
              </strong>{" "}
              across Israel
            </>
          )}
        </p>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Sort: Newest first</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
      </div>

      {/* States */}
      {error && <p className="search-error">{error}</p>}
      {messageError && <p className="search-error">{messageError}</p>}

      {!loading && !error && listings.length === 0 && (
        <p className="search-empty">No listings match your search.</p>
      )}

      {/* Cards */}
      <div className="results-grid">
        {listings.map((l) => {
          const isNew =
            Date.now() - new Date(l.createdAt).getTime() < 3 * 86_400_000;
          return (
            <div
              className="listing-card"
              key={l._id}
              onClick={() => setSelectedListing(l)}
            >
              <div className="listing-img">
                <img
                  src={l.images?.[0] ?? "/no-photo.svg"}
                  alt={l.title}
                  className="listing-thumb"
                />
                {isNew && <span className="listing-badge">New</span>}
              </div>

              <div className="listing-body">
                <div className="listing-price">
                  ₪{l.price.toLocaleString()}
                  <span> / month</span>
                </div>

                <div className="listing-location">
                  📍 {l.street ? `${l.street}, ` : ""}
                  {l.city}
                </div>

                <div className="listing-title">{l.title}</div>

                {l.description && (
                  <p className="listing-desc">{l.description}</p>
                )}

                <div className="listing-tags">
                  {l.rooms && <span className="tag">{l.rooms} rooms</span>}
                  {l.available && (
                    <span className="tag">{l.available} available</span>
                  )}
                  {l.gender && <span className="tag">{l.gender}</span>}
                  {l.pets && <span className="tag">Pets OK</span>}
                  {l.smoking && <span className="tag">Smoking OK</span>}
                  {l.students && <span className="tag">Students welcome</span>}
                  {l.furnished && <span className="tag">Furnished</span>}
                </div>
              </div>

              <div className="listing-footer">
                <span className="listing-posted">{timeAgo(l.createdAt)}</span>
                <div className="listing-footer-actions">
                  {l.owner._id !== user?.id && (
                    <button
                      className="btn-message"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessage(l._id);
                      }}
                      disabled={messagingId === l._id}
                    >
                      {messagingId === l._id ? "…" : "Message"}
                    </button>
                  )}
                  <button
                    className="btn-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedListing(l);
                    }}
                  >
                    View listing
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
