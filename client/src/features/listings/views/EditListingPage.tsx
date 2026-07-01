import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import ListingForm from "../components/ListingForm";
import type { Listing, ListingFormValues } from "../types";
import "./styles/CreatePage.css";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFetchLoading(true);
    setNotFound(false);

    fetch(`/api/apartments/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("not-found");
        if (!res.ok) throw new Error("Failed to load listing");
        return res.json() as Promise<Listing>;
      })
      .then((data) => {
        if (cancelled) return;
        if (!user || data.owner._id !== user.id) {
          setNotFound(true);
        } else {
          setListing(data);
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setFetchLoading(false); });

    return () => { cancelled = true; };
  }, [id, user]);

  const handleSubmit = async (values: ListingFormValues) => {
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/apartments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...values, price: Number(values.price) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate("/my-listings");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-page">
        <div className="create-guest">
          <div className="create-guest-icon">🔒</div>
          <h2>Sign in to edit this listing</h2>
          <p>You need an account to manage your listings.</p>
          <div className="create-guest-actions">
            <Link className="btn-submit" to="/login">
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="create-page">
        <p>Loading…</p>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="create-page">
        <div className="create-guest">
          <h2>Listing not found</h2>
          <p>This listing doesn't exist or isn't one of yours.</p>
          <div className="create-guest-actions">
            <Link className="btn-submit" to="/my-listings">
              Back to my listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      <div className="create-inner">
        <div className="create-header">
          <h1>Edit listing</h1>
          <p>Update the details of your listing.</p>
        </div>
        <ListingForm
          initialValues={{ ...listing, price: String(listing.price) }}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/my-listings")}
          submitLabel={submitLoading ? "Saving…" : "Save changes"}
          loading={submitLoading}
          error={submitError}
        />
      </div>
    </div>
  );
}
