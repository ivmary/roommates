import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import ListingForm from "../components/ListingForm";
import type { ListingFormValues } from "../types";
import "./styles/CreatePage.css";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ListingFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/apartments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...values, price: Number(values.price) }),
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
          <ListingForm
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            submitLabel={loading ? "Posting…" : "Post listing"}
            loading={loading}
            error={error}
          />
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
