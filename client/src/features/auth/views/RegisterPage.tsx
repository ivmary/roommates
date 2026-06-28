import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/store/AuthContext";
import "./styles/Auth.css";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
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
        <h1>Create account</h1>
        <p className="subtitle">
          Join RoomMates and find your perfect roommate
        </p>

        {error && <div className="auth-error">{error}</div>}

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
        <div className="auth-divider">
          <span>or</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mary Cohen"
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
