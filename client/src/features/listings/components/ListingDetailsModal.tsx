import { useState } from "react";
import Modal from "../../../shared/components/Modal";
import ImageCarousel from "./ImageCarousel";
import { useAuth } from "../../../shared/store/AuthContext";
import { useStartConversation } from "../../../hooks/useStartConversation";
import type { Listing } from "../types";
import "./styles/ListingDetailsModal.css";

interface ListingDetailsModalProps {
  listing: Listing;
  onClose: () => void;
}

export default function ListingDetailsModal({
  listing,
  onClose,
}: ListingDetailsModalProps) {
  const { user } = useAuth();
  const { startConversation, error } = useStartConversation();
  const [opening, setOpening] = useState(false);

  const isOwner = user?.id === listing.owner._id;

  const handleOpenChat = async () => {
    setOpening(true);
    await startConversation(listing._id);
    setOpening(false);
  };

  return (
    <Modal onClose={onClose}>
      <div className="listing-details">
        <ImageCarousel images={listing.images} alt={listing.title} />

        <div className="listing-details-body">
          <div className="listing-details-price">
            ₪{listing.price.toLocaleString()}
            <span> / month</span>
          </div>

          <div className="listing-details-location">
            📍 {listing.street ? `${listing.street}, ` : ""}
            {listing.city}
          </div>

          <h2 className="listing-details-title">{listing.title}</h2>

          {listing.description && (
            <p className="listing-details-desc">{listing.description}</p>
          )}

          <div className="listing-details-tags">
            {listing.rooms && <span className="tag">{listing.rooms} rooms</span>}
            {listing.available && (
              <span className="tag">{listing.available} available</span>
            )}
            {listing.gender && <span className="tag">{listing.gender}</span>}
            {listing.pets && <span className="tag">Pets OK</span>}
            {listing.smoking && <span className="tag">Smoking OK</span>}
            {listing.students && <span className="tag">Students welcome</span>}
            {listing.furnished && <span className="tag">Furnished</span>}
          </div>

          <div className="listing-details-owner">
            {listing.owner.avatar ? (
              <img
                src={listing.owner.avatar}
                alt={listing.owner.name}
                className="listing-details-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="listing-details-avatar listing-details-avatar--fallback">
                {listing.owner.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{listing.owner.name}</span>
          </div>

          {error && <p className="listing-details-error">{error}</p>}

          {!isOwner && (
            <button
              className="btn-open-chat"
              onClick={handleOpenChat}
              disabled={opening}
            >
              {opening ? "Opening chat…" : "Open chat"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
