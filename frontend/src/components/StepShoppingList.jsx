import { useState, useEffect, useMemo } from "react";
import { getShoppingList, getRecipeDetail } from "../api.js";

function RecipeAccordion({ dish, detail, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={`recipe-acc${open ? " is-open" : ""}`}>
      <button className="recipe-acc-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="recipe-acc-emoji" aria-hidden="true">{dish.emoji}</span>
        <span className="recipe-acc-text">
          <span className="recipe-acc-cat">{dish.category}</span>
          <span className="recipe-acc-name">{dish.name}</span>
        </span>
        <span className="recipe-acc-meta">{dish.time} min · nakład {dish.effort + 1}/5</span>
        <span className="recipe-acc-chev" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="recipe-acc-body">
          <div className="recipe-acc-ings">
            <h5 className="recipe-acc-h">Składniki</h5>
            {!detail
              ? <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>Brak danych.</p>
              : (
                <ul>
                  {detail.ingredients.map((ing, i) => (
                    <li key={i}>
                      <span>{ing.name}</span>
                      <span className="recipe-acc-qty">{ing.qty}</span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
          <div className="recipe-acc-steps">
            <h5 className="recipe-acc-h">Przygotowanie</h5>
            {!detail || detail.steps.length === 0
              ? <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>Brak kroków.</p>
              : (
                <ol>
                  {detail.steps.map((step, i) => (
                    <li key={i}>
                      <span className="recipe-acc-num">{String(i + 1).padStart(2, "0")}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            {detail?.notes && (
              <div className="recipe-acc-tip">
                <span>Wskazówka szefa</span>
                <p style={{ margin: 0 }}>{detail.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

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
  const [recipeDetails, setRecipeDetails] = useState({});
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const ids = menu.map((d) => d.id);
    setLoading(true);
    getShoppingList(ids, brief.guests, menu.length, brief.hungry)
      .then(setAisles)
      .catch(() => setError("Nie udało się załadować listy zakupów."))
      .finally(() => setLoading(false));
  }, [menu, brief.guests, brief.hungry]);

  useEffect(() => {
    Promise.all(
      menu.map((d) =>
        getRecipeDetail(d.id)
          .then((detail) => ({ id: d.id, detail }))
          .catch(() => ({ id: d.id, detail: null }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ id, detail }) => { map[id] = detail; });
      setRecipeDetails(map);
    });
  }, [menu]);

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

        {!loading && !error && menu.length > 0 && (
          <section className="recipes-section">
            <header className="recipes-section-head">
              <div>
                <div className="recipes-section-eyebrow">Wybrane przez Ciebie</div>
                <h2 className="recipes-section-title">Przepisy <em>krok po kroku</em></h2>
              </div>
              <button
                className="recipes-section-toggle"
                onClick={() => setAllOpen(!allOpen)}
              >
                {allOpen ? "Zwiń wszystkie" : "Rozwiń wszystkie"}
              </button>
            </header>
            <div className="recipes-list">
              {menu.map((d, i) => (
                <RecipeAccordion
                  key={`${d.id}-${i}-${allOpen}`}
                  dish={d}
                  detail={recipeDetails[d.id]}
                  defaultOpen={allOpen}
                />
              ))}
            </div>
          </section>
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
          <button className="side-btn dark" onClick={() => window.print()}>
            <span>Drukuj / Zapisz PDF</span>
            <span className="side-btn-arrow">↗</span>
          </button>
          <button className="side-btn" onClick={handleCopy}>
            <span>Kopiuj listę zakupów</span>
            <span className="side-btn-arrow">↗</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
