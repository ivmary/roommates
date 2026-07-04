import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import { useMyListings } from "../../../hooks/useMyListings";
import "./styles/CreatePage.css";
import "./styles/MyListingsPage.css";

export default function MyListingsPage() {
  const { user, token } = useAuth();
  const { listings, loading, error, refetch } = useMyListings();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    setDeleteError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/apartments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="create-page">
        <div className="create-guest">
          <div className="create-guest-icon">🔒</div>
          <h2>Sign in to see your listings</h2>
          <p>You need an account to manage the listings you've posted.</p>
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

  return (
    <div className="create-page">
      <div className="create-inner my-listings-inner">
        <div className="create-header">
          <h1>My listings</h1>
          <p>View, edit, and delete the listings you've posted.</p>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className="create-error">{error}</p>}
        {deleteError && <p className="create-error">{deleteError}</p>}

        {!loading && !error && listings.length === 0 && (
          <div className="my-listings-empty">
            <p>You haven't posted any listings yet.</p>
            <Link className="btn-submit" to="/create">
              Post a listing
            </Link>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="my-listings-table-wrap">
            <table className="my-listings-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Rooms</th>
                  <th>Posted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l._id}>
                    <td className="my-listings-thumb-cell">
                      <img
                        src={l.images?.[0] ?? "/no-photo.svg"}
                        alt={l.title}
                        className="my-listings-thumb"
                      />
                    </td>
                    <td>{l.title}</td>
                    <td>{l.street ? `${l.street}, ` : ""}{l.city}</td>
                    <td>₪{l.price.toLocaleString()}</td>
                    <td>{l.rooms || "—"}</td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="my-listings-actions">
                        <Link className="btn-edit" to={`/listings/${l._id}/edit`}>
                          Edit
                        </Link>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(l._id)}
                          disabled={deletingId === l._id}
                        >
                          {deletingId === l._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
