import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import "./styles/ProfilePage.css";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
          ) : (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h1>{user.name}</h1>
        <p className="profile-email">{user.email}</p>
      </div>
    </div>
  );
}
