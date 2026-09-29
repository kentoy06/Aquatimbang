import React, { useState } from "react";
import "./App.css";
import "./Login.css";

import Landing from "./Landing.jsx";
import Register from "./Register.jsx";
import Admin from "./Admin.jsx";
import Vendor from "./Vendor.jsx";
import LGU from "./LGU.jsx";

function App() {
  // "landing" | "login" | "register", or a role once logged in
  const [page, setPage] = useState("landing");

  const handleLogout = () => setPage("landing");
  const goLanding = () => setPage("landing");
  const goLogin = () => setPage("login");
  const goRegister = () => setPage("register");

  if (page === "Admin") return <Admin onLogout={handleLogout} />;
  if (page === "Vendor") return <Vendor onLogout={handleLogout} />;
  if (page === "LGU") return <LGU onLogout={handleLogout} />;
  if (page === "register") return <Register onBack={goLanding} onGoToLogin={goLogin} />;
  if (page === "login") return <Login onLogin={setPage} onBack={goLanding} onRegister={goRegister} />;

  return <Landing onGetStarted={goLogin} onRegister={goRegister} />;
}


/* =========================
   LOGIN / ROLE SELECT
========================= */

function Login({ onLogin, onBack, onRegister }) {
  const [selected, setSelected] = useState("Vendor");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    setError("");
    onLogin(selected);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setError("");
    setForgotSent(true);
  };

  const backToLoginForm = () => {
    setForgotMode(false);
    setForgotSent(false);
    setForgotEmail("");
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT PANEL */}
        <div className="login-left">
          <button className="login-back-btn" onClick={onBack}>← Back to Home</button>

          <div className="login-brand login-brand-spaced">
            <div className="brand-icon">🐟</div>
            <div>
              <h2>AquaTimbang</h2>
              <span>Fish Price Transparency</span>
            </div>
          </div>

          <h1>
            Fair prices,
            <br />
            clearly shown.
          </h1>

          <p>
            AquaTimbang publishes LGU-validated fish prices so vendors and
            buyers work from the same official rates.
          </p>

          <div className="login-points">
            <div className="login-point">
              <span>✔</span> Prices validated by LGU officers
            </div>
            <div className="login-point">
              <span>✔</span> Instant fair price computation
            </div>
            <div className="login-point">
              <span>✔</span> Short-term price forecasting
            </div>
          </div>

          <div className="login-fish">🐟</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">

          <div className="auth-tabs">
            <button className="auth-tab auth-tab-active">Login</button>
            <button className="auth-tab" onClick={onRegister}>Register</button>
          </div>

          {forgotMode ? (
            forgotSent ? (
              <>
                <div className="login-head">
                  <h3>Check your email</h3>
                  <p>If an account matches {forgotEmail}, we've sent password reset instructions to it.</p>
                </div>
                <button className="primary-btn full-btn" onClick={backToLoginForm}>← Back to Login</button>
              </>
            ) : (
              <>
                <div className="login-head">
                  <h3>Reset your password</h3>
                  <p>Enter your registered email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleForgotSubmit}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  {error && <div className="login-error">⚠ {error}</div>}

                  <button type="submit" className="primary-btn full-btn">Send Reset Link</button>
                </form>

                <div className="login-hint forgot-hint">
                  <button className="login-inline-link" onClick={backToLoginForm}>← Back to Login</button>
                </div>
              </>
            )
          ) : (
            <>
              <div className="login-head">
                <h3>Sign in to your account</h3>
                <p>Enter your username and password.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="forgot-link-row">
                  <button type="button" className="forgot-link" onClick={() => setForgotMode(true)}>Forgot password?</button>
                </div>

                <div className="simple-role-select">
                  <label>Log in as (demo selector)</label>
                  <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                    <option value="Vendor">Fish Vendor</option>
                    <option value="LGU">LGU Officer</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                {error && <div className="login-error">⚠ {error}</div>}

                <button type="submit" className="primary-btn full-btn">
                  Sign In
                </button>
              </form>

              <div className="login-hint">
                Demo build — any username and password will work. The dropdown
                above decides which dashboard opens, standing in for real
                role-based login until the backend is connected.
              </div>

              <div className="login-hint login-hint-big">
                New here?{" "}
                <button className="login-inline-link login-inline-link-big" onClick={onRegister}>Register instead</button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;