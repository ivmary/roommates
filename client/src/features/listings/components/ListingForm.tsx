import { useState } from "react";
import { useIsraeliCities } from "../../../hooks/useIsraeliCities";
import type { ListingFormValues } from "../types";
import { emptyListingFormValues } from "../types";
import "../views/styles/CreatePage.css";

interface ListingFormProps {
  initialValues?: Partial<ListingFormValues>;
  onSubmit: (values: ListingFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  loading: boolean;
  error: string | null;
}

export default function ListingForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
  error,
}: ListingFormProps) {
  const { cities, loading: citiesLoading } = useIsraeliCities();
  const [form, setForm] = useState<ListingFormValues>({
    ...emptyListingFormValues,
    ...initialValues,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const set = (field: keyof ListingFormValues, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (!form.title || !form.city || !form.price) {
      setValidationError("Title, city and price are required.");
      return;
    }
    setValidationError(null);
    onSubmit(form);
  };

  return (
    <>
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
            <label htmlFor="street">Neighborhood</label>
            <input
              id="street"
              type="text"
              placeholder="e.g. Florentin"
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
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
      {(validationError || error) && (
        <p className="create-error">{validationError ?? error}</p>
      )}
      <div className="create-actions">
        <button
          className="btn-cancel"
          type="button"
          onClick={onCancel}
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
          {submitLabel}
        </button>
      </div>
    </>
  );
}
