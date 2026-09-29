import React, { useState } from "react";
import "./App.css";
import "./LGU.css";

/* ================================================================
   CONSTANTS & MOCK DATA
   ================================================================ */

const SPECIES_LIST = ["Galunggong", "Tulingan", "Bolinaw", "Tamarong", "Anduhaw"];

const SCI_NAMES = {
  Galunggong: "Decapterus macarellus",
  Tulingan: "Euthynnus affinis",
  Bolinaw: "Stolephorus spp.",
  Tamarong: "Local catch",
  Anduhaw: "Rastrelliger spp.",
};

const BASE_PRICES = { Galunggong: 180, Tulingan: 160, Bolinaw: 120, Tamarong: 150, Anduhaw: 170 };
const MARKETS = ["Pasil Fish Market", "Carbon Public Market", "Mandaue City Market"];
const MIN_PRICE = 50;
const MAX_PRICE = 1000;
const ME = "Liza Fernandez";

const peso = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDate = (isoStr) => {
  const d = new Date(isoStr + "T00:00:00");
  return d.toLocaleDateString("en-PH", { month: "2-digit", day: "2-digit", year: "numeric" });
};

function buildPriceHistory() {
  const TODAY = new Date(2026, 8, 16);
  const history = {};
  SPECIES_LIST.forEach((sp) => {
    const rows = [];
    const base = BASE_PRICES[sp];
    for (let d = 29; d >= 0; d--) {
      const date = new Date(TODAY);
      date.setDate(date.getDate() - d);
      const weekday = date.getDay();
      const bump = weekday === 0 || weekday === 6 ? 4 : 0;
      const pseudo = Math.abs(Math.sin(d * 12.9898 + base) * 10000) % 1;
      const price = Math.max(40, Number((base + bump + (pseudo - 0.5) * 12).toFixed(2)));
      rows.push({ date: date.toISOString().slice(0, 10), price });
    }
    history[sp] = rows;
  });
  return history;
}

function buildMarketPrices(priceHistory) {
  // per-market variants of the same base history, for Price Comparison
  const out = {};
  MARKETS.forEach((mk, mi) => {
    out[mk] = {};
    SPECIES_LIST.forEach((sp) => {
      const rows = priceHistory[sp];
      const last = rows[rows.length - 1];
      const offset = (mi - 1) * 2.5;
      out[mk][sp] = Math.max(40, Number((last.price + offset).toFixed(2)));
    });
  });
  return out;
}

function buildFisherfolk() {
  return [
    { id: 1, name: "Marites Abellana", municipality: "Cebu City", registeredDate: "01/18/2026", status: "Active", suggestionCount: 14, lastSubmission: "09/15/2026", activity: [
      { date: "09/15/2026 04:10 PM", action: "Submitted suggested price for Bolinaw" },
      { date: "09/14/2026 09:02 AM", action: "Used Fair Price Calculator" },
    ]},
    { id: 2, name: "Ronald Ceniza", municipality: "Mandaue City", registeredDate: "01/22/2026", status: "Inactive", suggestionCount: 3, lastSubmission: "08/28/2026", activity: [
      { date: "08/28/2026 10:00 AM", action: "Submitted suggested price for Anduhaw" },
    ]},
    { id: 3, name: "Juan Dela Cruz", municipality: "Cebu City", registeredDate: "09/14/2026", status: "Pending", suggestionCount: 0, lastSubmission: "—", activity: [] },
    { id: 4, name: "Pedro Santos", municipality: "Cebu City", registeredDate: "09/15/2026", status: "Pending", suggestionCount: 0, lastSubmission: "—", activity: [] },
    { id: 5, name: "Maria Garcia", municipality: "Cebu City", registeredDate: "09/15/2026", status: "Pending", suggestionCount: 1, lastSubmission: "09/16/2026", activity: [
      { date: "09/16/2026 08:20 AM", action: "Submitted suggested price for Galunggong" },
    ]},
  ];
}

function buildSuggestions() {
  const vendors = ["Marites Abellana", "Ronald Ceniza", "Maria Garcia"];
  const rows = [];
  let id = 1;
  for (let d = 9; d >= 0; d--) {
    const date = new Date(2026, 8, 16);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    SPECIES_LIST.forEach((sp) => {
      vendors.forEach((v, i) => {
        if ((id + i) % 3 === 0) return;
        const base = BASE_PRICES[sp];
        const pseudo = Math.abs(Math.sin((id + i) * 8.31) * 10000) % 1;
        rows.push({
          id: id++,
          species: sp,
          suggestedPrice: Math.max(40, Number((base + (pseudo - 0.5) * 20).toFixed(2))),
          submittedBy: v,
          date: dateStr,
          comment: id % 5 === 0 ? "Typo — meant a lower price, please review." : "",
          status: d < 2 ? "Pending Review" : ["Reviewed", "Adopted", "Rejected"][id % 3],
        });
      });
    });
  }
  return rows.reverse();
}

/* ================================================================
   ROOT LGU COMPONENT
   ================================================================ */

