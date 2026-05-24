import { useState } from "react";
import { getSuggestions } from "../api.js";

const DIETS = [
  { id: "mieszana", label: "Wszystko",  sub: "Mięso, ryby, warzywa - żadnych wykluczeń." },
  { id: "weg",      label: "Bez mięsa", sub: "Wegetariańskie przekąski - mogą zawierać nabiał i jaja." },
  { id: "wegańska", label: "Wegańskie", sub: "Wyłącznie roślinne - bez produktów odzwierzęcych." },
];

const EFFORT_TIERS = [
  { value: 0, label: "do 1h",      sub: "szybkie przekąski, głównie składanie" },
  { value: 1, label: "1h–2h",      sub: "kilka dań z krótkim gotowaniem" },
  { value: 2, label: "powyżej 2h", sub: "czasochłonne przepisy w menu" },
];

const BUDGET_TIERS = [
  { value: 20, label: "Studencko",     tag: "kameralnie",  sub: "do 20 zł / os." },
  { value: 40, label: "Budżetowo",     tag: "wygodnie",    sub: "do 40 zł / os." },
  { value: 60, label: "Klasa średnia", tag: "z rozmachem", sub: "do 60 zł / os." },
  { value: 80, label: "Premium",       tag: "fine dining", sub: "do 80 zł / os." },
];

const EFFORT_LABELS = ["do 1h", "1h–2h", "powyżej 2h"];

function guestsWord(n) {
  if (n === 1) return "gość";
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return "gości";
  if (last >= 2 && last <= 4) return "gości";
  return "gości";
}

function dietCenterLabel(d) {
  const map = { mieszana: "dla wszystkich", weg: "bez mięsa", "wegańska": "weganie" };
  return d ? map[d] : "wybierz dietę";
}

function DietTileLabel({ id }) {
  return <>{DIETS.find((d) => d.id === id)?.label ?? id}</>;
}

function TablePreview({ guests, diet }) {
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
          {guests > 0 ? dietCenterLabel(diet) : "czeka na gości"}
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
  const canProceed = brief.guests > 0 && brief.diet && brief.budgetPP > 0;

  const currentDietIdx = DIETS.findIndex((d) => d.id === brief.diet);

  function handleDietKeyDown(e) {
    const len = DIETS.length;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setBrief({ ...brief, diet: DIETS[(currentDietIdx + 1) % len].id });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setBrief({ ...brief, diet: DIETS[(currentDietIdx - 1 + len) % len].id });
    }
  }

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
        <TablePreview guests={brief.guests} diet={brief.diet} />
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
          <div className="brief-stat-label">Dieta</div>
          <div className={`brief-stat-val${!brief.diet ? " dim" : ""}`}
            style={{ fontStyle: !brief.diet ? "italic" : "normal", fontSize: 22 }}>
            {brief.diet ? DIETS.find((d) => d.id === brief.diet)?.label : "—"}
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
              <div className="form-step-num">01 / 05</div>
            </div>
            <div className="guests">
              <button className="guests-btn" onClick={() => setBrief({ ...brief, guests: Math.max(1, brief.guests - 1) })} aria-label="mniej">−</button>
              <input className="guests-input" type="number" value={brief.guests || ""} placeholder="0"
                onChange={(e) => setBrief({ ...brief, guests: Math.max(0, parseInt(e.target.value) || 0) })} />
              <button className="guests-btn" onClick={() => setBrief({ ...brief, guests: brief.guests + 1 })} aria-label="więcej">+</button>
              <span className="guests-cap">osób przy stole</span>
            </div>
          </div>

          {/* 02 Co jecie? */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Co jecie?</div>
              <div className="form-step-num">02 / 05</div>
            </div>
            <p className="form-help">Dopasujemy menu do tego, co lubicie - wybierz jedną opcję.</p>
            <div
              className="diet-tile-grid"
              role="radiogroup"
              aria-label="Preferencje żywieniowe"
              onKeyDown={handleDietKeyDown}
            >
              {DIETS.map((d, i) => (
                <button
                  key={d.id}
                  className="diet-tile"
                  role="radio"
                  aria-checked={brief.diet === d.id}
                  aria-pressed={brief.diet === d.id}
                  tabIndex={brief.diet === d.id || (!brief.diet && i === 0) ? 0 : -1}
                  onClick={() => setBrief({ ...brief, diet: d.id })}
                >
                  <span className="diet-tile-marker">
                    <span className="diet-tile-dot" />
                    <span className="diet-tile-ordinal">0{i + 1}</span>
                  </span>
                  <span className="diet-tile-body">
                    <span className="diet-tile-name">
                      <DietTileLabel id={d.id} />
                    </span>
                    <span className="diet-tile-sub">{d.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 03 Hungry */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Apetyt gości</div>
              <div className="form-step-num">03 / 05</div>
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

          {/* 04 Effort */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-label">Jak bardzo chcesz się napracować?</div>
              <div className="form-step-num">04 / 05</div>
            </div>
            <p className="form-help">Czas całkowity spędzony na przygotowaniach</p>
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
              <div className="form-step-num">05 / 05</div>
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
