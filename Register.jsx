import React, { useState } from "react";
import "./App.css";
import "./Login.css";

const MUNICIPALITIES = [
  "Cebu City", "Mandaue City", "Lapu-Lapu City", "Talisay City",
  "Consolacion", "Liloan", "Compostela", "Cordova", "Minglanilla",
];

function Register({ onBack, onGoToLogin }) {
  const [role, setRole] = useState("Fish Vendor");
  const [form, setForm] = useState({
    name: "", username: "", password: "", confirmPassword: "",
    contact: "", email: "", dob: "", sex: "",
    municipality: "Cebu City", municipalityOther: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.username.trim() || !form.password.trim() || !form.contact.trim() || !form.email.trim() || !form.dob || !form.sex) {
      setError("Please fill in every field.");
      return;
    }
    if (form.municipality === "Other" && !form.municipalityOther.trim()) {
      setError("Please type your municipality.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!form.agree) {
      setError("Please agree to the Privacy Policy and Terms to continue.");
      return;
    }

    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="login-page">
        <div className="login-card register-confirm-card">
          <div className="register-confirm-icon">✔</div>
          <h3>Registration submitted</h3>
          <p>
            Thanks, {form.name.split(" ")[0]}! Your {role} account is pending
            approval from an Administrator. You'll be able to log in once
            it's reviewed and approved.
          </p>
          <div className="button-row" style={{ marginTop: 22 }}>
            <button className="secondary-btn" onClick={onBack}>← Back to Home</button>
            <button className="primary-btn" onClick={onGoToLogin}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

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

          <h1>Join as a<br />registered user.</h1>

          <p>
            Registering lets you access AquaTimbang as a Fish Vendor or LGU
            Officer. New accounts are monitored and reviewed by an
            Administrator before they're activated.
          </p>

          <div className="login-points">
            <div className="login-point"><span>✔</span> Free to register</div>
            <div className="login-point"><span>✔</span> Reviewed by an Administrator</div>
            <div className="login-point"><span>✔</span> Track your own activity once approved</div>
          </div>

          <div className="login-fish">🐟</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">

          <div className="auth-tabs">
            <button className="auth-tab" onClick={onGoToLogin}>Login</button>
            <button className="auth-tab auth-tab-active">Register</button>
          </div>

          <div className="login-head">
            <h3>Create your account</h3>
            <p>Select your role and fill in your details below.</p>
          </div>

          <div className="admin-watch-note">
            <span>🛈</span>
            <p>Every registration is reviewed by an Administrator before your account is activated.</p>
          </div>

          <div className="role-toggle-label">I am registering as:</div>
          <div className="role-toggle">
            <button
              type="button"
              className={`role-toggle-btn ${role === "Fish Vendor" ? "role-toggle-btn-active" : ""}`}
              onClick={() => setRole("Fish Vendor")}
            >
              🐟 Fish Vendor
            </button>
            <button
              type="button"
              className={`role-toggle-btn ${role === "LGU Officer" ? "role-toggle-btn-active" : ""}`}
              onClick={() => setRole("LGU Officer")}
            >
              ✔ LGU Officer
            </button>
          </div>

          <div className="registering-as-note">
            You are registering as a <strong>{role}</strong>.
            {role === "LGU Officer" && (
              <> LGU Officer requests require identity verification by the
              Administrator and may take longer to approve.</>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} placeholder="Enter your full name" onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sex</label>
                <select value={form.sex} onChange={(e) => update("sex", e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label>Username</label>
                <input value={form.username} placeholder="Choose a username" onChange={(e) => update("username", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} placeholder="At least 6 characters" onChange={(e) => update("password", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={form.confirmPassword} placeholder="Re-enter your password" onChange={(e) => update("confirmPassword", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Number</label>
                <input value={form.contact} placeholder="e.g. 0917 555 0198" onChange={(e) => update("contact", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email} placeholder="you@email.com" onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Municipality</label>
              <select value={form.municipality} onChange={(e) => update("municipality", e.target.value)}>
                {MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}
                <option value="Other">Other — not listed</option>
              </select>
            </div>

            {form.municipality === "Other" && (
              <div className="form-group">
                <label>Type your municipality</label>
                <input value={form.municipalityOther} placeholder="Enter your municipality" onChange={(e) => update("municipalityOther", e.target.value)} />
              </div>
            )}

            {error && <div className="login-error">⚠ {error}</div>}

            <label className="consent-row">
              <input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} />
              <span>I agree to AquaTimbang's Privacy Policy and Terms of Use, and consent to my data being processed for account verification.</span>
            </label>

            <button type="submit" className="primary-btn full-btn">Register</button>
          </form>

          <div className="login-hint login-hint-big">
            Already have an account?{" "}
            <button className="login-inline-link login-inline-link-big" onClick={onGoToLogin}>Log in instead</button>
          </div>

          <div className="login-hint forgot-hint">
            Forgot your password?{" "}
            <button className="login-inline-link" onClick={onGoToLogin}>Reset it from the Login page</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;