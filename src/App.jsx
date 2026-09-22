import React, { useState } from "react";

// ================= BRAND TOKENS =================
const teal = "#14403E";
const tealLight = "#1D5450";
const paper = "#F5F4EE";
const paperDeep = "#EBE9E0";
const charcoal = "#26312F";
const clay = "#B5652F";
const clayLight = "#F7E2D2";
const line = "#D9D5C7";
const muted = "#6B7570";

const fontDisplay = "'Fraunces', Georgia, serif";
const fontBody = "'Inter', -apple-system, sans-serif";
const fontMono = "'IBM Plex Mono', monospace";

// ================= SHOPPING LIST CONTEXT =================
const ShoppingListContext = React.createContext(null);
function useShoppingList() {
  return React.useContext(ShoppingListContext);
}
function ShoppingListProvider({ children }) {
  const [batches, setBatches] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pe_shopping_batches");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [checked, setChecked] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pe_shopping_checked");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [overrides, setOverrides] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pe_shopping_overrides");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  React.useEffect(() => { try { window.localStorage.setItem("pe_shopping_batches", JSON.stringify(batches)); } catch {} }, [batches]);
  React.useEffect(() => { try { window.localStorage.setItem("pe_shopping_checked", JSON.stringify(checked)); } catch {} }, [checked]);
  React.useEffect(() => { try { window.localStorage.setItem("pe_shopping_overrides", JSON.stringify(overrides)); } catch {} }, [overrides]);

  function addBatch(label, items) {
    const cleanItems = items.filter((i) => i.grams > 0).map((i) => ({ name: i.name, grams: Math.round(i.grams * 1000) / 1000 }));
    if (cleanItems.length === 0) return;
    setBatches((b) => [...b, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, addedAt: new Date().toISOString(), items: cleanItems }]);
  }
  function removeBatch(id) { setBatches((b) => b.filter((x) => x.id !== id)); }
  function clearAll() { setBatches([]); setChecked({}); setOverrides({}); }
  function toggleChecked(name) { setChecked((c) => ({ ...c, [name]: !c[name] })); }
  function setOverride(name, grams) { setOverrides((o) => ({ ...o, [name]: grams })); }

  return (
    <ShoppingListContext.Provider value={{ batches, addBatch, removeBatch, clearAll, checked, toggleChecked, overrides, setOverride }}>
      {children}
    </ShoppingListContext.Provider>
  );
}
function AddToListButton({ label, items }) {
  const list = useShoppingList();
  const [added, setAdded] = useState(false);
  if (!list) return null;
  return (
    <button
      onClick={() => { list.addBatch(label, items); setAdded(true); setTimeout(() => setAdded(false), 1600); }}
      style={{ padding: "10px 18px", borderRadius: 6, border: "none", background: added ? "#3E8E6E" : clay, color: "#fff", fontFamily: fontBody, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
    >
      {added ? "✓ Added to shopping list" : "+ Add to shopping list"}
    </button>
  );
}

// ================= SHARED UI =================
function PageTitle({ eyebrow, children, sub }) {
  return (
    <div style={{ marginBottom: 30 }}>
      {eyebrow && <div style={{ fontSize: 13, color: clay, fontFamily: fontBody, fontWeight: 600, marginBottom: 6 }}>{eyebrow}</div>}
      <h1 style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 600, color: teal, margin: 0, lineHeight: 1.15 }}>{children}</h1>
      {sub && <p style={{ fontFamily: fontBody, color: muted, fontSize: 15, lineHeight: 1.6, maxWidth: 660, marginTop: 12 }}>{sub}</p>}
    </div>
  );
}
function Card({ title, children, style }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 6, padding: "22px 24px", marginBottom: 18, ...style }}>
      {title && <h3 style={{ fontFamily: fontDisplay, fontSize: 17, color: teal, margin: "0 0 14px 0", fontWeight: 600 }}>{title}</h3>}
      {children}
    </div>
  );
}
function Warn({ children }) {
  return <div style={{ background: clayLight, border: `1px solid ${clay}`, borderRadius: 6, padding: "14px 18px", marginBottom: 18, fontFamily: fontBody, fontSize: 13.5, color: "#8A4A1E", lineHeight: 1.55 }}>{children}</div>;
}
function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${active ? teal : line}`, background: active ? teal : "transparent", color: active ? "#fff" : charcoal, fontFamily: fontBody, fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>{children}</button>
  );
}
function NumberInput({ label, value, onChange, width = 160, hint }) {
  return (
    <div>
      <label style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} style={{ width, padding: "10px 12px", border: `1px solid ${line}`, borderRadius: 4, fontFamily: fontMono, fontSize: 16, color: teal, background: paper }} />
      {hint && <div style={{ fontSize: 11.5, color: muted, fontFamily: fontBody, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
function IngredientTable({ rows, showVolume }) {
  const headers = ["Ingredient", "Dose spec", "Amount", ...(showVolume ? ["≈ Volume"] : []), "Role", "Format"];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${teal}`, color: teal, fontFamily: fontBody, fontWeight: 600, fontSize: 12 }}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => {
        const critical = r.role && r.role.includes("⚠️");
        const adjusted = r.role && r.role.includes("★");
        return (
          <tr key={i} style={{ background: critical ? clayLight : adjusted ? "#E4EEE9" : i % 2 === 0 ? paper : "#fff" }}>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontWeight: 600, fontSize: 13.5, color: charcoal }}>{r.name}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 13, color: muted }}>{r.doseLabel}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 14.5, color: teal, fontWeight: 700 }}>{r.amount}</td>
            {showVolume && <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 12.5, color: muted }}>{r.volume || "—"}</td>}
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontSize: 12.5, color: critical ? "#8A4A1E" : charcoal }}>{r.role}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontSize: 12.5, color: muted }}>{r.format}</td>
          </tr>
        );
      })}</tbody>
    </table>
  );
}
function MethodSteps({ steps }) {
  return <div>{steps.map((s, i) => (
    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
      <div style={{ minWidth: 26, height: 26, borderRadius: "50%", background: teal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontMono, fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
      <div style={{ fontFamily: fontBody, fontSize: 14, lineHeight: 1.55, color: charcoal }}>{s}</div>
    </div>
  ))}</div>;
}
function Accordion({ title, badge, children, open, onToggle }) {
  return (
    <div style={{ border: `1px solid ${line}`, borderRadius: 6, marginBottom: 12, background: "#fff", overflow: "hidden" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: open ? paperDeep : "#fff", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div>
          <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 600, color: teal }}>{title}</div>
          {badge && <div style={{ fontFamily: fontBody, fontSize: 12.5, color: muted, marginTop: 2 }}>{badge}</div>}
        </div>
        <div style={{ fontFamily: fontMono, fontSize: 18, color: clay }}>{open ? "–" : "+"}</div>
      </button>
      {open && <div style={{ padding: "20px", borderTop: `1px solid ${line}` }}>{children}</div>}
    </div>
  );
}

// ================= HELPERS =================
function compoundGrams(mg, pct) { return mg / pct / 1000; }
function approxTsp(g) { return g / 5; } // rough: ~5g per level teaspoon for a fine powder — varies by ingredient density
function volLabel(g) {
  const tsp = approxTsp(g);
  if (tsp < 0.15) return "a pinch";
  if (tsp < 1) return `≈${tsp.toFixed(2)} tsp`;
  return `≈${tsp.toFixed(1)} tsp`;
}
function parseG(str) { const n = parseFloat(str); return isNaN(n) ? 0 : n; }
function cumulativeMgWarning(magnesiumMgPerSachet, sachets) {
  const total = magnesiumMgPerSachet * sachets;
  if (total > 1600) return { text: `${total.toFixed(0)}mg magnesium across ${sachets.toFixed(1)} sachets — over the ~1,600mg threshold where laxative effect becomes a real risk.` };
  if (total > 1200) return { text: `${total.toFixed(0)}mg magnesium across ${sachets.toFixed(1)} sachets — approaching the level where GI sensitivity can appear.` };
  return null;
}
function ratioSplit(ratioLabel) {
  const r = ratioLabel === "2:1" ? 2 : 1.25;
  return { glucosePct: (r / (r + 1)) * 100, fructosePct: 100 - (r / (r + 1)) * 100 };
}

// ================= DATA: CARB MIX FLAVOURS =================
const CARB_FLAVOURS = {
  "Apple": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.70, role: "Primary acid — apple's natural acid", format: "Powder" },
    { name: "Freeze-dried apple powder", dose: 0.80, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Cinnamon (optional)", dose: 0.05, role: "Optional warmth", format: "Powder" },
  ]},
  "Orange": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.60, role: "Primary acid", format: "Powder" },
    { name: "Freeze-dried orange powder", dose: 0.75, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Orange peel powder", dose: 0.15, role: "⚠️ Non-negotiable — prevents flat sweetness", format: "Powder, no carrier" },
  ]},
  "Watermelon": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.70, role: "Dominant natural acid", format: "Powder" },
    { name: "Watermelon flavour", dose: 0.30, role: "Adsorb onto own maltodextrin first", format: "Liquid concentrate" },
    { name: "Citric acid", dose: 0.10, role: "Trace brightness", format: "Powder" },
  ]},
  "Mixed Berry": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.50, role: "Berries are malic-forward", format: "Powder" },
    { name: "Mixed berry flavour", dose: 0.30, role: "Adsorb onto own maltodextrin first", format: "Liquid concentrate" },
    { name: "Citric acid", dose: 0.10, role: "Small tartness boost", format: "Powder" },
  ]},
  "Cola + Caffeine": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.50, role: "Closest food-safe match to phosphoric acid", format: "Powder" },
    { name: "Cola flavour", dose: 0.30, role: "Adsorb onto own maltodextrin first", format: "Liquid concentrate" },
    { name: "Caffeine anhydrous", dose: 0.08, role: "⚠️ Milligram-scale precision mandatory", format: "Powder" },
    { name: "L-Theanine", dose: 0.16, role: "2:1 ratio with caffeine — smooths alertness", format: "Powder" },
  ]},
  "Neutral / Lemon": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.70, role: "The acid IS the flavour — soft, rounded", format: "Powder" },
    { name: "Lemon juice powder (optional)", dose: 0.20, role: "Very light citrus identity", format: "Powder" },
    { name: "Stevia extract", dose: 0.03, role: "Minimal sweetness", format: "Powder" },
  ]},
  "Naked (no flavour)": { category: "sweet", ingredients: [
    { name: "L-Malic acid", dose: 0.50, role: "Prevents a flat taste", format: "Powder" },
    { name: "Stevia extract", dose: 0.02, role: "Trace — less than any other variant", format: "Powder" },
  ]},
  "Mango & Orange": { category: "sweet", ingredients: [
    { name: "Freeze-dried mango powder", dose: 0.55, role: "Primary — sweetness-dominant", format: "Powder, no carrier" },
    { name: "Freeze-dried orange powder", dose: 0.35, role: "Secondary — citrus lift", format: "Powder, no carrier" },
    { name: "Orange peel powder", dose: 0.08, role: "Bitter complexity", format: "Powder" },
    { name: "L-Malic acid", dose: 0.55, role: "Corrects mango's low natural acid", format: "Powder" },
    { name: "Citric acid", dose: 0.12, role: "Orange authenticity", format: "Powder" },
  ]},
  "Lemon (standalone)": { category: "sweet", ingredients: [
    { name: "Lemon juice powder", dose: 0.90, role: "Primary — the assertive lead", format: "Powder, no carrier" },
    { name: "Citric acid", dose: 0.35, role: "PRIMARY acid — lemon is citric-dominant", format: "Powder" },
    { name: "L-Malic acid", dose: 0.20, role: "Sustained finish", format: "Powder" },
    { name: "Stevia extract", dose: 0.02, role: "Trace — stops pure-sour fatigue", format: "Powder" },
  ]},
  "Coconut & Pineapple": { category: "sweet", ingredients: [
    { name: "Freeze-dried pineapple powder", dose: 0.70, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Coconut milk powder", dose: 0.30, role: "NOT coconut water — flavour lives in the fat", format: "Powder" },
    { name: "Citric acid", dose: 0.22, role: "Primary — pineapple is citric-dominant", format: "Powder" },
    { name: "L-Malic acid", dose: 0.15, role: "Base tartness", format: "Powder" },
  ]},
};

