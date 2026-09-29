import React, { useState } from "react";
import "./App.css";
import "./Vendor.css";

/* ================================================================
   CONSTANTS & MOCK DATA
   ================================================================ */

const SPECIES = [
  { id: "galunggong", name: "Galunggong", icon: "🐟", sci: "Decapterus macarellus", base: 180 },
  { id: "tulingan", name: "Tulingan", icon: "🐠", sci: "Euthynnus affinis", base: 160 },
  { id: "bolinaw", name: "Bolinaw", icon: "🐡", sci: "Stolephorus spp.", base: 120 },
  { id: "tamarong", name: "Tamarong", icon: "🐟", sci: "Local catch", base: 150 },
  { id: "anduhaw", name: "Anduhaw", icon: "🐠", sci: "Rastrelliger spp.", base: 170 },
];

const SPECIES_NAMES = SPECIES.map((s) => s.name);
const MARKET = "Pasil Fish Market – Cebu City";
const ME = "Marites Abellana";
const OTHER_VENDORS = ["Ronald Ceniza", "Juan Dela Cruz", "Pedro Santos", "Maria Garcia"];

const peso = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function buildPriceHistory() {
  const TODAY = new Date(2026, 8, 16);
  const records = {};
  SPECIES.forEach((sp) => {
    const rows = [];
    let price = sp.base;
    for (let d = 29; d >= 0; d--) {
      const date = new Date(TODAY);
      date.setDate(date.getDate() - d);
      const weekday = date.getDay();
      const bump = weekday === 0 || weekday === 6 ? 4 : 0;
      const pseudo = Math.abs(Math.sin(d * 12.9898 + sp.base) * 10000) % 1;
      price = sp.base + bump + (pseudo - 0.5) * 12;
      rows.push({
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
        price: Math.max(40, Number(price.toFixed(2))),
      });
    }
    records[sp.name] = rows;
  });
  return records;
}

function buildCommunitySuggestions() {
  const TODAY = new Date(2026, 8, 16);
  const rows = [];
  let id = 1;
  for (let d = 9; d >= 0; d--) {
    const date = new Date(TODAY);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    SPECIES.forEach((sp) => {
      OTHER_VENDORS.forEach((v, i) => {
        if ((id + i) % 3 === 0) return; // not everyone submits every day
        const pseudo = Math.abs(Math.sin((id + i) * 8.31) * 10000) % 1;
        rows.push({
          id: id++,
          species: sp.name,
          suggestedPrice: Math.max(40, Number((sp.base + (pseudo - 0.5) * 18).toFixed(2))),
          submittedBy: v,
          date: dateStr,
        });
      });
    });
  }
  return rows;
}

function speciesStats(records, name) {
  const rows = records[name] || [];
  if (!rows.length) return { avg: null, high: null, low: null };
  const prices = rows.map((r) => r.price);
  return {
    avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    high: Math.max(...prices),
    low: Math.min(...prices),
  };
}

/* ================================================================
   ROOT VENDOR COMPONENT
   ================================================================ */

