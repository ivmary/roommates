import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/store/AuthContext";

export function useStartConversation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const startConversation = (apartmentId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/messages/apartment/${apartmentId}`);
  };

  return { startConversation };
}
