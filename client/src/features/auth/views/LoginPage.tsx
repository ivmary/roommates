import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import "./styles/Auth.css";

import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to your RoomMates account</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-google">
            <GoogleLogin
              onSuccess={async (response) => {
                try {
                  await googleLogin(response.credential!);
                  navigate("/");
                } catch (err: unknown) {
                  setError(
                    err instanceof Error ? err.message : "Google login failed",
                  );
                }
              }}
              onError={() => setError("Google login failed")}
              width="340"
            />
          </div>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