function Vendor({ onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [toast, setToast] = useState("");

  const [priceHistory] = useState(() => buildPriceHistory());
  const [communitySuggestions, setCommunitySuggestions] = useState(() => buildCommunitySuggestions());

  const [mySuggestions, setMySuggestions] = useState([
    { id: 1, species: "Galunggong", suggestedPrice: 182.0, date: "2026-09-14", status: "Reviewed", comment: "", lguFeedback: "Close to official rate, thanks for reporting." },
    { id: 2, species: "Bolinaw", suggestedPrice: 118.0, date: "2026-09-15", status: "Pending Review", comment: "", lguFeedback: "" },
  ]);

  const [profile, setProfile] = useState({
    name: ME,
    email: "marites.a@gmail.com",
    contact: "0917 555 0198",
    municipality: "Cebu City",
    market: MARKET,
    registeredDate: "01/18/2026",
    lastLogin: "09/16/2026 07:45 AM",
    priceAlerts: true,
    forecastAlerts: false,
  });

  const [activity, setActivity] = useState([
    { id: 1, date: "09/16/2026 07:45 AM", action: "Logged in" },
    { id: 2, date: "09/15/2026 04:10 PM", action: "Submitted suggested price for Bolinaw" },
    { id: 3, date: "09/14/2026 09:02 AM", action: "Used Fair Price Calculator for Galunggong" },
  ]);

  const [dismissedNotifs, setDismissedNotifs] = useState([]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  const logActivity = (action) => {
    setActivity((prev) => [
      { id: Date.now(), date: new Date().toLocaleString("en-PH", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), action },
      ...prev,
    ]);
  };

  const notifications = buildVendorNotifications(mySuggestions);
  const unread = notifications.filter((n) => !dismissedNotifs.includes(n.id));

  const menuGroups = [
    {
      label: "PRICES",
      items: [
        { name: "Dashboard", icon: "▦" },
        { name: "Current Fish Prices", icon: "₱" },
        { name: "Price Trends", icon: "📈" },
        { name: "Price Forecast", icon: "◔" },
      ],
    },
    {
      label: "SUGGESTIONS",
      items: [
        { name: "Submit Suggested Price", icon: "✎" },
        { name: "My Suggested Prices", icon: "📥" },
        { name: "Community Average", icon: "👥" },
      ],
    },
    {
      label: "TOOLS",
      items: [
        { name: "Fair Price Calculator", icon: "🧮" },
        { name: "Export Reports", icon: "📄" },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { name: "Notifications", icon: "🔔" },
        { name: "My Profile", icon: "♙" },
        { name: "Help / How to Use", icon: "❓" },
      ],
    },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "Current Fish Prices":
        return <CurrentFishPrices priceHistory={priceHistory} />;
      case "Price Trends":
        return <PriceTrends priceHistory={priceHistory} communitySuggestions={communitySuggestions} />;
      case "Price Forecast":
        return <PriceForecast priceHistory={priceHistory} />;
      case "Submit Suggested Price":
        return (
          <SubmitSuggestedPrice
            priceHistory={priceHistory}
            setMySuggestions={setMySuggestions}
            notify={notify} logActivity={logActivity}
          />
        );
      case "My Suggested Prices":
        return (
          <MySuggestedPrices
            mySuggestions={mySuggestions} setMySuggestions={setMySuggestions}
            notify={notify} logActivity={logActivity}
          />
        );
      case "Community Average":
        return <CommunityAverage priceHistory={priceHistory} communitySuggestions={communitySuggestions} mySuggestions={mySuggestions} />;
      case "Fair Price Calculator":
        return <FairPriceCalculator priceHistory={priceHistory} notify={notify} logActivity={logActivity} />;
      case "Export Reports":
        return <ExportReports mySuggestions={mySuggestions} priceHistory={priceHistory} notify={notify} />;
      case "Notifications":
        return <Notifications notifications={notifications} dismissedNotifs={dismissedNotifs} setDismissedNotifs={setDismissedNotifs} goTo={setActivePage} />;
      case "My Profile":
        return <MyProfile profile={profile} setProfile={setProfile} activity={activity} notify={notify} />;
      case "Help / How to Use":
        return <HelpPage />;
      default:
        return (
          <VendorDashboard
            priceHistory={priceHistory}
            communitySuggestions={communitySuggestions}
            mySuggestions={mySuggestions}
            goTo={setActivePage}
            notify={notify} logActivity={logActivity}
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

        <div className="admin-label">FISH VENDOR</div>

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
            <div className="avatar">MA</div>
            <div>
              <strong>Marites Abellana</strong>
              <small>Fish Vendor</small>
            </div>
          </div>

          <button className="logout-btn" onClick={onLogout}>↪ Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>View official fish prices and compute fair selling amounts</p>
          </div>

          <div className="topbar-right">
            <button className="notification" onClick={() => setActivePage("Notifications")}>
              🔔
              {unread.length > 0 && <span className="notif-dot"></span>}
            </button>
            <div className="top-profile">
              <div className="avatar small">MA</div>
              <div>
                <strong>Marites Abellana</strong>
                <span>Fish Vendor</span>
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

function buildVendorNotifications(mySuggestions) {
  const notifs = [];
  let id = 1;

  mySuggestions.forEach((s) => {
    if (s.status === "Reviewed" || s.status === "Adopted" || s.status === "Rejected") {
      notifs.push({
        id: id++,
        type: s.status === "Rejected" ? "danger" : "info",
        page: "My Suggested Prices",
        title: `Your ${s.species} suggestion was marked "${s.status}"`,
        detail: s.lguFeedback || "No additional feedback from the LGU officer.",
      });
    }
  });

  notifs.push({
    id: id++, type: "info", page: "Current Fish Prices",
    title: "Today's official prices are published",
    detail: "Validated by the LGU as of 6:00 AM.",
  });

  return notifs;
}

/* ================================================================
   DASHBOARD
   ================================================================ */

function VendorDashboard({ priceHistory, communitySuggestions, mySuggestions, goTo, notify, logActivity }) {
  const [weight, setWeight] = useState("2.5");
  const [species, setSpecies] = useState(SPECIES[0].name);

  const current = priceHistory[species][priceHistory[species].length - 1];
  const weekAgo = priceHistory[species][priceHistory[species].length - 8];
  const delta = current.price - weekAgo.price;
  const pct = (delta / weekAgo.price) * 100;
  const up = delta >= 0;

  const parsed = parseFloat(weight);
  const valid = !isNaN(parsed) && parsed > 0;
  const total = valid ? parsed * current.price : 0;

  const pendingCount = mySuggestions.filter((s) => s.status === "Pending Review").length;

  return (
    <>
      <div className="welcome-card">
        <div>
          <span className="eyebrow">FISH VENDOR</span>
          <h2>Magandang umaga, Marites!</h2>
          <p>Today's official prices are validated by the LGU and updated as of 6:00 AM.</p>
        </div>
        <div className="welcome-fish">🐟</div>
      </div>

      <div className="trust-banner">
        <div className="trust-icon">✔</div>
        <div>
          <strong>Prices are LGU-validated</strong>
          <p>All prices shown are reviewed and published by authorized LGU officers.</p>
        </div>
      </div>

      <div className="stats-grid">
        {SPECIES.slice(0, 4).map((sp) => {
          const rows = priceHistory[sp.name];
          const now = rows[rows.length - 1];
          const prev = rows[rows.length - 8];
          const d = now.price - prev.price;
          return (
            <div key={sp.id} className="stat-card clickable" onClick={() => goTo("Current Fish Prices")}>
              <div className="stat-icon blue">{sp.icon}</div>
              <div>
                <span>{sp.name}</span>
                <h2>{peso(now.price)}</h2>
                <small className={d >= 0 ? "up" : "down"}>
                  {d >= 0 ? "▲" : "▼"} {Math.abs((d / prev.price) * 100).toFixed(1)}% vs last week
                </small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Today's Official Prices</h3>
              <p>Pasil Fish Market – Cebu City</p>
            </div>
            <button className="text-button" onClick={() => goTo("Current Fish Prices")}>View All →</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>SPECIES</th>
                <th>PRICE / KG</th>
                <th>7-DAY CHANGE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {SPECIES.map((sp) => {
                const rows = priceHistory[sp.name];
                const now = rows[rows.length - 1];
                const prev = rows[rows.length - 8];
                const d = now.price - prev.price;
                return (
                  <tr key={sp.id} className="clickable-row" onClick={() => goTo("Current Fish Prices")}>
                    <td><strong>{sp.icon} {sp.name}</strong></td>
                    <td><strong>{peso(now.price)}</strong></td>
                    <td className={d >= 0 ? "up" : "down"}>{d >= 0 ? "▲" : "▼"} {peso(Math.abs(d))}</td>
                    <td><span className="badge success">Validated</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Quick Calculator</h3>
              <p>Compute your selling amount instantly</p>
            </div>
          </div>

          <div className="quick-calc">
            <div className="form-group">
              <label>Fish Species</label>
              <select value={species} onChange={(e) => setSpecies(e.target.value)}>
                {SPECIES.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Weight</label>
              <div className="input-with-unit">
                <input type="number" value={weight} min="0" step="0.01" onChange={(e) => setWeight(e.target.value)} />
                <span>kg</span>
              </div>
            </div>

            <div className="calc-result">
              <span>FAIR PRICE</span>
              <strong>{peso(total)}</strong>
              <small>{valid ? `${parsed} kg × ${peso(current.price)} per kg` : "Enter a valid weight"}</small>
            </div>

            <button className="primary-btn full-btn" onClick={() => goTo("Fair Price Calculator")}>
              Open Full Calculator
            </button>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="notice">
          <div className="notice-icon">!</div>
          <div>
            <strong>{pendingCount} suggested price{pendingCount > 1 ? "s" : ""} awaiting LGU review</strong>
            <p>Check "My Suggested Prices" for status updates.</p>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================
   CURRENT FISH PRICES
   ================================================================ */

function CurrentFishPrices({ priceHistory }) {
  const [market] = useState(MARKET);

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Current Fish Prices</h2>
          <p>Today's LGU-validated prices for every tracked species.</p>
        </div>
      </div>

      <div className="species-grid">
        {SPECIES.map((sp) => {
          const rows = priceHistory[sp.name];
          const now = rows[rows.length - 1];
          const prev = rows[rows.length - 8];
          const d = now.price - prev.price;
          return (
            <div className="species-card" key={sp.id}>
              <div className="species-card-icon">{sp.icon}</div>
              <div>
                <strong>{sp.name}</strong>
                <p>{sp.sci}</p>
                <div className="species-card-price">
                  {peso(now.price)}
                  <span className={d >= 0 ? "up" : "down"}>
                    {d >= 0 ? "▲" : "▼"} {Math.abs((d / prev.price) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Today's Price List</h3>
            <p>{market}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>SPECIES</th>
              <th>PRICE / KG</th>
              <th>7-DAY CHANGE</th>
              <th>MARKET</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {SPECIES.map((sp) => {
              const rows = priceHistory[sp.name];
              const now = rows[rows.length - 1];
              const prev = rows[rows.length - 8];
              const d = now.price - prev.price;
              return (
                <tr key={sp.id}>
                  <td><strong>{sp.icon} {sp.name}</strong></td>
                  <td><strong>{peso(now.price)}</strong></td>
                  <td className={d >= 0 ? "up" : "down"}>{d >= 0 ? "▲" : "▼"} {peso(Math.abs(d))}</td>
                  <td>{market}</td>
                  <td><span className="badge success">Validated</span></td>
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
   PRICE TRENDS (past)
   ================================================================ */

function PriceTrends({ priceHistory, communitySuggestions }) {
  const [species, setSpecies] = useState(SPECIES[0].name);
  const [range, setRange] = useState("30");

  const rows = priceHistory[species].slice(-Number(range));
  const stats = speciesStats({ [species]: rows }, species);

  const communityRows = communitySuggestions.filter((s) => s.species === species);
  const communityAvg = communityRows.length
    ? communityRows.reduce((a, b) => a + b.suggestedPrice, 0) / communityRows.length
    : null;

  const max = Math.max(...rows.map((r) => r.price), 1);

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Trends</h2>
          <p>Historical price movement for each species over time.</p>
        </div>
        <div className="filter-row">
          <select className="date-input" value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
          <select className="date-input" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">₱</div>
          <div>
            <span>Average Price</span>
            <h2>{peso(stats.avg)}</h2>
            <small>Over selected range</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">↑</div>
          <div>
            <span>Highest Price</span>
            <h2>{peso(stats.high)}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">↓</div>
          <div>
            <span>Lowest Price</span>
            <h2>{peso(stats.low)}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div>
            <span>Community Average</span>
            <h2>{communityAvg !== null ? peso(communityAvg) : "—"}</h2>
            <small>From fisherfolk suggestions</small>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>{species} — Price History</h3>
            <p>Last {range} days</p>
          </div>
        </div>

        <div className="chart-area">
          <div className="chart-placeholder">
            <div className="bars">
              {rows.map((r, i) => (
                <div key={i} className="bar" style={{ height: `${20 + (r.price / max) * 75}%` }} title={`${r.label} — ${peso(r.price)}`}></div>
              ))}
            </div>
            <p className="chart-note">Hover a bar to see that day's price.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   PRICE FORECAST
   ================================================================ */

function PriceForecast({ priceHistory }) {
  const [species, setSpecies] = useState(SPECIES[0].name);
  const [days, setDays] = useState("7");

  const rows = priceHistory[species];
  const last = rows[rows.length - 1];
  const weekAgo = rows[rows.length - 8];
  const trendPerDay = (last.price - weekAgo.price) / 7;
  const count = Number(days);

  const forecast = Array.from({ length: count }).map((_, i) => {
    const d = new Date(last.date + "T00:00:00");
    d.setDate(d.getDate() + i + 1);
    const value = last.price + trendPerDay * (i + 1) * 0.8;
    const spread = 3 + i * 0.6;
    return {
      date: d.toLocaleDateString("en-PH"),
      price: value,
      low: value - spread,
      high: value + spread,
      up: trendPerDay >= 0,
    };
  });

  const pct = ((forecast[forecast.length - 1].price - last.price) / last.price) * 100;

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Price Forecast</h2>
          <p>Short-term price projections to help you plan your buying and selling.</p>
        </div>
        <div className="filter-row">
          <select className="date-input" value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
          <select className="date-input" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">Next 7 days</option>
            <option value="14">Next 14 days</option>
          </select>
        </div>
      </div>

      <div className="notice">
        <div className="notice-icon">!</div>
        <div>
          <strong>Forecasts are estimates only</strong>
          <p>Projected prices are generated by the system and are not official LGU prices.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>{species} — {days} Day Forecast</h3>
            <p>Projected price movement per kilogram</p>
          </div>
        </div>

        <div className="chart-area">
          <div className="chart-placeholder">
            <div className="bars">
              {priceHistory[species].slice(-8).map((r, i) => (
                <div key={`h${i}`} className="bar" style={{ height: `${50 + i * 3}%` }}></div>
              ))}
              {forecast.map((f, i) => (
                <div key={`f${i}`} className="bar forecast-bar" style={{ height: `${55 + i * (30 / count)}%` }} title={`${f.date} — ${peso(f.price)}`}></div>
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
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>DATE</th>
              <th>PROJECTED PRICE</th>
              <th>EXPECTED RANGE</th>
              <th>TREND</th>
            </tr>
          </thead>
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
   SUBMIT SUGGESTED PRICE
   ================================================================ */

function SubmitSuggestedPrice({ priceHistory, setMySuggestions, notify, logActivity }) {
  const [species, setSpecies] = useState(SPECIES[0].name);
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");

  const officialNow = priceHistory[species][priceHistory[species].length - 1].price;
  const parsed = parseFloat(price);
  const valid = price !== "" && !isNaN(parsed) && parsed > 0;
  const diffPct = valid ? ((parsed - officialNow) / officialNow) * 100 : 0;
  const bigDiff = valid && Math.abs(diffPct) > 15;

  const submit = () => {
    if (!valid) {
      notify("Enter a valid suggested price first.");
      return;
    }

    setMySuggestions((prev) => [
      {
        id: Date.now(),
        species,
        suggestedPrice: parsed,
        date: new Date().toISOString().slice(0, 10),
        status: "Pending Review",
        comment,
        lguFeedback: "",
      },
      ...prev,
    ]);

    logActivity(`Submitted suggested price for ${species}: ${peso(parsed)}`);
    notify("Suggested price submitted for LGU review.");
    setPrice("");
    setComment("");
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Submit Suggested Price</h2>
          <p>Think the official price doesn't match what you're seeing at the market? Suggest a price for LGU review.</p>
        </div>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <div className="config-header">
            <div className="config-icon blue">✎</div>
            <div>
              <h3>New Suggestion</h3>
              <p>Submitted suggestions are reviewed by an LGU officer</p>
            </div>
          </div>

          <div className="form-group">
            <label>Fish Species</label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)}>
              {SPECIES.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Current Official Price</label>
            <div className="locked-field">{peso(officialNow)} <span className="badge success">LGU Validated</span></div>
          </div>

          <div className="form-group">
            <label>Your Suggested Price per KG</label>
            <div className="input-with-unit">
              <span>₱</span>
              <input type="number" value={price} placeholder="0.00" onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          {bigDiff && (
            <div className="warn-box">
              ⚠ This is {Math.abs(diffPct).toFixed(0)}% {diffPct > 0 ? "above" : "below"} the current official
              price. Adding a comment below helps the LGU officer understand why.
            </div>
          )}

          <div className="form-group">
            <label>Comment (optional)</label>
            <input
              type="text"
              value={comment}
              placeholder="e.g. Typo — meant ₱180 not ₱810, or: supply was very limited today"
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="info-box">
            Made a mistake after submitting? You can still add or edit your comment from
            "My Suggested Prices" while it's Pending Review — the LGU officer reads
            your comment before making any correction, they don't edit your submitted
            price directly without it.
          </div>

          <button className="primary-btn full-btn" onClick={submit}>Submit Suggestion</button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   MY SUGGESTED PRICES
   ================================================================ */

function MySuggestedPrices({ mySuggestions, setMySuggestions, notify, logActivity }) {
  const [editingId, setEditingId] = useState(null);
  const [draftComment, setDraftComment] = useState("");

  const statusClass = (s) => {
    if (s === "Adopted") return "success";
    if (s === "Rejected") return "deleted";
    if (s === "Reviewed") return "approved";
    return "pending";
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setDraftComment(s.comment);
  };

  const saveComment = (s) => {
    setMySuggestions((prev) => prev.map((x) => (x.id === s.id ? { ...x, comment: draftComment } : x)));
    logActivity(`Updated comment on ${s.species} suggestion`);
    notify("Comment saved — the LGU officer will see it on review.");
    setEditingId(null);
  };

  const withdraw = (s) => {
    if (!window.confirm(`Withdraw your ${s.species} suggestion?`)) return;
    setMySuggestions((prev) => prev.filter((x) => x.id !== s.id));
    logActivity(`Withdrew suggestion for ${s.species}`);
    notify("Suggestion withdrawn.");
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>My Suggested Prices</h2>
          <p>Track the status of every price you've suggested to the LGU.</p>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>DATE</th>
              <th>SPECIES</th>
              <th>SUGGESTED PRICE</th>
              <th>COMMENT</th>
              <th>STATUS</th>
              <th>LGU FEEDBACK</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {mySuggestions.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">You haven't submitted any suggestions yet.</td></tr>
            ) : (
              mySuggestions.map((s) => (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td><strong>{s.species}</strong></td>
                  <td><strong>{peso(s.suggestedPrice)}</strong></td>
                  <td>
                    {editingId === s.id ? (
                      <input
                        className="inline-input"
                        value={draftComment}
                        onChange={(e) => setDraftComment(e.target.value)}
                        placeholder="Add a note for the LGU officer..."
                      />
                    ) : (
                      s.comment || <span className="muted-text">No comment</span>
                    )}
                  </td>
                  <td><span className={`badge ${statusClass(s.status)}`}>{s.status}</span></td>
                  <td>{s.lguFeedback || <span className="muted-text">—</span>}</td>
                  <td>
                    {s.status === "Pending Review" ? (
                      editingId === s.id ? (
                        <div className="action-icons">
                          <button title="Save" onClick={() => saveComment(s)}>✔</button>
                          <button title="Cancel" onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      ) : (
                        <div className="action-icons">
                          <button title="Edit comment" onClick={() => startEdit(s)}>✎</button>
                          <button title="Withdraw" onClick={() => withdraw(s)}>🗑</button>
                        </div>
                      )
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
   COMMUNITY AVERAGE
   ================================================================ */

function CommunityAverage({ priceHistory, communitySuggestions, mySuggestions }) {
  const allMine = mySuggestions.map((s) => ({ ...s, submittedBy: ME }));
  const combined = [...communitySuggestions, ...allMine];

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Community Average</h2>
          <p>See how your fellow fisherfolk's suggested prices compare with the official rate.</p>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>SPECIES</th>
              <th>OFFICIAL PRICE</th>
              <th>COMMUNITY AVERAGE</th>
              <th>DIFFERENCE</th>
              <th>SUBMISSIONS</th>
            </tr>
          </thead>
          <tbody>
            {SPECIES.map((sp) => {
              const rows = combined.filter((s) => s.species === sp.name);
              const official = priceHistory[sp.name][priceHistory[sp.name].length - 1].price;
              const avg = rows.length ? rows.reduce((a, b) => a + b.suggestedPrice, 0) / rows.length : null;
              const diff = avg !== null ? avg - official : null;

              return (
                <tr key={sp.id}>
                  <td><strong>{sp.icon} {sp.name}</strong></td>
                  <td>{peso(official)}</td>
                  <td>{avg !== null ? peso(avg) : "—"}</td>
                  <td className={diff === null ? "" : diff >= 0 ? "up" : "down"}>
                    {diff !== null ? `${diff >= 0 ? "▲" : "▼"} ${peso(Math.abs(diff))}` : "—"}
                  </td>
                  <td>{rows.length}</td>
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
   FAIR PRICE CALCULATOR
   ================================================================ */

function FairPriceCalculator({ priceHistory, notify, logActivity }) {
  const [species, setSpecies] = useState(SPECIES[0].name);
  const [weight, setWeight] = useState("");
  const [history, setHistory] = useState([]);

  const unit = priceHistory[species][priceHistory[species].length - 1].price;
  const parsed = parseFloat(weight);
  const touched = weight !== "";
  const invalid = touched && (isNaN(parsed) || parsed <= 0);
  const valid = touched && !invalid;
  const total = valid ? parsed * unit : 0;

  const save = () => {
    if (!valid) {
      notify("Enter a valid weight first.");
      return;
    }
    setHistory((prev) => [{ id: Date.now(), species, weight: parsed, total }, ...prev].slice(0, 5));
    logActivity(`Used Fair Price Calculator for ${species}: ${parsed} kg`);
    notify("Computation saved.");
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Fair Price Calculator</h2>
          <p>Enter the weight to compute the fair amount based on the official LGU price.</p>
        </div>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <div className="config-header">
            <div className="config-icon blue">🧮</div>
            <div>
              <h3>Compute Fair Price</h3>
              <p>Weight × official price per kilogram</p>
            </div>
          </div>

          <div className="form-group">
            <label>Fish Species</label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)}>
              {SPECIES.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Weight in Kilograms</label>
            <div className="input-with-unit">
              <input type="number" value={weight} min="0" step="0.01" placeholder="0.00" onChange={(e) => setWeight(e.target.value)} />
              <span>kg</span>
            </div>
          </div>

          {invalid && <div className="error-box">⚠ Please enter a valid weight greater than 0.</div>}

          <div className="form-group">
            <label>Official Price per KG</label>
            <div className="locked-field">{peso(unit)} <span className="badge success">LGU Validated</span></div>
          </div>
        </div>

        <div className="config-card">
          <div className="config-header">
            <div className="config-icon green">₱</div>
            <div>
              <h3>Computation Result</h3>
              <p>Amount the buyer should pay</p>
            </div>
          </div>

          <div className="big-result">
            <span>TOTAL FAIR PRICE</span>
            <strong>{peso(total)}</strong>
            <small>{valid ? `${parsed} kg × ${peso(unit)} per kg` : "Enter a weight to compute"}</small>
          </div>

          <div className="button-row">
            <button className="secondary-btn" onClick={() => setWeight("")}>Clear</button>
            <button className="primary-btn" onClick={save}>Save</button>
          </div>

          {history.length > 0 && (
            <>
              <div className="mini-head">Recent Computations</div>
              <div className="breakdown">
                {history.map((h) => (
                  <div className="breakdown-row" key={h.id}>
                    <span>{h.species} · {h.weight} kg</span>
                    <strong>{peso(h.total)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================
   EXPORT REPORTS
   ================================================================ */

function ExportReports({ mySuggestions, priceHistory, notify }) {
  const [reportType, setReportType] = useState("My Suggested Prices");

  const exportCSV = () => {
    let header, body, filename;

    if (reportType === "My Suggested Prices") {
      header = "Date,Species,Suggested Price,Comment,Status\n";
      body = mySuggestions.map((s) => `"${s.date}","${s.species}","${s.suggestedPrice.toFixed(2)}","${s.comment}","${s.status}"`).join("\n");
      filename = "my_suggested_prices.csv";
    } else {
      header = "Date,Species,Price per kg\n";
      const rows = [];
      SPECIES.forEach((sp) => {
        priceHistory[sp.name].slice(-30).forEach((r) => rows.push(`"${r.date}","${sp.name}","${r.price.toFixed(2)}"`));
      });
      body = rows.join("\n");
      filename = "price_history_30days.csv";
    }

    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    notify(`${reportType} exported as CSV.`);
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Export Reports</h2>
          <p>Download your own submissions or recent price history for your records.</p>
        </div>
      </div>

      <div className="panel">
        <div className="table-tools">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option>My Suggested Prices</option>
            <option>Price History (30 days)</option>
          </select>
          <button className="primary-btn" onClick={exportCSV}>↓ Export CSV</button>
        </div>

        <p className="empty-row">Select a report type above, then export it as a CSV file.</p>
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
  const iconFor = (type) => (type === "danger" ? "⚠" : "ℹ");
  const bgFor = (type) => (type === "danger" ? "purple-bg" : "blue-bg");

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Notifications</h2>
          <p>Updates about your suggestions and today's official prices.</p>
        </div>
        {dismissedNotifs.length > 0 && (
          <button className="secondary-btn" onClick={() => setDismissedNotifs([])}>Restore Dismissed</button>
        )}
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
        <div>
          <h2>My Profile</h2>
          <p>Manage your vendor profile, preferences, and see your recent activity.</p>
        </div>
        <button className="primary-btn" onClick={save}>Save Changes</button>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <div className="config-header">
            <div className="config-icon blue">♙</div>
            <div>
              <h3>Profile Information</h3>
              <p>Your registered vendor details</p>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input value={draft.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input value={draft.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input value={draft.contact} onChange={(e) => update("contact", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Municipality</label>
            <select value={draft.municipality} onChange={(e) => update("municipality", e.target.value)}>
              <option>Cebu City</option>
              <option>Mandaue City</option>
            </select>
          </div>

          <div className="profile-grid" style={{ marginTop: 14 }}>
            <div className="profile-field">
              <span>Registered Date</span>
              <strong>{draft.registeredDate}</strong>
            </div>
            <div className="profile-field">
              <span>Last Login</span>
              <strong>{draft.lastLogin}</strong>
            </div>
          </div>

          <div className="toggle-row">
            <div>
              <strong>Daily Price Alerts</strong>
              <p>Notify me when new prices are published.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={draft.priceAlerts} onChange={(e) => update("priceAlerts", e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="config-card">
          <div className="config-header">
            <div className="config-icon orange">◷</div>
            <div>
              <h3>My Activity</h3>
              <p>Your recent actions in AquaTimbang</p>
            </div>
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

/* ================================================================
   HELP / HOW TO USE
   ================================================================ */

function HelpPage() {
  const steps = [
    { title: "Check today's prices", text: "Open Current Fish Prices to see LGU-validated rates for every species before you head to the market." },
    { title: "Compute a fair price", text: "Use the Fair Price Calculator — enter the weight you're selling and it multiplies it by the official rate automatically." },
    { title: "Suggest a correction", text: "If a price looks off, go to Submit Suggested Price. Add a comment explaining why so the LGU officer has context." },
    { title: "Track your suggestions", text: "My Suggested Prices shows the status of everything you've submitted, plus any feedback from the LGU officer." },
    { title: "Compare with other vendors", text: "Community Average shows what other fisherfolk are suggesting, so you can see if your numbers line up." },
    { title: "Watch the forecast", text: "Price Forecast gives you a short-term projection so you can plan ahead for buying or selling." },
  ];

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Help / How to Use</h2>
          <p>A quick walkthrough of everything you can do in AquaTimbang.</p>
        </div>
      </div>

      <div className="panel">
        {steps.map((s, i) => (
          <div className="activity" key={i}>
            <div className="activity-icon blue-bg">{i + 1}</div>
            <div>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="notice" style={{ marginTop: 18 }}>
        <div className="notice-icon">?</div>
        <div>
          <strong>Still need help?</strong>
          <p>Visit your local LGU office or reach out through the market coordinator for further assistance.</p>
        </div>
      </div>
    </>
  );
}

export default Vendor;