const SAVOURY_FLAVOURS = {
  "Miso & Ginger": { category: "savoury", saltIngredientIndex: null, ingredients: [
    { name: "Miso powder (freeze-dried)", dose: 3.00, role: "Umami + savoury body", format: "Powder" },
    { name: "Ginger extract (5% gingerols)", dose: 0.30, role: "⚠️ Genuinely anti-nausea — standardised only", format: "Powder" },
    { name: "Nutritional yeast (milled)", dose: 0.80, role: "Umami depth (glutamates)", format: "Powder" },
    { name: "Shiitake mushroom powder", dose: 0.50, role: "Umami synergy", format: "Powder" },
    { name: "White pepper", dose: 0.05, role: "Gentle heat", format: "Powder" },
    { name: "L-Malic acid", dose: 0.15, role: "Light acidity", format: "Powder" },
  ]},
  "Cucumber, Mint & Sea Salt": { category: "savoury", saltIngredientIndex: 2, ingredients: [
    { name: "Freeze-dried cucumber powder", dose: 2.50, role: "Fresh, clean base", format: "Powder, no carrier" },
    { name: "Spearmint powder", dose: 0.40, role: "⚠️ Spearmint not peppermint — reflux risk", format: "Powder" },
    { name: "Sea salt flakes (extra)", dose: 0.30, role: "Savoury lift", format: "Powder" },
    { name: "L-Malic acid", dose: 0.25, role: "Light tartness", format: "Powder" },
    { name: "Lime juice powder (optional)", dose: 0.30, role: "Brightness", format: "Powder" },
  ]},
  "Salted Watermelon": { category: "savoury", saltIngredientIndex: 1, ingredients: [
    { name: "Freeze-dried watermelon powder", dose: 3.50, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Sea salt flakes (extra)", dose: 0.40, role: "The hero ingredient", format: "Powder" },
    { name: "L-Malic acid", dose: 0.30, role: "Watermelon's natural acid", format: "Powder" },
    { name: "Stevia extract", dose: 0.02, role: "MINIMAL — do not increase", format: "Powder" },
    { name: "Lime juice powder (optional)", dose: 0.30, role: "Brightness", format: "Powder" },
  ]},
};

const ELECTROLYTE_FLAVOURS = {
  Daily: {
    "Orange, Ginger & Turmeric": [
      { name: "Freeze-dried orange powder", dose: 0.75, role: "Primary flavour", format: "Powder" },
      { name: "Orange peel powder", dose: 0.15, role: "Bitter depth", format: "Powder" },
      { name: "Ginger root powder", dose: 0.20, role: "Warmth", format: "Powder" },
      { name: "Turmeric powder", dose: 0.05, role: "Earthy warmth", format: "Powder" },
      { name: "Piperine 95%", dose: 0.005, role: "⚠️ Required with turmeric — 20x absorption", format: "Powder" },
      { name: "Stevia extract", dose: 0.05, role: "Background sweetness", format: "Powder" },
    ],
    "Lemon & Ginger": [
      { name: "Lemon juice powder", dose: 0.60, role: "Primary — clean citrus lead", format: "Powder" },
      { name: "Ginger root powder", dose: 0.15, role: "Warmth", format: "Powder" },
      { name: "Stevia extract", dose: 0.04, role: "Background sweetness", format: "Powder" },
    ],
    "Berry": [
      { name: "Freeze-dried mixed berry powder", dose: 0.65, role: "Primary flavour", format: "Powder" },
      { name: "L-Malic acid", dose: 0.30, role: "Berry-forward acid", format: "Powder" },
      { name: "Stevia extract", dose: 0.04, role: "Background sweetness", format: "Powder" },
    ],
  },
  Race: {
    "Lemon & Ginger": [
      { name: "Lemon juice powder", dose: 0.50, role: "Lighter, more neutral than orange", format: "Powder" },
      { name: "Ginger extract 5% gingerols", dose: 0.30, role: "⚠️ 300mg therapeutic dose — standardised only", format: "Powder" },
      { name: "Stevia extract", dose: 0.03, role: "Minimal sweetness", format: "Powder" },
    ],
    "Lime": [
      { name: "Lime juice powder", dose: 0.55, role: "Primary — margarita-principle lead flavour", format: "Powder" },
      { name: "Stevia extract", dose: 0.02, role: "Minimal — lime carries the salt well on its own", format: "Powder" },
    ],
    "Watermelon & Sea Salt": [
      { name: "Freeze-dried watermelon powder", dose: 0.60, role: "Primary flavour", format: "Powder" },
      { name: "L-Malic acid", dose: 0.20, role: "Watermelon's natural acid", format: "Powder" },
      { name: "Stevia extract", dose: 0.02, role: "MINIMAL — salt is already doing the work", format: "Powder" },
    ],
    "Raspberry": [
      { name: "Freeze-dried raspberry powder", dose: 0.65, role: "Primary flavour — high natural malic acid", format: "Powder" },
      { name: "L-Malic acid", dose: 0.25, role: "Sour-led — pairs well with a salty base", format: "Powder" },
    ],
  },
};

const GEL_FLAVOURS = {
  "Pineapple & Coconut": [
    { name: "Freeze-dried pineapple powder", dose: 4.00, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Coconut milk powder", dose: 1.50, role: "Replaces coconut water — flavour lives in the fat", format: "Powder" },
    { name: "L-Malic acid", dose: 0.28, role: "Raised for gel sweetness", format: "Powder" },
    { name: "Citric acid", dose: 0.20, role: "Raised — pineapple is citric-dominant", format: "Powder" },
    { name: "Fine sea salt", dose: 0.05, role: "Sweetness suppressor", format: "Powder" },
  ],
  "Mango & Lime": [
    { name: "Freeze-dried mango powder", dose: 3.50, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Lime juice powder", dose: 0.80, role: "Citrus brightness", format: "Powder" },
    { name: "L-Malic acid", dose: 0.42, role: "Raised — sweetest fruit in the range", format: "Powder" },
    { name: "Citric acid", dose: 0.08, role: "Trace front-palate brightness", format: "Powder" },
    { name: "Fine sea salt", dose: 0.05, role: "Sweetness suppressor", format: "Powder" },
  ],
  "Orange": [
    { name: "Freeze-dried orange powder", dose: 3.50, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Orange peel powder", dose: 0.50, role: "Bitter complexity", format: "Powder" },
    { name: "L-Malic acid", dose: 0.28, role: "Raised for gel sweetness", format: "Powder" },
    { name: "Citric acid", dose: 0.15, role: "Raised — mirrors real orange juice", format: "Powder" },
    { name: "Fine sea salt", dose: 0.05, role: "Sweetness suppressor", format: "Powder" },
  ],
  "Raspberry & Lime": [
    { name: "Freeze-dried raspberry powder", dose: 4.00, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Lime juice powder", dose: 0.80, role: "Sharpness", format: "Powder" },
    { name: "L-Malic acid", dose: 0.49, role: "Highest dose in the range — deliberately sour-led", format: "Powder" },
    { name: "Citric acid", dose: 0.08, role: "Trace front-palate brightness", format: "Powder" },
    { name: "Fine sea salt", dose: 0.05, role: "Sweetness suppressor", format: "Powder" },
  ],
};

const PCT_ACTIVE = { Na_citrate: 0.267, Na_salt: 0.393, K_citrate: 0.362, Mg_malate: 0.123, Ca_carbonate: 0.40, Zn_citrate: 0.31 };
function dailyBase() {
  return [
    { name: "Himalayan salt (fine)", mg: 500, el: "Na", pct: PCT_ACTIVE.Na_salt, role: "Primary sodium" },
    { name: "Potassium citrate", mg: 300, el: "K", pct: PCT_ACTIVE.K_citrate, role: "Potassium" },
    { name: "Magnesium malate", mg: 200, el: "Mg", pct: PCT_ACTIVE.Mg_malate, role: "Highest dose in the range — daily use only" },
    { name: "Calcium carbonate", mg: 100, el: "Ca", pct: PCT_ACTIVE.Ca_carbonate, role: "Once-daily calcium" },
    { name: "Zinc citrate", mg: 5, el: "Zn", pct: PCT_ACTIVE.Zn_citrate, role: "Immune / recovery support" },
    { name: "Coconut water powder", el: "trace", flatG: 2.0, role: "Trace minerals + natural background flavour — ~5mg Na, ~65mg K, ~5mg Ca at this dose. Not a primary electrolyte source." },
  ];
}
function raceBase(sodiumMg) {
  const half = sodiumMg / 2;
  return [
    { name: "Tri-sodium citrate", mg: half, el: "Na", pct: PCT_ACTIVE.Na_citrate, role: "Alkalising sodium — buffering, softer taste" },
    { name: "Himalayan salt (fine)", mg: half, el: "Na", pct: PCT_ACTIVE.Na_salt, role: "SGLT1-driving sodium — active absorption" },
    { name: "Potassium citrate", mg: 200, el: "K", pct: PCT_ACTIVE.K_citrate, role: "Potassium" },
    { name: "Magnesium malate", mg: 80, el: "Mg", pct: PCT_ACTIVE.Mg_malate, role: "⚠️ Capped — cumulative safety over a long race" },
    { name: "Calcium carbonate", mg: 50, el: "Ca", pct: PCT_ACTIVE.Ca_carbonate, role: "Acute replacement" },
    { name: "Ginger extract (5% gingerols)", mg: 300, el: "extract", pct: 1, role: "⚠️ Standardised extract only — genuinely anti-nausea" },
    { name: "Coconut water powder", el: "trace", flatG: 2.0, role: "Trace minerals + natural background flavour — ~5mg Na, ~65mg K, ~5mg Ca at this dose. Not a primary electrolyte source." },
  ];
}

// ================= DATA: BARS (now with defaultCarbs, ratioAdjustable, hasElectrolyte flags) =================
const BARS = {
  Race: {
    "Natural": { defaultCarbs: 35, hasElectrolyte: true, badge: "35g carbs default · lowest GI risk of the race set, but highest fibre — training bar", perBar: [
      { name: "Rice syrup", g: 28, role: "Binder + primary carb" }, { name: "Low-fibre oats (quick oats)", g: 14, role: "Chew matrix" },
      { name: "Rice flour", g: 6, role: "Structure" }, { name: "Freeze-dried apple powder", g: 4, role: "Real flavour" },
      { name: "Sunflower oil", g: 3, role: "Texture" }, { name: "L-Malic acid", g: 0.5, role: "Cut sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true }, { name: "Sunflower lecithin", g: 0.3, role: "Bind phases" },
    ], method: ["Warm rice syrup in a pan to ~50°C — pourable, not boiling.", "Toast oats lightly in a dry pan 3-4 min, cool slightly.", "Pour warm syrup over oats, stir to coat.", "Fold in rice flour, apple powder, malic acid, electrolyte premix, lecithin.", "Add sunflower oil to loosen if too stiff.", "Press hard into a lined tray, ~1.5cm thick.", "Chill 2-3 hours until firm, then cut and wrap."] },
    "Performance": { defaultCarbs: 44, hasElectrolyte: true, ratioAdjustable: true, badge: "44g carbs default · pick 1:0.8 or 2:1 · the direct Maurten analog", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Maltodextrin", g: 13, role: "Carb payload", isMalto: true },
      { name: "Fructose", g: 10, role: "Carb payload", isFructose: true }, { name: "Low-fibre oats", g: 8, role: "Minimal chew matrix" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Sunflower oil", g: 2.5, role: "Texture" },
      { name: "L-Malic acid", g: 0.6, role: "Cuts Maurten-style sweetness" }, { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
      { name: "Sunflower lecithin", g: 0.3, role: "Bind phases" },
    ], method: ["Warm rice syrup to ~50°C.", "Whisk maltodextrin, fructose, rice flour, malic acid, electrolyte premix and lecithin together dry.", "Combine warm syrup with the dry mix and the oats — fold to a stiff dough.", "Add oil if needed to loosen.", "Press hard into a lined tray, ~1.5cm thick.", "Chill 2-3 hours, cut, wrap."] },
    "Hybrid": { defaultCarbs: 42, hasElectrolyte: true, ratioAdjustable: true, badge: "42g carbs default · pick 1:0.8 or 2:1 · best all-round chew", perBar: [
      { name: "Rice syrup", g: 22, role: "Binder + carb" }, { name: "Maltodextrin", g: 9, role: "Carb payload", isMalto: true },
      { name: "Fructose", g: 7, role: "Carb payload", isFructose: true }, { name: "Low-fibre oats", g: 12, role: "Satisfying chew" },
      { name: "Rice flour", g: 5, role: "Structure" }, { name: "Freeze-dried apple powder", g: 3, role: "Real flavour" },
      { name: "Sunflower oil", g: 2.5, role: "Texture" }, { name: "L-Malic acid", g: 0.5, role: "Cut sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Warm rice syrup to ~50°C.", "Toast oats lightly, cool.", "Combine syrup, oats, dry malto/fructose mix, fruit powder, malic acid and electrolyte premix.", "Fold to a stiff dough, loosen with oil if needed.", "Press hard into a lined tray, chill 2-3 hours.", "Cut and wrap."] },
    "Nougat — Original": { defaultCarbs: 40, hasElectrolyte: true, badge: "40g carbs default · fastest emptying · best choice for a sensitive gut", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey (or extra rice syrup)", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Freeze-dried fruit powder", g: 3, role: "Flavour" }, { name: "L-Malic acid", g: 0.5, role: "Cut honey sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Whip rehydrated egg white powder (or aquafaba) to stiff peaks.", "Heat rice syrup + honey to ~120-130°C (soft-ball) with a sugar thermometer.", "Slowly pour hot syrup into whites while whipping. Whip 3-5 min until glossy.", "Quickly fold in malto, fructose, rice flour, electrolyte premix, malic acid, fruit powder.", "Spread onto edible rice paper in a lined tray, top with a second sheet, press flat.", "Set at room temp 4-6 hours — do NOT refrigerate.", "Cut through the rice paper into bars."] },
    "Nougat — Raspberry": { defaultCarbs: 40, hasElectrolyte: true, badge: "40g carbs default · same fast-emptying nougat base, tart berry lead", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey (or extra rice syrup)", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Freeze-dried raspberry powder", g: 3.5, role: "Tart lead flavour" }, { name: "L-Malic acid", g: 0.4, role: "Raspberry is already tart — slightly less than the original" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Whip rehydrated egg white powder (or aquafaba) to stiff peaks.", "Heat rice syrup + honey to ~120-130°C (soft-ball) with a sugar thermometer.", "Slowly pour hot syrup into whites while whipping. Whip 3-5 min until glossy.", "Quickly fold in malto, fructose, rice flour, electrolyte premix, malic acid, raspberry powder.", "Spread onto edible rice paper in a lined tray, top with a second sheet, press flat.", "Set at room temp 4-6 hours — do NOT refrigerate.", "Cut through the rice paper into bars."] },
  },
  Training: {
    "Peanut Butter & Jam": { defaultCarbs: 33, hasElectrolyte: false, badge: "The universal crowd-pleaser — real fruit, real peanut butter", perBar: [
      { name: "Peanut butter (smooth)", g: 20, role: "Primary flavour + fat + protein" }, { name: "Rice syrup", g: 18, role: "Binder" },
      { name: "Quick oats", g: 12, role: "Texture" }, { name: "Freeze-dried raspberry or strawberry powder", g: 4, role: "The 'jam' layer" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Himalayan salt", g: 0.4, role: "Classic salty-peanut lift" },
    ], method: ["Warm rice syrup, mix in peanut butter until smooth.", "Fold in oats, rice flour and salt.", "Press half the mix into a lined tray.", "Spread the fruit powder mixed with a splash of water as a jam layer.", "Top with remaining mix, press flat, chill and cut."] },
    "Salted Caramel & Pretzel": { defaultCarbs: 36, hasElectrolyte: false, badge: "Same browning trick as the waffle — real caramel, nothing added", perBar: [
      { name: "Rice syrup + light brown sugar", g: 22, role: "The caramel — cooked to light amber" }, { name: "Crushed pretzels", g: 10, role: "Crunch + salt" },
      { name: "Quick oats", g: 10, role: "Structure" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "Himalayan salt (extra)", g: 0.5, role: "Salted caramel is salt-forward" }, { name: "Vanilla", g: 0.2, role: "Rounds the caramel" },
    ], method: ["Cook rice syrup + brown sugar to ~118-120°C — light amber, watch closely.", "Off heat, stir in vanilla and salt.", "Fold in oats, rice flour and crushed pretzel — work quickly before it sets.", "Press into a lined tray, chill, cut."] },
    "Double Chocolate & Cherry": { defaultCarbs: 34, hasElectrolyte: false, badge: "Real chocolate chunks — the texture the race bars can't use", perBar: [
      { name: "Rice syrup", g: 18, role: "Binder" }, { name: "Dark chocolate chunks", g: 12, role: "Real chocolate, genuine indulgence" },
      { name: "Tart cherry powder", g: 6, role: "Ties to the Recovery Bar family" }, { name: "Quick oats", g: 10, role: "Structure" },
      { name: "Cocoa (fat-reduced)", g: 4, role: "Deepens the chocolate" }, { name: "L-Malic acid", g: 0.3, role: "Balances cherry + chocolate sweetness" },
    ], method: ["Warm rice syrup, stir in cocoa and malic acid.", "Fold in oats, tart cherry powder and chocolate chunks.", "Press into a lined tray while chunks are still distinct — don't overmix.", "Chill and cut."] },
    "Lemon Drizzle": { defaultCarbs: 32, hasElectrolyte: false, badge: "Home-snacking flavour — bright, less rich than the chocolate/caramel options", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 12, role: "Structure" },
      { name: "Lemon juice powder", g: 3, role: "Bright citrus lead" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "L-Malic acid", g: 0.3, role: "Sustained citrus finish" }, { name: "Himalayan salt", g: 0.3, role: "Rounds the sweetness" },
    ], method: ["Warm rice syrup, stir in lemon powder and malic acid.", "Fold in oats, rice flour and salt.", "Press into a lined tray, chill, cut."] },
    "Ginger Snap": { defaultCarbs: 32, hasElectrolyte: false, badge: "Home-snacking flavour — warm spice, good for a cold-weather training bar", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 12, role: "Structure" },
      { name: "Ground ginger", g: 1.5, role: "Warm spice lead" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "L-Malic acid", g: 0.3, role: "Cuts sweetness" }, { name: "Cinnamon", g: 0.3, role: "Rounds the spice" },
    ], method: ["Warm rice syrup, stir in ginger, cinnamon and malic acid.", "Fold in oats and rice flour.", "Press into a lined tray, chill, cut."] },
    "Nougat — Vanilla (Training)": { defaultCarbs: 38, hasElectrolyte: false, badge: "Lighter, aerated snack format — same nougat base, no race electrolytes", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Vanilla extract", g: 0.3, role: "Classic nougat flavour" },
    ], method: ["Whip rehydrated egg white powder (or aquafaba) to stiff peaks.", "Heat rice syrup + honey to ~120-130°C (soft-ball).", "Slowly pour hot syrup into whites while whipping. Whip 3-5 min until glossy.", "Fold in malto, fructose, rice flour, vanilla.", "Spread onto edible rice paper, top with a second sheet, press flat.", "Set at room temp 4-6 hours. Cut through the rice paper."] },
  },
  Waffle: {
    "Neutral Caramel": { defaultCarbs: 30, hasElectrolyte: true, badge: "The flagship — real caramel from browning, nothing added, anti-flavour-fatigue", perBar: [
      { name: "Rice flour", g: 14, role: "Biscuit structure" }, { name: "Rice syrup (biscuit)", g: 6, role: "Biscuit bind" },
      { name: "Coconut oil", g: 4, role: "Crisp + richness" }, { name: "Cane sugar", g: 3, role: "Browning + crisp" },
      { name: "Rice syrup (filling)", g: 9, role: "Filling base" }, { name: "Light brown sugar", g: 2, role: "THE caramel — cooked to light amber, nothing added" },
      { name: "Maltodextrin (filling)", g: 2, role: "Firmer set + carbs" }, { name: "L-Malic acid", g: 0.20, role: "Cuts sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward — salt doubles as caramel enhancer", isElectrolyte: true },
      { name: "Vanilla", g: 0.05, role: "Rounds the caramel" },
    ], method: ["Rub coconut oil into rice flour + cane sugar, add biscuit-portion rice syrup, bring to a stiff dough. Rest 15 min.", "Press ~28g balls in a hot pizzelle/stroopwafel iron ~30-60s until golden and thin.", "Cook filling rice syrup + brown sugar to ~118-120°C — light amber, this IS the flavour.", "Off heat, stir in maltodextrin, malic acid, electrolyte premix, vanilla.", "Spread warm filling on one waffle half, press second half on top.", "Cool flat until set, wrap."] },
    "Apple & Cinnamon": { defaultCarbs: 30, hasElectrolyte: true, badge: "Classic stroopwafel pairing — comfort flavour for cooler days", perBar: [
      { name: "Rice flour", g: 14, role: "Biscuit structure" }, { name: "Rice syrup (biscuit)", g: 6, role: "Biscuit bind" },
      { name: "Coconut oil", g: 4, role: "Crisp + richness" }, { name: "Cane sugar", g: 3, role: "Browning + crisp" },
      { name: "Rice syrup (filling)", g: 9, role: "Filling base" }, { name: "Agave syrup (filling)", g: 4, role: "Softness + fructose" },
      { name: "Freeze-dried apple powder", g: 1.5, role: "Real fruit flavour" }, { name: "Cinnamon", g: 0.1, role: "Classic pairing" },
      { name: "L-Malic acid", g: 0.25, role: "Apple's natural acid" }, { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Rub coconut oil into rice flour + cane sugar, add biscuit rice syrup, bring to a stiff dough. Rest 15 min.", "Press ~28g balls in a hot pizzelle/stroopwafel iron ~30-60s until golden and thin.", "Warm filling rice syrup + agave to ~110°C, stir in apple powder, cinnamon, malic acid, electrolyte premix.", "Spread warm filling on one waffle half, press second half on top.", "Cool flat until set, wrap."] },
  },
};

// ================= PAGE: CARB MIX =================
function CarbMixPage() {
  const [batchG, setBatchG] = useState(750);
  const [ratio, setRatio] = useState("2:1");
  const [withElectrolytes, setWithElectrolytes] = useState(false);
  const [carbsPerServing, setCarbsPerServing] = useState(90);
  const [flavourCategory, setFlavourCategory] = useState("sweet");
  const [flavour, setFlavour] = useState("Apple");
  const [raceSodiumMg, setRaceSodiumMg] = useState(1000);
  const [includeAntiClump, setIncludeAntiClump] = useState(false);
  const [withCaffeine, setWithCaffeine] = useState(false);
  const [caffeineMgPerServe, setCaffeineMgPerServe] = useState(75);

  const flavourSet = flavourCategory === "sweet" ? CARB_FLAVOURS : SAVOURY_FLAVOURS;
  const flavourNames = Object.keys(flavourSet);
  const flavourData = flavourSet[flavour] || flavourSet[flavourNames[0]];

  const { glucosePct, fructosePct } = ratioSplit(ratio);
  const malto = (batchG * glucosePct) / 100;
  const fructose = (batchG * fructosePct) / 100;
  const servings = carbsPerServing > 0 ? batchG / carbsPerServing : 0;

  const baseRows = [
    { name: "Maltodextrin (DE 18-20)", doseLabel: `${glucosePct.toFixed(1)}%`, amount: `${malto.toFixed(1)}g`, role: "Primary carb — SGLT1 transporter", format: "Powder" },
    { name: "Fructose (crystalline)", doseLabel: `${fructosePct.toFixed(1)}%`, amount: `${fructose.toFixed(1)}g`, role: "GLUT5 — essential above 60g/hr", format: "Powder" },
    { name: "Ascorbic acid", doseLabel: "0.1%", amount: `${(batchG * 0.001).toFixed(1)}g`, role: "Antioxidant, shelf-life", format: "Powder" },
  ];
  const antiClumpRows = [
    { name: "Sunflower lecithin", doseLabel: "0.2%", amount: `${(batchG * 0.002).toFixed(1)}g`, role: "Wetting agent — helps cold-water mixability", format: "Powder" },
    { name: "Silicon dioxide", doseLabel: "0.1%", amount: `${(batchG * 0.001).toFixed(1)}g`, role: "Anti-caking — keeps powder free-flowing in the sachet", format: "Powder" },
  ];

  const electrolyteRows = withElectrolytes
    ? raceBase(raceSodiumMg).map((e) => {
        if (e.el === "trace") {
          const total = e.flatG * servings;
          return { name: e.name, doseLabel: `${e.flatG}g/serve`, amount: `${total.toFixed(2)}g`, volume: volLabel(total), role: e.role, format: "Powder" };
        }
        const compoundG = compoundGrams(e.mg, e.pct);
        const total = e.el === "extract" ? (e.mg / 1000) * servings : compoundG * servings;
        return { name: e.name, doseLabel: `${e.mg}mg ${e.el}/serve`, amount: `${total.toFixed(2)}g`, volume: volLabel(total), role: e.role, format: "Powder" };
      })
    : [];

  const caffeineRows = withCaffeine ? [
    { name: "Caffeine anhydrous", doseLabel: `${caffeineMgPerServe}mg/serve`, amount: `${((caffeineMgPerServe / 1000) * servings).toFixed(3)}g`, role: "⚠️ Milligram-scale precision mandatory — weigh, don't estimate", format: "Powder" },
    { name: "L-Theanine", doseLabel: `${(caffeineMgPerServe * 2)}mg/serve`, amount: `${(((caffeineMgPerServe * 2) / 1000) * servings).toFixed(3)}g`, role: "2:1 ratio with caffeine — smooths alertness", format: "Powder" },
  ] : [];

  const flavourRows = (flavourData.ingredients || []).map((f, idx) => {
    let dose = f.dose, role = f.role;
    if (withElectrolytes && flavourData.category === "savoury" && idx === flavourData.saltIngredientIndex) {
      dose = dose * 0.5; role = "★ Halved — race electrolyte sodium already covers much of this job";
    }
    const basis = flavourData.category === "sweet" ? batchG / 100 : servings;
    return { name: f.name, doseLabel: `${f.dose}g ${flavourData.category === "sweet" ? "/100g" : "/serve"}`, amount: `${(dose * basis).toFixed(2)}g`, role, format: f.format };
  });

  const sweetExtraStevia = withElectrolytes && flavourData.category === "sweet" && !flavourData.ingredients.some((f) => f.name.includes("Stevia"));
  const magWarning = withElectrolytes ? cumulativeMgWarning(80, servings) : null;
  let stepNum = 2;

  return (
    <div>
      <PageTitle eyebrow="Step 1" sub="Set your batch, your own serving size, a ratio, whether race electrolytes and caffeine ride along, then a flavour.">Carb Mix Builder</PageTitle>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <NumberInput label="Batch size (g of base powder)" value={batchG} onChange={setBatchG} width="100%" />
          <NumberInput label="Carbs per serving / bottle (g)" value={carbsPerServing} onChange={setCarbsPerServing} width="100%" hint={`≈ ${servings.toFixed(1)} servings from this batch`} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Ratio</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Pill active={ratio === "2:1"} onClick={() => setRatio("2:1")}>2:1 — up to 90g/hr</Pill>
            <Pill active={ratio === "1:0.8"} onClick={() => setRatio("1:0.8")}>1:0.8 — 90–120g/hr</Pill>
          </div>
        </div>
        <div style={{ marginBottom: withElectrolytes ? 18 : 16 }}>
          <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Race electrolytes in this batch?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Pill active={!withElectrolytes} onClick={() => setWithElectrolytes(false)}>No — separate bottle</Pill>
            <Pill active={withElectrolytes} onClick={() => setWithElectrolytes(true)}>Yes — combine into this mix</Pill>
          </div>
          {withElectrolytes && <div style={{ marginTop: 14 }}><NumberInput label="Total sodium target (mg per serving)" value={raceSodiumMg} onChange={setRaceSodiumMg} width={220} hint="Default 1000mg for hot/long races." /></div>}
        </div>
        <div>
          <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Caffeine?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Pill active={!withCaffeine} onClick={() => setWithCaffeine(false)}>No</Pill>
            <Pill active={withCaffeine} onClick={() => setWithCaffeine(true)}>Yes</Pill>
          </div>
          {withCaffeine && <div style={{ marginTop: 14 }}><NumberInput label="Caffeine (mg per serving)" value={caffeineMgPerServe} onChange={setCaffeineMgPerServe} width={220} hint="50-100mg typical. Stay under 300-400mg total across a race." /></div>}
        </div>
      </Card>

      <Card title="1. Base carb formula — bottle mix">
        <p style={{ fontFamily: fontBody, fontSize: 13, color: muted, marginTop: 0, marginBottom: 14 }}>Just the carb payload and a shelf-life antioxidant. Pectin and calcium lactate are left out — they only do anything at gel concentration. See the Gel Builder for that version.</p>
        <IngredientTable rows={baseRows} />
      </Card>

      <Card title="Optional: anti-clumping agents">
        <p style={{ fontFamily: fontBody, fontSize: 13, color: muted, marginTop: 0, marginBottom: 14 }}>Not required, but helps if the powder floats or clumps in cold water.</p>
        <div style={{ display: "flex", gap: 10, marginBottom: includeAntiClump ? 16 : 0 }}>
          <Pill active={!includeAntiClump} onClick={() => setIncludeAntiClump(false)}>Leave out</Pill>
          <Pill active={includeAntiClump} onClick={() => setIncludeAntiClump(true)}>Add these in</Pill>
        </div>
        {includeAntiClump && <IngredientTable rows={antiClumpRows} />}
      </Card>

      {withElectrolytes && (
        <>
          <Card title={`${stepNum++}. Race electrolytes (weight + approx volume)`}>
            <IngredientTable rows={electrolyteRows} showVolume />
            <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, fontStyle: "italic" }}>Volume assumes ~5g per level teaspoon for a fine powder — actual density varies by ingredient, weight is always the reliable number.</p>
          </Card>
          <Card title="Why two sodium sources, not one?">
            <p style={{ fontFamily: fontBody, fontSize: 14, lineHeight: 1.6, color: charcoal, margin: 0 }}>Tri-sodium citrate buffers and tastes softer; Himalayan salt directly drives SGLT1, the sodium-glucose co-transporter behind faster absorption. Splitting the dose gets both benefits.</p>
          </Card>
          {magWarning && <Warn>⚠️ {magWarning.text}</Warn>}
        </>
      )}

      {withCaffeine && (
        <Card title={`${stepNum++}. Caffeine + L-theanine`}>
          <IngredientTable rows={caffeineRows} />
        </Card>
      )}

      <Card title={`${stepNum++}. Flavour`}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <Pill active={flavourCategory === "sweet"} onClick={() => { setFlavourCategory("sweet"); setFlavour(Object.keys(CARB_FLAVOURS)[0]); }}>Sweet</Pill>
          <Pill active={flavourCategory === "savoury"} onClick={() => { setFlavourCategory("savoury"); setFlavour(Object.keys(SAVOURY_FLAVOURS)[0]); }}>Savoury</Pill>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>{flavourNames.map((f) => <Pill key={f} active={flavour === f} onClick={() => setFlavour(f)}>{f}</Pill>)}</div>
        <IngredientTable rows={flavourRows} />
        {sweetExtraStevia && <p style={{ fontFamily: fontBody, fontSize: 12.5, color: clay, marginTop: 12, fontWeight: 600 }}>★ Salt from the electrolytes will dull this flavour's fruit notes slightly. Consider a trace more stevia.</p>}
        {flavourCategory === "savoury" && withElectrolytes && <p style={{ fontFamily: fontBody, fontSize: 12.5, color: clay, marginTop: 12, fontWeight: 600 }}>★ The added salt line above has already been halved to avoid over-salting on top of the sachet's own sodium.</p>}
      </Card>

      <Card title="Mixing instructions">
        <MethodSteps steps={[
          "Weigh the maltodextrin, fructose and ascorbic acid into a large bowl. Whisk 60 seconds until uniform.",
          includeAntiClump ? "Sieve the lecithin and silicon dioxide into a small bowl, whisk into 2 tbsp of the maltodextrin first, then fold back into the main batch." : "Skipping the anti-clumping agents — shake a little harder in cold water.",
          withElectrolytes ? "Add the race electrolyte ingredients and whisk in thoroughly." : "Electrolytes kept separate — mix into their own bottle at race time.",
          withCaffeine ? "Weigh caffeine and L-theanine on a milligram-precision scale and whisk in — do not estimate by volume." : null,
          "Add the flavour ingredients and whisk a final 30-60 seconds.",
          "Sieve the finished mix once more if any lumps remain.",
          "Portion into bottle-sized sachets by weight. Store airtight, cool, dark.",
          "To mix a bottle: sprinkle powder ONTO water (never the reverse), shake hard 20s, rest 60s, shake again.",
        ].filter(Boolean)} />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <AddToListButton
          label={`Carb Mix — ${flavour} — ${batchG}g batch`}
          items={[
            ...baseRows,
            ...(includeAntiClump ? antiClumpRows : []),
            ...(withElectrolytes ? electrolyteRows : []),
            ...(withCaffeine ? caffeineRows : []),
            ...flavourRows,
          ].map((r) => ({ name: r.name, grams: parseG(r.amount) }))}
        />
      </div>
    </div>
  );
}

// ================= PAGE: ELECTROLYTES =================
function ElectrolytesPage() {
  const [type, setType] = useState("Daily");
  const [servings, setServings] = useState(10);
  const [raceSodiumMg, setRaceSodiumMg] = useState(1000);
  const flavourNames = Object.keys(ELECTROLYTE_FLAVOURS[type]);
  const [flavour, setFlavour] = useState(flavourNames[0]);
  function onTypeChange(t) { setType(t); setFlavour(Object.keys(ELECTROLYTE_FLAVOURS[t])[0]); }

  const base = type === "Daily" ? dailyBase() : raceBase(raceSodiumMg);
  const baseRows = base.map((e) => {
    if (e.el === "trace") {
      const total = e.flatG * servings;
      return { name: e.name, doseLabel: `${e.flatG}g/sachet`, amount: `${total.toFixed(2)}g`, volume: volLabel(total), role: e.role, format: "Powder" };
    }
    const compoundG = compoundGrams(e.mg, e.pct);
    const total = e.el === "extract" ? (e.mg / 1000) * servings : compoundG * servings;
    return { name: e.name, doseLabel: `${e.mg}mg ${e.el}`, amount: `${total.toFixed(2)}g`, volume: volLabel(total), role: e.role, format: "Powder" };
  });
  const flavourRows = (ELECTROLYTE_FLAVOURS[type][flavour] || []).map((f) => ({
    name: f.name, doseLabel: `${f.dose}g / sachet`, amount: `${(f.dose * servings).toFixed(2)}g`, volume: volLabel(f.dose * servings), role: f.role, format: f.format,
  }));

  const magWarning = type === "Race" ? cumulativeMgWarning(80, servings) : null;
  const longRace = servings >= 16;

  return (
    <div>
      <PageTitle eyebrow="Step 2" sub="Daily or Race, how many sachets, then a flavour — with weight AND approximate spoon volume for each ingredient.">Electrolyte Builder</PageTitle>
      <Card>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Type</div>
          <div style={{ display: "flex", gap: 10 }}><Pill active={type === "Daily"} onClick={() => onTypeChange("Daily")}>Daily</Pill><Pill active={type === "Race"} onClick={() => onTypeChange("Race")}>Race</Pill></div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <NumberInput label="Number of sachets" value={servings} onChange={setServings} />
          {type === "Race" && <NumberInput label="Sodium target (mg/sachet)" value={raceSodiumMg} onChange={setRaceSodiumMg} hint="Default 1000mg" />}
        </div>
      </Card>
      {type === "Race" && longRace && <Warn>⚠️ {servings} sachets is a long race. Consider tapering to one sachet per 90 minutes after hour 10 rather than hourly.</Warn>}
      {magWarning && <Warn>⚠️ {magWarning.text}</Warn>}
      <Card title={`1. ${type} electrolyte base (weight + approx volume)`}>
        <IngredientTable rows={baseRows} showVolume />
        <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, fontStyle: "italic" }}>Volume assumes ~5g per level teaspoon for a fine powder — density varies by ingredient, weight is the reliable number.</p>
      </Card>
      {type === "Race" && <Card title="Why two sodium sources?"><p style={{ fontFamily: fontBody, fontSize: 14, lineHeight: 1.6, color: charcoal, margin: 0 }}>Tri-sodium citrate buffers and tastes softer; Himalayan salt directly drives SGLT1, the transporter responsible for faster absorption. Splitting the dose gets both benefits.</p></Card>}
      <Card title={`2. Flavour — ${flavour}`}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>{flavourNames.map((f) => <Pill key={f} active={flavour === f} onClick={() => setFlavour(f)}>{f}</Pill>)}</div>
        <IngredientTable rows={flavourRows} showVolume />
      </Card>
      <Card title="Mixing instructions">
        <MethodSteps steps={["Weigh all base minerals into a bowl. Milligram-scale precision matters for piperine and any capped ingredient.", "Add the flavour ingredients and whisk thoroughly.", "Sieve the finished blend to break up any clumps.", "Portion into individual sachets by weight, not by scoop.", "To use: dissolve one sachet in 500ml water. Shake hard, rest 60s, shake again."]} />
      </Card>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <AddToListButton
          label={`Electrolytes — ${type} — ${flavour} — ${servings} sachets`}
          items={[...baseRows, ...flavourRows].map((r) => ({ name: r.name, grams: parseG(r.amount) }))}
        />
      </div>
    </div>
  );
}

// ================= PAGE: GELS =================
function GelsPage() {
  const [mode, setMode] = useState("purefruit");
  const [numGels, setNumGels] = useState(10);
  const [ratio, setRatio] = useState("2:1");
  const [carbsPerGel, setCarbsPerGel] = useState(30);
  const flavourNames = Object.keys(GEL_FLAVOURS);
  const [flavour, setFlavour] = useState(flavourNames[0]);
  const [withElectrolytes, setWithElectrolytes] = useState(false);
  const [raceSodiumMg, setRaceSodiumMg] = useState(1000);
  const [withCaffeine, setWithCaffeine] = useState(false);
  const [caffeineMgPerGel, setCaffeineMgPerGel] = useState(50);

  const [cmFlavour, setCmFlavour] = useState(Object.keys(CARB_FLAVOURS)[0]);
  const [cmCarbsPerGel, setCmCarbsPerGel] = useState(30);
  const [cmRatio, setCmRatio] = useState("2:1");

  const riceEff = 0.56, agaveEff = 0.60;
  const r1 = ratio === "2:1" ? 2 : 1.25;
  const riceSyrupPerGel = (carbsPerGel * r1) / (r1 + 1) / riceEff;
  const agavePerGel = (carbsPerGel * 1) / (r1 + 1) / agaveEff;

  const electrolytePerGel = (mg) => mg / 1000; // grams, using compound total per gel approx (see below split)
  const pfElectrolyteRows = withElectrolytes ? raceBase(raceSodiumMg).map((e) => {
    if (e.el === "trace") return { name: e.name, doseLabel: `${e.flatG}g/gel`, amount: `${(e.flatG * numGels).toFixed(2)}g`, role: e.role, format: "Powder" };
    const compoundG = compoundGrams(e.mg, e.pct);
    const perGel = e.el === "extract" ? e.mg / 1000 : compoundG;
    return { name: e.name, doseLabel: `${e.mg}mg ${e.el}/gel`, amount: `${(perGel * numGels).toFixed(2)}g`, role: e.role, format: "Powder" };
  }) : [];
  const pfCaffeineRows = withCaffeine ? [
    { name: "Caffeine anhydrous", doseLabel: `${caffeineMgPerGel}mg/gel`, amount: `${((caffeineMgPerGel / 1000) * numGels).toFixed(3)}g`, role: "⚠️ Milligram-scale precision mandatory", format: "Powder" },
    { name: "L-Theanine", doseLabel: `${caffeineMgPerGel * 2}mg/gel`, amount: `${(((caffeineMgPerGel * 2) / 1000) * numGels).toFixed(3)}g`, role: "2:1 ratio with caffeine", format: "Powder" },
  ] : [];

  const pfBaseRows = [
    { name: "Organic rice syrup", doseLabel: `${riceSyrupPerGel.toFixed(1)}g/gel`, amount: `${(riceSyrupPerGel * numGels).toFixed(0)}g`, role: "Primary glucose source + binder", format: "Syrup" },
    { name: "Organic agave syrup", doseLabel: `${agavePerGel.toFixed(1)}g/gel`, amount: `${(agavePerGel * numGels).toFixed(0)}g`, role: "Primary fructose source", format: "Syrup" },
    { name: "Ascorbic acid", doseLabel: "0.10g/gel", amount: `${(0.10 * numGels).toFixed(1)}g`, role: "Antioxidant, shelf-life", format: "Powder" },
  ];
  const pfFlavourRows = (GEL_FLAVOURS[flavour] || []).map((f) => ({ name: f.name, doseLabel: `${f.dose}g/gel`, amount: `${(f.dose * numGels).toFixed(1)}g`, role: f.role, format: f.format }));

  // Carb-mix-as-gel: compute powder needed for target carbs/gel, then water proportional to the established 45.5g:35ml ratio
  const { glucosePct: cmGlucosePct, fructosePct: cmFructosePct } = ratioSplit(cmRatio);
  const cmPowderPerGel = cmCarbsPerGel / 0.99; // powder is ~99% carbs before additives, consistent with bottle base
  const cmWaterPerGel = cmPowderPerGel * (35 / 45.5);
  const cmTotalPowder = cmPowderPerGel * numGels;
  const cmTotalWater = cmWaterPerGel * numGels;

  const gelSpecificRows = [
    { name: "Maltodextrin (DE 18-20)", doseLabel: `${cmGlucosePct.toFixed(1)}%`, amount: `${((cmTotalPowder * cmGlucosePct) / 100).toFixed(1)}g`, role: "Primary carb", format: "Powder" },
    { name: "Fructose (crystalline)", doseLabel: `${cmFructosePct.toFixed(1)}%`, amount: `${((cmTotalPowder * cmFructosePct) / 100).toFixed(1)}g`, role: "GLUT5", format: "Powder" },
    { name: "LM Pectin NH", doseLabel: "1%", amount: `${(cmTotalPowder * 0.01).toFixed(1)}g`, role: "⚠️ Must be low-methoxyl — this is what makes it a gel", format: "Powder" },
    { name: "Calcium lactate", doseLabel: "0.3%", amount: `${(cmTotalPowder * 0.003).toFixed(1)}g`, role: "Activates pectin cross-link", format: "Powder" },
    { name: "Ascorbic acid", doseLabel: "0.1%", amount: `${(cmTotalPowder * 0.001).toFixed(1)}g`, role: "Antioxidant, shelf-life", format: "Powder" },
    { name: "Sunflower lecithin", doseLabel: "0.2%", amount: `${(cmTotalPowder * 0.002).toFixed(1)}g`, role: "Wetting agent — helps initial dissolve before it sets", format: "Powder" },
    { name: "Silicon dioxide", doseLabel: "0.1%", amount: `${(cmTotalPowder * 0.001).toFixed(1)}g`, role: "Anti-caking", format: "Powder" },
  ];
  const cmFlavourRows = (CARB_FLAVOURS[cmFlavour]?.ingredients || []).map((f) => ({ name: f.name, doseLabel: `${f.dose}g/100g powder`, amount: `${((cmTotalPowder * f.dose) / 100).toFixed(2)}g`, role: f.role, format: f.format }));

  const cmElectrolytePerGel = withElectrolytes ? raceBase(raceSodiumMg).map((e) => {
    if (e.el === "trace") return { name: e.name, doseLabel: `${e.flatG}g/gel`, amount: `${(e.flatG * numGels).toFixed(2)}g`, role: e.role, format: "Powder" };
    const compoundG = compoundGrams(e.mg, e.pct);
    const perGel = e.el === "extract" ? e.mg / 1000 : compoundG;
    return { name: e.name, doseLabel: `${e.mg}mg ${e.el}/gel`, amount: `${(perGel * numGels).toFixed(2)}g`, role: e.role, format: "Powder" };
  }) : [];
  const cmCaffeineRows = withCaffeine ? [
    { name: "Caffeine anhydrous", doseLabel: `${caffeineMgPerGel}mg/gel`, amount: `${((caffeineMgPerGel / 1000) * numGels).toFixed(3)}g`, role: "⚠️ Milligram-scale precision mandatory", format: "Powder" },
    { name: "L-Theanine", doseLabel: `${caffeineMgPerGel * 2}mg/gel`, amount: `${(((caffeineMgPerGel * 2) / 1000) * numGels).toFixed(3)}g`, role: "2:1 ratio with caffeine", format: "Powder" },
  ] : [];

  return (
    <div>
      <PageTitle eyebrow="Step 3" sub="Two ways to make a gel: PureFruit's natural syrup base, or your own Carb Mix powder at gel concentration. Both now support electrolytes and caffeine.">Gel Builder</PageTitle>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <Pill active={mode === "purefruit"} onClick={() => setMode("purefruit")}>PureFruit Gel (rice syrup + agave)</Pill>
        <Pill active={mode === "carbmix"} onClick={() => setMode("carbmix")}>Carb Mix as Gel Powder</Pill>
      </div>

      {mode === "purefruit" && (
        <>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
              <NumberInput label="Number of gels" value={numGels} onChange={setNumGels} width="100%" />
              <NumberInput label="Carbs per gel (g)" value={carbsPerGel} onChange={setCarbsPerGel} width="100%" />
            </div>
            <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Ratio</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <Pill active={ratio === "2:1"} onClick={() => setRatio("2:1")}>2:1 — 80-90g/hr pairing</Pill>
              <Pill active={ratio === "1:0.8"} onClick={() => setRatio("1:0.8")}>1:0.8 — 100g/hr+</Pill>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Electrolytes in these gels?</div>
              <div style={{ display: "flex", gap: 10 }}><Pill active={!withElectrolytes} onClick={() => setWithElectrolytes(false)}>No</Pill><Pill active={withElectrolytes} onClick={() => setWithElectrolytes(true)}>Yes</Pill></div>
              {withElectrolytes && <div style={{ marginTop: 12 }}><NumberInput label="Sodium target (mg/gel)" value={raceSodiumMg} onChange={setRaceSodiumMg} width={200} /></div>}
            </div>
            <div>
              <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Caffeine?</div>
              <div style={{ display: "flex", gap: 10 }}><Pill active={!withCaffeine} onClick={() => setWithCaffeine(false)}>No</Pill><Pill active={withCaffeine} onClick={() => setWithCaffeine(true)}>Yes</Pill></div>
              {withCaffeine && <div style={{ marginTop: 12 }}><NumberInput label="Caffeine (mg/gel)" value={caffeineMgPerGel} onChange={setCaffeineMgPerGel} width={200} /></div>}
            </div>
          </Card>
          <Card title="1. Base gel formula"><IngredientTable rows={pfBaseRows} /></Card>
          {withElectrolytes && <Card title="2. Electrolytes"><IngredientTable rows={pfElectrolyteRows} /></Card>}
          {withCaffeine && <Card title="Caffeine + L-theanine"><IngredientTable rows={pfCaffeineRows} /></Card>}
          <Card title={`Flavour — ${flavour}`}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>{flavourNames.map((f) => <Pill key={f} active={flavour === f} onClick={() => setFlavour(f)}>{f}</Pill>)}</div>
            <IngredientTable rows={pfFlavourRows} />
          </Card>
          <Card title="Mixing instructions">
            <MethodSteps steps={["Warm the rice syrup and agave together gently to ~40°C — pourable, not caramelising.", "Fold in the flavour's fruit powder(s) and acid blend while warm.", withElectrolytes ? "Stir in the electrolyte premix." : null, withCaffeine ? "Weigh caffeine and theanine precisely and stir in." : null, "Stir in the ascorbic acid last, off the heat.", "Fill into narrow foil stick packs or a reusable soft flask while still warm.", "Cool fully before sealing or capping."].filter(Boolean)} />
          </Card>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AddToListButton
              label={`PureFruit Gel — ${flavour} — ${numGels} gels`}
              items={[
                ...pfBaseRows,
                ...(withElectrolytes ? pfElectrolyteRows : []),
                ...(withCaffeine ? pfCaffeineRows : []),
                ...pfFlavourRows,
              ].map((r) => ({ name: r.name, grams: parseG(r.amount) }))}
            />
          </div>
        </>
      )}

      {mode === "carbmix" && (
        <>
          <Card>
            <p style={{ fontFamily: fontBody, fontSize: 14, color: charcoal, lineHeight: 1.6, marginTop: 0 }}>Tell it how many carbs you want per gel — it works out the powder and water needed, using the same ~99%-carb powder logic as the bottle mix, thickened to gel concentration.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
              <NumberInput label="Number of gels" value={numGels} onChange={setNumGels} width="100%" />
              <NumberInput label="Carbs per gel (g)" value={cmCarbsPerGel} onChange={setCmCarbsPerGel} width="100%" />
            </div>
            <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Ratio</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <Pill active={cmRatio === "2:1"} onClick={() => setCmRatio("2:1")}>2:1</Pill>
              <Pill active={cmRatio === "1:0.8"} onClick={() => setCmRatio("1:0.8")}>1:0.8</Pill>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Electrolytes in these gels?</div>
              <div style={{ display: "flex", gap: 10 }}><Pill active={!withElectrolytes} onClick={() => setWithElectrolytes(false)}>No</Pill><Pill active={withElectrolytes} onClick={() => setWithElectrolytes(true)}>Yes</Pill></div>
              {withElectrolytes && <div style={{ marginTop: 12 }}><NumberInput label="Sodium target (mg/gel)" value={raceSodiumMg} onChange={setRaceSodiumMg} width={200} /></div>}
            </div>
            <div>
              <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Caffeine?</div>
              <div style={{ display: "flex", gap: 10 }}><Pill active={!withCaffeine} onClick={() => setWithCaffeine(false)}>No</Pill><Pill active={withCaffeine} onClick={() => setWithCaffeine(true)}>Yes</Pill></div>
              {withCaffeine && <div style={{ marginTop: 12 }}><NumberInput label="Caffeine (mg/gel)" value={caffeineMgPerGel} onChange={setCaffeineMgPerGel} width={200} /></div>}
            </div>
          </Card>
          <Card title="1. Powder & water needed">
            <IngredientTable rows={[
              { name: "Total powder", doseLabel: `${cmPowderPerGel.toFixed(1)}g/gel`, amount: `${cmTotalPowder.toFixed(0)}g`, role: `Delivers ${cmCarbsPerGel}g carbs/gel`, format: "Powder" },
              { name: "Water", doseLabel: `${cmWaterPerGel.toFixed(1)}ml/gel`, amount: `${cmTotalWater.toFixed(0)}ml`, role: "Added TO the powder, not the reverse", format: "Liquid" },
            ]} />
          </Card>
          <Card title="2. Gel-specific base formula (pectin + calcium lactate included — this is what makes it a gel)">
            <IngredientTable rows={gelSpecificRows} />
          </Card>
          {withElectrolytes && <Card title="3. Electrolytes"><IngredientTable rows={cmElectrolytePerGel} /></Card>}
          {withCaffeine && <Card title="Caffeine + L-theanine"><IngredientTable rows={cmCaffeineRows} /></Card>}
          <Card title={`Flavour — ${cmFlavour}`}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>{Object.keys(CARB_FLAVOURS).map((f) => <Pill key={f} active={cmFlavour === f} onClick={() => setCmFlavour(f)}>{f}</Pill>)}</div>
            <IngredientTable rows={cmFlavourRows} />
          </Card>
          <Card title="Mixing instructions">
            <MethodSteps steps={["Sieve the pectin, calcium lactate, lecithin and silicon dioxide together, whisk into a small portion of the maltodextrin first.", "Weigh the remaining maltodextrin, fructose and ascorbic acid, add the pre-mix, whisk until uniform.", withElectrolytes ? "Add the electrolyte ingredients and whisk in." : null, withCaffeine ? "Weigh caffeine and theanine precisely and whisk in." : null, "Add the flavour ingredients.", "Measure the water into a bowl first, sprinkle the powder onto it while stirring — never the reverse.", "Stir 60 seconds until smooth, then rest 4 minutes untouched — this is when the pectin cross-links with the calcium.", "Load into a flask, seal, stand upright 5 minutes, then refrigerate overnight before use."].filter(Boolean)} />
          </Card>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AddToListButton
              label={`Carb Mix Gel — ${cmFlavour} — ${numGels} gels`}
              items={[
                { name: "Water (for mixing, not shopping)", grams: 0 },
                ...gelSpecificRows,
                ...(withElectrolytes ? cmElectrolytePerGel : []),
                ...(withCaffeine ? cmCaffeineRows : []),
                ...cmFlavourRows,
              ].map((r) => ({ name: r.name, grams: parseG(r.amount) })).filter((r) => r.name !== "Water (for mixing, not shopping)")}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ================= PAGE: BARS =================
function BarsPage() {
  const [openCategory, setOpenCategory] = useState("Race");
  const [openBar, setOpenBar] = useState(null);
  const [settings, setSettings] = useState({}); // { barName: { count, targetCarbs, ratio, includeElectrolyte } }

  function getSettings(name, bar) {
    return settings[name] || { count: 1, targetCarbs: bar.defaultCarbs, ratio: "2:1", includeElectrolyte: true };
  }
  function updateSetting(name, patch) {
    setSettings((s) => ({ ...s, [name]: { ...getSettings(name, BARS[openCategory][name]), ...patch } }));
  }

  return (
    <div>
      <PageTitle eyebrow="Step 4" sub="Click a bar to open it — set the carbs you want per bar, how many bars, and (where relevant) the carb ratio and whether electrolytes are included.">Bars</PageTitle>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>{Object.keys(BARS).map((cat) => <Pill key={cat} active={openCategory === cat} onClick={() => { setOpenCategory(cat); setOpenBar(null); }}>{cat}</Pill>)}</div>
      {openCategory === "Waffle" && <p style={{ fontFamily: fontBody, fontSize: 13.5, color: muted, marginBottom: 16, fontStyle: "italic" }}>Stroopwafel-style — two thin biscuits with a syrup filling. Needs a pizzelle/stroopwafel iron. Softest solid to chew, proven format for a sensitive gut.</p>}

      {Object.entries(BARS[openCategory]).map(([name, bar]) => {
        const s = getSettings(name, bar);
        const scale = (s.targetCarbs / bar.defaultCarbs) * s.count;
        const { glucosePct, fructosePct } = bar.ratioAdjustable ? ratioSplit(s.ratio) : { glucosePct: null, fructosePct: null };

        const rows = bar.perBar
          .filter((ing) => !(ing.isElectrolyte && !s.includeElectrolyte))
          .map((ing) => {
            let grams = ing.g;
            if (bar.ratioAdjustable && (ing.isMalto || ing.isFructose)) {
              const maltoBase = bar.perBar.find((i) => i.isMalto).g;
              const fructoseBase = bar.perBar.find((i) => i.isFructose).g;
              const combined = maltoBase + fructoseBase;
              grams = ing.isMalto ? (combined * glucosePct) / 100 : (combined * fructosePct) / 100;
            }
            return { name: ing.name, doseLabel: `${grams.toFixed(1)}g / bar (base)`, amount: `${(grams * scale).toFixed(1)}g`, role: ing.role, format: "—" };
          });

        return (
          <Accordion key={name} title={name} badge={bar.badge} open={openBar === name} onToggle={() => setOpenBar(openBar === name ? null : name)}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
              <NumberInput label="Carbs per bar (g)" value={s.targetCarbs} onChange={(v) => updateSetting(name, { targetCarbs: v })} width={150} hint={`Default ${bar.defaultCarbs}g`} />
              <NumberInput label="How many bars?" value={s.count} onChange={(v) => updateSetting(name, { count: v })} width={130} />
            </div>
            {bar.ratioAdjustable && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Malto:fructose ratio</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Pill active={s.ratio === "2:1"} onClick={() => updateSetting(name, { ratio: "2:1" })}>2:1</Pill>
                  <Pill active={s.ratio === "1:0.8"} onClick={() => updateSetting(name, { ratio: "1:0.8" })}>1:0.8</Pill>
                </div>
              </div>
            )}
            {bar.hasElectrolyte && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Include electrolyte premix?</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Pill active={s.includeElectrolyte} onClick={() => updateSetting(name, { includeElectrolyte: true })}>Yes</Pill>
                  <Pill active={!s.includeElectrolyte} onClick={() => updateSetting(name, { includeElectrolyte: false })}>No</Pill>
                </div>
              </div>
            )}
            <div style={{ marginBottom: 20 }}><IngredientTable rows={rows} /></div>
            <div>
              <h4 style={{ fontFamily: fontDisplay, fontSize: 15, color: teal, margin: "0 0 12px 0" }}>Method</h4>
              <MethodSteps steps={bar.method} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <AddToListButton
                label={`${name} — ${s.count} bar(s) @ ${s.targetCarbs}g carbs`}
                items={rows.map((r) => ({ name: r.name, grams: parseG(r.amount) }))}
              />
            </div>
          </Accordion>
        );
      })}
    </div>
  );
}

// ================= PAGE: ALL FLAVOURS =================
function AllFlavoursPage() {
  const [openKey, setOpenKey] = useState(null);
  const groups = [
    { label: "Carb Mix — Sweet", data: Object.fromEntries(Object.entries(CARB_FLAVOURS).map(([k, v]) => [k, v.ingredients])), doseNote: (d) => `${d}g / 100g base powder` },
    { label: "Carb Mix — Savoury", data: Object.fromEntries(Object.entries(SAVOURY_FLAVOURS).map(([k, v]) => [k, v.ingredients])), doseNote: (d) => `${d}g / serve` },
    { label: "PureFruit Gels", data: GEL_FLAVOURS, doseNote: (d) => `${d}g / gel` },
    { label: "Electrolyte Sachets — Daily", data: ELECTROLYTE_FLAVOURS.Daily, doseNote: (d) => `${d}g / sachet` },
    { label: "Electrolyte Sachets — Race", data: ELECTROLYTE_FLAVOURS.Race, doseNote: (d) => `${d}g / sachet` },
  ];
  return (
    <div>
      <PageTitle eyebrow="Step 5" sub="Every flavour across the whole range, including savoury and both electrolyte tiers.">All Flavours</PageTitle>
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 20, color: teal, marginBottom: 14 }}>{group.label}</h2>
          {Object.entries(group.data).map(([name, ingredients]) => {
            const key = `${group.label}::${name}`;
            return (
              <Accordion key={key} title={name} open={openKey === key} onToggle={() => setOpenKey(openKey === key ? null : key)}>
                <IngredientTable rows={ingredients.map((f) => ({ name: f.name, doseLabel: group.doseNote(f.dose), amount: `${f.dose}g base dose`, role: f.role, format: f.format }))} />
              </Accordion>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ================= PAGE: RACE DAY =================
function RaceDayPage() {
  const [hours, setHours] = useState(11);
  const [carbsPerHr, setCarbsPerHr] = useState(90);
  const [ratio, setRatio] = useState("2:1");
  const [withElectrolytes, setWithElectrolytes] = useState(true);
  const [raceSodiumMg, setRaceSodiumMg] = useState(1000);
  const [withCaffeine, setWithCaffeine] = useState(false);
  const [caffeineMgPerHr, setCaffeineMgPerHr] = useState(40);

  const { glucosePct } = ratioSplit(ratio);
  const totalCarbs = hours * carbsPerHr;
  const totalPowder = Math.round(totalCarbs / 0.99);
  const glucosePerHr = carbsPerHr * (glucosePct / 100);
  const overCeiling = glucosePerHr > 63;
  const atCeiling = Math.abs(glucosePerHr - 60) < 3;
  const magWarning = withElectrolytes ? cumulativeMgWarning(80, hours) : null;

  const electrolyteHourRows = withElectrolytes ? raceBase(raceSodiumMg).map((e) => {
    if (e.el === "trace") return { name: e.name, doseLabel: `${e.flatG}g/hr`, amount: `${(e.flatG * hours).toFixed(2)}g total`, role: e.role, format: `${e.flatG.toFixed(2)}g/hr` };
    const compoundG = compoundGrams(e.mg, e.pct);
    const perHr = e.el === "extract" ? e.mg / 1000 : compoundG;
    return { name: e.name, doseLabel: `${e.mg}mg ${e.el}/hr`, amount: `${(perHr * hours).toFixed(2)}g total`, role: e.role, format: `${perHr.toFixed(2)}g/hr` };
  }) : [];

  const totalCaffeine = withCaffeine ? caffeineMgPerHr * hours : 0;
  const caffeineOverCap = totalCaffeine > 400;

  // Loadout planner
  const [loadout, setLoadout] = useState([
    { label: "Bottles", carbsEach: 60, qty: 6 },
    { label: "Gels", carbsEach: 30, qty: 6 },
    { label: "Bars", carbsEach: 40, qty: 2 },
  ]);
  function updateLoadout(i, patch) {
    setLoadout((l) => l.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  const loadoutTotal = loadout.reduce((sum, row) => sum + row.carbsEach * row.qty, 0);
  const loadoutDiff = loadoutTotal - totalCarbs;

  return (
    <div>
      <PageTitle eyebrow="Step 6" sub="Total race requirement, electrolyte and caffeine totals, then plan exactly how you'll carry it all.">Race Day Calculator</PageTitle>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
          <NumberInput label="Race hours" value={hours} onChange={setHours} width="100%" />
          <NumberInput label="Carbs per hour (g)" value={carbsPerHr} onChange={setCarbsPerHr} width="100%" />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Pill active={ratio === "2:1"} onClick={() => setRatio("2:1")}>2:1</Pill>
          <Pill active={ratio === "1:0.8"} onClick={() => setRatio("1:0.8")}>1:0.8</Pill>
        </div>
        <div style={{ background: teal, borderRadius: 6, padding: "20px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[["Total powder needed", `${totalPowder}g`], ["Total carbs", `${totalCarbs}g`], ["Glucose / hr", `${glucosePerHr.toFixed(1)}g`]].map(([label, val], i) => (
              <div key={i}><div style={{ color: "#B9D4CF", fontSize: 11.5, fontFamily: fontBody, marginBottom: 4 }}>{label}</div><div style={{ color: "#fff", fontSize: 22, fontFamily: fontMono, fontWeight: 500 }}>{val}</div></div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 4, fontSize: 13, fontFamily: fontBody, background: overCeiling ? clayLight : atCeiling ? "#E4EEE9" : paperDeep, color: overCeiling ? "#8A4A1E" : teal }}>
          {overCeiling ? `Glucose exceeds the ~60g/hr SGLT1 ceiling by ${(glucosePerHr - 60).toFixed(1)}g/hr.` : atCeiling ? "Glucose sits right at the SGLT1 ceiling — optimal." : "Comfortably under the SGLT1 ceiling."}
        </div>
      </Card>

      {hours >= 16 && <Warn>⚠️ {hours}-hour race: taper electrolyte sachet frequency from hourly to one per 90 minutes after hour 10.</Warn>}

      <Card title="Electrolytes for this race">
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}><Pill active={!withElectrolytes} onClick={() => setWithElectrolytes(false)}>Not adding electrolytes</Pill><Pill active={withElectrolytes} onClick={() => setWithElectrolytes(true)}>Adding electrolytes</Pill></div>
        {withElectrolytes && (
          <>
            <div style={{ marginBottom: 16 }}><NumberInput label="Sodium target (mg/hr)" value={raceSodiumMg} onChange={setRaceSodiumMg} width={200} /></div>
            <IngredientTable rows={electrolyteHourRows} />
            {magWarning && <div style={{ marginTop: 14 }}><Warn>⚠️ {magWarning.text}</Warn></div>}
          </>
        )}
      </Card>

      <Card title="Caffeine for this race">
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}><Pill active={!withCaffeine} onClick={() => setWithCaffeine(false)}>Not using caffeine</Pill><Pill active={withCaffeine} onClick={() => setWithCaffeine(true)}>Using caffeine</Pill></div>
        {withCaffeine && (
          <>
            <div style={{ marginBottom: 16 }}><NumberInput label="Average mg per hour" value={caffeineMgPerHr} onChange={setCaffeineMgPerHr} width={200} hint="Don't dose every hour — see the timing table below" /></div>
            <div style={{ padding: "10px 14px", borderRadius: 4, fontSize: 13, fontFamily: fontBody, background: caffeineOverCap ? clayLight : "#E4EEE9", color: caffeineOverCap ? "#8A4A1E" : teal }}>
              Total for the race: <Num>{totalCaffeine}mg</Num> {caffeineOverCap ? "— over the 300-400mg practical ceiling, spread doses out more or reduce mg/hr." : "— within the practical ceiling."}
            </div>
          </>
        )}
        <Card title="Timing" style={{ marginTop: 16, boxShadow: "none" }}>
          <IngredientTable rows={[
            { name: "Hours 0-4", doseLabel: "—", amount: "None", role: "Save it — you're fresh", format: "—" },
            { name: "Hours 4-8", doseLabel: "—", amount: "50-75mg", role: "First dose, as alertness dips", format: "—" },
            { name: "Hours 8-14", doseLabel: "—", amount: "50-75mg", role: "Time it to a hard section", format: "—" },
          ]} />
        </Card>
      </Card>

      <Card title="Carb loading">
        <IngredientTable rows={[
          { name: "Under 90 min", doseLabel: "—", amount: "Normal diet", role: "No special protocol needed", format: "—" },
          { name: "90 min – 3 hrs", doseLabel: "24hrs before", amount: "7-8g/kg", role: "One high-carb day + taper", format: "—" },
          { name: "3+ hrs (ultra)", doseLabel: "36-48hrs before", amount: "8-12g/kg", role: "Full glycogen supercompensation", format: "—" },
        ]} />
      </Card>

      <Card title="How will you get there? — loadout planner">
        <p style={{ fontFamily: fontBody, fontSize: 13.5, color: muted, marginTop: 0, marginBottom: 16 }}>Edit the carbs-per-item and quantity for each format you're carrying — it totals against your race requirement above.</p>
        {loadout.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ minWidth: 90, fontFamily: fontBody, fontSize: 14, fontWeight: 600, color: teal, paddingBottom: 10 }}>{row.label}</div>
            <NumberInput label="Carbs each (g)" value={row.carbsEach} onChange={(v) => updateLoadout(i, { carbsEach: v })} width={130} />
            <NumberInput label="Quantity" value={row.qty} onChange={(v) => updateLoadout(i, { qty: v })} width={110} />
            <div style={{ fontFamily: fontMono, fontSize: 15, color: teal, fontWeight: 700, paddingBottom: 10 }}>= {(row.carbsEach * row.qty)}g</div>
          </div>
        ))}
        <div style={{ background: teal, borderRadius: 6, padding: "16px 20px", marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div><div style={{ color: "#B9D4CF", fontSize: 11.5, fontFamily: fontBody }}>Loadout total</div><div style={{ color: "#fff", fontSize: 20, fontFamily: fontMono, fontWeight: 600 }}>{loadoutTotal}g</div></div>
            <div><div style={{ color: "#B9D4CF", fontSize: 11.5, fontFamily: fontBody }}>Race requirement</div><div style={{ color: "#fff", fontSize: 20, fontFamily: fontMono, fontWeight: 600 }}>{totalCarbs}g</div></div>
            <div><div style={{ color: "#B9D4CF", fontSize: 11.5, fontFamily: fontBody }}>Difference</div><div style={{ color: loadoutDiff < 0 ? "#F0B088" : "#fff", fontSize: 20, fontFamily: fontMono, fontWeight: 600 }}>{loadoutDiff >= 0 ? "+" : ""}{loadoutDiff}g</div></div>
          </div>
        </div>
        {loadoutDiff < 0 && <p style={{ fontFamily: fontBody, fontSize: 12.5, color: clay, marginTop: 12, fontWeight: 600 }}>★ Short by {Math.abs(loadoutDiff)}g — add another item or increase a quantity above.</p>}
      </Card>

      <Card title="The two-bottle rule">
        <p style={{ fontFamily: fontBody, fontSize: 14.5, lineHeight: 1.65, color: charcoal, margin: 0 }}>Above ~10% concentration, carb drinks pull water into the gut instead of being absorbed. Carry a concentrated carb bottle and a separate electrolyte bottle, alternate sips.</p>
      </Card>

      <Card title="Rescue ladder — if the gut turns on you">
        <IngredientTable rows={[
          { name: "Full carb mix", doseLabel: "—", amount: "90g/hr", role: "Gut working fine", format: "—" },
          { name: "Half-strength mix", doseLabel: "—", amount: "~45g/hr", role: "Struggling but not shut down", format: "—" },
          { name: "Pure Electrolyte", doseLabel: "—", amount: "0g", role: "Gut has had enough — sodium only", format: "—" },
          { name: "Savoury range", doseLabel: "—", amount: "varies", role: "Sweet fatigue specifically", format: "—" },
        ]} />
      </Card>
      <p style={{ fontFamily: fontBody, fontSize: 12.5, color: muted, fontStyle: "italic" }}>Never debut a new flavour, dose, or timing on race day — test everything on this page in training first.</p>
    </div>
  );
}
function Num({ children }) { return <span style={{ fontFamily: fontMono, fontWeight: 700 }}>{children}</span>; }

// ================= PAGE: SHOPPING LIST =================
function ShoppingListPage() {
  const list = useShoppingList();
  const [emailAddr, setEmailAddr] = useState("");

  if (!list) return null;
  const { batches, removeBatch, clearAll, checked, toggleChecked, overrides, setOverride } = list;

  const summary = {};
  batches.forEach((b) => {
    b.items.forEach((it) => {
      if (!summary[it.name]) summary[it.name] = { name: it.name, total: 0, usedIn: [] };
      summary[it.name].total += it.grams;
      if (!summary[it.name].usedIn.includes(b.label)) summary[it.name].usedIn.push(b.label);
    });
  });
  const summaryRows = Object.values(summary).sort((a, b) => a.name.localeCompare(b.name));

  function effectiveAmount(name, calculated) {
    return overrides[name] !== undefined ? overrides[name] : Math.round(calculated * 100) / 100;
  }

  function buildListText() {
    const lines = ["POLAR ENDURANCE — SHOPPING LIST", ""];
    summaryRows.forEach((row) => {
      const amt = effectiveAmount(row.name, row.total);
      lines.push(`${checked[row.name] ? "[x]" : "[ ]"} ${row.name}: ${amt}g`);
    });
    lines.push("", `Compiled from ${batches.length} recipe${batches.length === 1 ? "" : "s"} added in the app.`);
    return lines.join("\n");
  }

  function exportCsv() {
    const rows = [["Ingredient", "Total (g)", "Purchased", "Used in"]];
    summaryRows.forEach((row) => {
      const amt = effectiveAmount(row.name, row.total);
      rows.push([row.name, amt, checked[row.name] ? "Yes" : "No", row.usedIn.join(" | ")]);
    });
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `polar-endurance-shopping-list-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function emailList() {
    const subject = encodeURIComponent("Polar Endurance — Shopping List");
    const body = encodeURIComponent(buildListText() + "\n\n(Attach the exported CSV for a spreadsheet version — email links can't attach files automatically.)");
    window.location.href = `mailto:${emailAddr}?subject=${subject}&body=${body}`;
  }

  return (
    <div>
      <PageTitle eyebrow="Step 7" sub="Build recipes on the other pages and click 'Add to shopping list' — they collect here, aggregated into one order. Adjust any total by hand, tick items off as you buy them, export to Excel, or email the list to yourself.">
        Shopping List
      </PageTitle>

      {batches.length === 0 && (
        <Card>
          <p style={{ fontFamily: fontBody, fontSize: 14.5, color: charcoal, margin: 0 }}>
            Nothing added yet. Go to Carb Mix, Electrolytes, Gels, or Bars, dial in your batch, and click
            <strong> + Add to shopping list</strong> at the bottom of the page — it'll show up here.
          </p>
        </Card>
      )}

      {batches.length > 0 && (
        <>
          <Card title="Order summary — aggregated across everything you've added">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["✓", "Ingredient", "Total needed", "Used in"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${teal}`, color: teal, fontFamily: fontBody, fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row, i) => {
                  const isChecked = !!checked[row.name];
                  return (
                    <tr key={row.name} style={{ background: isChecked ? "#E4EEE9" : i % 2 === 0 ? paper : "#fff" }}>
                      <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}` }}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleChecked(row.name)} style={{ width: 18, height: 18, cursor: "pointer" }} />
                      </td>
                      <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontWeight: 600, fontSize: 13.5, color: isChecked ? muted : charcoal, textDecoration: isChecked ? "line-through" : "none" }}>{row.name}</td>
                      <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}` }}>
                        <input
                          type="number"
                          value={effectiveAmount(row.name, row.total)}
                          onChange={(e) => setOverride(row.name, Number(e.target.value) || 0)}
                          style={{ width: 90, padding: "6px 8px", border: `1px solid ${line}`, borderRadius: 4, fontFamily: fontMono, fontSize: 13.5, color: teal, background: paper }}
                        />
                        <span style={{ fontFamily: fontMono, fontSize: 12.5, color: muted, marginLeft: 6 }}>g</span>
                      </td>
                      <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontSize: 12, color: muted }}>{row.usedIn.join(", ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card title="Export & share">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <button onClick={exportCsv} style={{ padding: "12px 20px", borderRadius: 6, border: "none", background: teal, color: "#fff", fontFamily: fontBody, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                ↓ Export to Excel (CSV)
              </button>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, display: "block", marginBottom: 6 }}>Email address</label>
                  <input type="email" placeholder="you@example.com" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} style={{ width: 220, padding: "10px 12px", border: `1px solid ${line}`, borderRadius: 4, fontFamily: fontBody, fontSize: 14 }} />
                </div>
                <button onClick={emailList} disabled={!emailAddr} style={{ padding: "12px 20px", borderRadius: 6, border: "none", background: emailAddr ? clay : line, color: "#fff", fontFamily: fontBody, fontSize: 14, fontWeight: 600, cursor: emailAddr ? "pointer" : "not-allowed" }}>
                  ✉ Email this list
                </button>
              </div>
            </div>
            <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, marginBottom: 0, fontStyle: "italic" }}>
              Email opens your own email app with the list pre-filled — it can't attach the CSV automatically, so export it first and attach it yourself if you want the spreadsheet version too.
            </p>
          </Card>

          <Card title="What's been added">
            {batches.map((b) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${line}` }}>
                <div>
                  <div style={{ fontFamily: fontBody, fontSize: 13.5, fontWeight: 600, color: charcoal }}>{b.label}</div>
                  <div style={{ fontFamily: fontBody, fontSize: 11.5, color: muted }}>{b.items.length} ingredients</div>
                </div>
                <button onClick={() => removeBatch(b.id)} style={{ padding: "6px 12px", borderRadius: 4, border: `1px solid ${line}`, background: "transparent", color: clay, fontFamily: fontBody, fontSize: 12.5, cursor: "pointer" }}>Remove</button>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <button onClick={clearAll} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${clay}`, background: "transparent", color: clay, fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Clear entire list</button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ================= NAV + APP SHELL =================
const NAV = [
  { id: "carbmix", label: "1 · Carb Mix" },
  { id: "electrolytes", label: "2 · Electrolytes" },
  { id: "gels", label: "3 · Gels" },
  { id: "bars", label: "4 · Bars" },
  { id: "flavours", label: "5 · All Flavours" },
  { id: "raceday", label: "6 · Race Day" },
  { id: "shoppinglist", label: "7 · Shopping List" },
];
const PAGES = { carbmix: CarbMixPage, electrolytes: ElectrolytesPage, gels: GelsPage, bars: BarsPage, flavours: AllFlavoursPage, raceday: RaceDayPage, shoppinglist: ShoppingListPage };

export default function PolarEnduranceApp() {
  const [active, setActive] = useState("carbmix");
  const [mobileOpen, setMobileOpen] = useState(false);
  const Page = PAGES[active];
  return (
    <ShoppingListProvider>
    <div style={{ minHeight: "100vh", background: paper, fontFamily: fontBody, display: "flex" }}>
      <style>{`
        input:focus { outline: 2px solid ${clay}; outline-offset: 1px; }
        .pe-menu-btn { display: none; }
        @media (max-width: 780px) {
          .pe-sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 20; transform: translateX(-100%); transition: transform 0.2s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.2); }
          .pe-sidebar.pe-open { transform: translateX(0); }
          .pe-menu-btn { display: flex; align-items: center; gap: 8px; position: sticky; top: 0; z-index: 10; background: ${teal}; color: #fff; border: none; padding: 14px 18px; font-family: ${fontBody}; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; }
          .pe-main { padding: 24px 20px !important; max-width: 100% !important; }
          .pe-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 15; }
        }
      `}</style>
      {mobileOpen && <div className="pe-overlay" onClick={() => setMobileOpen(false)} />}
      <div className={`pe-sidebar${mobileOpen ? " pe-open" : ""}`} style={{ width: 250, minWidth: 250, background: teal, padding: "32px 22px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 21, color: "#fff", fontWeight: 600 }}>Polar Endurance</div>
          <div style={{ fontFamily: fontBody, fontSize: 12, color: "#9FC4BE", marginTop: 4, fontStyle: "italic" }}>The outdoors is waiting.</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => (
            <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }} style={{ textAlign: "left", background: active === item.id ? tealLight : "transparent", border: "none", borderLeft: active === item.id ? `3px solid ${clay}` : "3px solid transparent", color: active === item.id ? "#fff" : "#B9D4CF", padding: "11px 14px", fontFamily: fontBody, fontSize: 14, fontWeight: active === item.id ? 600 : 500, cursor: "pointer", borderRadius: 3 }}>{item.label}</button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 26, borderTop: `1px solid ${tealLight}` }}>
          <div style={{ color: "#7FA9A2", fontSize: 11, fontFamily: fontBody, lineHeight: 1.5 }}>Formulation builder<br />Not yet kitchen-tested unless noted.</div>
        </div>
      </div>
      <div className="pe-main" style={{ flex: 1, minWidth: 0 }}>
        <button className="pe-menu-btn" onClick={() => setMobileOpen(true)}>☰ &nbsp;{NAV.find((n) => n.id === active)?.label}</button>
        <div style={{ padding: "48px 56px", maxWidth: 940 }}><Page /></div>
      </div>
    </div>
    </ShoppingListProvider>
  );
}