function LGU({ onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [toast, setToast] = useState("");

  const [priceHistory] = useState(() => buildPriceHistory());
  const [marketPrices] = useState(() => buildMarketPrices(buildPriceHistory()));
  const [fisherfolk, setFisherfolk] = useState(() => buildFisherfolk());
  const [suggestions, setSuggestions] = useState(() => buildSuggestions());

  const [entries, setEntries] = useState([
    { id: 1, date: "09/16/2026", species: "Galunggong", price: 180.0, prev: 175.9, market: "Pasil Fish Market", status: "Published", remarks: "" },
    { id: 2, date: "09/16/2026", species: "Tulingan", price: 160.0, prev: 161.8, market: "Pasil Fish Market", status: "For Review", remarks: "" },
    { id: 3, date: "09/16/2026", species: "Bolinaw", price: 980.0, prev: 119.05, market: "Pasil Fish Market", status: "Flagged", remarks: "Encoding check needed" },
  ]);

  const [factors, setFactors] = useState([
    { id: 1, date: "09/15/2026", fuel: 66.8, weather: "Cloudy", holiday: true, note: "Local fiesta — Barangay Pasil" },
    { id: 2, date: "09/14/2026", fuel: 66.1, weather: "Stormy", holiday: false, note: "Fishing trips suspended" },
    { id: 3, date: "09/12/2026", fuel: 66.1, weather: "Rainy", holiday: false, note: "" },
    { id: 4, date: "09/10/2026", fuel: 65.4, weather: "Sunny", holiday: false, note: "" },
  ]);

  const [referencePrices, setReferencePrices] = useState(
    SPECIES_LIST.map((sp, i) => ({
      id: i + 1,
      species: sp,
      price: BASE_PRICES[sp],
      publishedDate: "09/10/2026",
      publishedBy: ME,
    }))
  );

  const [validationHistory, setValidationHistory] = useState([
    { id: 1, date: "09/16/2026 06:02 AM", user: ME, action: "Published daily price for Galunggong", details: "₱180.00 per kg" },
    { id: 2, date: "09/10/2026 08:00 AM", user: ME, action: "Published reference price for all species", details: "Initial reference set" },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, date: "09/16/2026 06:02 AM", user: ME, action: "Published price", species: "Galunggong", details: "₱180.00 per kg", status: "Success" },
    { id: 2, date: "09/16/2026 05:48 AM", user: ME, action: "Flagged entry", species: "Bolinaw", details: "₱980.00 outside bounds", status: "Flagged" },
    { id: 3, date: "09/16/2026 05:41 AM", user: ME, action: "Encoded price", species: "Tulingan", details: "₱160.00 per kg", status: "Success" },
  ]);

  const [profile, setProfile] = useState({
    name: ME,
    email: "liza@cebucity.gov.ph",
    username: "liza_lgu",
    role: "LGU Personnel",
    municipality: "Cebu City",
    registeredDate: "02/20/2026",
    lastLogin: "09/16/2026 06:02 AM",
  });

  const [myActivity, setMyActivity] = useState([
    { id: 1, date: "09/16/2026 06:02 AM", action: "Logged in" },
    { id: 2, date: "09/15/2026 05:52 PM", action: "Edited price for Galunggong" },
  ]);

  const [dismissedNotifs, setDismissedNotifs] = useState([]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  const addLog = (action, species, details, status = "Success") => {
    setLogs((prev) => [
      { id: Date.now(), date: new Date().toLocaleString("en-PH", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), user: ME, action, species, details, status },
      ...prev,
    ]);
  };

  const addValidation = (action, details) => {
    setValidationHistory((prev) => [
      { id: Date.now(), date: new Date().toLocaleString("en-PH", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), user: ME, action, details },
      ...prev,
    ]);
  };

  const logActivity = (action) => {
    setMyActivity((prev) => [
      { id: Date.now(), date: new Date().toLocaleString("en-PH", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), action },
      ...prev,
    ]);
  };

  const notifications = buildLguNotifications(suggestions, entries, fisherfolk);
  const unread = notifications.filter((n) => !dismissedNotifs.includes(n.id));

  const menuGroups = [
    {
      label: "DAILY OPERATIONS",
      items: [
        { name: "Dashboard", icon: "▦" },
        { name: "Price Entry", icon: "✎" },
        { name: "Review & Publish", icon: "✔" },
        { name: "External Factors", icon: "☁" },
      ],
    },
    {
      label: "FISHERFOLK",
      items: [
        { name: "Fisherfolk Management", icon: "👥" },
        { name: "Price Suggestions", icon: "📥" },
      ],
    },
    {
      label: "REFERENCE PRICES",
      items: [
        { name: "Official Reference Prices", icon: "₱" },
        { name: "Price Trends", icon: "📈" },
        { name: "Price Comparison", icon: "⇄" },
        { name: "Price Anomalies", icon: "⚠" },
      ],
    },
    {
      label: "FORECASTING",
      items: [{ name: "Price Forecast", icon: "◔" }],
    },
    {
      label: "REPORTS & AUDIT",
      items: [
        { name: "Reports", icon: "▤" },
        { name: "Validation History", icon: "🗂" },
        { name: "Audit Log", icon: "◷" },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { name: "Notifications", icon: "🔔" },
        { name: "My Profile", icon: "♙" },
      ],
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "Price Entry":
        return <PriceEntry entries={entries} setEntries={setEntries} notify={notify} addLog={addLog} logActivity={logActivity} />;
      case "Review & Publish":
        return <ReviewPublish entries={entries} setEntries={setEntries} notify={notify} addLog={addLog} addValidation={addValidation} logActivity={logActivity} />;
      case "External Factors":
        return <ExternalFactors factors={factors} setFactors={setFactors} notify={notify} addLog={addLog} />;
      case "Fisherfolk Management":
        return <FisherfolkManagement fisherfolk={fisherfolk} notify={notify} />;
      case "Price Suggestions":
        return (
          <PriceSuggestions
            suggestions={suggestions} setSuggestions={setSuggestions}
            referencePrices={referencePrices} setReferencePrices={setReferencePrices}
            notify={notify} addValidation={addValidation} logActivity={logActivity}
          />
        );
      case "Official Reference Prices":
        return (
          <OfficialReferencePrices
            referencePrices={referencePrices} setReferencePrices={setReferencePrices}
            notify={notify} addValidation={addValidation} logActivity={logActivity}
          />
        );
      case "Price Trends":
        return <PriceTrends priceHistory={priceHistory} />;
      case "Price Comparison":
        return <PriceComparison marketPrices={marketPrices} />;
      case "Price Anomalies":
        return <PriceAnomalies entries={entries} suggestions={suggestions} />;
      case "Price Forecast":
        return <PriceForecast priceHistory={priceHistory} factors={factors} notify={notify} />;
      case "Reports":
        return <Reports entries={entries} notify={notify} />;
      case "Validation History":
        return <ValidationHistory validationHistory={validationHistory} notify={notify} />;
      case "Audit Log":
        return <AuditLog logs={logs} notify={notify} />;
      case "Notifications":
        return <Notifications notifications={notifications} dismissedNotifs={dismissedNotifs} setDismissedNotifs={setDismissedNotifs} goTo={setActivePage} />;
      case "My Profile":
        return <MyProfile profile={profile} setProfile={setProfile} activity={myActivity} notify={notify} />;
      default:
        return (
          <LGUDashboard
            entries={entries} logs={logs} suggestions={suggestions} fisherfolk={fisherfolk}
            priceHistory={priceHistory} goTo={setActivePage}
          />
        );
    }
  };

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🐟</div>
          <div>
            <h2>AquaTimbang</h2>
            <span>Fish Price Transparency</span>
          </div>
        </div>

        <div className="admin-label">LGU OFFICER</div>

        <nav>
          {menuGroups.map((group, gi) => (
            <React.Fragment key={group.label}>
              {gi > 0 && <div className="admin-label group-label">{group.label}</div>}
              {group.items.map((item) => (
                <button
                  key={item.name}
                  className={`nav-item ${activePage === item.name ? "active" : ""}`}
                  onClick={() => setActivePage(item.name)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.name === "Notifications" && unread.length > 0 && (
                    <span className="nav-badge">{unread.length}</span>
                  )}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="avatar">LF</div>
            <div>
              <strong>Liza Fernandez</strong>
              <small>LGU Officer</small>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>↪ Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Encode, validate, and publish official fish prices</p>
          </div>

          <div className="topbar-right">
            <button className="notification" onClick={() => setActivePage("Notifications")}>
              🔔
              {unread.length > 0 && <span className="notif-dot"></span>}
            </button>
            <div className="top-profile">
              <div className="avatar small">LF</div>
              <div>
                <strong>Liza Fernandez</strong>
                <span>LGU Officer</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">{renderPage()}</section>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function buildLguNotifications(suggestions, entries, fisherfolk) {
  const notifs = [];
  let id = 1;

  const pendingSuggestions = suggestions.filter((s) => s.status === "Pending Review");
  if (pendingSuggestions.length > 0) {
    notifs.push({
      id: id++, type: "warning", page: "Price Suggestions",
      title: `${pendingSuggestions.length} suggested price${pendingSuggestions.length > 1 ? "s" : ""} awaiting review`,
      detail: pendingSuggestions.slice(0, 3).map((s) => s.species).join(", "),
    });
  }

  const pendingFisherfolk = fisherfolk.filter((f) => f.status === "Pending");
  if (pendingFisherfolk.length > 0) {
    notifs.push({
      id: id++, type: "info", page: "Fisherfolk Management",
      title: `${pendingFisherfolk.length} fisherfolk registration${pendingFisherfolk.length > 1 ? "s" : ""} pending`,
      detail: "Administrator approval required before they can submit suggestions.",
    });
  }

  const flagged = entries.filter((e) => e.status === "Flagged");
  if (flagged.length > 0) {
    notifs.push({
      id: id++, type: "danger", page: "Review & Publish",
      title: `${flagged.length} flagged price entr${flagged.length > 1 ? "ies" : "y"}`,
      detail: flagged.map((e) => `${e.species} at ${peso(e.price)}`).join(", "),
    });
  }

  const notEncoded = SPECIES_LIST.filter((sp) => !entries.some((e) => e.species === sp));
  if (notEncoded.length > 0) {
    notifs.push({
      id: id++, type: "warning", page: "Price Entry",
      title: `${notEncoded.length} species not yet encoded today`,
      detail: notEncoded.join(", "),
    });
  }

  return notifs;
}

/* ================================================================
   DASHBOARD
   ================================================================ */

function LGUDashboard({ entries, logs, suggestions, fisherfolk, priceHistory, goTo }) {
  const published = entries.filter((e) => e.status === "Published");
  const review = entries.filter((e) => e.status === "For Review");
  const flagged = entries.filter((e) => e.status === "Flagged");
  const notEncoded = SPECIES_LIST.filter((sp) => !entries.some((e) => e.species === sp));

  const avgToday = entries.length ? entries.reduce((s, e) => s + e.price, 0) / entries.length : 0;
  const recordsThisWeek = SPECIES_LIST.reduce((sum, sp) => sum + priceHistory[sp].slice(-7).length, 0);

  const weekAgo = new Date(2026, 8, 9).toISOString().slice(0, 10);
  const suggestionsThisWeek = suggestions.filter((s) => s.date >= weekAgo);
  const participatingFisherfolk = new Set(suggestionsThisWeek.map((s) => s.submittedBy)).size;
  const pendingSuggestions = suggestions.filter((s) => s.status === "Pending Review").length;

  return (
    <>
      <div className="welcome-card">
        <div>
          <span className="eyebrow">LGU OFFICER</span>
          <h2>Welcome back, Officer Fernandez</h2>
          <p>Encode today's fish prices and publish validated rates for vendors and buyers.</p>
        </div>
        <div className="welcome-fish">🐟</div>
      </div>

      {notEncoded.length > 0 && (
        <div className="notice">
          <div className="notice-icon">!</div>
          <div>
            <strong>{entries.length} of {SPECIES_LIST.length} species encoded today</strong>
            <p>Still missing: {notEncoded.join(", ")}. Publish before 6:00 AM so vendors see the official rates.</p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => goTo("Price Entry")}>
          <div className="stat-icon blue">✎</div>
          <div>
            <span>Encoded Today</span>
            <h2>{entries.length}</h2>
            <small>of {SPECIES_LIST.length} active species</small>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => goTo("Review & Publish")}>
          <div className="stat-icon orange">⏳</div>
          <div>
            <span>Pending Review</span>
            <h2>{review.length}</h2>
            <small>Awaiting validation</small>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => goTo("Review & Publish")}>
          <div className="stat-icon green">✔</div>
          <div>
            <span>Published</span>
            <h2>{published.length}</h2>
            <small>Live for vendors</small>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => goTo("Review & Publish")}>
          <div className="stat-icon purple">⚠</div>
          <div>
            <span>Flagged Entries</span>
            <h2>{flagged.length}</h2>
            <small>Outside price bounds</small>
          </div>
        </div>
      </div>

      <div className="page-title" style={{ marginBottom: 8, marginTop: 22 }}>
        <div><h2 style={{ fontSize: 15 }}>Data Summary</h2></div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">₱</div>
          <div>
            <span>Average Price Today</span>
            <h2>{peso(avgToday)}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">▤</div>
          <div>
            <span>Records This Week</span>
            <h2>{recordsThisWeek}</h2>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => goTo("Price Suggestions")}>
          <div className="stat-icon green">📥</div>
          <div>
            <span>Suggestions This Week</span>
            <h2>{suggestionsThisWeek.length}</h2>
          </div>
        </div>
        <div className="stat-card clickable" onClick={() => goTo("Fisherfolk Management")}>
          <div className="stat-icon purple">👥</div>
          <div>
            <span>Participating Fisherfolk</span>
            <h2>{participatingFisherfolk}</h2>
            <small>{pendingSuggestions} suggestion{pendingSuggestions !== 1 ? "s" : ""} pending</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Today's Price Entries</h3>
              <p>Pasil Fish Market – 09/16/2026</p>
            </div>
            <button className="text-button" onClick={() => goTo("Price Entry")}>Go to Price Entry →</button>
          </div>

          <table>
            <thead><tr><th>SPECIES</th><th>PRICE / KG</th><th>STATUS</th></tr></thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.species}</strong></td>
                  <td><strong>{peso(e.price)}</strong></td>
                  <td><span className={`badge ${e.status.toLowerCase().replace(/\s/g, "")}`}>{e.status}</span></td>
                </tr>
              ))}
              {notEncoded.map((s) => (
                <tr key={s}>
                  <td><strong>{s}</strong></td>
                  <td>—</td>
                  <td><span className="badge inactive">Not Encoded</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Your latest price actions</p>
            </div>
          </div>
          {logs.slice(0, 3).map((l) => (
            <div className="activity" key={l.id}>
              <div className="activity-icon blue-bg">◷</div>
              <div>
                <strong>{l.action}</strong>
                <p>{l.species} — {l.details}</p>
                <small>{l.date}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ================================================================
   PRICE ENTRY
   ================================================================ */

function PriceEntry({ entries, setEntries, notify, addLog, logActivity }) {
  const [form, setForm] = useState({ date: "2026-09-16", market: "Pasil Fish Market", species: "Tamarong", price: "", remarks: "" });

  const value = parseFloat(form.price);
  const touched = form.price !== "";
  const outOfBounds = touched && !isNaN(value) && (value < MIN_PRICE || value > MAX_PRICE);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const saveEntry = (asDraft) => {
    if (!touched || isNaN(value) || value <= 0) {
      notify("Enter a valid price per kilogram.");
      return;
    }
    const existing = entries.find((e) => e.species === form.species);
    if (existing) {
      notify(`${form.species} is already encoded today. Edit it instead.`);
      return;
    }

    const status = outOfBounds ? "Flagged" : asDraft ? "Draft" : "For Review";
    setEntries((prev) => [
      ...prev,
      { id: Date.now(), date: "09/16/2026", species: form.species, price: value, prev: value, market: form.market, status, remarks: form.remarks },
    ]);

    addLog(outOfBounds ? "Flagged entry" : "Encoded price", form.species, `${peso(value)} per kg`, outOfBounds ? "Flagged" : "Success");
    logActivity(`Encoded price for ${form.species}: ${peso(value)}`);
    notify(outOfBounds ? `${form.species} saved but flagged — price is outside bounds.` : `${form.species} saved as ${status.toLowerCase()}.`);
    setForm({ ...form, price: "", remarks: "" });
  };

  const submitAll = () => {
    const drafts = entries.filter((e) => e.status === "Draft");
    if (drafts.length === 0) {
      notify("No draft entries to submit.");
      return;
    }
    setEntries((prev) => prev.map((e) => (e.status === "Draft" ? { ...e, status: "For Review" } : e)));
    addLog("Submitted entries for review", "—", `${drafts.length} entries`);
    notify(`${drafts.length} entries submitted for review.`);
  };

  const removeEntry = (e) => {
    if (e.status === "Published") {
      notify("Published prices cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete the ${e.species} entry?`)) return;
    setEntries((prev) => prev.filter((x) => x.id !== e.id));
    addLog("Deleted entry", e.species, peso(e.price));
    notify(`${e.species} entry deleted.`);
  };

  const editPrice = (e) => {
    if (e.status === "Published") {
      notify("Published prices can no longer be edited.");
      return;
    }
    const input = window.prompt(`New price per kg for ${e.species}:`, e.price);
    if (input === null) return;
    const newPrice = parseFloat(input);
    if (isNaN(newPrice) || newPrice <= 0) {
      notify("Invalid price entered.");
      return;
    }
    const flagged = newPrice < MIN_PRICE || newPrice > MAX_PRICE;
    setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, price: newPrice, status: flagged ? "Flagged" : "For Review" } : x)));
    addLog("Edited price", e.species, `${peso(e.price)} → ${peso(newPrice)}`);
    logActivity(`Edited price for ${e.species}`);
    notify(`${e.species} updated.`);
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Daily Price Entry</h2>
          <p>Encode today's fish prices per species. Entries are saved as drafts until submitted.</p>
        </div>
        <button className="primary-btn" onClick={submitAll}>Submit All for Review</button>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <div className="config-header">
            <div className="config-icon blue">✎</div>
            <div><h3>New Price Entry</h3><p>Encode a price for a single species</p></div>
          </div>

          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></div>
          <div className="form-group">
            <label>Market</label>
            <select value={form.market} onChange={(e) => update("market", e.target.value)}>
              {MARKETS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Fish Species</label>
            <select value={form.species} onChange={(e) => update("species", e.target.value)}>
              {SPECIES_LIST.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price per Kilogram</label>
            <div className="input-with-unit">
              <span>₱</span>
              <input type="number" value={form.price} placeholder="0.00" onChange={(e) => update("price", e.target.value)} />
            </div>
          </div>

          {outOfBounds && (
            <div className="warn-box">
              ⚠ This price is outside the configured range of {peso(MIN_PRICE)} – {peso(MAX_PRICE)} per kg. It will be flagged for review.
            </div>
          )}

          <div className="form-group">
            <label>Remarks (optional)</label>
            <input type="text" value={form.remarks} placeholder="e.g. Limited supply today" onChange={(e) => update("remarks", e.target.value)} />
          </div>

          <div className="button-row">
            <button className="secondary-btn" onClick={() => saveEntry(true)}>Save as Draft</button>
            <button className="primary-btn" onClick={() => saveEntry(false)}>Save Entry</button>
          </div>
        </div>

        <div className="config-card">
          <div className="config-header">
            <div className="config-icon orange">▤</div>
            <div><h3>Encoded Today</h3><p>Entries saved for 09/16/2026</p></div>
          </div>

          <table className="inner-table">
            <thead><tr><th>SPECIES</th><th>PRICE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan="4" className="empty-row">No entries yet.</td></tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.species}</strong></td>
                    <td>{peso(e.price)}</td>
                    <td><span className={`badge ${e.status.toLowerCase().replace(/\s/g, "")}`}>{e.status}</span></td>
                    <td>
                      <div className="action-icons">
                        <button title="Edit" onClick={() => editPrice(e)}>✎</button>
                        <button title="Delete" onClick={() => removeEntry(e)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="info-box">Draft entries are only visible to LGU officers. Vendors will see prices after they are reviewed and published.</div>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   REVIEW & PUBLISH
   ================================================================ */

function ReviewPublish({ entries, setEntries, notify, addLog, addValidation, logActivity }) {
  const [tab, setTab] = useState("For Review");
  const [search, setSearch] = useState("");

  const flagged = entries.filter((e) => e.status === "Flagged");

  const visible = entries
    .filter((e) => {
      if (tab === "For Review") return e.status === "For Review" || e.status === "Flagged";
      if (tab === "Published") return e.status === "Published";
      return e.status === "Rejected";
    })
    .filter((e) => e.species.toLowerCase().includes(search.toLowerCase()));

  const approve = (e) => {
    if (e.status === "Flagged" && !window.confirm(`${e.species} is flagged at ${peso(e.price)}, outside the allowed range. Approve anyway?`)) return;
    setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: "Approved" } : x)));
    addLog("Approved price", e.species, peso(e.price));
    addValidation("Approved price entry", `${e.species} at ${peso(e.price)}`);
    logActivity(`Approved price for ${e.species}`);
    notify(`${e.species} approved. Publish to make it live.`);
  };

  const reject = (e) => {
    if (!window.confirm(`Reject the ${e.species} entry?`)) return;
    setEntries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: "Rejected" } : x)));
    addLog("Rejected price", e.species, peso(e.price), "Rejected");
    addValidation("Rejected price entry", `${e.species} at ${peso(e.price)}`);
    logActivity(`Rejected price for ${e.species}`);
    notify(`${e.species} rejected.`);
  };

  const publishAll = () => {
    const approved = entries.filter((e) => e.status === "Approved");
    if (approved.length === 0) {
      notify("No approved entries to publish. Approve entries first.");
      return;
    }
    setEntries((prev) => prev.map((e) => (e.status === "Approved" ? { ...e, status: "Published" } : e)));
    addLog("Published prices", "—", `${approved.length} entries published`);
    addValidation("Published daily prices", `${approved.length} entries published`);
    logActivity(`Published ${approved.length} daily price entries`);
    notify(`${approved.length} prices published. Vendors can now see them.`);
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Review &amp; Publish</h2>
          <p>Validate encoded prices before publishing them as official LGU rates.</p>
        </div>
        <button className="primary-btn" onClick={publishAll}>✔ Publish Approved Prices</button>
      </div>

      {flagged.length > 0 && (
        <div className="notice">
          <div className="notice-icon">!</div>
          <div>
            <strong>{flagged.length} entry flagged for validation</strong>
            <p>{flagged.map((f) => `${f.species} at ${peso(f.price)}`).join(", ")} — outside the configured price bounds.</p>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="tabs">
          {["For Review", "Published", "Rejected"].map((t) => (
            <button key={t} className={tab === t ? "tab active-tab" : "tab"} onClick={() => setTab(t)}>
              {t}
              {t === "For Review" && (
                <span className="tab-count">{entries.filter((e) => e.status === "For Review" || e.status === "Flagged").length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="table-tools">
          <div className="search-box">
            🔍
            <input type="text" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <table>
          <thead><tr><th>SPECIES</th><th>PRICE / KG</th><th>PREVIOUS</th><th>CHANGE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan="6" className="empty-row">No entries in this tab.</td></tr>
            ) : (
              visible.map((e) => {
                const diff = e.price - e.prev;
                const up = diff >= 0;
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="species-cell">
                        <div className="fish-avatar">{e.species.slice(0, 2).toUpperCase()}</div>
                        <div><strong>{e.species}</strong><small>{SCI_NAMES[e.species]}</small></div>
                      </div>
                    </td>
                    <td><strong className={e.status === "Flagged" ? "flag-price" : ""}>{peso(e.price)}</strong></td>
                    <td>{peso(e.prev)}</td>
                    <td className={up ? "up" : "down"}>{up ? "▲" : "▼"} {peso(Math.abs(diff))}</td>
                    <td><span className={`badge ${e.status.toLowerCase().replace(/\s/g, "")}`}>{e.status}</span></td>
                    <td>
                      {e.status === "Published" || e.status === "Rejected" ? (
                        <span className="muted-text">No actions</span>
                      ) : (
                        <div className="action-buttons">
                          <button className="approve" onClick={() => approve(e)}>Approve</button>
                          <button className="reject" onClick={() => reject(e)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   EXTERNAL FACTORS
   ================================================================ */

function ExternalFactors({ factors, setFactors, notify, addLog }) {
  const [form, setForm] = useState({ date: "2026-09-16", fuel: "66.80", weather: "Cloudy", holiday: true, note: "Local fiesta — Barangay Pasil" });
  const update = (key, val) => setForm({ ...form, [key]: val });

  const save = () => {
    const fuel = parseFloat(form.fuel);
    if (!form.date || isNaN(fuel) || fuel <= 0) {
      notify("Enter a valid date and fuel price.");
      return;
    }
    const formatted = new Date(form.date).toLocaleDateString("en-PH");
    setFactors((prev) => [{ id: Date.now(), date: formatted, fuel, weather: form.weather, holiday: form.holiday, note: form.note }, ...prev]);
    addLog("Logged external factor", "—", `Fuel ${peso(fuel)}, ${form.weather}`);
    notify("External factor saved.");
  };

  const remove = (f) => {
    if (!window.confirm(`Delete the entry for ${f.date}?`)) return;
    setFactors((prev) => prev.filter((x) => x.id !== f.id));
    notify("Entry deleted.");
  };

  const edit = (f) => {
    const input = window.prompt(`New fuel price for ${f.date}:`, f.fuel);
    if (input === null) return;
    const fuel = parseFloat(input);
    if (isNaN(fuel) || fuel <= 0) {
      notify("Invalid fuel price.");
      return;
    }
    setFactors((prev) => prev.map((x) => (x.id === f.id ? { ...x, fuel } : x)));
    notify("Entry updated.");
  };

  return (
    <>
      <div className="page-title">
        <div><h2>External Factors</h2><p>Log fuel prices, weather, and holidays used by the forecasting model.</p></div>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <div className="config-header">
            <div className="config-icon orange">☁</div>
            <div><h3>Log External Factor</h3><p>Record conditions that affect fish supply</p></div>
          </div>

          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></div>
          <div className="form-group">
            <label>Fuel Price per Liter</label>
            <div className="input-with-unit"><span>₱</span><input type="number" step="0.01" value={form.fuel} onChange={(e) => update("fuel", e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label>Weather Condition</label>
            <select value={form.weather} onChange={(e) => update("weather", e.target.value)}>
              <option>Sunny</option><option>Cloudy</option><option>Rainy</option><option>Stormy</option>
            </select>
          </div>
          <div className="toggle-row">
            <div><strong>Holiday or Fiesta</strong><p>Mark if this date is a local holiday.</p></div>
            <label className="switch"><input type="checkbox" checked={form.holiday} onChange={(e) => update("holiday", e.target.checked)} /><span className="slider"></span></label>
          </div>
          <div className="form-group"><label>Notes</label><input value={form.note} onChange={(e) => update("note", e.target.value)} /></div>
          <button className="primary-btn full-btn" onClick={save}>Save Factor</button>
        </div>

        <div className="config-card">
          <div className="config-header">
            <div className="config-icon purple">▤</div>
            <div><h3>Recent Entries</h3><p>Latest logged external conditions</p></div>
          </div>

          <table className="inner-table">
            <thead><tr><th>DATE</th><th>FUEL</th><th>WEATHER</th><th>HOLIDAY</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {factors.map((f) => (
                <tr key={f.id}>
                  <td>{f.date}</td>
                  <td><strong>{peso(f.fuel)}</strong></td>
                  <td>{f.weather}</td>
                  <td>{f.holiday ? <span className="badge pending">Yes</span> : <span className="badge inactive">No</span>}</td>
                  <td>
                    <div className="action-icons">
                      <button title="Edit" onClick={() => edit(f)}>✎</button>
                      <button title="Delete" onClick={() => remove(f)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="info-box purple-info">These values are used as external inputs in the forecasting module to improve price predictions.</div>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   FISHERFOLK MANAGEMENT
   ================================================================ */

function FisherfolkManagement({ fisherfolk, notify }) {
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  const visible = fisherfolk.filter((f) =>
    [f.name, f.municipality].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Fisherfolk Management</h2>
          <p>Monitor the fisherfolk accounts registered under your municipality.</p>
        </div>
      </div>

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Fisherfolk Profile</h3>
              <button className="modal-close" onClick={() => setViewing(null)}>✕</button>
            </div>

            <div className="profile-head">
              <div className="table-avatar profile-avatar">{initials(viewing.name)}</div>
              <div>
                <strong>{viewing.name}</strong>
                <p>{viewing.municipality}</p>
                <div className="profile-badges">
                  <span className={`badge ${viewing.status.toLowerCase()}`}>{viewing.status}</span>
                </div>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-field"><span>Registration Date</span><strong>{viewing.registeredDate}</strong></div>
              <div className="profile-field"><span>Price Suggestions</span><strong>{viewing.suggestionCount}</strong></div>
              <div className="profile-field"><span>Last Submission</span><strong>{viewing.lastSubmission}</strong></div>
              <div className="profile-field"><span>Account Status</span><strong>{viewing.status}</strong></div>
            </div>

            <div className="mini-head">Account Activity</div>
            <div className="history-list">
              {viewing.activity.length === 0 ? (
                <p className="empty-row">No recorded activity yet.</p>
              ) : (
                viewing.activity.map((a, i) => (
                  <div className="history-item" key={i}>
                    <div><strong>{a.action}</strong></div>
                    <small>{a.date}</small>
                  </div>
                ))
              )}
            </div>

            <div className="button-row">
              <button className="primary-btn full-btn" onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="table-tools">
          <div className="search-box">
            🔍
            <input type="text" placeholder="Search fisherfolk..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>MUNICIPALITY</th>
              <th>REGISTRATION DATE</th>
              <th>STATUS</th>
              <th>SUGGESTIONS</th>
              <th>LAST SUBMISSION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No fisherfolk found.</td></tr>
            ) : (
              visible.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="user-cell">
                      <div className="table-avatar">{initials(f.name)}</div>
                      <strong>{f.name}</strong>
                    </div>
                  </td>
                  <td>{f.municipality}</td>
                  <td>{f.registeredDate}</td>
                  <td><span className={`badge ${f.status.toLowerCase()}`}>{f.status}</span></td>
                  <td>{f.suggestionCount}</td>
                  <td>{f.lastSubmission}</td>
                  <td>
                    <div className="action-icons">
                      <button title="View Activity" onClick={() => setViewing(f)}>👁</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   PRICE SUGGESTIONS
   ================================================================ */

function PriceSuggestions({ suggestions, setSuggestions, referencePrices, setReferencePrices, notify, addValidation, logActivity }) {
  const [speciesFilter, setSpeciesFilter] = useState("All Species");
  const [search, setSearch] = useState("");

  const visible = suggestions
    .filter((s) => speciesFilter === "All Species" || s.species === speciesFilter)
    .filter((s) => [s.species, s.submittedBy].join(" ").toLowerCase().includes(search.toLowerCase()));

  const computedAverage = (species) => {
    const rows = suggestions.filter((s) => s.species === species);
    if (!rows.length) return null;
    return rows.reduce((a, b) => a + b.suggestedPrice, 0) / rows.length;
  };

  const statusClass = (s) => {
    if (s === "Adopted") return "success";
    if (s === "Rejected") return "deleted";
    if (s === "Reviewed") return "approved";
    return "pending";
  };

  const markReviewed = (s) => {
    setSuggestions((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: "Reviewed" } : x)));
    addValidation("Reviewed fisherfolk suggestion", `${s.species} by ${s.submittedBy}: ${peso(s.suggestedPrice)}`);
    logActivity(`Reviewed suggestion for ${s.species} from ${s.submittedBy}`);
    notify("Marked as reviewed.");
  };

  const reject = (s) => {
    if (!window.confirm(`Reject ${s.submittedBy}'s suggestion for ${s.species}?`)) return;
    setSuggestions((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: "Rejected" } : x)));
    addValidation("Rejected fisherfolk suggestion", `${s.species} by ${s.submittedBy}: ${peso(s.suggestedPrice)}`);
    logActivity(`Rejected suggestion for ${s.species} from ${s.submittedBy}`);
    notify("Suggestion rejected.");
  };

  const adoptAsReference = (s) => {
    if (!window.confirm(`Adopt ${peso(s.suggestedPrice)} as the new official reference price for ${s.species}?`)) return;
    setSuggestions((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: "Adopted" } : x)));
    setReferencePrices((prev) =>
      prev.map((r) => (r.species === s.species ? { ...r, price: s.suggestedPrice, publishedDate: new Date().toLocaleDateString("en-PH"), publishedBy: ME } : r))
    );
    addValidation("Adopted suggestion as reference price", `${s.species}: ${peso(s.suggestedPrice)} (from ${s.submittedBy})`);
    logActivity(`Adopted ${s.species} suggestion from ${s.submittedBy} as reference price`);
    notify(`${s.species} reference price updated to ${peso(s.suggestedPrice)}.`);
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Suggestions</h2>
          <p>Prices suggested by fisherfolk, with the computed community average per species.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div><h3>Computed Average by Species</h3><p>Used as a reference when reviewing individual suggestions</p></div>
        </div>
        <table>
          <thead><tr><th>SPECIES</th><th>COMPUTED AVERAGE</th><th>SUBMISSIONS</th></tr></thead>
          <tbody>
            {SPECIES_LIST.map((sp) => {
              const avg = computedAverage(sp);
              const count = suggestions.filter((s) => s.species === sp).length;
              return (
                <tr key={sp}>
                  <td><strong>{sp}</strong></td>
                  <td>{avg !== null ? peso(avg) : "—"}</td>
                  <td>{count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="table-tools">
          <div className="search-box">
            🔍
            <input type="text" placeholder="Search species or submitter..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}>
            <option>All Species</option>
            {SPECIES_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>DATE</th><th>SPECIES</th><th>SUGGESTED PRICE</th><th>SUBMITTED BY</th>
              <th>COMMENT</th><th>STATUS</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No submissions match these filters.</td></tr>
            ) : (
              visible.map((s) => (
                <tr key={s.id}>
                  <td>{fmtDate(s.date)}</td>
                  <td><strong>{s.species}</strong></td>
                  <td><strong>{peso(s.suggestedPrice)}</strong></td>
                  <td>{s.submittedBy}</td>
                  <td>{s.comment || <span className="muted-text">—</span>}</td>
                  <td><span className={`badge ${statusClass(s.status)}`}>{s.status}</span></td>
                  <td>
                    {s.status === "Pending Review" || s.status === "Reviewed" ? (
                      <div className="action-icons">
                        <button title="Mark Reviewed" onClick={() => markReviewed(s)}>👁</button>
                        <button title="Adopt as Reference Price" onClick={() => adoptAsReference(s)}>✔</button>
                        <button title="Reject" onClick={() => reject(s)}>✕</button>
                      </div>
                    ) : (
                      <span className="muted-text">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   OFFICIAL REFERENCE PRICES
   ================================================================ */

function OfficialReferencePrices({ referencePrices, setReferencePrices, notify, addValidation, logActivity }) {
  const [showForm, setShowForm] = useState(false);
  const [target, setTarget] = useState(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const openPublish = (r) => {
    setTarget(r);
    setPrice(String(r.price));
    setNote("");
    setShowForm(true);
  };

  const publish = () => {
    const value = parseFloat(price);
    if (isNaN(value) || value <= 0) {
      notify("Enter a valid price.");
      return;
    }

    setReferencePrices((prev) =>
      prev.map((r) => (r.id === target.id ? { ...r, price: value, publishedDate: new Date().toLocaleDateString("en-PH"), publishedBy: ME } : r))
    );

    addValidation(
      value === target.price ? "Re-confirmed reference price" : "Published corrected reference price",
      `${target.species}: ${peso(target.price)} → ${peso(value)}${note ? ` — ${note}` : ""}`
    );
    logActivity(`Published reference price for ${target.species}: ${peso(value)}`);
    notify(`${target.species} reference price published.`);
    setShowForm(false);
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Official Reference Prices</h2>
          <p>The current published reference price per species — separate from daily market entries.</p>
        </div>
      </div>

      {showForm && target && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Publish Reference Price — {target.species}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Current Reference Price</label>
              <div className="locked-field">{peso(target.price)}</div>
            </div>

            <div className="form-group">
              <label>New Reference Price per KG</label>
              <div className="input-with-unit"><span>₱</span><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            </div>

            <div className="form-group">
              <label>Note (optional, for the audit trail)</label>
              <input value={note} placeholder="Reason for this correction or update" onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="button-row">
              <button className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="primary-btn" onClick={publish}>Publish</button>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr><th>SPECIES</th><th>REFERENCE PRICE</th><th>LAST PUBLISHED</th><th>PUBLISHED BY</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {referencePrices.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.species}</strong></td>
                <td><strong>{peso(r.price)}</strong></td>
                <td>{r.publishedDate}</td>
                <td>{r.publishedBy}</td>
                <td>
                  <div className="action-icons">
                    <button title="Publish / Correct" onClick={() => openPublish(r)}>✎</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   PRICE TRENDS (broader LGU view)
   ================================================================ */

function PriceTrends({ priceHistory }) {
  const [species, setSpecies] = useState(SPECIES_LIST[0]);
  const [range, setRange] = useState("30");

  const rows = priceHistory[species].slice(-Number(range));
  const prices = rows.map((r) => r.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const change = last - first;
  const pctChange = (change / first) * 100;
  const max = Math.max(...prices, 1);

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Trends</h2>
          <p>A broader view of price movement across all species, for oversight and planning.</p>
        </div>
        <div className="filter-row">
          <select className="date-input" value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="date-input" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">₱</div><div><span>Average Price</span><h2>{peso(avg)}</h2></div></div>
        <div className="stat-card"><div className="stat-icon orange">↑</div><div><span>Highest Price</span><h2>{peso(high)}</h2></div></div>
        <div className="stat-card"><div className="stat-icon green">↓</div><div><span>Lowest Price</span><h2>{peso(low)}</h2></div></div>
        <div className="stat-card">
          <div className={`stat-icon ${change >= 0 ? "purple" : "green"}`}>{change >= 0 ? "▲" : "▼"}</div>
          <div>
            <span>Price Change</span>
            <h2 className={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : ""}{peso(change)}</h2>
            <small>{pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% over range</small>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div><h3>{species} — Price History</h3><p>Last {range} days</p></div>
        </div>
        <div className="chart-area">
          <div className="chart-placeholder">
            <div className="bars">
              {rows.map((r, i) => (
                <div key={i} className="bar" style={{ height: `${20 + (r.price / max) * 75}%` }} title={peso(r.price)}></div>
              ))}
            </div>
            <p className="chart-note">Hover a bar to see that day's price.</p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div><h3>All Species — Percentage Change</h3><p>Over the last {range} days</p></div>
        </div>
        <table>
          <thead><tr><th>SPECIES</th><th>START PRICE</th><th>CURRENT PRICE</th><th>CHANGE</th><th>% CHANGE</th></tr></thead>
          <tbody>
            {SPECIES_LIST.map((sp) => {
              const r = priceHistory[sp].slice(-Number(range));
              const p = r.map((x) => x.price);
              const d = p[p.length - 1] - p[0];
              const pc = (d / p[0]) * 100;
              return (
                <tr key={sp}>
                  <td><strong>{sp}</strong></td>
                  <td>{peso(p[0])}</td>
                  <td>{peso(p[p.length - 1])}</td>
                  <td className={d >= 0 ? "up" : "down"}>{d >= 0 ? "+" : ""}{peso(d)}</td>
                  <td className={pc >= 0 ? "up" : "down"}>{pc >= 0 ? "+" : ""}{pc.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   PRICE COMPARISON
   ================================================================ */

function PriceComparison({ marketPrices }) {
  const [species, setSpecies] = useState(SPECIES_LIST[0]);

  const rows = MARKETS.map((mk) => ({ market: mk, price: marketPrices[mk][species] }));
  const highest = Math.max(...rows.map((r) => r.price));
  const lowest = Math.min(...rows.map((r) => r.price));

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Comparison</h2>
          <p>Compare current prices for a species across every market you oversee.</p>
        </div>
        <select className="date-input" value={species} onChange={(e) => setSpecies(e.target.value)}>
          {SPECIES_LIST.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div><h3>{species} — Price by Market</h3><p>Today's rates</p></div>
        </div>
        <table>
          <thead><tr><th>MARKET</th><th>PRICE / KG</th><th>VS. HIGHEST</th><th>NOTE</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.market}>
                <td><strong>{r.market}</strong></td>
                <td><strong>{peso(r.price)}</strong></td>
                <td className={r.price === highest ? "" : "down"}>
                  {r.price === highest ? "—" : `-${peso(highest - r.price)}`}
                </td>
                <td>
                  {r.price === highest && <span className="badge accent">Highest</span>}
                  {r.price === lowest && <span className="badge success">Lowest</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   PRICE ANOMALIES
   ================================================================ */

function PriceAnomalies({ entries, suggestions }) {
  const anomalousEntries = entries.filter((e) => e.price < MIN_PRICE || e.price > MAX_PRICE);

  const suggestionAnomalies = SPECIES_LIST.flatMap((sp) => {
    const rows = suggestions.filter((s) => s.species === sp);
    if (rows.length < 3) return [];
    const avg = rows.reduce((a, b) => a + b.suggestedPrice, 0) / rows.length;
    return rows.filter((r) => Math.abs(r.suggestedPrice - avg) / avg > 0.3).map((r) => ({ ...r, avg }));
  });

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Anomalies</h2>
          <p>Entries and suggestions that fall well outside expected price ranges.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div><h3>Flagged Daily Entries</h3><p>Outside the {peso(MIN_PRICE)} – {peso(MAX_PRICE)} validation range</p></div>
        </div>
        <table>
          <thead><tr><th>SPECIES</th><th>PRICE</th><th>MARKET</th><th>STATUS</th></tr></thead>
          <tbody>
            {anomalousEntries.length === 0 ? (
              <tr><td colSpan="4" className="empty-row">No anomalous entries right now.</td></tr>
            ) : (
              anomalousEntries.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.species}</strong></td>
                  <td className="flag-price"><strong>{peso(e.price)}</strong></td>
                  <td>{e.market}</td>
                  <td><span className="badge flagged">{e.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div><h3>Unusual Fisherfolk Suggestions</h3><p>More than 30% away from that species' community average</p></div>
        </div>
        <table>
          <thead><tr><th>SPECIES</th><th>SUGGESTED PRICE</th><th>COMMUNITY AVERAGE</th><th>SUBMITTED BY</th><th>DEVIATION</th></tr></thead>
          <tbody>
            {suggestionAnomalies.length === 0 ? (
              <tr><td colSpan="5" className="empty-row">No unusual suggestions detected.</td></tr>
            ) : (
              suggestionAnomalies.map((s) => {
                const dev = ((s.suggestedPrice - s.avg) / s.avg) * 100;
                return (
                  <tr key={s.id}>
                    <td><strong>{s.species}</strong></td>
                    <td className="flag-price"><strong>{peso(s.suggestedPrice)}</strong></td>
                    <td>{peso(s.avg)}</td>
                    <td>{s.submittedBy}</td>
                    <td className={dev >= 0 ? "up" : "down"}>{dev >= 0 ? "+" : ""}{dev.toFixed(0)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   PRICE FORECAST
   ================================================================ */

function PriceForecast({ priceHistory, factors, notify }) {
  const [species, setSpecies] = useState(SPECIES_LIST[0]);
  const [days, setDays] = useState("7");

  const rows = priceHistory[species];
  const last = rows[rows.length - 1];
  const weekAgo = rows[rows.length - 8];
  const trendPerDay = (last.price - weekAgo.price) / 7;
  const count = Number(days);
  const holidays = factors.filter((f) => f.holiday).length;

  const forecast = Array.from({ length: count }).map((_, i) => {
    const d = new Date(last.date + "T00:00:00");
    d.setDate(d.getDate() + i + 1);
    const value = last.price + trendPerDay * (i + 1) * 0.8;
    const spread = 3 + i * 0.6;
    return { date: d.toLocaleDateString("en-PH"), price: value, low: value - spread, high: value + spread, up: trendPerDay >= 0 };
  });

  const pct = ((forecast[forecast.length - 1].price - last.price) / last.price) * 100;

  const exportForecast = () => {
    const header = "Date,Projected Price,Low,High\n";
    const body = forecast.map((f) => `"${f.date}","${f.price.toFixed(2)}","${f.low.toFixed(2)}","${f.high.toFixed(2)}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${species}_forecast.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Forecast exported.");
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Forecast</h2>
          <p>Projected price movement generated from historical prices and external factors.</p>
        </div>
        <div className="filter-row">
          <select className="date-input" value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="date-input" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">Next 7 days</option>
            <option value="14">Next 14 days</option>
            <option value="30">Next 30 days</option>
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div><h3>{species} — Forecast</h3><p>Historical prices with projected values</p></div>
          <button className="secondary-btn" onClick={exportForecast}>↓ Export Forecast</button>
        </div>

        <div className="chart-area">
          <div className="chart-placeholder">
            <div className="bars">
              {priceHistory[species].slice(-8).map((r, i) => <div key={`h${i}`} className="bar" style={{ height: `${50 + i * 3}%` }}></div>)}
              {forecast.map((f, i) => (
                <div key={`f${i}`} className="bar forecast-bar" style={{ height: `${55 + i * (28 / count)}%` }} title={`${f.date} — ${peso(f.price)}`}></div>
              ))}
            </div>
            <p className="chart-note">Blue bars are actual prices, orange bars are projected values.</p>
          </div>
        </div>

        <div className="insight-box">
          <strong>📈 Insight</strong>
          <p>
            {species} prices are projected to {pct >= 0 ? "rise" : "fall"} by about {Math.abs(pct).toFixed(1)}%
            over the next {days} days, ending near {peso(forecast[forecast.length - 1].price)} per kilogram.
            {holidays > 0 && ` ${holidays} logged holiday${holidays > 1 ? "s" : ""} may push demand higher than usual.`}
          </p>
        </div>

        <table>
          <thead><tr><th>DATE</th><th>PROJECTED PRICE</th><th>EXPECTED RANGE</th><th>TREND</th></tr></thead>
          <tbody>
            {forecast.map((f, i) => (
              <tr key={i}>
                <td>{f.date}</td>
                <td><strong>{peso(f.price)}</strong></td>
                <td>{peso(f.low)} – {peso(f.high)}</td>
                <td className={f.up ? "up" : "down"}>{f.up ? "▲ Rising" : "▼ Easing"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   REPORTS
   ================================================================ */

function Reports({ entries, notify }) {
  const [type, setType] = useState("Price History Report");
  const [speciesFilter, setSpeciesFilter] = useState("All Species");

  const visible = entries.filter((e) => speciesFilter === "All Species" || e.species === speciesFilter);
  const published = entries.filter((e) => e.status === "Published");
  const flagged = entries.filter((e) => e.status === "Flagged");
  const average = entries.length ? entries.reduce((s, e) => s + e.price, 0) / entries.length : 0;

  const exportCSV = () => {
    const header = "Date,Species,Price per kg,Market,Status\n";
    const body = visible.map((e) => `"${e.date}","${e.species}","${e.price.toFixed(2)}","${e.market}","${e.status}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "price_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Report exported as CSV.");
  };

  const exportPDF = () => {
    notify("Opening print dialog — choose 'Save as PDF'.");
    setTimeout(() => window.print(), 400);
  };

  return (
    <>
      <div className="page-title">
        <div><h2>Reports</h2><p>Generate and export price history and external factor reports.</p></div>
        <div className="filter-row">
          <button className="secondary-btn" onClick={exportCSV}>↓ Export CSV</button>
          <button className="primary-btn" onClick={exportPDF}>↓ Export PDF</button>
        </div>
      </div>

      <div className="log-summary">
        <div className="mini-stat"><span>Total Entries</span><strong>{entries.length}</strong></div>
        <div className="mini-stat"><span>Published</span><strong>{published.length}</strong></div>
        <div className="mini-stat"><span>Average Price</span><strong>{peso(average)}</strong></div>
        <div className="mini-stat"><span>Flagged Entries</span><strong>{flagged.length}</strong></div>
      </div>

      <div className="panel">
        <div className="table-tools">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Price History Report</option>
            <option>External Factor Summary</option>
            <option>Publication Summary</option>
          </select>
          <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}>
            <option>All Species</option>
            {SPECIES_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <table>
          <thead><tr><th>DATE</th><th>SPECIES</th><th>PRICE / KG</th><th>MARKET</th><th>STATUS</th></tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan="5" className="empty-row">No records found.</td></tr>
            ) : (
              visible.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td><strong>{e.species}</strong></td>
                  <td><strong>{peso(e.price)}</strong></td>
                  <td>{e.market}</td>
                  <td><span className={`badge ${e.status.toLowerCase().replace(/\s/g, "")}`}>{e.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   VALIDATION HISTORY
   ================================================================ */

function ValidationHistory({ validationHistory, notify }) {
  const [search, setSearch] = useState("");

  const visible = validationHistory.filter((v) =>
    [v.user, v.action, v.details].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = "Date,User,Decision,Details\n";
    const body = visible.map((v) => `"${v.date}","${v.user}","${v.action}","${v.details}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validation_history.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Validation history exported.");
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Validation History</h2>
          <p>Every review, approval, rejection, and reference-price decision you've made.</p>
        </div>
        <button className="secondary-btn" onClick={exportCSV}>↓ Export</button>
      </div>

      <div className="panel">
        <div className="table-tools">
          <div className="search-box">
            🔍
            <input type="text" placeholder="Search decisions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <table>
          <thead><tr><th>DATE</th><th>USER</th><th>DECISION</th><th>DETAILS</th></tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan="4" className="empty-row">No decisions recorded yet.</td></tr>
            ) : (
              visible.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.user}</td>
                  <td><strong>{v.action}</strong></td>
                  <td>{v.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   AUDIT LOG
   ================================================================ */

function AuditLog({ logs, notify }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Actions");

  const visible = logs
    .filter((l) => filter === "All Actions" || l.action === filter)
    .filter((l) => [l.user, l.action, l.species, l.details].join(" ").toLowerCase().includes(search.toLowerCase()));

  const exportLogs = () => {
    const header = "Date & Time,User,Action,Species,Details,Status\n";
    const body = visible.map((l) => `"${l.date}","${l.user}","${l.action}","${l.species}","${l.details}","${l.status}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_log.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Audit log exported.");
  };

  return (
    <>
      <div className="page-title">
        <div><h2>Audit Log</h2><p>Record of all price entry, validation, and publication actions.</p></div>
        <button className="secondary-btn" onClick={exportLogs}>↓ Export Logs</button>
      </div>

      <div className="panel">
        <div className="table-tools">
          <div className="search-box">
            🔍
            <input type="text" placeholder="Search actions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All Actions</option>
            <option>Encoded price</option>
            <option>Edited price</option>
            <option>Approved price</option>
            <option>Published prices</option>
            <option>Rejected price</option>
            <option>Flagged entry</option>
          </select>
        </div>

        <table>
          <thead><tr><th>DATE &amp; TIME</th><th>USER</th><th>ACTION</th><th>SPECIES</th><th>DETAILS</th><th>STATUS</th></tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan="6" className="empty-row">No activities found.</td></tr>
            ) : (
              visible.map((l) => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>{l.user}</td>
                  <td><strong>{l.action}</strong></td>
                  <td>{l.species}</td>
                  <td>{l.details}</td>
                  <td><span className={`badge ${l.status === "Success" ? "success" : "flagged"}`}>{l.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================
   NOTIFICATIONS
   ================================================================ */

function Notifications({ notifications, dismissedNotifs, setDismissedNotifs, goTo }) {
  const dismiss = (id) => setDismissedNotifs((prev) => [...prev, id]);
  const visible = notifications.filter((n) => !dismissedNotifs.includes(n.id));
  const iconFor = (type) => (type === "danger" ? "⚠" : type === "warning" ? "⏳" : "ℹ");
  const bgFor = (type) => (type === "danger" ? "purple-bg" : type === "warning" ? "blue-bg" : "green-bg");

  return (
    <>
      <div className="page-title">
        <div><h2>Notifications</h2><p>Alerts about fisherfolk suggestions, flagged entries, and pending work.</p></div>
        {dismissedNotifs.length > 0 && <button className="secondary-btn" onClick={() => setDismissedNotifs([])}>Restore Dismissed</button>}
      </div>

      <div className="panel">
        {visible.length === 0 ? (
          <p className="empty-row">You're all caught up.</p>
        ) : (
          visible.map((n) => (
            <div className="activity" key={n.id}>
              <div className={`activity-icon ${bgFor(n.type)}`}>{iconFor(n.type)}</div>
              <div style={{ flex: 1 }}>
                <strong>{n.title}</strong>
                <p>{n.detail}</p>
              </div>
              <div className="action-icons" style={{ alignSelf: "center" }}>
                <button title="View" onClick={() => goTo(n.page)}>👁</button>
                <button title="Dismiss" onClick={() => dismiss(n.id)}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================================================================
   MY PROFILE
   ================================================================ */

function MyProfile({ profile, setProfile, activity, notify }) {
  const [draft, setDraft] = useState(profile);
  const update = (key, value) => setDraft({ ...draft, [key]: value });

  const save = () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      notify("Name and email are required.");
      return;
    }
    setProfile(draft);
    notify("Profile saved.");
  };

  return (
    <>
      <div className="page-title">
        <div><h2>My Profile</h2><p>Your LGU officer account details.</p></div>
        <button className="primary-btn" onClick={save}>Save Changes</button>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <div className="config-header">
            <div className="config-icon blue">♙</div>
            <div><h3>Profile Information</h3><p>Editable contact details</p></div>
          </div>
          <div className="form-group"><label>Full Name</label><input value={draft.name} onChange={(e) => update("name", e.target.value)} /></div>
          <div className="form-group"><label>Email Address</label><input value={draft.email} onChange={(e) => update("email", e.target.value)} /></div>

          <div className="profile-grid" style={{ marginTop: 14 }}>
            <div className="profile-field"><span>Username</span><strong>{draft.username}</strong></div>
            <div className="profile-field"><span>Role</span><strong>{draft.role}</strong></div>
            <div className="profile-field"><span>Municipality</span><strong>{draft.municipality}</strong></div>
            <div className="profile-field"><span>Last Login</span><strong>{draft.lastLogin}</strong></div>
          </div>

          <div className="info-box" style={{ marginTop: 14 }}>
            Username and role can only be changed by an administrator, from User Management.
          </div>
        </div>

        <div className="config-card">
          <div className="config-header">
            <div className="config-icon orange">◷</div>
            <div><h3>My Activity</h3><p>Your recent actions in AquaTimbang</p></div>
          </div>
          <div className="history-list">
            {activity.map((a) => (
              <div className="history-item" key={a.id}>
                <div><strong>{a.action}</strong></div>
                <small>{a.date}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default LGU;