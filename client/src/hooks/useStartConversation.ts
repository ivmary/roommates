import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/store/AuthContext";

export function useStartConversation() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const startConversation = async (apartmentId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apartmentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate(`/messages/${data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return { startConversation, error };
}
