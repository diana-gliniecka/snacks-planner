import { useState, useEffect, useMemo } from "react";
import { getShoppingList } from "../api.js";

function guestsWord(n) {
  if (n === 1) return "gość";
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return "gości";
  if (last >= 2 && last <= 4) return "gości";
  return "gości";
}

export default function StepShoppingList({ brief, menu, onBack, onRestart }) {
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const ids = menu.map((d) => d.id);
    setLoading(true);
    getShoppingList(ids, brief.guests, menu.length, brief.hungry)
      .then(setAisles)
      .catch(() => setError("Nie udało się załadować listy zakupów."))
      .finally(() => setLoading(false));
  }, [menu, brief.guests, brief.hungry]);

  const allItems = useMemo(
    () => aisles.flatMap((a) => a.items.map((item, idx) => ({ ...item, key: `${a.id}-${item.name}-${idx}` }))),
    [aisles]
  );

  const totalCost = useMemo(
    () => menu.reduce((sum, d) => sum + d.costPP * brief.guests, 0),
    [menu, brief.guests]
  );

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = allItems.length ? (checkedCount / allItems.length) * 100 : 0;
  const budgetTotal = brief.budgetPP * brief.guests;
  const diff = budgetTotal - totalCost;
  const overBudget = diff < 0;

  const toggleItem = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const dishCosts = menu.map((d, i) => ({
    key: d.id + "-" + i,
    dish: d,
    total: d.costPP * brief.guests,
  }));

  async function handleCopy() {
    const lines = [`Lista zakupów dla ${brief.guests} ${guestsWord(brief.guests)}`];
    for (const aisle of aisles) {
      lines.push("", aisle.name.toUpperCase());
      for (const item of aisle.items) {
        lines.push(item.qty ? `- ${item.name}: ${item.qty}` : `- ${item.name}`);
      }
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {}
  }

  return (
    <div className="step3">
      <main className="shop-main">
        <div className="shop-head">
          <div className="brief-eyebrow">Krok 03 z 03 · {brief.guests} {guestsWord(brief.guests)}</div>
          <h1 className="shop-title">Lista <em>zakupów</em></h1>
          {!loading && !error && (
            <div className="shop-progress">
              <div className="shop-progress-bar">
                <div className="shop-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="shop-progress-num">{checkedCount}/{allItems.length} kupione</span>
            </div>
          )}
        </div>

        {loading && (
          <p style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>Ładowanie listy…</p>
        )}
        {error && (
          <p style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{error}</p>
        )}

        {!loading && !error && aisles.map((aisle, ai) => (
          <section className="aisle" key={aisle.id}>
            <header className="aisle-head">
              <span className="aisle-num">{String(ai + 1).padStart(2, "0")}</span>
              <h2 className="aisle-name">{aisle.name}</h2>
              <span className="aisle-count">
                {aisle.items.length} {aisle.items.length === 1 ? "pozycja" : "pozycji"}
              </span>
            </header>
            {aisle.items.map((item, idx) => {
              const key = `${aisle.id}-${item.name}-${idx}`;
              const isChecked = !!checked[key];
              return (
                <div key={key} className={`item${isChecked ? " checked" : ""}`} onClick={() => toggleItem(key)}>
                  <span className="item-check">
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 14 14">
                        <path d="M3 7.2 5.8 10 11 4.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">{item.qty}</span>
                </div>
              );
            })}
          </section>
        ))}

        <div className="step-foot">
          <button className="btn btn-ghost" onClick={onBack}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Wróć do menu
          </button>
          <button className="btn btn-primary" onClick={onRestart}>
            Nowa impreza
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </main>

      <aside className="shop-side">
        <div className="side-eyebrow">Suma zakupów</div>
        <div className="side-total">
          {totalCost.toFixed(0)}<span className="side-total-unit">zł</span>
        </div>
        <div className="side-per">
          {(totalCost / brief.guests).toFixed(2)} zł / osobę · {brief.guests} {guestsWord(brief.guests)}
        </div>

        <div className="side-budget-row">
          <span className="side-budget-label">vs. budżet</span>
          <span className={`side-budget-val ${overBudget ? "alert" : "ok"}`}>
            {overBudget ? "+" : "−"}{Math.abs(diff).toFixed(0)} zł
          </span>
        </div>

        <h3 className="side-h3">Koszt na przekąskę</h3>
        {dishCosts.map(({ key, dish, total }) => (
          <div className="side-dish-row" key={key}>
            <div>
              <span className="side-dish-course">{dish.category}</span>
              <div className="side-dish-name">{dish.name}</div>
            </div>
            <div className="side-dish-cost">{total.toFixed(0)} zł</div>
          </div>
        ))}

        <div className="side-actions">
          <button className="side-btn dark" onClick={handleCopy}>
            <span>Kopiuj listę zakupów</span>
            <span className="side-btn-arrow">↗</span>
          </button>
          <button className="side-btn" onClick={() => window.print()}>
            <span>Drukuj listę</span>
            <span className="side-btn-arrow">↗</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
