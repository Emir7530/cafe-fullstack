import { useState } from "react";
import { registerUser } from "../api/authApi";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await registerUser({
        name,
        email,
        password,
      });

      login(data.user, data.token);
      navigate("/");

      setSuccess("Account created successfully.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-label">Create Account</p>
        <h1>Register</h1>
        <p className="auth-description">
          Join our cafe and start shopping your favorite coffees.
        </p>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Emir"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="emir@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-bottom-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;