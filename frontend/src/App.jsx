import { useState, useEffect, useCallback, useRef } from "react";
import StepPartyDetails from "./components/StepPartyDetails.jsx";
import StepSuggestions from "./components/StepSuggestions.jsx";
import StepShoppingList from "./components/StepShoppingList.jsx";


// ── Main app ────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = {
  palette: "trattoria",
  displayFont: "Instrument Serif",
  imagery: true,
  density: "regular",
};

function Topbar({ step, setStep, canVisit }) {
  const steps = [
    { n: 1, label: "Szczegóły" },
    { n: 2, label: "Menu" },
    { n: 3, label: "Zakupy" },
  ];
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"><em>Snacks</em> Planner</span>
      </div>
      <nav className="stepper" aria-label="Postęp">
        {steps.map((s, i) => (
          <span key={s.n} style={{ display: "contents" }}>
            {i > 0 && <span className="stepper-sep" />}
            <button
              aria-current={step === s.n ? "step" : undefined}
              data-done={step > s.n ? "1" : "0"}
              disabled={!canVisit(s.n)}
              onClick={() => canVisit(s.n) && setStep(s.n)}
              style={{ opacity: canVisit(s.n) ? 1 : 0.4, cursor: canVisit(s.n) ? "pointer" : "not-allowed" }}
            >
              <span className="stepper-num">{step > s.n ? "✓" : s.n}</span>
              {s.label}
            </button>
          </span>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  const [tweaks, setTweaksState] = useState(TWEAK_DEFAULTS);

  const setTweak = useCallback((key, val) => {
    setTweaksState((prev) => ({ ...prev, [key]: val }));
  }, []);

  const [step, setStepRaw] = useState(1);
  const setStep = (n) => { setStepRaw(n); window.scrollTo({ top: 0, behavior: "instant" }); };
  const [brief, setBrief] = useState({
    guests: 0,
    diet: "mieszana",
    effort: null,
    budgetPP: 0,
    hungry: false,
  });
  const [allDishes, setAllDishes] = useState(null); // all matching from /suggest
  const [menu, setMenu] = useState(null);            // currently selected subset

  // Apply tweaks to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", tweaks.palette);
    document.documentElement.setAttribute("data-density", tweaks.density);
    document.documentElement.style.setProperty(
      "--font-display",
      `"${tweaks.displayFont}", "Times New Roman", serif`
    );
  }, [tweaks]);

  // Demo fill
  useEffect(() => {
    if (!tweaks._demo) return;
    setBrief({ guests: 24, diet: "mieszana", effort: 2, budgetPP: 40, hungry: false });
    setAllDishes(null);
    setMenu(null);
    setStep(1);
    setTweak("_demo", false);
  }, [tweaks._demo]);

  const canVisit = (n) => {
    if (n === 1) return true;
    if (n === 2) return brief.guests > 0 && brief.diet && brief.budgetPP > 0;
    if (n === 3) return menu && menu.length > 0;
    return false;
  };

  return (
    <div className="app">
      <Topbar step={step} setStep={setStep} canVisit={canVisit} />

      {step === 1 && (
        <StepPartyDetails
          brief={brief}
          setBrief={setBrief}
          onNext={(dishes) => {
            setAllDishes(dishes);
            let initial;
            if (brief.diet === "mieszana") {
              const meat = dishes.filter((d) => !d.isUniversal);
              const universal = dishes.filter((d) => d.isUniversal);
              initial = [...meat.slice(0, 5), ...universal.slice(0, 1)].slice(0, 6);
            } else {
              initial = dishes.slice(0, 6);
            }
            setMenu(initial);
            setStep(2);
          }}
        />
      )}
      {step === 2 && allDishes && (
        <StepSuggestions
          brief={brief}
          allDishes={allDishes}
          menu={menu}
          setMenu={setMenu}
          showImagery={tweaks.imagery}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && menu && (
        <StepShoppingList
          brief={brief}
          menu={menu}
          onBack={() => setStep(2)}
          onRestart={() => { setMenu(null); setAllDishes(null); setStep(1); }}
        />
      )}

    </div>
  );
}
