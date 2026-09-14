import { useState, useEffect, useMemo } from "react";
import { getShoppingList, getRecipeDetail } from "../api.js";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleClick(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <button
      className={`copy-btn${copied ? " copied" : ""}`}
      onClick={handleClick}
      type="button"
      aria-label={copied ? "Skopiowano" : "Kopiuj do schowka"}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7.2 5.8 10 11 4.2" />
          </svg>
          Skopiowano
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Kopiuj
        </>
      )}
    </button>
  );
}

// Section header acts as a toggle but contains a CopyButton, so it can't be a <button> itself
function toggleProps(open, onToggle) {
  return {
    role: "button",
    tabIndex: 0,
    "aria-expanded": open,
    onClick: onToggle,
    onKeyDown: (e) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
  };
}

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
        <span className="recipe-acc-meta">{dish.time} min · nakład {dish.effort + 1}/3</span>
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
  const [shopOpen, setShopOpen] = useState(true);
  const [recipesOpen, setRecipesOpen] = useState(false);

  // Expand all sections before printing (handles Ctrl+P as well as the button)
  useEffect(() => {
    function onBeforePrint() {
      setShopOpen(true);
      setRecipesOpen(true);
      setAllOpen(true);
    }
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []);

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
        getRecipeDetail(d.id, brief.guests)
          .then((detail) => ({ id: d.id, detail }))
          .catch(() => ({ id: d.id, detail: null }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ id, detail }) => { map[id] = detail; });
      setRecipeDetails(map);
    });
  }, [menu, brief.guests]);

  const allItems = useMemo(
    () => aisles.flatMap((a) => a.items.map((item, idx) => ({ ...item, key: `${a.id}-${item.name}-${idx}` }))),
    [aisles]
  );

  const totalCost = useMemo(
    () => menu.reduce((sum, d) => sum + d.costPP * brief.guests, 0),
    [menu, brief.guests]
  );

  const totalTime = useMemo(
    () => menu.reduce((sum, d) => sum + (d.time ?? 0), 0),
    [menu]
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

  const shopCopyText = useMemo(() => {
    const lines = [
      `Lista zakupów · ${brief.guests} ${guestsWord(brief.guests)}`,
      `Suma: ${totalCost.toFixed(0)} zł`,
      "— — —",
      "",
    ];
    for (const aisle of aisles) {
      lines.push(aisle.name.toUpperCase());
      for (const item of aisle.items) {
        lines.push(item.qty ? `  •  ${item.name} — ${item.qty}` : `  •  ${item.name}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }, [aisles, brief.guests, totalCost]);

  const recipesCopyText = useMemo(() => {
    const lines = [
      `Przepisy · ${brief.guests} ${guestsWord(brief.guests)}`,
      "— — —",
    ];
    for (const d of menu) {
      const detail = recipeDetails[d.id];
      lines.push("", `${d.name.toUpperCase()}  ·  ${d.category}  ·  ${d.time} min`);
      if (detail?.ingredients?.length) {
        lines.push("", "Składniki:");
        for (const ing of detail.ingredients) {
          lines.push(`  •  ${ing.name} — ${ing.qty}`);
        }
      }
      if (detail?.steps?.length) {
        lines.push("", "Przygotowanie:");
        detail.steps.forEach((step, i) => {
          lines.push(`  ${i + 1}. ${step}`);
        });
      }
      if (detail?.notes) {
        lines.push("", `Wskazówka szefa: ${detail.notes}`);
      }
      lines.push("", "— — — — — —");
    }
    return lines.join("\n");
  }, [menu, recipeDetails, brief.guests]);

  function handlePrint() {
    setShopOpen(true);
    setRecipesOpen(true);
    setAllOpen(true);
    setTimeout(() => window.print(), 60);
  }

  return (
    <div className="step3">
      <main className="shop-main">

        {/* 1. Back button — top-left, outside padded content */}
        <button className="shop-back" onClick={onBack}>
          <span className="shop-back-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </span>
          Wróć do menu
        </button>

        {/* 2 + 3 + 4. Eyebrow, title, progress */}
        <div className="shop-head">
          <div className="brief-eyebrow">Krok 03 z 03 · {brief.guests} {guestsWord(brief.guests)}</div>
          <div className="shop-eyebrow-sub">Wszystkie składniki zostały zaokrąglone w górę do pełnych wartości</div>
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

        {/* 5a. Mega-section: Produkty do kupienia */}
        {!loading && !error && (
          <section className="mega-section">
            <div
              className="mega-head"
              {...toggleProps(shopOpen, () => setShopOpen((v) => !v))}
            >
              <div className="mega-head-left">
                <span className="mega-title">Produkty do kupienia</span>
                <span className="mega-hint">{allItems.length} pozycji · {aisles.length} kategorii</span>
              </div>
              <div className="mega-head-right">
                <CopyButton text={shopCopyText} />
                <span className={`mega-chev${shopOpen ? " is-open" : ""}`} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>
            </div>

            {shopOpen && (
              <div className="mega-body">
                {aisles.map((aisle, ai) => (
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
                        <div
                          key={key}
                          className={`item${isChecked ? " checked" : ""}`}
                          onClick={() => toggleItem(key)}
                        >
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
              </div>
            )}
          </section>
        )}

        {/* 5b. Mega-section: Przepisy krok po kroku */}
        {!loading && !error && menu.length > 0 && (
          <section className="mega-section">
            <div
              className="mega-head"
              {...toggleProps(recipesOpen, () => setRecipesOpen((v) => !v))}
            >
              <div className="mega-head-left">
                <span className="mega-title">Przepisy krok po kroku</span>
                <span className="mega-hint">
                  {menu.length} {menu.length === 1 ? "przepis" : "przepisów"}
                </span>
              </div>
              <div className="mega-head-right">
                <CopyButton text={recipesCopyText} />
                <span className={`mega-chev${recipesOpen ? " is-open" : ""}`} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>
            </div>

            {recipesOpen && (
              <div className="mega-body">
                <div className="recipes-expand-row">
                  <button
                    className="recipes-expand-btn"
                    onClick={() => setAllOpen((v) => !v)}
                  >
                    {allOpen ? "Zwiń wszystkie" : "Rozwiń wszystkie"}
                  </button>
                </div>
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
              </div>
            )}
          </section>
        )}

        {/* 6. Footer — summary + restart, no back button here */}
        <div className="step-foot">
          <div className="step-foot-meta">
            <b>{totalCost.toFixed(0)}</b> zł łącznie
            {" · "}
            {overBudget
              ? <span style={{ color: "var(--accent)" }}>{Math.abs(diff).toFixed(0)} zł ponad budżet</span>
              : `${Math.abs(diff).toFixed(0)} zł w zapasie`}
          </div>
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
        <div className="side-per">
          ok. {totalTime >= 60
            ? `${Math.floor(totalTime / 60)}h ${totalTime % 60 > 0 ? `${totalTime % 60} min` : ""}`.trim()
            : `${totalTime} min`} pracy
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
          <button className="side-btn dark" onClick={handlePrint}>
            <span>Drukuj / Zapisz PDF</span>
            <span className="side-btn-arrow">↗</span>
          </button>
          <button className="side-btn" onClick={async () => { try { await navigator.clipboard.writeText(shopCopyText); } catch {} }}>
            <span>Kopiuj listę zakupów</span>
            <span className="side-btn-arrow">↗</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
