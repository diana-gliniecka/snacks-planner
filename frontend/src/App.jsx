import { useState, useEffect, useCallback, useRef } from "react";
import StepPartyDetails from "./components/StepPartyDetails.jsx";
import StepSuggestions from "./components/StepSuggestions.jsx";
import StepShoppingList from "./components/StepShoppingList.jsx";

// ── Tweaks panel (self-contained, no host protocol needed) ──────────────────
const TWEAK_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2000;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.9);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:12.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none;border-bottom:.5px solid rgba(0,0,0,.08)}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:8px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-sect{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:8px 0 0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06)}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:pointer;padding:4px 6px;line-height:1.2}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0;flex-shrink:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:pointer;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);transition:transform .12s}
  .twk-chip:hover{transform:translateY(-1px)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;display:flex;flex-direction:column}
  .twk-chip>span>i{flex:1}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6);
    color:inherit;font:inherit;outline:none}
  select.twk-field{padding-right:20px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");background-repeat:no-repeat;background-position:right 8px center}
  .twk-fab{position:fixed;right:16px;bottom:16px;z-index:1999;appearance:none;
    border:0;border-radius:999px;background:var(--ink);color:var(--bg);
    padding:10px 16px;font:500 12px ui-sans-serif,system-ui,sans-serif;
    cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2);letter-spacing:.02em}
  .twk-fab:hover{background:var(--primary)}
`;

const PALETTES = [
  { id: "trattoria", label: "Trattoria", colors: ["#2d4a3e", "#f4eee2", "#c45a3a"] },
  { id: "bistro",    label: "Bistro",    colors: ["#e8c068", "#1a1612", "#d97757"] },
  { id: "patisserie",label: "Patisserie",colors: ["#6a2c4a", "#f6ecec", "#c98ba0"] },
];
const DISPLAY_FONTS = [
  { value: "Instrument Serif", label: "Instrument Serif" },
  { value: "Newsreader",       label: "Newsreader" },
  { value: "DM Serif Display", label: "DM Serif" },
  { value: "Playfair Display", label: "Playfair" },
];

function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);
  const idx = Math.max(0, ["compact","regular","comfy"].indexOf(tweaks.density));
  const n = 3;

  return (
    <>
      <style>{TWEAK_STYLE}</style>
      {!open && (
        <button className="twk-fab" onClick={() => setOpen(true)}>⚙ Tweaks</button>
      )}
      {open && (
        <div className="twk-panel">
          <div className="twk-hd">
            <b>Tweaks</b>
            <button className="twk-x" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="twk-body">
            <div className="twk-sect">Paleta</div>
            <div className="twk-chips">
              {PALETTES.map((p) => (
                <button key={p.id} className="twk-chip"
                  data-on={tweaks.palette === p.id ? "1" : "0"}
                  style={{ background: p.colors[0] }}
                  title={p.label}
                  onClick={() => setTweak("palette", p.id)}>
                  <span>
                    <i style={{ background: p.colors[1] }} />
                    <i style={{ background: p.colors[2] }} />
                  </span>
                </button>
              ))}
            </div>

            <div className="twk-sect">Typografia</div>
            <div className="twk-row">
              <div className="twk-lbl"><span>Czcionka tytułów</span></div>
              <select className="twk-field" value={tweaks.displayFont}
                onChange={(e) => setTweak("displayFont", e.target.value)}>
                {DISPLAY_FONTS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="twk-sect">Wygląd</div>
            <div className="twk-row">
              <div className="twk-lbl"><span>Gęstość</span></div>
              <div className="twk-seg">
                <div className="twk-seg-thumb"
                  style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`, width: `calc((100% - 4px) / ${n})` }} />
                {["Kompakt","Normalna","Luźna"].map((label, i) => (
                  <button key={i} onClick={() => setTweak("density", ["compact","regular","comfy"][i])}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="twk-row twk-row-h">
              <div className="twk-lbl"><span>Zdjęcia dań</span></div>
              <button className="twk-toggle" data-on={tweaks.imagery ? "1" : "0"}
                role="switch" aria-checked={tweaks.imagery}
                onClick={() => setTweak("imagery", !tweaks.imagery)}>
                <i />
              </button>
            </div>

            <div className="twk-sect">Demo</div>
            <button style={{
              appearance:"none",height:26,padding:"0 12px",border:0,borderRadius:7,
              background:"rgba(0,0,0,.06)",color:"inherit",font:"inherit",fontWeight:500,cursor:"pointer"
            }} onClick={() => setTweak("_demo", true)}>
              Wypełnij przykładem
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main app ────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = {
  palette: "trattoria",
  displayFont: "Instrument Serif",
  imagery: true,
  density: "regular",
};

function Topbar({ step, setStep, canVisit }) {
  const steps = [
    { n: 1, label: "Brief" },
    { n: 2, label: "Menu" },
    { n: 3, label: "Zakupy" },
  ];
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"><em>Planer</em> Imprezy</span>
        <span className="brand-tag">v1 · próba kuchni</span>
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

  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState({
    guests: 0,
    venue: "",
    diet: "",
    allergens: [],
    effort: 2,
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
    setBrief({ guests: 24, venue: "ogród", diet: "miesna", allergens: [], effort: 3, budgetPP: 40, hungry: false });
    setAllDishes(null);
    setMenu(null);
    setStep(1);
    setTweak("_demo", false);
  }, [tweaks._demo]);

  const canVisit = (n) => {
    if (n === 1) return true;
    if (n === 2) return brief.guests > 0 && brief.venue && brief.diet && brief.budgetPP > 0;
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
            if (brief.diet === "miesna") {
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

      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}
