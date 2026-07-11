import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/store/AuthContext";

// Doesn't create anything — just routes to the conversation for this
// apartment if one exists, or a draft thread if it doesn't yet.
// MessagesPage resolves which one it is once it loads.
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
