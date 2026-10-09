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
  function updateItemGrams(batchId, itemName, grams) {
    setBatches((bs) => bs.map((b) => (b.id !== batchId ? b : { ...b, items: b.items.map((it) => (it.name === itemName ? { ...it, grams } : it)) })));
  }

  return (
    <ShoppingListContext.Provider value={{ batches, addBatch, removeBatch, clearAll, checked, toggleChecked, overrides, setOverride, updateItemGrams }}>
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

// ================= ACID SYSTEM (app-wide) =================
const isMalicAcid = (n) => /malic acid/i.test(n);
const isCitricAcid = (n) => /citric acid/i.test(n);
const ACID_CHOICES = [
  { id: "citric", label: "Citric (standard)" },
  { id: "malic", label: "Malic (original)" },
  { id: "half", label: "Half dose" },
  { id: "none", label: "No added acid" },
];
const ACID_HINTS = {
  citric: "The standard acid across the whole app. Every flavour's malic acid is swapped for citric at ~1.1x the weight and merged with any citric already in that flavour. Citric is what Precision Fuel & Hydration, SiS gels and Amacx use. The 1.1x is an approximation for similar sourness, so taste it and adjust.",
  malic: "The original formulas with malic acid, for comparing against citric. By my calculation citric is no less acidic than malic (both sit around pH 2.7-2.8 unbuffered) — the difference is the character of the sourness, not how acidic it is.",
  half: "Citric at half the standard amount — a clean test of whether the amount of acid is the problem.",
  none: "No added acid. Fruit powders still carry some natural acid, so it won't be completely neutral. The SiS and Maurten drink mixes use none.",
};
const CITRIC_PER_MALIC = 1.1; // citric needs roughly 10% more by weight than malic for similar sourness (approximation)
function applyAcidChoice(items, choice, field = "dose") {
  if (choice === "malic") return items;
  const isAcid = (i) => isMalicAcid(i.name) || isCitricAcid(i.name);
  if (choice === "none") return items.filter((i) => !isAcid(i));
  const malicTotal = items.filter((i) => isMalicAcid(i.name)).reduce((s, i) => s + i[field], 0);
  const citricItems = items.filter((i) => isCitricAcid(i.name));
  const citricTotal = citricItems.reduce((s, i) => s + i[field], 0);
  const factor = choice === "half" ? 0.5 : 1;
  const total = (citricTotal + malicTotal * CITRIC_PER_MALIC) * factor;
  const role =
    choice === "half"
      ? "★ Half dose for acid test — citric at half the standard amount"
      : malicTotal > 0
      ? "Acid — citric (swapped from malic at ~1.1x the weight)"
      : citricItems[0]
      ? citricItems[0].role
      : "Acid — citric";
  let placed = false;
  const out = [];
  items.forEach((i) => {
    if (isAcid(i)) {
      if (!placed && total > 0) {
        out.push({ ...i, name: "Citric acid", [field]: total, ...(field === "dose" ? { listedDose: total } : {}), role, format: i.format || "Powder" });
        placed = true;
      }
    } else out.push(i);
  });
  return out;
}
// END ACID HELPERS

const AcidContext = React.createContext({ acid: "citric", setAcid: () => {} });
function useAcid() { return React.useContext(AcidContext); }
function AcidProvider({ children }) {
  const [acid, setAcid] = useState(() => {
    try {
      const saved = window.localStorage.getItem("pe_acid_choice");
      return ACID_CHOICES.some((a) => a.id === saved) ? saved : "citric";
    } catch { return "citric"; }
  });
  React.useEffect(() => { try { window.localStorage.setItem("pe_acid_choice", acid); } catch {} }, [acid]);
  return <AcidContext.Provider value={{ acid, setAcid }}>{children}</AcidContext.Provider>;
}
function acidTag(acid) {
  return { citric: "", malic: " (malic version)", half: " (half-acid test)", none: " (no-acid test)" }[acid] || "";
}
function AcidBar() {
  const { acid, setAcid } = useAcid();
  return (
    <Card style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Acid system — applies across the whole app</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ACID_CHOICES.map((a) => <Pill key={a.id} active={acid === a.id} onClick={() => setAcid(a.id)}>{a.label}</Pill>)}
      </div>
      <div style={{ fontSize: 11.5, color: muted, fontFamily: fontBody, marginTop: 8, lineHeight: 1.5 }}>{ACID_HINTS[acid]}</div>
    </Card>
  );
}
const THICKENER_HINTS = {
  xanthan: "What Amacx and SiS use in their gels. Thickens the syrup without setting it, so it pours from a flask. The 0.2% dose is my starting point, not taken from their labels, so adjust it by feel.",
  pectin: "Sets to a firm gel using calcium lactate (needs the 4-minute rest). Squeezes rather than pours.",
  none: "A syrup this concentrated is already fairly viscous (Truefuel lists no thickener). The simplest option, but it will pour thinner.",
};
function fmtG(x) { return x < 10 ? x.toFixed(2) : x.toFixed(1); }


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
    ], method: ["Weigh out every ingredient before you start — this dough firms up fast once combined, so there's no time to measure mid-process.", "Line a tray with a sheet of edible rice paper, cut slightly larger than the tray base — this stops the bar sticking and becomes part of its edible skin.", "Warm the rice syrup in a small pan over low heat to ~50°C — it should be pourable but not boiling. Take it off the heat.", "Toast the oats in a dry pan over medium heat for 3-4 minutes, stirring constantly, until lightly golden and smelling nutty. Tip into a bowl and cool for a few minutes.", "Pour the warm syrup over the toasted oats and stir until every oat is coated.", "Fold in the rice flour, apple powder, citric acid, electrolyte premix and lecithin. Keep folding until there are no dry pockets of powder left.", "If the mix is too stiff to bring together, work in the sunflower oil a teaspoon at a time — it should end up like a thick, slightly sticky cookie dough.", "Tip the mixture onto the rice-paper-lined tray. Press hard and evenly — a second sheet of rice paper on top lets you press with the flat of your hand without sticking to it — to an even ~1.5cm thickness.", "Chill for 2-3 hours, uncovered, until firm to the touch.", "Cut through the rice paper into bars with a sharp knife, wiping the blade clean between cuts for a neat edge. Wrap individually if not eating within a day or two."] },
    "Performance": { defaultCarbs: 44, hasElectrolyte: true, ratioAdjustable: true, badge: "44g carbs default · pick 1:0.8 or 2:1 · the direct Maurten analog", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Maltodextrin", g: 13, role: "Carb payload", isMalto: true },
      { name: "Fructose", g: 10, role: "Carb payload", isFructose: true }, { name: "Low-fibre oats", g: 8, role: "Minimal chew matrix" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Sunflower oil", g: 2.5, role: "Texture" },
      { name: "L-Malic acid", g: 0.6, role: "Cuts Maurten-style sweetness" }, { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
      { name: "Sunflower lecithin", g: 0.3, role: "Bind phases" },
    ], method: ["Weigh every ingredient before starting — once combined this dough sets quickly.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup in a small pan to ~50°C — pourable, not boiling. Remove from heat.", "In a separate bowl, whisk the maltodextrin, fructose, rice flour, citric acid, electrolyte premix and lecithin together until evenly blended — this prevents pockets of any one ingredient in the finished bar.", "Combine the warm syrup with the dry mix and the oats. Fold firmly and repeatedly until a stiff, uniform dough forms with no streaks of syrup or dry powder.", "If the dough won't come together, work in the sunflower oil a teaspoon at a time until it holds its shape without crumbling.", "Press the dough onto the rice-paper-lined tray, working it firmly into the corners, to an even ~1.5cm thickness.", "Chill for 2-3 hours until firm.", "Cut through the rice paper into bars, wrap individually, and store somewhere cool."] },
    "Hybrid": { defaultCarbs: 42, hasElectrolyte: true, ratioAdjustable: true, badge: "42g carbs default · pick 1:0.8 or 2:1 · best all-round chew", perBar: [
      { name: "Rice syrup", g: 22, role: "Binder + carb" }, { name: "Maltodextrin", g: 9, role: "Carb payload", isMalto: true },
      { name: "Fructose", g: 7, role: "Carb payload", isFructose: true }, { name: "Low-fibre oats", g: 12, role: "Satisfying chew" },
      { name: "Rice flour", g: 5, role: "Structure" }, { name: "Freeze-dried apple powder", g: 3, role: "Real flavour" },
      { name: "Sunflower oil", g: 2.5, role: "Texture" }, { name: "L-Malic acid", g: 0.5, role: "Cut sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Weigh every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup to ~50°C in a small pan — pourable, not boiling.", "Toast the oats in a dry pan over medium heat for 3-4 minutes until lightly golden, then cool for a few minutes.", "In a large bowl, combine the warm syrup, toasted oats, the dry maltodextrin/fructose mix, apple powder, citric acid and electrolyte premix.", "Fold everything together until a stiff, cohesive dough forms. If it won't hold together, work in the sunflower oil a teaspoon at a time.", "Press the dough hard onto the rice-paper-lined tray, ~1.5cm thick, pressing firmly into the edges.", "Chill for 2-3 hours until firm.", "Cut through the rice paper into bars, wrap and store cool."] },
    "Nougat — Original": { defaultCarbs: 40, hasElectrolyte: true, badge: "40g carbs default · fastest emptying · best choice for a sensitive gut", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey (or extra rice syrup)", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Freeze-dried fruit powder", g: 3, role: "Flavour" }, { name: "L-Malic acid", g: 0.5, role: "Cut honey sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Weigh everything and have two sheets of edible rice paper cut to the size of your tray before you begin — once the syrup is hot, this process moves fast and there's no time to prep mid-way.", "Line the tray with the first sheet of rice paper.", "Whip the rehydrated egg white powder (or aquafaba) in a stand mixer or with electric beaters to stiff, glossy peaks — it should hold its shape when you lift the beaters.", "Heat the rice syrup and honey together in a small pan with a sugar thermometer clipped to the side, to 120-130°C (the soft-ball stage). Don't stir once it's boiling — just watch the thermometer.", "With the mixer running on a medium speed, pour the hot syrup into the whipped whites in a thin, steady stream down the side of the bowl, avoiding the beaters. Keep whipping for 3-5 minutes until thick, glossy and holding soft peaks.", "Working quickly before it sets, fold in the maltodextrin, fructose, rice flour, electrolyte premix, citric acid and fruit powder by hand with a spatula.", "Spread the mixture onto the rice-paper-lined tray, lay the second sheet of rice paper on top, and press flat and even with a rolling pin or the base of a tray.", "Leave to set at room temperature for 4-6 hours. Do NOT refrigerate — cold temperatures make nougat go hard and can cause it to weep.", "Cut through both layers of rice paper into bars with a sharp, lightly oiled knife."] },
    "Nougat — Raspberry": { defaultCarbs: 40, hasElectrolyte: true, badge: "40g carbs default · same fast-emptying nougat base, tart berry lead", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey (or extra rice syrup)", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Freeze-dried raspberry powder", g: 3.5, role: "Tart lead flavour" }, { name: "L-Malic acid", g: 0.4, role: "Raspberry is already tart — slightly less than the original" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Weigh everything and have two sheets of edible rice paper cut to the size of your tray before you begin.", "Line the tray with the first sheet of rice paper.", "Whip the rehydrated egg white powder (or aquafaba) to stiff, glossy peaks.", "Heat the rice syrup and honey together with a sugar thermometer to 120-130°C (soft-ball stage), without stirring once boiling.", "With the mixer running, pour the hot syrup into the whites in a thin stream down the side of the bowl. Whip 3-5 minutes until thick and glossy.", "Working quickly, fold in the maltodextrin, fructose, rice flour, electrolyte premix, citric acid and raspberry powder by hand.", "Spread onto the rice-paper-lined tray, top with the second sheet of rice paper, and press flat and even.", "Set at room temperature 4-6 hours — do NOT refrigerate.", "Cut through both layers of rice paper into bars with a sharp, lightly oiled knife."] },
  },
  "Training & Recovery": {
    "Peanut Butter & Jam": { wheyOk: true, defaultCarbs: 33, hasElectrolyte: false, badge: "The universal crowd-pleaser — real fruit, real peanut butter", perBar: [
      { name: "Peanut butter (smooth)", g: 20, role: "Primary flavour + fat + protein" }, { name: "Rice syrup", g: 18, role: "Binder" },
      { name: "Quick oats", g: 12, role: "Texture" }, { name: "Freeze-dried raspberry or strawberry powder", g: 4, role: "The 'jam' layer" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Himalayan salt", g: 0.4, role: "Classic salty-peanut lift" },
    ], method: ["Weigh out every ingredient before starting — this dough firms as it cools, so work efficiently once mixing begins.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan, then stir in the peanut butter until completely smooth and glossy — don't let it boil.", "Toast the oats in a dry pan for 2-3 minutes until lightly golden, then cool briefly before folding into the peanut butter mixture along with the rice flour and salt.", "Press half of the mixture into the rice-paper-lined tray in an even layer, about 0.7cm thick.", "Mix the freeze-dried fruit powder with 1-2 teaspoons of warm water to form a thick, spreadable paste — this becomes the jam layer.", "Spread the fruit paste evenly over the base layer, leaving a small border around the edges.", "Top with the remaining peanut butter mixture, pressing down firmly around the edges to seal the jam layer inside completely.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Salted Caramel": { wheyOk: true, defaultCarbs: 36, hasElectrolyte: false, badge: "Same browning trick as the waffle — real caramel, nothing added", perBar: [
      { name: "Rice syrup + light brown sugar", g: 27, role: "The caramel — cooked to light amber (raised to replace the pretzel carbs)" },
      { name: "Quick oats", g: 14, role: "Structure (raised to replace the pretzel bulk)" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "Himalayan salt (extra)", g: 0.8, role: "Salted caramel is salt-forward" }, { name: "Vanilla", g: 0.2, role: "Rounds the caramel" },
    ], method: ["Weigh everything before you start the caramel — once it hits temperature, this moves fast and there's no time to prep.", "Line a tray with edible rice paper, cut to size.", "Combine the rice syrup and brown sugar in a small, heavy-based pan over medium heat. Clip a sugar thermometer to the side and cook, without stirring, to 118-120°C — a light amber colour, not dark.", "Watch closely in the final 30 seconds — caramel can darken from light amber to burnt very quickly once it's near temperature.", "The moment it hits 118-120°C, remove the pan from the heat immediately. Stir in the vanilla and salt — it will bubble up, that's normal.", "Working quickly before the caramel starts to set, fold in the oats and rice flour with a wooden spoon or heatproof spatula.", "While still warm and workable, press the mixture onto the rice-paper-lined tray to an even ~1.5cm thickness — it will firm up fast, so don't delay.", "Leave to cool and set fully at room temperature, then chill for at least 1 hour for a cleaner cut.", "Cut through the rice paper into bars with a sharp knife, warming the blade under hot water if the caramel resists cutting cleanly."] },
    "Double Chocolate & Cherry": { wheyOk: true, defaultCarbs: 34, hasElectrolyte: false, badge: "Real chocolate chunks — the texture the race bars can't use", perBar: [
      { name: "Rice syrup", g: 18, role: "Binder" }, { name: "Dark chocolate chunks", g: 12, role: "Real chocolate, genuine indulgence" },
      { name: "Tart cherry powder", g: 6, role: "Ties to the Recovery Bar family" }, { name: "Quick oats", g: 10, role: "Structure" },
      { name: "Cocoa (fat-reduced)", g: 4, role: "Deepens the chocolate" }, { name: "L-Malic acid", g: 0.3, role: "Balances cherry + chocolate sweetness" },
    ], method: ["Weigh out every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan — just enough to loosen it, not to boil — then stir in the cocoa powder and citric acid until smooth and fully combined.", "Toast the oats in a dry pan for 2-3 minutes until lightly golden, then cool briefly.", "Fold the toasted oats, tart cherry powder and chocolate chunks into the warm cocoa syrup. Mix gently and only until just combined — overmixing will melt the chocolate chunks into the dough rather than leaving them as distinct pieces.", "Press the mixture onto the rice-paper-lined tray to an even ~1.5cm thickness, working quickly so the chocolate chunks don't have time to soften further.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Lemon Drizzle": { wheyOk: true, defaultCarbs: 32, hasElectrolyte: false, badge: "Home-snacking flavour — bright, less rich than the chocolate/caramel options", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 12, role: "Structure" },
      { name: "Lemon juice powder", g: 3, role: "Bright citrus lead" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "L-Malic acid", g: 0.3, role: "Sustained citrus finish" }, { name: "Himalayan salt", g: 0.3, role: "Rounds the sweetness" },
    ], method: ["Weigh out every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan, then stir in the lemon juice powder and citric acid until fully dissolved — taste at this point, it should be noticeably sharp before the oats mellow it.", "Toast the oats in a dry pan for 2-3 minutes until lightly golden, then cool briefly.", "Fold the toasted oats, rice flour and salt into the lemon syrup until no dry patches remain.", "Press the mixture onto the rice-paper-lined tray to an even ~1.5cm thickness, smoothing the top with the back of a spoon.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Ginger Snap": { wheyOk: true, defaultCarbs: 32, hasElectrolyte: false, badge: "Home-snacking flavour — warm spice, good for a cold-weather training bar", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 12, role: "Structure" },
      { name: "Ground ginger", g: 1.5, role: "Warm spice lead" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "L-Malic acid", g: 0.3, role: "Cuts sweetness" }, { name: "Cinnamon", g: 0.3, role: "Rounds the spice" },
    ], method: ["Weigh out every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan, then stir in the ground ginger, cinnamon and citric acid until evenly distributed through the syrup.", "Toast the oats in a dry pan for 2-3 minutes until lightly golden, then cool briefly.", "Fold the toasted oats and rice flour into the spiced syrup until no dry pockets remain and the mixture holds together.", "Press onto the rice-paper-lined tray to an even ~1.5cm thickness.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Banana Bread": { wheyOk: true, defaultCarbs: 34, hasElectrolyte: false, badge: "New · home-snacking flavour. Soft, warm and familiar", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 12, role: "Structure" },
      { name: "Freeze-dried banana powder", g: 5, role: "Banana lead flavour" }, { name: "Walnuts (chopped)", g: 6, role: "Texture + richness" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Cinnamon", g: 0.3, role: "Banana-bread spice" }, { name: "Himalayan salt", g: 0.3, role: "Rounds the sweetness" },
    ], method: ["Weigh out every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan, then stir in the banana powder, cinnamon and salt until smooth.", "Toast the oats and walnuts in a dry pan for 2-3 minutes until lightly golden, then cool briefly.", "Fold the toasted oats, walnuts and rice flour into the banana syrup until no dry patches remain.", "Press onto the rice-paper-lined tray to an even ~1.5cm thickness.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Apple Crumble": { wheyOk: true, defaultCarbs: 33, hasElectrolyte: false, badge: "New · home-snacking flavour. Apple, cinnamon and a toasted-oat crumble", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 14, role: "Crumble texture" },
      { name: "Freeze-dried apple powder", g: 5, role: "Apple lead flavour" }, { name: "Brown sugar", g: 3, role: "Crumble-topping flavour" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Cinnamon", g: 0.4, role: "Apple-pie spice" }, { name: "Himalayan salt", g: 0.3, role: "Rounds the sweetness" },
    ], method: ["Weigh out every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup and brown sugar gently until the sugar dissolves. Do not boil. Stir in the apple powder, cinnamon and salt.", "Toast the oats in a dry pan for 3-4 minutes until golden and nutty, then cool briefly. The deeper toast is the crumble flavour.", "Fold the oats and rice flour into the syrup until the mix holds together.", "Press onto the rice-paper-lined tray to an even ~1.5cm thickness.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Coconut & Lime": { wheyOk: true, defaultCarbs: 32, hasElectrolyte: false, badge: "New · home-snacking flavour. Bright and tropical, lighter than the chocolate bars", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Quick oats", g: 12, role: "Structure" },
      { name: "Coconut milk powder", g: 4, role: "Coconut flavour lives in the fat" }, { name: "Lime juice powder", g: 2.5, role: "Bright citrus" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Citric acid", g: 0.3, role: "Sharpens the lime" }, { name: "Himalayan salt", g: 0.3, role: "Rounds the sweetness" },
    ], method: ["Weigh out every ingredient before starting.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan, then stir in the coconut milk powder, lime juice powder, citric acid and salt until smooth. Taste: it should be noticeably sharp before the oats mellow it.", "Toast the oats in a dry pan for 2-3 minutes until lightly golden, then cool briefly.", "Fold the oats and rice flour into the syrup until no dry patches remain.", "Press onto the rice-paper-lined tray to an even ~1.5cm thickness.", "Chill for at least 1 hour until firm.", "Cut through the rice paper into bars with a sharp knife."] },
    "Nougat — Vanilla (Training)": { defaultCarbs: 38, hasElectrolyte: false, badge: "Lighter, aerated snack format — same nougat base, no race electrolytes", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Vanilla extract", g: 0.3, role: "Classic nougat flavour" },
    ], method: ["Weigh everything and have two sheets of edible rice paper cut to the size of your tray before you begin.", "Line the tray with the first sheet of rice paper.", "Whip the rehydrated egg white powder (or aquafaba) to stiff, glossy peaks.", "Heat the rice syrup and honey together with a sugar thermometer to 120-130°C (soft-ball stage), without stirring once boiling.", "With the mixer running, pour the hot syrup into the whites in a thin stream down the side of the bowl. Whip 3-5 minutes until thick and glossy.", "Working quickly, fold in the maltodextrin, fructose, rice flour and vanilla extract by hand.", "Spread onto the rice-paper-lined tray, top with the second sheet of rice paper, and press flat and even.", "Leave to set at room temperature for 4-6 hours — do NOT refrigerate.", "Cut through both layers of rice paper into bars with a sharp, lightly oiled knife."] },
    "Chocolate Peanut": { wheyBar: true, defaultCarbs: 34, hasElectrolyte: false, badge: "New \u00b7 whey protein bar. Carbs shown are for the base, whey is added on top by the ratio you pick", perBar: [
      { name: "Rice syrup", g: 26, role: "Binder + carb" },
      { name: "Quick oats", g: 14, role: "Structure" },
      { name: "Peanut butter (smooth)", g: 12, role: "Flavour + fat, softens the whey" },
      { name: "Cocoa (fat-reduced)", g: 4, role: "Chocolate depth" },
      { name: "Rice flour", g: 4, role: "Structure" },
      { name: "Himalayan salt", g: 0.4, role: "Peanut and chocolate lift" },
    ], method: ["Weigh out every ingredient before starting. The whey amount is set by the ratio you choose, so use the table.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan to about 50\u00b0C, then stir in the peanut butter and cocoa until smooth. Take it off the heat and let it cool until just warm (below about 60\u00b0C). Hot syrup makes whey clump.", "In a large bowl, whisk the vanilla whey with the oats, rice flour and any other dry ingredients until evenly mixed.", "Pour the warm syrup mix over the dry mix and fold firmly until a stiff dough forms. Whey absorbs a lot of liquid. If it is crumbly, work in warm water or rice syrup a teaspoon at a time until it holds together.", "Press hard onto the rice-paper-lined tray to an even ~1.5cm thickness. Lay a second sheet of rice paper on top and press with your hand.", "Chill for at least 2 hours until firm. Whey bars firm up further over a day or two, so eat within about 5 days or freeze.", "Cut through the rice paper into bars with a sharp knife, wiping the blade between cuts."] },
    "Vanilla Cookie Dough": { wheyBar: true, defaultCarbs: 36, hasElectrolyte: false, badge: "New \u00b7 whey protein bar. Soft, cookie-dough style, best with a vanilla whey", perBar: [
      { name: "Rice syrup", g: 26, role: "Binder + carb" },
      { name: "Quick oats", g: 16, role: "Structure" },
      { name: "Almond butter", g: 10, role: "Richness, softens the whey" },
      { name: "Dark chocolate chips", g: 4, role: "Cookie-dough chips" },
      { name: "Rice flour", g: 4, role: "Structure" },
      { name: "Vanilla extract", g: 0.5, role: "Cookie flavour" },
      { name: "Himalayan salt", g: 0.4, role: "Rounds the sweetness" },
    ], method: ["Weigh out every ingredient before starting. The whey amount is set by the ratio you choose, so use the table.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan to about 50\u00b0C, then stir in the almond butter, vanilla and salt until smooth. Take it off the heat and let it cool until just warm (below about 60\u00b0C). Hot syrup makes whey clump.", "In a large bowl, whisk the vanilla whey with the oats, rice flour and any other dry ingredients until evenly mixed.", "Pour the warm syrup mix over the dry mix and fold firmly until a stiff dough forms. Whey absorbs a lot of liquid. If it is crumbly, work in warm water or rice syrup a teaspoon at a time until it holds together.", "Press hard onto the rice-paper-lined tray to an even ~1.5cm thickness. Lay a second sheet of rice paper on top and press with your hand.", "Chill for at least 2 hours until firm. Whey bars firm up further over a day or two, so eat within about 5 days or freeze.", "Cut through the rice paper into bars with a sharp knife, wiping the blade between cuts."] },
    "Raspberry Yoghurt": { wheyBar: true, defaultCarbs: 34, hasElectrolyte: false, badge: "New \u00b7 whey protein bar. Tart berry, lighter than the chocolate options", perBar: [
      { name: "Rice syrup", g: 26, role: "Binder + carb" },
      { name: "Quick oats", g: 14, role: "Structure" },
      { name: "Freeze-dried raspberry powder", g: 5, role: "Tart berry lead" },
      { name: "Lime juice powder", g: 2, role: "Yoghurt-like sharpness" },
      { name: "Coconut oil", g: 4, role: "Softens the whey, adds richness" },
      { name: "Rice flour", g: 4, role: "Structure" },
      { name: "Citric acid", g: 0.3, role: "Sharpens the berry" },
      { name: "Himalayan salt", g: 0.3, role: "Rounds the sweetness" },
    ], method: ["Weigh out every ingredient before starting. The whey amount is set by the ratio you choose, so use the table.", "Line a tray with edible rice paper, cut to size.", "Warm the rice syrup gently in a small pan to about 50\u00b0C, then stir in the raspberry powder, lime powder, citric acid, melted coconut oil and salt until smooth. Take it off the heat and let it cool until just warm (below about 60\u00b0C). Hot syrup makes whey clump.", "In a large bowl, whisk the vanilla whey with the oats, rice flour and any other dry ingredients until evenly mixed.", "Pour the warm syrup mix over the dry mix and fold firmly until a stiff dough forms. Whey absorbs a lot of liquid. If it is crumbly, work in warm water or rice syrup a teaspoon at a time until it holds together.", "Press hard onto the rice-paper-lined tray to an even ~1.5cm thickness. Lay a second sheet of rice paper on top and press with your hand.", "Chill for at least 2 hours until firm. Whey bars firm up further over a day or two, so eat within about 5 days or freeze.", "Cut through the rice paper into bars with a sharp knife, wiping the blade between cuts."] },
  },
  Waffle: {
    "Neutral Caramel": { defaultCarbs: 30, hasElectrolyte: true, badge: "The flagship — real caramel from browning, nothing added, anti-flavour-fatigue", perBar: [
      { name: "Rice flour", g: 14, role: "Biscuit structure" }, { name: "Rice syrup (biscuit)", g: 6, role: "Biscuit bind" },
      { name: "Coconut oil", g: 4, role: "Crisp + richness" }, { name: "Cane sugar", g: 3, role: "Browning + crisp" },
      { name: "Rice syrup (filling)", g: 9, role: "Filling base" }, { name: "Light brown sugar", g: 2, role: "THE caramel — cooked to light amber, nothing added" },
      { name: "Maltodextrin (filling)", g: 2, role: "Firmer set + carbs" }, { name: "L-Malic acid", g: 0.20, role: "Cuts sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward — salt doubles as caramel enhancer", isElectrolyte: true },
      { name: "Vanilla", g: 0.05, role: "Rounds the caramel" },
    ], method: ["Weigh out every ingredient before starting, and preheat your pizzelle/stroopwafel iron.", "Rub the coconut oil into the rice flour and cane sugar with your fingertips until it resembles breadcrumbs, then add the biscuit-portion rice syrup and bring together into a stiff, slightly oily dough. Rest for 15 minutes — this relaxes the dough and makes it easier to press thin.", "Divide into ~28g balls. Press one at a time in the hot iron for 30-60 seconds until golden and thin — check the first one and adjust timing if your iron runs hotter or cooler. Cool the biscuits flat on a rack.", "For the filling, combine the filling-portion rice syrup and brown sugar in a small pan with a sugar thermometer. Cook to 118-120°C — a light amber colour. This caramelisation IS the flavour, so don't rush or under-cook it, but watch closely in the final 30 seconds as it can darken fast.", "Remove from heat immediately. Stir in the maltodextrin, citric acid, electrolyte premix and vanilla until smooth.", "While the filling is still warm and spreadable, spread it evenly over one biscuit half, leaving a small border, then press a second biscuit half on top, pressing gently to spread the filling to the edges.", "If the biscuit itself feels fragile once cool, you can optionally wrap the finished waffle in a small sheet of edible rice paper for extra grip and protection in transit — though the biscuit halves already largely solve the stickiness problem on their own.", "Leave flat until fully cool and the filling has set, then wrap individually for storage."] },
    "Apple & Cinnamon": { defaultCarbs: 30, hasElectrolyte: true, badge: "Classic stroopwafel pairing — comfort flavour for cooler days", perBar: [
      { name: "Rice flour", g: 14, role: "Biscuit structure" }, { name: "Rice syrup (biscuit)", g: 6, role: "Biscuit bind" },
      { name: "Coconut oil", g: 4, role: "Crisp + richness" }, { name: "Cane sugar", g: 3, role: "Browning + crisp" },
      { name: "Rice syrup (filling)", g: 9, role: "Filling base" }, { name: "Agave syrup (filling)", g: 4, role: "Softness + fructose" },
      { name: "Freeze-dried apple powder", g: 1.5, role: "Real fruit flavour" }, { name: "Cinnamon", g: 0.1, role: "Classic pairing" },
      { name: "L-Malic acid", g: 0.25, role: "Apple's natural acid" }, { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward", isElectrolyte: true },
    ], method: ["Weigh out every ingredient before starting, and preheat your pizzelle/stroopwafel iron.", "Rub the coconut oil into the rice flour and cane sugar until it resembles breadcrumbs, add the biscuit-portion rice syrup, and bring together into a stiff dough. Rest 15 minutes.", "Divide into ~28g balls and press one at a time in the hot iron for 30-60 seconds until golden and thin. Cool the biscuits flat.", "Warm the filling-portion rice syrup and agave together in a small pan to around 110°C — just hot enough to be fully fluid, no thermometer precision needed here since there's no caramelisation step.", "Off the heat, stir in the apple powder, cinnamon, citric acid and electrolyte premix until evenly combined.", "While the filling is still warm, spread it over one biscuit half, leaving a small border, then press a second biscuit half on top.", "Optionally wrap the finished waffle in a small sheet of edible rice paper for extra grip in transit.", "Leave flat until fully cool and set, then wrap individually."] },
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
  const { acid: acidChoice } = useAcid();

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

  const baseFlavourItems = (flavourData.ingredients || []).map((f, idx) => {
    let dose = f.dose, role = f.role;
    if (withElectrolytes && flavourData.category === "savoury" && idx === flavourData.saltIngredientIndex) {
      dose = dose * 0.5; role = "★ Halved — race electrolyte sodium already covers much of this job";
    }
    return { name: f.name, dose, listedDose: f.dose, role, format: f.format };
  });
  const flavourRows = applyAcidChoice(baseFlavourItems, acidChoice).map((f) => {
    const basis = flavourData.category === "sweet" ? batchG / 100 : servings;
    return { name: f.name, doseLabel: `${+f.listedDose.toFixed(3)}g ${flavourData.category === "sweet" ? "/100g" : "/serve"}`, amount: `${(f.dose * basis).toFixed(2)}g`, role: f.role, format: f.format };
  });

  const sweetExtraStevia = withElectrolytes && flavourData.category === "sweet" && !flavourData.ingredients.some((f) => f.name.includes("Stevia"));
  const magWarning = withElectrolytes ? cumulativeMgWarning(80, servings) : null;
  let stepNum = 2;

  return (
    <div>
      <PageTitle eyebrow="Step 1" sub="Set your batch, your own serving size, a ratio, whether race electrolytes and caffeine ride along, then a flavour.">Carb Mix Builder</PageTitle>
      <AcidBar />

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
        {acidChoice !== "citric" && <p style={{ fontFamily: fontBody, fontSize: 12.5, color: clay, marginTop: 12, fontWeight: 600 }}>★ Acid test batch — change only this one thing compared with your last bottle, and note how it feels. {acidChoice === "none" && flavour.startsWith("Naked") ? "Naked has nothing but acid and stevia, so with no acid this is only stevia." : ""}</p>}
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
          label={`Carb Mix — ${flavour} — ${batchG}g batch${acidTag(acidChoice)}`}
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
  const { acid } = useAcid();
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
  const flavourRows = applyAcidChoice(ELECTROLYTE_FLAVOURS[type][flavour] || [], acid).map((f) => ({
    name: f.name, doseLabel: `${+f.dose.toFixed(3)}g / sachet`, amount: `${(f.dose * servings).toFixed(2)}g`, volume: volLabel(f.dose * servings), role: f.role, format: f.format,
  }));

  const magWarning = type === "Race" ? cumulativeMgWarning(80, servings) : null;
  const longRace = servings >= 16;

  return (
    <div>
      <PageTitle eyebrow="Step 2" sub="Daily or Race, how many sachets, then a flavour — with weight AND approximate spoon volume for each ingredient.">Electrolyte Builder</PageTitle>
      <AcidBar />
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
          label={`Electrolytes — ${type} — ${flavour} — ${servings} sachets${acidTag(acid)}`}
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
  const [thickener, setThickener] = useState("xanthan");
  const [bottleMl, setBottleMl] = useState(120);
  const { acid } = useAcid();

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
  const pfFlavourRows = applyAcidChoice(GEL_FLAVOURS[flavour] || [], acid).map((f) => ({ name: f.name, doseLabel: `${+f.dose.toFixed(3)}g/gel`, amount: `${(f.dose * numGels).toFixed(2)}g`, role: f.role, format: f.format }));

  // Carb-mix-as-gel: compute powder needed for target carbs/gel, then water proportional to the established 45.5g:35ml ratio
  const { glucosePct: cmGlucosePct, fructosePct: cmFructosePct } = ratioSplit(cmRatio);
  const cmPowderPerGel = cmCarbsPerGel / 0.99; // powder is ~99% carbs before additives, consistent with bottle base
  const cmWaterPerGel = cmPowderPerGel * (35 / 45.5);
  const cmTotalPowder = cmPowderPerGel * numGels;
  const cmTotalWater = cmWaterPerGel * numGels;

  // Finished-gel size and fit. Density is an estimate for a ~55% w/w carbohydrate solution (sucrose tables used as a proxy) — not measured.
  const GEL_DENSITY = 1.26;
  const cmGelMassPerGel = cmPowderPerGel + cmWaterPerGel; // g (1ml water ~ 1g)
  const cmGelVolumePerGel = cmGelMassPerGel / GEL_DENSITY; // ml
  const cmCarbPctByWeight = cmGelMassPerGel > 0 ? (cmCarbsPerGel / cmGelMassPerGel) * 100 : 0;
  const bottleHeadroom = bottleMl - cmGelVolumePerGel;
  const waterToDrink = (pct) => Math.max(0, cmCarbsPerGel / (pct / 100) - cmGelVolumePerGel);
  const XANTHAN_PCT = 0.2; // % of finished gel weight — a starting point, not from a label
  const cmGelMassTotal = cmGelMassPerGel * numGels;

  const gelSpecificRows = [
    { name: "Maltodextrin (DE 18-20)", doseLabel: `${cmGlucosePct.toFixed(1)}%`, amount: `${((cmTotalPowder * cmGlucosePct) / 100).toFixed(1)}g`, role: "Primary carb", format: "Powder" },
    { name: "Fructose (crystalline)", doseLabel: `${cmFructosePct.toFixed(1)}%`, amount: `${((cmTotalPowder * cmFructosePct) / 100).toFixed(1)}g`, role: "GLUT5", format: "Powder" },
    ...(thickener === "pectin" ? [
      { name: "LM Pectin NH", doseLabel: "1%", amount: `${(cmTotalPowder * 0.01).toFixed(1)}g`, role: "⚠️ Must be low-methoxyl — this is what makes it a set gel", format: "Powder" },
      { name: "Calcium lactate", doseLabel: "0.3%", amount: `${(cmTotalPowder * 0.003).toFixed(1)}g`, role: "Activates pectin cross-link", format: "Powder" },
    ] : []),
    ...(thickener === "xanthan" ? [
      { name: "Xanthan gum", doseLabel: `${XANTHAN_PCT}% of finished gel`, amount: `${((cmGelMassTotal * XANTHAN_PCT) / 100).toFixed(2)}g`, role: "⚠️ Starting dose, not from a label. Thickens without setting, so it pours. Needs a 0.01g scale.", format: "Powder" },
    ] : []),
    { name: "Ascorbic acid", doseLabel: "0.1%", amount: `${(cmTotalPowder * 0.001).toFixed(1)}g`, role: "Antioxidant, shelf-life", format: "Powder" },
    ...(thickener === "pectin" ? [
      { name: "Sunflower lecithin", doseLabel: "0.2%", amount: `${(cmTotalPowder * 0.002).toFixed(1)}g`, role: "Wetting agent — helps initial dissolve before it sets", format: "Powder" },
      { name: "Silicon dioxide", doseLabel: "0.1%", amount: `${(cmTotalPowder * 0.001).toFixed(1)}g`, role: "Anti-caking", format: "Powder" },
    ] : []),
  ];
  const cmFlavourRows = applyAcidChoice(CARB_FLAVOURS[cmFlavour]?.ingredients || [], acid).map((f) => ({ name: f.name, doseLabel: `${+f.dose.toFixed(3)}g/100g powder`, amount: `${((cmTotalPowder * f.dose) / 100).toFixed(2)}g`, role: f.role, format: f.format }));

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

  const cmMethodSteps = (thickener === "pectin" ? [
    "Sieve the pectin, calcium lactate, lecithin and silicon dioxide together, whisk into a small portion of the maltodextrin first.",
    "Weigh the remaining maltodextrin, fructose and ascorbic acid, add the pre-mix, whisk until uniform.",
    withElectrolytes ? "Add the electrolyte ingredients and whisk in." : null,
    withCaffeine ? "Weigh caffeine and theanine precisely and whisk in." : null,
    "Add the flavour ingredients.",
    "Measure the water into a bowl first, sprinkle the powder onto it while stirring — never the reverse.",
    "Stir 60 seconds until smooth, then rest 4 minutes untouched — this is when the pectin cross-links with the calcium.",
    "Load into a flask, seal, stand upright 5 minutes, then refrigerate overnight before use.",
  ] : [
    thickener === "xanthan"
      ? "Weigh the maltodextrin, fructose and ascorbic acid, then whisk the xanthan gum into this dry mix first — added straight to liquid it clumps. Weigh the xanthan on a 0.01g scale."
      : "Weigh the maltodextrin, fructose and ascorbic acid and whisk until uniform.",
    withElectrolytes ? "Add the electrolyte ingredients and whisk in." : null,
    withCaffeine ? "Weigh caffeine and theanine precisely and whisk in." : null,
    "Add the flavour ingredients to the dry mix.",
    "Warm the water to about 50°C — this much powder in so little water won't dissolve cold. Add the powder in three or four portions, stirring or stick-blending between each, until smooth and clear.",
    thickener === "xanthan"
      ? "Leave to stand 10-15 minutes so the xanthan fully hydrates, then check how it pours. Too thin: whisk in a pinch more xanthan. Too thick: stir in a teaspoon of warm water."
      : "Leave to cool — it thickens as it cools, and will pour thinner than a set gel.",
    "Pour into the bottle or flask through a funnel, leaving a little headroom. Cool, then refrigerate. There is no preservative, so make it the night before and use it within a few days.",
  ]).filter(Boolean);

  return (
    <div>
      <PageTitle eyebrow="Step 3" sub="Two ways to make a gel: PureFruit's natural syrup base, or your own Carb Mix powder at gel concentration. Both now support electrolytes and caffeine.">Gel Builder</PageTitle>
      <AcidBar />
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
              label={`PureFruit Gel — ${flavour} — ${numGels} gels${acidTag(acid)}`}
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
            <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Thickener</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <Pill active={thickener === "xanthan"} onClick={() => setThickener("xanthan")}>Xanthan — pourable liquid gel</Pill>
              <Pill active={thickener === "pectin"} onClick={() => setThickener("pectin")}>Pectin — set gel</Pill>
              <Pill active={thickener === "none"} onClick={() => setThickener("none")}>None — plain syrup</Pill>
            </div>
            <div style={{ fontSize: 11.5, color: muted, fontFamily: fontBody, marginBottom: 18, lineHeight: 1.5 }}>{THICKENER_HINTS[thickener]}</div>
            <div style={{ marginBottom: 18 }}><NumberInput label="Bottle size (ml)" value={bottleMl} onChange={setBottleMl} width={160} hint="Checks whether the finished gel fits" /></div>
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
              { name: "Water", doseLabel: `${cmWaterPerGel.toFixed(1)}ml/gel`, amount: `${cmTotalWater.toFixed(0)}ml`, role: "Added TO the powder, not the reverse. Warm it to ~50°C.", format: "Liquid" },
            ]} />
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 4, fontSize: 13, fontFamily: fontBody, background: bottleHeadroom < 0 ? clayLight : "#E4EEE9", color: bottleHeadroom < 0 ? "#8A4A1E" : teal, lineHeight: 1.5 }}>
              Each gel is about {cmGelMassPerGel.toFixed(0)}g and roughly {cmGelVolumePerGel.toFixed(0)}ml, {cmCarbPctByWeight.toFixed(0)}% carbs by weight (Amacx works out at about 53-54%).{" "}
              {bottleHeadroom < 0
                ? `That is about ${Math.abs(bottleHeadroom).toFixed(0)}ml more than a ${bottleMl}ml bottle holds — use a bigger bottle or fewer carbs.`
                : `It should fit a ${bottleMl}ml bottle with about ${bottleHeadroom.toFixed(0)}ml to spare. Mix in a separate jug, then pour.`}{" "}
              The volume is an estimate (density about 1.26g/ml), not measured.
            </div>
          </Card>
          <Card title="Water to drink alongside each gel">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr>{["Target stomach concentration", "Water to drink with each gel", "Note"].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${teal}`, color: teal, fontFamily: fontBody, fontWeight: 600, fontSize: 12 }}>{h}</th>
              ))}</tr></thead>
              <tbody>{[[10, "The ~10% line we've used as a ceiling"], [12, "Middle ground"], [13.3, "About SiS's own drink-mix concentration"]].map(([pct, note], i) => (
                <tr key={pct} style={{ background: i % 2 === 0 ? paper : "#fff" }}>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 13.5, color: charcoal }}>{pct}%</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 14.5, color: teal, fontWeight: 700 }}>{waterToDrink(pct).toFixed(0)}ml</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontSize: 12.5, color: muted }}>{note}</td>
                </tr>
              ))}</tbody>
            </table>
            <p style={{ fontFamily: fontBody, fontSize: 12.5, color: muted, fontStyle: "italic", margin: "12px 0 0 0" }}>Per gel. Sip the gel and the water alternately rather than taking it in one go.</p>
          </Card>
          <Card title={thickener === "pectin" ? "2. Gel-specific base formula (pectin + calcium lactate included — this is what makes it a set gel)" : thickener === "xanthan" ? "2. Liquid-gel base formula (xanthan thickened — pours, doesn't set)" : "2. Plain syrup-gel base formula (no thickener)"}>
            <IngredientTable rows={gelSpecificRows} />
          </Card>
          {withElectrolytes && <Card title="3. Electrolytes"><IngredientTable rows={cmElectrolytePerGel} /></Card>}
          {withCaffeine && <Card title="Caffeine + L-theanine"><IngredientTable rows={cmCaffeineRows} /></Card>}
          <Card title={`Flavour — ${cmFlavour}`}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>{Object.keys(CARB_FLAVOURS).map((f) => <Pill key={f} active={cmFlavour === f} onClick={() => setCmFlavour(f)}>{f}</Pill>)}</div>
            <IngredientTable rows={cmFlavourRows} />
          </Card>
          <Card title="Mixing instructions">
            <MethodSteps steps={cmMethodSteps} />
          </Card>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AddToListButton
              label={`Carb Mix Gel — ${cmFlavour} — ${numGels} gels (${thickener})${acidTag(acid)}`}
              items={[
                ...gelSpecificRows,
                ...(withElectrolytes ? cmElectrolytePerGel : []),
                ...(withCaffeine ? cmCaffeineRows : []),
                ...cmFlavourRows,
              ].map((r) => ({ name: r.name, grams: parseG(r.amount) }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ================= PAGE: BARS =================
// ================= MACROS (typical label values per 1g of ingredient, estimates) =================
// c = carbs, p = protein, f = fat, fr = share of the carbs that reaches the gut as fructose (rest counts as glucose route).
const NUTR = [
  [/maltodextrin/i, { c: 0.95, p: 0, f: 0, fr: 0 }],
  [/^fructose/i, { c: 1.0, p: 0, f: 0, fr: 1 }],
  [/rice syrup \+ light brown sugar/i, { c: 0.8, p: 0, f: 0, fr: 0.125 }],
  [/rice syrup|extra binder/i, { c: 0.75, p: 0, f: 0, fr: 0 }],
  [/agave/i, { c: 0.76, p: 0, f: 0, fr: 0.7 }],
  [/honey/i, { c: 0.82, p: 0, f: 0, fr: 0.46 }],
  [/brown sugar|cane sugar/i, { c: 0.98, p: 0, f: 0, fr: 0.5 }],
  [/whey/i, { c: 0.06, p: 0.8, f: 0.05, fr: 0 }],
  [/egg white/i, { c: 0.05, p: 0.8, f: 0, fr: 0 }],
  [/oats/i, { c: 0.66, p: 0.13, f: 0.07, fr: 0 }],
  [/rice flour/i, { c: 0.8, p: 0.07, f: 0.01, fr: 0 }],
  [/peanut butter/i, { c: 0.12, p: 0.25, f: 0.5, fr: 0 }],
  [/almond butter/i, { c: 0.1, p: 0.21, f: 0.55, fr: 0 }],
  [/walnut/i, { c: 0.07, p: 0.15, f: 0.65, fr: 0 }],
  [/coconut oil|sunflower oil/i, { c: 0, p: 0, f: 1, fr: 0 }],
  [/lecithin/i, { c: 0, p: 0, f: 1, fr: 0 }],
  [/cocoa/i, { c: 0.25, p: 0.2, f: 0.11, fr: 0 }],
  [/chocolate/i, { c: 0.45, p: 0.06, f: 0.35, fr: 0.3 }],
  [/coconut milk powder/i, { c: 0.3, p: 0.06, f: 0.55, fr: 0 }],
  [/lime juice powder|lemon juice powder/i, { c: 0.75, p: 0.02, f: 0, fr: 0.1 }],
  [/orange peel/i, { c: 0.3, p: 0.05, f: 0.01, fr: 0.3 }],
  [/banana/i, { c: 0.88, p: 0.04, f: 0.01, fr: 0.4 }],
  [/raspberry|strawberry/i, { c: 0.65, p: 0.04, f: 0.01, fr: 0.5 }],
  [/cherry/i, { c: 0.85, p: 0.04, f: 0.01, fr: 0.45 }],
  [/apple|mango|pineapple|orange|fruit powder/i, { c: 0.85, p: 0.03, f: 0.01, fr: 0.5 }],
];
function nutrFor(name) { const hit = NUTR.find(([re]) => re.test(name)); return hit ? hit[1] : { c: 0, p: 0, f: 0, fr: 0 }; }
function computeMacros(rows, count) {
  const per = Math.max(count, 1);
  const lines = rows.map((r) => {
    const g = parseG(r.amount) / per; // grams per bar
    const n = nutrFor(r.name);
    const carbs = g * n.c;
    return { name: r.name, g, carbs, fructose: carbs * n.fr, glucose: carbs * (1 - n.fr), protein: g * n.p, fat: g * n.f };
  });
  const sum = (k) => lines.reduce((a, l) => a + l[k], 0);
  const t = { carbs: sum("carbs"), protein: sum("protein"), fat: sum("fat"), glucose: sum("glucose"), fructose: sum("fructose") };
  t.kcal = t.carbs * 4 + t.protein * 4 + t.fat * 9;
  return { lines, perBar: t };
}
function pathwayVerdict(glu, fru) {
  if (glu + fru < 1) return "Almost no carbs";
  if (fru < 0.5) return "Glucose route only. Fine under about 60g/hr, but there's no fructose to add on top.";
  const ratio = glu / fru;
  if (ratio >= 1.7 && ratio <= 2.4) return "Close to 2:1 (up to about 90g/hr).";
  if (ratio >= 1.0 && ratio < 1.7) return "In the 1:0.8 to 1.5:1 range (more fructose than 2:1, aimed at 90-120g/hr). Check gut tolerance.";
  if (ratio < 1.0) return "Fructose-heavy (more fructose than glucose). Likely to upset the gut at high rates.";
  return "Glucose-heavy (above 2:1). Fine, but it uses less of the fructose pathway.";
}

function BarsPage() {
  const [openCategory, setOpenCategory] = useState("Race");
  const [openBar, setOpenBar] = useState(null);
  const { acid } = useAcid();
  const [macroOpen, setMacroOpen] = useState({});
  const [settings, setSettings] = useState({}); // { barName: { count, targetCarbs, ratio, includeElectrolyte } }

  function getSettings(name, bar) {
    return settings[name] || { count: 1, targetCarbs: bar.defaultCarbs, ratio: "2:1", includeElectrolyte: true, wheyOn: false, wheyG: 10, proteinRatio: "2:1" };
  }
  function updateSetting(name, patch) {
    setSettings((s) => ({ ...s, [name]: { ...getSettings(name, BARS[openCategory][name]), ...patch } }));
  }

  return (
    <div>
      <PageTitle eyebrow="Step 4" sub="Click a bar to open it — set the carbs you want per bar, how many bars, and (where relevant) the carb ratio and whether electrolytes are included.">Bars</PageTitle>
      <AcidBar />
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>{Object.keys(BARS).map((cat) => <Pill key={cat} active={openCategory === cat} onClick={() => { setOpenCategory(cat); setOpenBar(null); }}>{cat}</Pill>)}</div>
      {openCategory === "Training & Recovery" && <p style={{ fontFamily: fontBody, fontSize: 13.5, color: muted, marginBottom: 16, fontStyle: "italic" }}>Snack, long-training and recovery bars. The three whey bars (Chocolate Peanut, Vanilla Cookie Dough, Raspberry Yoghurt) set their whey from a carbs-to-protein ratio: 2:1 for pure muscle recovery, 3:1 after a long run. Other bars have an optional whey add-in. Not for racing.</p>}
      {openCategory === "Waffle" && <p style={{ fontFamily: fontBody, fontSize: 13.5, color: muted, marginBottom: 16, fontStyle: "italic" }}>Stroopwafel-style — two thin biscuits with a syrup filling. Needs a pizzelle/stroopwafel iron. Softest solid to chew, proven format for a sensitive gut.</p>}

      {Object.entries(BARS[openCategory]).map(([name, bar]) => {
        const s = getSettings(name, bar);
        const scale = (s.targetCarbs / bar.defaultCarbs) * s.count;
        const { glucosePct, fructosePct } = bar.ratioAdjustable ? ratioSplit(s.ratio) : { glucosePct: null, fructosePct: null };

        const perBarAdj = applyAcidChoice(bar.perBar, acid, "g");
        const rows = perBarAdj
          .filter((ing) => !(ing.isElectrolyte && !s.includeElectrolyte))
          .map((ing) => {
            let grams = ing.g;
            if (bar.ratioAdjustable && (ing.isMalto || ing.isFructose)) {
              const maltoBase = perBarAdj.find((i) => i.isMalto).g;
              const fructoseBase = perBarAdj.find((i) => i.isFructose).g;
              const combined = maltoBase + fructoseBase;
              grams = ing.isMalto ? (combined * glucosePct) / 100 : (combined * fructosePct) / 100;
            }
            return { name: ing.name, doseLabel: `${fmtG(grams)}g / bar (base)`, amount: `${fmtG(grams * scale)}g`, role: ing.role, format: "—" };
          });
        const proteinN = s.proteinRatio === "3:1" ? 3 : 2;
        const wheyPerBar = bar.wheyBar ? s.targetCarbs / proteinN / 0.8 : 0;
        if (bar.wheyBar) rows.push({ name: "Vanilla whey protein powder", doseLabel: `${fmtG(wheyPerBar)}g / bar at ${s.proteinRatio}`, amount: `${fmtG(wheyPerBar * s.count)}g`, role: `Sets carbs:protein at ${s.proteinRatio} (assumes 80% protein). Add after the syrup cools.`, format: "Powder" });
        if (bar.wheyOk && s.wheyOn) rows.push({ name: "Vanilla whey protein powder", doseLabel: `${fmtG(s.wheyG)}g / bar`, amount: `${fmtG(s.wheyG * s.count)}g`, role: "Optional protein. Not scaled with carbs. Add dry, after the syrup has cooled.", format: "Powder" });
        if (bar.wheyOk && s.wheyOn && s.wheyG > 10) rows.push({ name: "Extra binder (rice syrup or nut butter)", doseLabel: `${fmtG((s.wheyG - 10) * 0.4)}g / bar`, amount: `${fmtG((s.wheyG - 10) * 0.4 * s.count)}g`, role: "Estimate only: high whey dries the dough out. Add as needed, adds some carbs.", format: "Syrup / spread" });
        const wheyMethod = bar.wheyOk && s.wheyOn ? [`Whey: whisk the ${fmtG(s.wheyG)}g per bar of vanilla whey into the dry ingredients, or fold it in once the syrup or caramel has cooled below about 60°C. Hot syrup can make whey clump. If the dough turns dry or crumbly, work in a teaspoon of warm water or rice syrup at a time.`] : [];

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
            {bar.wheyBar && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Carbs : protein ratio</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Pill active={s.proteinRatio === "2:1"} onClick={() => updateSetting(name, { proteinRatio: "2:1" })}>2:1 pure muscle recovery</Pill>
                  <Pill active={s.proteinRatio === "3:1"} onClick={() => updateSetting(name, { proteinRatio: "3:1" })}>3:1 post long run</Pill>
                </div>
                <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, fontStyle: "italic", margin: "8px 0 0 0" }}>{`At ${s.targetCarbs}g carbs this gives about ${fmtG(s.targetCarbs / proteinN)}g protein (${fmtG(wheyPerBar)}g whey) per bar. Ratios are your targets, not tested recipes. Contains milk.`}</p>
              </div>
            )}
            {bar.wheyOk && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Add vanilla whey protein?</div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <Pill active={!s.wheyOn} onClick={() => updateSetting(name, { wheyOn: false })}>No</Pill>
                  <Pill active={s.wheyOn} onClick={() => updateSetting(name, { wheyOn: true })}>Yes</Pill>
                  {s.wheyOn && <Pill active={s.wheyG === 12.5} onClick={() => updateSetting(name, { wheyG: 12.5 })}>10g protein</Pill>}
                  {s.wheyOn && <Pill active={s.wheyG === 25} onClick={() => updateSetting(name, { wheyG: 25 })}>20g protein</Pill>}
                  {s.wheyOn && <NumberInput label="Whey per bar (g)" value={s.wheyG} onChange={(v) => updateSetting(name, { wheyG: v })} width={150} hint={`about ${fmtG(s.wheyG * 0.8)}g protein per bar (assumes 80% protein)`} />}
                </div>
                {s.wheyOn && <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, fontStyle: "italic", margin: "8px 0 0 0" }}>Presets: 10g protein = 12.5g whey, 20g protein = 25g whey. 20g protein is a big load of whey in one bar: it comes out drier, chalkier and heavier, so expect to add binder. Not for race bars: protein slows gastric emptying. Contains milk. Starting amounts, not tested against these recipes.</p>}
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <Pill active={!!macroOpen[name]} onClick={() => setMacroOpen((m) => ({ ...m, [name]: !m[name] }))}>{macroOpen[name] ? "Hide macros and carb split" : "Show macros and carb split"}</Pill>
            </div>
            <div style={{ marginBottom: 20 }}><IngredientTable rows={rows} /></div>
            {macroOpen[name] && (() => {
              const mac = computeMacros(rows, s.count);
              const b = mac.perBar, k = Math.max(s.count, 1);
              const f1 = (x) => x.toFixed(1);
              const th = { textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${line}`, color: teal, fontWeight: 600 };
              const td = { padding: "6px 8px", borderBottom: `1px solid ${line}` };
              const ratioTxt = b.fructose >= 0.5 ? `${(b.glucose / b.fructose).toFixed(1)} : 1` : "no fructose";
              return (
                <div style={{ border: `1px solid ${line}`, borderRadius: 8, padding: 14, marginBottom: 20, fontFamily: fontBody, fontSize: 13 }}>
                  <h4 style={{ fontFamily: fontDisplay, fontSize: 15, color: teal, margin: "0 0 10px 0" }}>Macros and carb split</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
                    <thead><tr><th style={th}></th><th style={th}>Per bar</th><th style={th}>Total ({s.count} bar{s.count === 1 ? "" : "s"})</th></tr></thead>
                    <tbody>
                      <tr><td style={td}>Energy</td><td style={td}>{Math.round(b.kcal)} kcal</td><td style={td}>{Math.round(b.kcal * k)} kcal</td></tr>
                      <tr><td style={td}>Carbohydrate</td><td style={td}>{f1(b.carbs)}g</td><td style={td}>{f1(b.carbs * k)}g</td></tr>
                      <tr><td style={td}>Protein</td><td style={td}>{f1(b.protein)}g</td><td style={td}>{f1(b.protein * k)}g</td></tr>
                      <tr><td style={td}>Fat</td><td style={td}>{f1(b.fat)}g</td><td style={td}>{f1(b.fat * k)}g</td></tr>
                      <tr><td style={td}>Glucose route (maltodextrin, syrups, starch)</td><td style={td}>{f1(b.glucose)}g</td><td style={td}>{f1(b.glucose * k)}g</td></tr>
                      <tr><td style={td}>Fructose route (fructose, agave, honey, fruit, sucrose half)</td><td style={td}>{f1(b.fructose)}g</td><td style={td}>{f1(b.fructose * k)}g</td></tr>
                    </tbody>
                  </table>
                  <p style={{ margin: "0 0 12px 0", color: teal, fontWeight: 600 }}>Glucose : fructose = {ratioTxt}. {pathwayVerdict(b.glucose, b.fructose)}</p>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
                    <thead><tr><th style={th}>Ingredient</th><th style={th}>Carbs / bar</th><th style={th}>Glucose route</th><th style={th}>Fructose route</th></tr></thead>
                    <tbody>
                      {mac.lines.filter((l) => l.carbs > 0.05).map((l, i) => (
                        <tr key={i}><td style={td}>{l.name}</td><td style={td}>{f1(l.carbs)}g</td><td style={td}>{f1(l.glucose)}g</td><td style={td}>{f1(l.fructose)}g</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ margin: 0, fontSize: 12, color: muted, fontStyle: "italic" }}>Estimated from typical label values for each ingredient, not lab-tested, so weigh a batch and check against your own labels. Calculated carbs can differ from the "{s.targetCarbs}g carbs" target. Fibre is not subtracted. Sucrose (brown sugar) counts as half glucose, half fructose. Lactose in whey counts on the glucose route.</p>
                </div>
              );
            })()}
            <div>
              <h4 style={{ fontFamily: fontDisplay, fontSize: 15, color: teal, margin: "0 0 12px 0" }}>Method</h4>
              <MethodSteps steps={[...bar.method, ...wheyMethod]} />
              <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, fontStyle: "italic", margin: "4px 0 0 0" }}>The steps name citric acid, the standard. If you've changed the acid setting above, follow the ingredient table.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <AddToListButton
                label={`${name} — ${s.count} bar(s) @ ${s.targetCarbs}g carbs${bar.wheyBar ? ` @ ${s.proteinRatio} carb:protein` : bar.wheyOk && s.wheyOn ? " + whey" : ""}${acidTag(acid)}`}
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
  const { acid } = useAcid();
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
      <AcidBar />
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 20, color: teal, marginBottom: 14 }}>{group.label}</h2>
          {Object.entries(group.data).map(([name, ingredients]) => {
            const key = `${group.label}::${name}`;
            return (
              <Accordion key={key} title={name} open={openKey === key} onToggle={() => setOpenKey(openKey === key ? null : key)}>
                <IngredientTable rows={applyAcidChoice(ingredients, acid).map((f) => ({ name: f.name, doseLabel: group.doseNote(+f.dose.toFixed(3)), amount: `${+f.dose.toFixed(3)}g base dose`, role: f.role, format: f.format }))} />
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
  const { batches, removeBatch, clearAll, checked, toggleChecked, overrides, setOverride, updateItemGrams } = list;

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
          <Card title="What's been added — edit any amount directly">
            <p style={{ fontFamily: fontBody, fontSize: 13, color: muted, marginTop: 0, marginBottom: 16 }}>Each recipe you added, broken out by ingredient. Change any gram amount here and it feeds straight into the order summary below.</p>
            {batches.map((b) => (
              <div key={b.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontFamily: fontDisplay, fontSize: 15.5, fontWeight: 600, color: teal }}>{b.label}</div>
                  <button onClick={() => removeBatch(b.id)} style={{ padding: "6px 12px", borderRadius: 4, border: `1px solid ${line}`, background: "transparent", color: clay, fontFamily: fontBody, fontSize: 12.5, cursor: "pointer" }}>Remove</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <tbody>
                    {b.items.map((it) => (
                      <tr key={it.name}>
                        <td style={{ padding: "6px 10px 6px 0", fontFamily: fontBody, color: charcoal }}>{it.name}</td>
                        <td style={{ padding: "6px 0", textAlign: "right" }}>
                          <input
                            type="number"
                            value={it.grams}
                            onChange={(e) => updateItemGrams(b.id, it.name, Number(e.target.value) || 0)}
                            style={{ width: 90, padding: "6px 8px", border: `1px solid ${line}`, borderRadius: 4, fontFamily: fontMono, fontSize: 13, color: teal, background: paper, textAlign: "right" }}
                          />
                          <span style={{ fontFamily: fontMono, fontSize: 12.5, color: muted, marginLeft: 6 }}>g</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button onClick={clearAll} style={{ padding: "8px 16px", borderRadius: 6, border: `1px solid ${clay}`, background: "transparent", color: clay, fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Clear entire list</button>
          </Card>

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
            <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, marginBottom: 0, fontStyle: "italic" }}>Editing a total here is a one-off override for this ingredient's grand total. To adjust one specific recipe's contribution instead, edit it directly in "What's been added" above.</p>
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
    <AcidProvider>
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
    </AcidProvider>
    </ShoppingListProvider>
  );
}
