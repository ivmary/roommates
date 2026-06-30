import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import { useIsraeliCities } from "../../../hooks/useIsraeliCities";
import { useStreets } from "../../../hooks/useStreets";
import "./styles/CreatePage.css";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    street: "",
    price: "",
    rooms: "",
    available: "",
    gender: "",
    pets: false,
    smoking: false,
    students: false,
    furnished: false,
  });

  const { cities, loading: citiesLoading } = useIsraeliCities();
  const { streets, loading: streetsLoading } = useStreets(
    cities.includes(form.city) ? form.city : ""
  );

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title || !form.city || !form.price) {
      setError("Title, city and price are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/apartments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate("/search");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      {user ? (
        <div className="create-inner">
          <div className="create-header">
            <h1>Post a listing</h1>
            <p>Fill in the details below and let roommates find you.</p>
          </div>

          {/* Basic info */}
          <div className="create-section">
            <div className="section-title">Basic info</div>

            <div className="field">
              <label htmlFor="title">Listing title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Sunny room in Florentin, Tel Aviv"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <span className="field-hint">
                Describe the apartment, vibe, and what you're looking for in a
                roommate.
              </span>
              <textarea
                id="description"
                placeholder="The apartment is on the 3rd floor, lots of natural light…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="create-section">
            <div className="section-title">Location</div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  list="cities-list"
                  placeholder={citiesLoading ? 'Loading cities…' : 'Type a city…'}
                  disabled={citiesLoading}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                <datalist id="cities-list">
                  {cities.map((city) => <option key={city} value={city} />)}
                </datalist>
              </div>

              <div className="field">
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  type="text"
                  list="streets-list"
                  placeholder={
                    !form.city || !cities.includes(form.city)
                      ? 'Select a city first'
                      : streetsLoading
                      ? 'Loading streets…'
                      : 'Type a street…'
                  }
                  disabled={!form.city || !cities.includes(form.city) || streetsLoading}
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
                <datalist id="streets-list">
                  {streets.map((s) => <option key={s} value={s} />)}
                </datalist>
              </div>
            </div>
          </div>

          {/* Apartment details */}
          <div className="create-section">
            <div className="section-title">Apartment details</div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="price">Monthly rent (₪)</label>
                <input
                  id="price"
                  type="number"
                  placeholder="2 500"
                  min={0}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="rooms">Total rooms</label>
                <select
                  id="rooms"
                  value={form.rooms}
                  onChange={(e) => set("rooms", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6+</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="available">Rooms available</label>
                <select
                  id="available"
                  value={form.available}
                  onChange={(e) => set("available", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="gender">Gender preference</label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  <option value="">No preference</option>
                  <option>Mixed</option>
                  <option>Female only</option>
                  <option>Male only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="create-section">
            <div className="section-title">Preferences &amp; features</div>

            <div className="pref-grid">
              <label className="pref-option">
                <input
                  type="checkbox"
                  checked={form.pets}
                  onChange={(e) => set("pets", e.target.checked)}
                />
                <span>🐾 Pets allowed</span>
              </label>

              <label className="pref-option">
                <input
                  type="checkbox"
                  checked={form.smoking}
                  onChange={(e) => set("smoking", e.target.checked)}
                />
                <span>🚬 Smoking OK</span>
              </label>

              <label className="pref-option">
                <input
                  type="checkbox"
                  checked={form.students}
                  onChange={(e) => set("students", e.target.checked)}
                />
                <span>🎓 Students welcome</span>
              </label>

              <label className="pref-option">
                <input
                  type="checkbox"
                  checked={form.furnished}
                  onChange={(e) => set("furnished", e.target.checked)}
                />
                <span>🛋️ Furnished</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          {error && <p className="create-error">{error}</p>}
          <div className="create-actions">
            <button
              className="btn-cancel"
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn-submit"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Posting…" : "Post listing"}
            </button>
          </div>
        </div>
      ) : (
        <div className="create-guest">
          <div className="create-guest-icon">🔒</div>
          <h2>Sign in to post a listing</h2>
          <p>You need an account to create and manage listings.</p>
          <div className="create-guest-actions">
            <Link className="btn-submit" to="/login">
              Log in
            </Link>
            <Link className="btn-cancel" to="/register">
              Create account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
