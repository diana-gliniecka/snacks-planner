import { useState, useEffect, useCallback } from "react";
import { getRecipeDetail } from "../api.js";

const CATEGORIES = ["na zimno", "na ciepło", "do dzielenia", "słodkie"];

function CategoryDot({ category }) {
  const colors = {
    "na zimno":     "var(--accent)",
    "na ciepło":    "#d97757",
    "do dzielenia": "var(--success)",
    "słodkie":      "var(--highlight)",
  };
  return (
    <span aria-hidden="true" style={{
      display: "inline-block", width: 8, height: 8, borderRadius: 2,
      background: colors[category] || "var(--ink-3)", marginRight: 8, verticalAlign: "middle",
    }} />
  );
}

function RecipeModal({ open, dish, detail, loading, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !dish) return null;

  const effortLabels = ["", "łatwe", "średnie", "wymagające"];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal--recipe"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Przepis: ${dish.name}`}
      >
        <header className="modal-head modal-head--recipe">
          <div>
            <div className="modal-eyebrow">Przepis · {dish.category}</div>
            <h2 className="modal-title">{dish.name}</h2>
            {dish.desc && <p className="modal-sub">{dish.desc}</p>}
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Zamknij">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        <div className="modal-body modal-body--recipe">
          {loading && <p className="recipe-empty">Wczytuję przepis…</p>}
          {!loading && !detail && <p className="recipe-empty">Nie udało się załadować przepisu.</p>}
          {!loading && detail && (
            <div className="recipe recipe--wide">
              <div className="recipe-side">
                <div className="recipe-meta-grid">
                  <div>
                    <div className="recipe-meta-label">Czas</div>
                    <div className="recipe-meta-val">{dish.time}<span style={{ fontSize: 14, color: "var(--ink-2)" }}> min</span></div>
                  </div>
                  <div>
                    <div className="recipe-meta-label">Nakład</div>
                    <div className="recipe-meta-val">{effortLabels[detail.effort_level] || detail.effort_level}</div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <div className="recipe-meta-label">Porcje</div>
                    <div className="recipe-meta-yields">na {detail.base_servings} os.</div>
                  </div>
                </div>

                {detail.ingredients.length > 0 && (
                  <div className="recipe-ings">
                    <h5 className="recipe-h">Składniki</h5>
                    <ul>
                      {detail.ingredients.map((ing, i) => (
                        <li key={i}>
                          <span>{ing.name}</span>
                          <span className="recipe-ing-qty">{ing.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detail.notes && (
                  <div className="recipe-tip">
                    <span className="recipe-tip-label">Wskazówka szefa</span>
                    <p style={{ margin: 0 }}>{detail.notes}</p>
                  </div>
                )}
              </div>

              <div className="recipe-steps">
                <h5 className="recipe-h">Przygotowanie</h5>
                {detail.steps.length === 0
                  ? <p className="recipe-empty">Brak kroków przygotowania.</p>
                  : (
                    <ol>
                      {detail.steps.map((step, i) => (
                        <li key={i}>
                          <span className="recipe-step-num">{String(i + 1).padStart(2, "0")}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SnackCard({ dish, brief, onSwap, onRemove, onRecipe, showImagery }) {
  const totalCost = (dish.costPP * brief.guests).toFixed(0);
  return (
    <article className="snack">
      <button className="snack-remove" onClick={onRemove} aria-label="Usuń przekąskę" title="Usuń">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>

      <div className="snack-img">
        {showImagery ? (
          <>
            <div className="snack-img-placeholder" />
            <div className="snack-img-emoji" aria-hidden="true">{dish.emoji}</div>
          </>
        ) : (
          <>
            <div className="snack-img-placeholder" />
            <span className="snack-img-tag">{dish.tag}</span>
          </>
        )}
      </div>

      <div className="snack-body">
        <div className="snack-cat">
          <CategoryDot category={dish.category} />
          {dish.category}
        </div>
        <h3 className="snack-name">{dish.name}</h3>
        {dish.desc && <p className="snack-desc">{dish.desc}</p>}

        <div className="snack-meta">
          <span className="snack-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {dish.time} min
          </span>
          <span className="snack-meta-item">nakład {dish.effort + 1}/5</span>
          {dish.allergens?.length > 0 && (
            <span className="snack-meta-item dim" title={`Zawiera: ${dish.allergens.join(", ")}`}>
              zawiera {dish.allergens.slice(0, 2).join(", ")}{dish.allergens.length > 2 ? "…" : ""}
            </span>
          )}
        </div>

        <div className="snack-foot">
          <div className="snack-cost">
            <span className="snack-cost-pp"><b>{dish.costPP.toFixed(1)}</b> zł / os.</span>
            <span className="snack-cost-total">razem {totalCost} zł</span>
          </div>
          <div className="snack-foot-actions">
            <button className="snack-action" onClick={onRecipe}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Przepis
            </button>
            <button className="snack-swap" onClick={onSwap}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h13l-3-3M20 17H7l3 3" />
              </svg>
              Wymień
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SwapModal({ open, mode, currentDish, menu, allDishes, brief, showImagery, onClose, onPick }) {
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!open) return;
    setFilter("all");
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // Show dishes not currently in menu (excluding the one being swapped)
  const inMenu = new Set(menu.map((d) => d.id));
  if (mode === "swap" && currentDish) inMenu.delete(currentDish.id);

  const pool = allDishes.filter((d) => !inMenu.has(d.id));
  const filtered = filter === "all" ? pool : pool.filter((d) => d.category === filter);

  const title = mode === "add" ? "Dodaj przekąskę" : "Wymień przekąskę";
  const subtitle = mode === "swap" && currentDish
    ? `Zamiast „${currentDish.name}" możesz podać:`
    : `Wybierz coś co pasuje do tego stołu — ${pool.length} opcji.`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <div>
            <div className="modal-eyebrow">{mode === "add" ? "Dodawanie · katalog" : "Wymiana · katalog"}</div>
            <h2 className="modal-title">{title}</h2>
            <p className="modal-sub">{subtitle}</p>
          </div>
          <button className="modal-x" onClick={onClose} aria-label="Zamknij">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        <div className="modal-filters">
          <button className="modal-chip" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            Wszystkie <span className="modal-chip-count">{pool.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const n = pool.filter((d) => d.category === cat).length;
            return (
              <button key={cat} className="modal-chip" aria-pressed={filter === cat}
                onClick={() => setFilter(cat)} disabled={n === 0}>
                <CategoryDot category={cat} />{cat} <span className="modal-chip-count">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          {filtered.length === 0 ? (
            <div className="modal-empty">Brak alternatyw spełniających kryteria.</div>
          ) : (
            <div className="modal-grid">
              {filtered.map((d) => (
                <button key={d.id} className="alt-card" onClick={() => onPick(d)}>
                  <div className="alt-card-img">
                    {showImagery ? (
                      <>
                        <div className="snack-img-placeholder" />
                        <div className="alt-card-emoji" aria-hidden="true">{d.emoji}</div>
                      </>
                    ) : (
                      <>
                        <div className="snack-img-placeholder" />
                        <span className="alt-card-tag">{d.tag}</span>
                      </>
                    )}
                    <span className="alt-card-cat">
                      <CategoryDot category={d.category} />{d.category}
                    </span>
                  </div>
                  <div className="alt-card-body">
                    <h4 className="alt-card-name">{d.name}</h4>
                    <div className="alt-card-meta">
                      <span><b>{d.costPP.toFixed(1)}</b> zł / os.</span>
                      <span>·</span>
                      <span>{d.time} min</span>
                      <span>·</span>
                      <span>nakład {d.effort + 1}/5</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StepSuggestions({ brief, allDishes, menu, setMenu, showImagery, onBack, onNext }) {
  const [swap, setSwap] = useState(null);
  const [recipeDish, setRecipeDish] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);

  const openRecipe = useCallback((dish) => {
    setRecipeDish(dish);
    setRecipeDetail(null);
    setRecipeLoading(true);
    getRecipeDetail(dish.id)
      .then(setRecipeDetail)
      .catch(() => setRecipeDetail(null))
      .finally(() => setRecipeLoading(false));
  }, []);

  const closeRecipe = useCallback(() => {
    setRecipeDish(null);
    setRecipeDetail(null);
  }, []);

  const openSwap = (index) => setSwap({ mode: "swap", index, dish: menu[index] });
  const openAdd = () => setSwap({ mode: "add", index: -1, dish: null });
  const closeSwap = () => setSwap(null);

  const pickReplacement = (dish) => {
    if (!swap) return;
    if (swap.mode === "swap") {
      const next = [...menu];
      next[swap.index] = dish;
      setMenu(next);
    } else {
      setMenu([...menu, dish]);
    }
    setSwap(null);
  };

  const removeAt = (index) => setMenu(menu.filter((_, i) => i !== index));

  const totalPP = menu.reduce((sum, d) => sum + (d?.costPP || 0), 0);
  const totalAll = totalPP * brief.guests;
  const budgetTotal = brief.budgetPP * brief.guests;
  const overBudget = totalPP > brief.budgetPP;
  const diff = budgetTotal - totalAll;

  const catCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = menu.filter((d) => d.category === cat).length;
    return acc;
  }, {});

  // How many dishes are still available to add
  const inMenuIds = new Set(menu.map((d) => d.id));
  const availableCount = allDishes.filter((d) => !inMenuIds.has(d.id)).length;

  if (allDishes.length === 0) {
    return (
      <div className="step2">
        <div className="menu-head">
          <div>
            <div className="menu-eyebrow">Twoje przekąski</div>
            <h1 className="menu-title">Brak <em>wyników</em>.</h1>
          </div>
        </div>
        <p style={{ color: "var(--ink-2)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20 }}>
          Żadne dania nie pasują do Twoich kryteriów. Spróbuj zmniejszyć nakład pracy lub zwiększyć budżet.
        </p>
        <div className="step-foot">
          <button className="btn btn-ghost" onClick={onBack}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Zmień brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step2">
      <div className="menu-head">
        <div>
          <div className="menu-eyebrow">
            Twoje przekąski · {brief.guests} osób · {brief.venue}
          </div>
          <h1 className="menu-title">
            {menu.length} przekąsek,<br />jedna <em>uczta</em>.
          </h1>
          <div className="menu-mix">
            {CATEGORIES.filter((c) => catCounts[c] > 0).map((c) => (
              <span key={c} className="menu-mix-item">
                <CategoryDot category={c} />
                <b>{catCounts[c]}</b> {c}
              </span>
            ))}
          </div>
        </div>
        <div className="menu-summary">
          <div className="menu-summary-item">
            <div className="menu-summary-label">koszt / osoba</div>
            <div className={`menu-summary-val${overBudget ? " alert" : ""}`}>
              {totalPP.toFixed(1)}<sup>zł</sup>
            </div>
          </div>
          <div className="menu-summary-item">
            <div className="menu-summary-label">budżet / osoba</div>
            <div className="menu-summary-val" style={{ color: "var(--ink-3)" }}>
              {brief.budgetPP}<sup>zł</sup>
            </div>
          </div>
          <div className="menu-summary-item">
            <div className="menu-summary-label">łącznie</div>
            <div className={`menu-summary-val${overBudget ? " alert" : ""}`}>
              {totalAll.toFixed(0)}<sup>zł</sup>
            </div>
          </div>
        </div>
      </div>

      <div className="snack-grid">
        {menu.map((d, i) => (
          <SnackCard
            key={d.id + "-" + i}
            dish={d}
            brief={brief}
            showImagery={showImagery}
            onSwap={() => openSwap(i)}
            onRemove={() => removeAt(i)}
            onRecipe={() => openRecipe(d)}
          />
        ))}
        <button className="snack-add" onClick={openAdd}>
          <span className="snack-add-plus">+</span>
          <span className="snack-add-label">Dodaj kolejną przekąskę</span>
          <span className="snack-add-sub">{availableCount} opcji w katalogu</span>
        </button>
      </div>

      <div className="step-foot">
        <button className="btn btn-ghost" onClick={onBack}>
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zmień brief
        </button>
        <span className="step-foot-meta">
          <b>{totalAll.toFixed(0)} zł</b> łącznie ·{" "}
          {overBudget
            ? `${Math.abs(diff).toFixed(0)} zł ponad budżet`
            : `${diff.toFixed(0)} zł w zapasie`}
        </span>
        <button className="btn btn-primary" onClick={onNext} disabled={menu.length === 0}>
          Zrób listę zakupów
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <SwapModal
        open={!!swap}
        mode={swap?.mode}
        currentDish={swap?.dish}
        menu={menu}
        allDishes={allDishes}
        brief={brief}
        showImagery={showImagery}
        onClose={closeSwap}
        onPick={pickReplacement}
      />

      <RecipeModal
        open={!!recipeDish}
        dish={recipeDish}
        detail={recipeDetail}
        loading={recipeLoading}
        onClose={closeRecipe}
      />
    </div>
  );
}
