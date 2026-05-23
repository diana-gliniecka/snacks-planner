import { useState } from "react";
import { getSuggestions } from "../api.js";

const VENUES = [
  { id: "grill",     label: "Grill",         tag: "outdoor · ogień" },
  { id: "mieszkanie",label: "W mieszkaniu",   tag: "indoor · klasyk" },
  { id: "ogród",     label: "W ogrodzie",     tag: "outdoor · lato" },
  { id: "koktajl",   label: "Koktajl",        tag: "na stojąco" },
];

const DIETS = [
  { id: "miesna",    label: "Mięsna" },
  { id: "weg",       label: "Wegetariańska" },
  { id: "wegańska",  label: "Wegańska" },
  { id: "rybna",     label: "Pescetariańska" },
];


const EFFORT_TIERS = [
  { value: 0, label: "Łatwe",   sub: "do 30 min" },
  { value: 1, label: "Średnie", sub: "30–60 min" },
  { value: 2, label: "Trudne",  sub: "ponad 1 h" },
];

const BUDGET_TIERS = [
  { value: 10, label: "Studencko",     tag: "kameralnie",  sub: "do 10 zł / os." },
  { value: 20, label: "Budżetowo",     tag: "wygodnie",    sub: "do 20 zł / os." },
  { value: 30, label: "Klasa średnia", tag: "z rozmachem", sub: "do 30 zł / os." },
  { value: 40, label: "Premium",       tag: "fine dining", sub: "do 40 zł / os." },
];

const EFFORT_LABELS = ["Łatwe", "Średnie", "Trudne"];

function guestsWord(n) {
  if (n === 1) return "gość";
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return "gości";
  if (last >= 2 && last <= 4) return "gości";
  return "gości";
}

function venueLabel(v) {
  const map = { grill:"grill party", mieszkanie:"w domu", "ogród":"w ogrodzie", koktajl:"koktajl" };
  return v ? map[v] : "wybierz miejsce";
}

function VenueIcon({ id }) {
  const props = { width:28, height:28, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.4, strokeLinecap:"round", strokeLinejoin:"round" };
  if (id === "grill") return (
    <svg {...props}>
      <path d="M5 9h14l-1.5 7.5a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5L5 9Z" />
      <path d="M8 4c0 1-1 1.5-1 2.5S8 8 8 9" /><path d="M12 4c0 1-1 1.5-1 2.5s1 1.5 1 2.5" /><path d="M16 4c0 1-1 1.5-1 2.5s1 1.5 1 2.5" />
    </svg>);
  if (id === "mieszkanie") return (
    <svg {...props}>
      <path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" />
    </svg>);
  if (id === "ogród") return (
    <svg {...props}>
      <path d="M12 17c-2 0-5-1-5-4 0-2 2-3 2-3s-1-3 1-4c1-.5 2 0 2 0s1-.5 2 0c2 1 1 4 1 4s2 1 2 3c0 3-3 4-5 4Z" />
      <path d="M12 17v5" />
    </svg>);
  if (id === "koktajl") return (
    <svg {...props}>
      <path d="M5 5h14l-7 9v6" /><path d="M9 20h6" /><path d="M8 8h8" />
    </svg>);
  return null;
}

