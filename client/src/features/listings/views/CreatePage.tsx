import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import "./styles/CreatePage.css";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    neighborhood: "",
    price: "",
    rooms: "",
    available: "",
    gender: "",
    pets: false,
    smoking: false,
    students: false,
    furnished: false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

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
                <select
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                >
                  <option value="">Select city…</option>
                  <option>Tel Aviv</option>
                  <option>Jerusalem</option>
                  <option>Haifa</option>
                  <option>Be'er Sheva</option>
                  <option>Ramat Gan</option>
                  <option>Petah Tikva</option>
                  <option>Rishon LeZion</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="neighborhood">Neighborhood</label>
                <input
                  id="neighborhood"
                  type="text"
                  placeholder="e.g. Florentin"
                  value={form.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                />
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
          <div className="create-actions">
            <button
              className="btn-cancel"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button className="btn-submit" type="button">
              Post listing
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
