import { useState } from "react";
import { loginUser } from "../api/authApi";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const data = await loginUser({
                email,
                password,
            });

            login(data.user, data.token);
            navigate("/");

            setSuccess("Logged in successfully.");

            // Later you can redirect to home/admin page here
            // window.location.href = "/";
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
                <p className="auth-label">Welcome Back</p>
                <h1>Login</h1>
                <p className="auth-description">
                    Login to continue shopping our coffees and viewing your account.
                </p>

                <form onSubmit={handleLogin} className="auth-form">
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
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="auth-bottom-text">
                    Don&apos;t have an account? <a href="/register">Register</a>
                </p>
            </section>
        </main>
    );
}

export default LoginPage;