function TablePreview({ guests, venue }) {
  const MAX_SEATS = 12;
  const visibleSeats = Math.min(guests, MAX_SEATS);
  const overflow = Math.max(0, guests - MAX_SEATS);
  const seats = Array.from({ length: MAX_SEATS }, (_, i) => {
    const angle = (i / MAX_SEATS) * Math.PI * 2 - Math.PI / 2;
    const r = 92;
    return { x: 120 + Math.cos(angle) * r, y: 120 + Math.sin(angle) * r, filled: i < visibleSeats };
  });
  return (
    <div className="brief-canvas">
      <svg className="table-svg" viewBox="0 0 240 240">
        <circle className="table-ring" cx="120" cy="120" r="92" />
        <circle className="table-plate" cx="120" cy="120" r="58" />
        <text className="table-center" x="120" y="118">
          {guests > 0 ? venueLabel(venue) : "czeka na gości"}
        </text>
        <text className="table-center" x="120" y="134"
          style={{ fontSize:12, fontStyle:"normal", fontFamily:"var(--font-mono)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          {guests > 0 ? `${guests} ${guestsWord(guests)}` : ""}
        </text>
        {seats.map((s, i) => (
          <g key={i} className={`table-seat${s.filled ? " filled" : ""}`}
            style={{ transform: s.filled ? "scale(1)" : "scale(0.85)", opacity: s.filled ? 1 : 0.5 }}>
            <circle cx={s.x} cy={s.y} r="11" />
            {s.filled && overflow > 0 && i === MAX_SEATS - 1
              ? <text x={s.x} y={s.y}>+{overflow + 1}</text>
              : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function StepPartyDetails({ brief, setBrief, onNext }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalBudget = brief.guests && brief.budgetPP ? brief.guests * brief.budgetPP : 0;
  const canProceed = brief.guests > 0 && brief.venue && brief.diet && brief.budgetPP > 0;

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const dishes = await getSuggestions(brief);
      onNext(dishes);
    } catch {
      setError("Nie udało się pobrać propozycji. Sprawdź czy serwer działa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="step1">
      {/* Header: intro text + live table */}
      <aside className="brief-preview">
        <div className="brief-intro">
          <div className="brief-eyebrow">Brief · Krok 01 z 03</div>
          <h1 className="brief-title">
            Dobra impreza<br />zaczyna się od <em>jedzenia</em>.
          </h1>
          <p className="brief-sub">
            Powiedz nam kto, gdzie i ile — zaproponujemy menu przekąsek specjalnie dla Ciebie.
          </p>
        </div>
        <TablePreview guests={brief.guests} venue={brief.venue} />
      </aside>

      {/* Stats strip */}
      <div className="brief-stats">
        <div className="brief-stat">
          <div className="brief-stat-label">Goście</div>
          <div className={`brief-stat-val${!brief.guests ? " dim" : ""}`}>{brief.guests || "—"}</div>
        </div>
        <div className="brief-stat">
          <div className="brief-stat-label">Budżet całk.</div>
          <div className={`brief-stat-val${!totalBudget ? " dim" : ""}`}>
            {totalBudget || "—"}<sup>zł</sup>
          </div>
        </div>
        <div className="brief-stat">
          <div className="brief-stat-label">Nakład</div>
          <div className={`brief-stat-val${brief.effort == null ? " dim" : ""}`}
            style={{ fontStyle: brief.effort == null ? "italic" : "normal", fontSize: 22 }}>
            {brief.effort != null ? EFFORT_LABELS[brief.effort] : "—"}
          </div>
        </div>
        <div className="brief-stat">
          <div className="brief-stat-label">Charakter</div>
          <div className={`brief-stat-val${!brief.venue ? " dim" : ""}`}
            style={{ fontStyle: !brief.venue ? "italic" : "normal", fontSize: 22 }}>
            {brief.venue ? VENUES.find((v) => v.id === brief.venue)?.label : "—"}
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="brief-form">
        <div className="form-card">

          {/* 01 Goście */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Ilu gości?</div>
              <div className="form-step-num">01 / 06</div>
            </div>
            <div className="guests">
              <button className="guests-btn" onClick={() => setBrief({ ...brief, guests: Math.max(1, brief.guests - 1) })} aria-label="mniej">−</button>
              <input className="guests-input" type="number" value={brief.guests || ""} placeholder="0"
                onChange={(e) => setBrief({ ...brief, guests: Math.max(0, parseInt(e.target.value) || 0) })} />
              <button className="guests-btn" onClick={() => setBrief({ ...brief, guests: brief.guests + 1 })} aria-label="więcej">+</button>
              <span className="guests-cap">osób przy stole</span>
            </div>
          </div>

          {/* 02 Venue */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Gdzie świętujemy?</div>
              <div className="form-step-num">02 / 06</div>
            </div>
            <div className="tile-grid">
              {VENUES.map((v) => (
                <button key={v.id} className="tile" aria-pressed={brief.venue === v.id}
                  onClick={() => setBrief({ ...brief, venue: v.id })}>
                  <span className="tile-icon"><VenueIcon id={v.id} /></span>
                  <span>
                    <span className="tile-name">{v.label}</span><br />
                    <span className="tile-sub">{v.tag}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 03 Diet */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Preferencje żywieniowe</div>
              <div className="form-step-num">03 / 06</div>
            </div>
            <div className="chip-row">
              {DIETS.map((d) => (
                <button key={d.id} className="chip" aria-pressed={brief.diet === d.id}
                  onClick={() => setBrief({ ...brief, diet: d.id })}>
                  <span className="chip-dot" />{d.label}
                </button>
              ))}
            </div>
          </div>

          {/* 04 Hungry */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Apetyt gości</div>
              <div className="form-step-num">04 / 06</div>
            </div>
            <div className="chip-row">
              <button className="chip" aria-pressed={!brief.hungry}
                onClick={() => setBrief({ ...brief, hungry: false })}>
                <span className="chip-dot" />Normalny
              </button>
              <button className="chip" aria-pressed={brief.hungry}
                onClick={() => setBrief({ ...brief, hungry: true })}>
                <span className="chip-dot" />Mega głodni (+30%)
              </button>
            </div>
          </div>

          {/* 05 Effort */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Jak bardzo chcesz się napracować?</div>
              <div className="form-step-num">05 / 06</div>
            </div>
            <div className="effort-tiles">
              {EFFORT_TIERS.map((t) => (
                <button key={t.value} className="effort-tile" aria-pressed={brief.effort === t.value}
                  onClick={() => setBrief({ ...brief, effort: t.value })}>
                  <span className="effort-tile-num">{t.value + 1}</span>
                  <span className="effort-tile-body">
                    <span className="effort-tile-label">{t.label}</span>
                    <span className="effort-tile-sub">{t.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 05 Budget */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Budżet na osobę</div>
              <div className="form-step-num">06 / 06</div>
            </div>
            <div className="budget-tiles">
              {BUDGET_TIERS.map((t) => (
                <button key={t.value} className="budget-tile" aria-pressed={brief.budgetPP === t.value}
                  onClick={() => setBrief({ ...brief, budgetPP: t.value })}>
                  <span className="budget-tile-tag">{t.tag}</span>
                  <span className="budget-tile-name">{t.label}</span>
                  <span className="budget-tile-price">
                    <span className="budget-tile-price-num">{t.value}</span>
                    <span className="budget-tile-price-unit">zł / os.</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="budget-meta">
              <span>razem dla {brief.guests || "—"} osób: <b>{totalBudget ? totalBudget.toFixed(0) + " zł" : "— zł"}</b></span>
              <span>{brief.budgetPP ? BUDGET_TIERS.find((b) => b.value === brief.budgetPP)?.tag : "—"}</span>
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 12, margin: "0 0 8px" }}>
              {error}
            </p>
          )}

          <div className="cta-bar">
            <button className="btn btn-primary" disabled={!canProceed || loading} onClick={handleSubmit}>
              {loading ? "Szukam dań…" : "Skomponuj menu"}
              {!loading && (
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            {!canProceed && (
              <span className="form-help" style={{ margin: 0 }}>uzupełnij wszystkie pola</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
