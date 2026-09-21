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
  return (
    <div style={{ background: clayLight, border: `1px solid ${clay}`, borderRadius: 6, padding: "14px 18px", marginBottom: 18, fontFamily: fontBody, fontSize: 13.5, color: "#8A4A1E", lineHeight: 1.55 }}>
      {children}
    </div>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 20, border: `1px solid ${active ? teal : line}`,
      background: active ? teal : "transparent", color: active ? "#fff" : charcoal,
      fontFamily: fontBody, fontSize: 13.5, fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease",
    }}>{children}</button>
  );
}

function NumberInput({ label, value, onChange, width = 160, hint }) {
  return (
    <div>
      <label style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width, padding: "10px 12px", border: `1px solid ${line}`, borderRadius: 4, fontFamily: fontMono, fontSize: 16, color: teal, background: paper }} />
      {hint && <div style={{ fontSize: 11.5, color: muted, fontFamily: fontBody, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function IngredientTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead><tr>{["Ingredient", "Dose spec", "Amount for this batch", "Role", "Format"].map((h, i) => (
        <th key={i} style={{ textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${teal}`, color: teal, fontFamily: fontBody, fontWeight: 600, fontSize: 12 }}>{h}</th>
      ))}</tr></thead>
      <tbody>{rows.map((r, i) => {
        const critical = r.role && r.role.includes("⚠️");
        const adjusted = r.role && r.role.includes("★");
        return (
          <tr key={i} style={{ background: critical ? clayLight : adjusted ? "#E4EEE9" : i % 2 === 0 ? paper : "#fff" }}>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontWeight: 600, fontSize: 13.5, color: charcoal }}>{r.name}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 13, color: muted }}>{r.doseLabel}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontMono, fontSize: 14.5, color: teal, fontWeight: 700 }}>{r.amount}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontSize: 12.5, color: critical ? "#8A4A1E" : charcoal }}>{r.role}</td>
            <td style={{ padding: "9px 10px", borderBottom: `1px solid ${line}`, fontFamily: fontBody, fontSize: 12.5, color: muted }}>{r.format}</td>
          </tr>
        );
      })}</tbody>
    </table>
  );
}

function MethodSteps({ steps }) {
  return (
    <div>{steps.map((s, i) => (
      <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div style={{ minWidth: 26, height: 26, borderRadius: "50%", background: teal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontMono, fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
        <div style={{ fontFamily: fontBody, fontSize: 14, lineHeight: 1.55, color: charcoal }}>{s}</div>
      </div>
    ))}</div>
  );
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

// ================= DATA: CARB MIX FLAVOURS (sweet, per 100g base powder) =================
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

// ================= DATA: SAVOURY FLAVOURS (per serving) =================
// saltIndex marks the ingredient that should reduce if race electrolytes are already in the mix.
const SAVOURY_FLAVOURS = {
  "Miso & Ginger": { category: "savoury", ingredients: [
    { name: "Miso powder (freeze-dried)", dose: 3.00, role: "Umami + savoury body", format: "Powder" },
    { name: "Ginger extract (5% gingerols)", dose: 0.30, role: "⚠️ Genuinely anti-nausea — standardised only", format: "Powder" },
    { name: "Nutritional yeast (milled)", dose: 0.80, role: "Umami depth (glutamates)", format: "Powder" },
    { name: "Shiitake mushroom powder", dose: 0.50, role: "Umami synergy", format: "Powder" },
    { name: "White pepper", dose: 0.05, role: "Gentle heat", format: "Powder" },
    { name: "L-Malic acid", dose: 0.15, role: "Light acidity", format: "Powder" },
  ], saltIngredientIndex: null },
  "Cucumber, Mint & Sea Salt": { category: "savoury", ingredients: [
    { name: "Freeze-dried cucumber powder", dose: 2.50, role: "Fresh, clean base", format: "Powder, no carrier" },
    { name: "Spearmint powder", dose: 0.40, role: "⚠️ Spearmint not peppermint — reflux risk", format: "Powder" },
    { name: "Sea salt flakes (extra)", dose: 0.30, role: "Savoury lift", format: "Powder" },
    { name: "L-Malic acid", dose: 0.25, role: "Light tartness", format: "Powder" },
    { name: "Lime juice powder (optional)", dose: 0.30, role: "Brightness", format: "Powder" },
  ], saltIngredientIndex: 2 },
  "Salted Watermelon": { category: "savoury", ingredients: [
    { name: "Freeze-dried watermelon powder", dose: 3.50, role: "Primary flavour", format: "Powder, no carrier" },
    { name: "Sea salt flakes (extra)", dose: 0.40, role: "The hero ingredient", format: "Powder" },
    { name: "L-Malic acid", dose: 0.30, role: "Watermelon's natural acid", format: "Powder" },
    { name: "Stevia extract", dose: 0.02, role: "MINIMAL — do not increase", format: "Powder" },
    { name: "Lime juice powder (optional)", dose: 0.30, role: "Brightness", format: "Powder" },
  ], saltIngredientIndex: 1 },
};

// ================= DATA: ELECTROLYTE FLAVOURS (per sachet) =================
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

// ================= DATA: PUREFRUIT GEL FLAVOURS (per gel) =================
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

// ================= DATA: ELECTROLYTE BASE (element mg → approximate compound conversion) =================
const PCT_ACTIVE = { Na_citrate: 0.267, Na_salt: 0.393, K_citrate: 0.362, Mg_malate: 0.123, Ca_carbonate: 0.40, Zn_citrate: 0.31 };

function dailyBase() {
  return [
    { name: "Himalayan salt (fine)", mg: 500, el: "Na", pct: PCT_ACTIVE.Na_salt, role: "Primary sodium" },
    { name: "Potassium citrate", mg: 300, el: "K", pct: PCT_ACTIVE.K_citrate, role: "Potassium" },
    { name: "Magnesium malate", mg: 200, el: "Mg", pct: PCT_ACTIVE.Mg_malate, role: "Highest dose in the range — daily use only" },
    { name: "Calcium carbonate", mg: 100, el: "Ca", pct: PCT_ACTIVE.Ca_carbonate, role: "Once-daily calcium" },
    { name: "Zinc citrate", mg: 5, el: "Zn", pct: PCT_ACTIVE.Zn_citrate, role: "Immune / recovery support" },
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
  ];
}

// ================= DATA: BARS =================
const BARS = {
  Race: {
    "Natural": { badge: "35g carbs · lowest GI risk of the race set, but highest fibre — training bar", perBar: [
      { name: "Rice syrup", g: 28, role: "Binder + primary carb" }, { name: "Low-fibre oats (quick oats)", g: 14, role: "Chew matrix" },
      { name: "Rice flour", g: 6, role: "Structure" }, { name: "Freeze-dried apple powder", g: 4, role: "Real flavour" },
      { name: "Sunflower oil", g: 3, role: "Texture" }, { name: "L-Malic acid", g: 0.5, role: "Cut sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward" }, { name: "Sunflower lecithin", g: 0.3, role: "Bind phases" },
    ], method: ["Warm rice syrup in a pan to ~50°C — pourable, not boiling.", "Toast oats lightly in a dry pan 3-4 min, cool slightly.", "Pour warm syrup over oats, stir to coat.", "Fold in rice flour, apple powder, malic acid, electrolyte premix, lecithin.", "Add sunflower oil to loosen if too stiff.", "Press hard into a lined tray, ~1.5cm thick.", "Chill 2-3 hours until firm, then cut and wrap."] },
    "Performance": { badge: "44g carbs · true 1:0.8 ratio · the direct Maurten analog", perBar: [
      { name: "Rice syrup", g: 20, role: "Binder + carb" }, { name: "Maltodextrin", g: 13, role: "Carb payload" },
      { name: "Fructose", g: 10, role: "Carb payload — 1:0.8 ratio" }, { name: "Low-fibre oats", g: 8, role: "Minimal chew matrix" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Sunflower oil", g: 2.5, role: "Texture" },
      { name: "L-Malic acid", g: 0.6, role: "Cuts Maurten-style sweetness" }, { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward" },
      { name: "Sunflower lecithin", g: 0.3, role: "Bind phases" },
    ], method: ["Warm rice syrup to ~50°C.", "Whisk maltodextrin, fructose, rice flour, malic acid, electrolyte premix and lecithin together dry.", "Combine warm syrup with the dry mix and the oats — fold to a stiff dough.", "Add oil if needed to loosen.", "Press hard into a lined tray, ~1.5cm thick.", "Chill 2-3 hours, cut, wrap."] },
    "Hybrid": { badge: "42g carbs · best all-round chew · recommended lead variant", perBar: [
      { name: "Rice syrup", g: 22, role: "Binder + carb" }, { name: "Maltodextrin", g: 9, role: "Carb payload" },
      { name: "Fructose", g: 7, role: "Carb payload — 1:0.8 ratio" }, { name: "Low-fibre oats", g: 12, role: "Satisfying chew" },
      { name: "Rice flour", g: 5, role: "Structure" }, { name: "Freeze-dried apple powder", g: 3, role: "Real flavour" },
      { name: "Sunflower oil", g: 2.5, role: "Texture" }, { name: "L-Malic acid", g: 0.5, role: "Cut sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward" },
    ], method: ["Warm rice syrup to ~50°C.", "Toast oats lightly, cool.", "Combine syrup, oats, dry malto/fructose mix, fruit powder, malic acid and electrolyte premix.", "Fold to a stiff dough, loosen with oil if needed.", "Press hard into a lined tray, chill 2-3 hours.", "Cut and wrap."] },
    "Nougat": { badge: "40g carbs · fastest emptying · best choice for a sensitive gut", perBar: [
      { name: "Rice syrup", g: 18, role: "Base syrup — whipped hot into whites" }, { name: "Honey (or extra rice syrup)", g: 10, role: "Traditional flavour + carbs" },
      { name: "Maltodextrin", g: 8, role: "Carb payload" }, { name: "Fructose", g: 6, role: "Carb payload" },
      { name: "Egg white powder (or aquafaba)", g: 3, role: "The aeration" }, { name: "Rice flour", g: 4, role: "Light structure" },
      { name: "Freeze-dried fruit powder", g: 3, role: "Flavour" }, { name: "L-Malic acid", g: 0.5, role: "Cut honey sweetness" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Sodium-forward" },
    ], method: ["Whip rehydrated egg white powder (or aquafaba) to stiff peaks.", "Heat rice syrup + honey to ~120-130°C (soft-ball) with a sugar thermometer.", "Slowly pour hot syrup into whites while whipping. Whip 3-5 min until glossy.", "Quickly fold in malto, fructose, rice flour, electrolyte premix, malic acid, fruit powder.", "Spread onto edible rice paper in a lined tray, top with a second sheet, press flat.", "Set at room temp 4-6 hours — do NOT refrigerate.", "Cut through the rice paper into bars."] },
  },
  Training: {
    "Peanut Butter & Jam": { badge: "The universal crowd-pleaser — real fruit, real peanut butter", perBar: [
      { name: "Peanut butter (smooth)", g: 20, role: "Primary flavour + fat + protein" }, { name: "Rice syrup", g: 18, role: "Binder" },
      { name: "Quick oats", g: 12, role: "Texture" }, { name: "Freeze-dried raspberry or strawberry powder", g: 4, role: "The 'jam' layer" },
      { name: "Rice flour", g: 4, role: "Structure" }, { name: "Himalayan salt", g: 0.4, role: "Classic salty-peanut lift" },
    ], method: ["Warm rice syrup, mix in peanut butter until smooth.", "Fold in oats, rice flour and salt.", "Press half the mix into a lined tray.", "Spread the fruit powder mixed with a splash of water as a jam layer.", "Top with remaining mix, press flat, chill and cut."] },
    "Salted Caramel & Pretzel": { badge: "Same browning trick as the neutral caramel waffle — real caramel, nothing added", perBar: [
      { name: "Rice syrup + light brown sugar", g: 22, role: "The caramel — cooked to light amber" }, { name: "Crushed pretzels", g: 10, role: "Crunch + salt" },
      { name: "Quick oats", g: 10, role: "Structure" }, { name: "Rice flour", g: 4, role: "Structure" },
      { name: "Himalayan salt (extra)", g: 0.5, role: "Salted caramel is salt-forward" }, { name: "Vanilla", g: 0.2, role: "Rounds the caramel" },
    ], method: ["Cook rice syrup + brown sugar to ~118-120°C — light amber, watch closely.", "Off heat, stir in vanilla and salt.", "Fold in oats, rice flour and crushed pretzel — work quickly before it sets.", "Press into a lined tray, chill, cut."] },
    "Double Chocolate & Cherry": { badge: "Real chocolate chunks — the texture the race bars can't use", perBar: [
      { name: "Rice syrup", g: 18, role: "Binder" }, { name: "Dark chocolate chunks", g: 12, role: "Real chocolate, genuine indulgence" },
      { name: "Tart cherry powder", g: 6, role: "Ties to the Recovery Bar family" }, { name: "Quick oats", g: 10, role: "Structure" },
      { name: "Cocoa (fat-reduced)", g: 4, role: "Deepens the chocolate" }, { name: "L-Malic acid", g: 0.3, role: "Balances cherry + chocolate sweetness" },
    ], method: ["Warm rice syrup, stir in cocoa and malic acid.", "Fold in oats, tart cherry powder and chocolate chunks.", "Press into a lined tray while chunks are still distinct — don't overmix.", "Chill and cut."] },
  },
  Recovery: {
    "High Protein — Original": { badge: "77g bar · 31g protein · 22g carbs — repair & satiety focus", perBar: [
      { name: "Pea protein isolate", g: 25, role: "Primary protein" }, { name: "Rice protein", g: 8, role: "Amino acid complement" },
      { name: "Almond butter", g: 15, role: "Fat, binding, satiety" }, { name: "Rice syrup", g: 10, role: "Binder" },
      { name: "Quick oats", g: 10, role: "Texture" }, { name: "Dark chocolate chips or cocoa", g: 8, role: "Masks plain protein taste" },
      { name: "Himalayan salt", g: 0.5, role: "Post-exercise sodium" }, { name: "Vanilla extract", g: 0.3, role: "Rounds the flavour" },
    ], method: ["Mix almond butter and rice syrup until smooth.", "Fold in pea protein, rice protein, oats, cocoa, salt, vanilla.", "Press into a lined tray — this dough is denser, press firmly.", "Chill at least 1 hour before cutting."] },
    "High Protein — Chocolate Peanut Butter": { badge: "Home-snacking flavour — swaps almond butter for peanut, doubles down on chocolate", perBar: [
      { name: "Pea protein isolate", g: 25, role: "Primary protein" }, { name: "Rice protein", g: 8, role: "Amino acid complement" },
      { name: "Peanut butter", g: 15, role: "Fat, binding, classic pairing with chocolate" }, { name: "Rice syrup", g: 10, role: "Binder" },
      { name: "Quick oats", g: 10, role: "Texture" }, { name: "Dark chocolate chunks", g: 10, role: "Real chocolate, not just cocoa" },
      { name: "Himalayan salt", g: 0.5, role: "Post-exercise sodium + lifts the peanut butter" },
    ], method: ["Mix peanut butter and rice syrup until smooth.", "Fold in pea protein, rice protein, oats and salt.", "Fold in chocolate chunks last, keeping them distinct.", "Press firmly into a lined tray, chill at least 1 hour, cut."] },
    "High Protein — Berry": { badge: "Home-snacking flavour — fruitier, lighter than the chocolate variants", perBar: [
      { name: "Pea protein isolate", g: 25, role: "Primary protein" }, { name: "Rice protein", g: 8, role: "Amino acid complement" },
      { name: "Almond butter", g: 12, role: "Fat, binding" }, { name: "Rice syrup", g: 10, role: "Binder" },
      { name: "Quick oats", g: 10, role: "Texture" }, { name: "Freeze-dried mixed berry powder", g: 6, role: "Real fruit flavour" },
      { name: "L-Malic acid", g: 0.3, role: "Balances the protein powder's flatness" }, { name: "Himalayan salt", g: 0.4, role: "Post-exercise sodium" },
    ], method: ["Mix almond butter and rice syrup until smooth.", "Fold in pea protein, rice protein, oats, berry powder, malic acid and salt.", "Press firmly into a lined tray, chill at least 1 hour, cut."] },
    "Recovery — Black Forest (3:1)": { badge: "100g bar · glycogen-priority ratio — the original recovery flavour", perBar: [
      { name: "Rice syrup", g: 25, role: "Carb base" }, { name: "Maltodextrin", g: 15, role: "Carb payload" },
      { name: "Fructose", g: 10, role: "Carb payload" }, { name: "Pea protein isolate", g: 20, role: "Primary protein" },
      { name: "Rice protein", g: 8, role: "Amino acid complement" }, { name: "Tart cherry powder", g: 5, role: "Anti-inflammatory recovery ingredient" },
      { name: "Quick oats", g: 10, role: "Structure" }, { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Post-exercise fluid retention" },
      { name: "L-Malic acid", g: 0.4, role: "Cut sweetness" }, { name: "Cocoa (fat-reduced)", g: 5, role: "Black Forest direction with the cherry" },
    ], method: ["Warm rice syrup.", "Whisk maltodextrin, fructose, pea protein, rice protein, tart cherry, cocoa, malic acid and electrolyte premix dry.", "Combine with warm syrup and oats, fold to a cohesive dough.", "Press into a large lined tray — bigger format than the race bars.", "Chill at least 1 hour, cut into large blocks."] },
    "Recovery — Mocha (3:1)": { badge: "Home-snacking flavour — coffee note for an afternoon recovery snack", perBar: [
      { name: "Rice syrup", g: 25, role: "Carb base" }, { name: "Maltodextrin", g: 15, role: "Carb payload" },
      { name: "Fructose", g: 10, role: "Carb payload" }, { name: "Pea protein isolate", g: 20, role: "Primary protein" },
      { name: "Rice protein", g: 8, role: "Amino acid complement" }, { name: "Instant espresso powder", g: 2, role: "Coffee note — omit for an evening snack" },
      { name: "Cocoa (fat-reduced)", g: 6, role: "Mocha direction" }, { name: "Quick oats", g: 10, role: "Structure" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Post-exercise fluid retention" }, { name: "L-Malic acid", g: 0.3, role: "Cut sweetness" },
    ], method: ["Warm rice syrup.", "Whisk maltodextrin, fructose, pea protein, rice protein, espresso powder, cocoa, malic acid and electrolyte premix dry.", "Combine with warm syrup and oats, fold to a cohesive dough.", "Press into a large lined tray, chill at least 1 hour, cut."] },
    "Recovery — Apple Cinnamon (3:1)": { badge: "Home-snacking flavour — lighter, no chocolate, good for an evening snack", perBar: [
      { name: "Rice syrup", g: 25, role: "Carb base" }, { name: "Maltodextrin", g: 15, role: "Carb payload" },
      { name: "Fructose", g: 10, role: "Carb payload" }, { name: "Pea protein isolate", g: 20, role: "Primary protein" },
      { name: "Rice protein", g: 8, role: "Amino acid complement" }, { name: "Freeze-dried apple powder", g: 6, role: "Real fruit flavour" },
      { name: "Cinnamon", g: 0.3, role: "Warmth" }, { name: "Quick oats", g: 10, role: "Structure" },
      { name: "Electrolyte premix (no Mg)", g: 1.5, role: "Post-exercise fluid retention" }, { name: "L-Malic acid", g: 0.4, role: "Apple's natural acid, cuts sweetness" },
    ], method: ["Warm rice syrup.", "Whisk maltodextrin, fructose, pea protein, rice protein, apple powder, cinnamon, malic acid and electrolyte premix dry.", "Combine with warm syrup and oats, fold to a cohesive dough.", "Press into a large lined tray, chill at least 1 hour, cut."] },
  },
};

// ================= HELPERS =================
function compoundGrams(mg, pct) { return mg / pct / 1000; }

function cumulativeMgWarning(magnesiumMgPerSachet, sachets) {
  const total = magnesiumMgPerSachet * sachets;
  if (total > 1600) return { level: "high", text: `${total.toFixed(0)}mg magnesium across ${sachets} sachets — over the ~1,600mg threshold where laxative effect becomes a real risk. Consider skipping a sachet or two, or switching to Pure Electrolyte (no Mg) for some hours.` };
  if (total > 1200) return { level: "moderate", text: `${total.toFixed(0)}mg magnesium across ${sachets} sachets — approaching the level where GI sensitivity can appear. Fine for most people, worth knowing if you're prone to a sensitive gut late in a race.` };
  return null;
}

// ================= PAGE: CARB MIX =================
function CarbMixPage() {
  const [batchG, setBatchG] = useState(750);
  const [ratio, setRatio] = useState("2:1");
  const [withElectrolytes, setWithElectrolytes] = useState(false);
  const [carbsPerServing, setCarbsPerServing] = useState(90);
  const [flavourCategory, setFlavourCategory] = useState("sweet");
  const [flavour, setFlavour] = useState("Apple");
  const [raceSodiumMg, setRaceSodiumMg] = useState(1000);

  const flavourSet = flavourCategory === "sweet" ? CARB_FLAVOURS : SAVOURY_FLAVOURS;
  const flavourNames = Object.keys(flavourSet);
  const flavourData = flavourSet[flavour] || flavourSet[flavourNames[0]];

  const r = ratio === "2:1" ? 2 : 1.25;
  const glucosePct = (r / (r + 1)) * 100;
  const fructosePct = 100 - glucosePct;
  const malto = (batchG * glucosePct) / 100;
  const fructose = (batchG * fructosePct) / 100;
  const servings = carbsPerServing > 0 ? batchG / carbsPerServing : 0;

  const baseRows = [
    { name: "Maltodextrin (DE 18-20)", doseLabel: `${glucosePct.toFixed(1)}%`, amount: `${malto.toFixed(1)}g`, role: "Primary carb — SGLT1 transporter", format: "Powder" },
    { name: "Fructose (crystalline)", doseLabel: `${fructosePct.toFixed(1)}%`, amount: `${fructose.toFixed(1)}g`, role: "GLUT5 — essential above 60g/hr", format: "Powder" },
    { name: "LM Pectin NH", doseLabel: "1%", amount: `${(batchG * 0.01).toFixed(1)}g`, role: "⚠️ Must be low-methoxyl — gels with calcium lactate", format: "Powder" },
    { name: "Calcium lactate", doseLabel: "0.3%", amount: `${(batchG * 0.003).toFixed(1)}g`, role: "Activates pectin cross-link", format: "Powder" },
    { name: "Ascorbic acid", doseLabel: "0.1%", amount: `${(batchG * 0.001).toFixed(1)}g`, role: "Antioxidant, shelf-life", format: "Powder" },
    { name: "Sunflower lecithin", doseLabel: "0.2%", amount: `${(batchG * 0.002).toFixed(1)}g`, role: "Wetting agent — cold-water mixability", format: "Powder" },
    { name: "Silicon dioxide", doseLabel: "0.1%", amount: `${(batchG * 0.001).toFixed(1)}g`, role: "Anti-caking", format: "Powder" },
  ];

  const electrolyteRows = withElectrolytes
    ? raceBase(raceSodiumMg).map((e) => {
        const compoundG = compoundGrams(e.mg, e.pct);
        const total = e.el === "extract" ? (e.mg / 1000) * servings : compoundG * servings;
        return { name: e.name, doseLabel: `${e.mg}mg ${e.el}/serve`, amount: `${total.toFixed(2)}g`, role: e.role, format: "Powder" };
      })
    : [];

  // Flavour rows with electrolyte-interaction adjustment
  const flavourRows = (flavourData.ingredients || []).map((f, idx) => {
    let dose = f.dose;
    let role = f.role;
    if (withElectrolytes && flavourData.category === "savoury" && idx === flavourData.saltIngredientIndex) {
      dose = dose * 0.5;
      role = "★ Halved — race electrolyte sodium already covers much of this job";
    }
    const basis = flavourData.category === "sweet" ? batchG / 100 : servings;
    const amount = dose * basis;
    return { name: f.name, doseLabel: `${f.dose}g ${flavourData.category === "sweet" ? "/100g" : "/serve"}`, amount: `${amount.toFixed(2)}g`, role, format: f.format };
  });

  const sweetExtraStevia = withElectrolytes && flavourData.category === "sweet" && !flavourData.ingredients.some((f) => f.name.includes("Stevia"));

  const magWarning = withElectrolytes ? cumulativeMgWarning(80, servings) : null;

  return (
    <div>
      <PageTitle eyebrow="Step 1" sub="Set your batch, your own serving size, a ratio, whether race electrolytes ride along, then a flavour — sweet or savoury. Everything below updates live.">
        Carb Mix Builder
      </PageTitle>

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

        <div style={{ marginBottom: withElectrolytes ? 18 : 4 }}>
          <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Race electrolytes in this batch?</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Pill active={!withElectrolytes} onClick={() => setWithElectrolytes(false)}>No — separate bottle</Pill>
            <Pill active={withElectrolytes} onClick={() => setWithElectrolytes(true)}>Yes — combine into this mix</Pill>
          </div>
        </div>

        {withElectrolytes && (
          <NumberInput label="Total sodium target (mg per serving)" value={raceSodiumMg} onChange={setRaceSodiumMg} width={220} hint="Default 1000mg for hot/long races. Drop to 750mg or lower for cooler, shorter efforts." />
        )}
      </Card>

      <Card title="1. Base carb formula">
        <IngredientTable rows={baseRows} />
      </Card>

      {withElectrolytes && (
        <>
          <Card title="2. Race electrolytes (scaled to your servings)">
            <IngredientTable rows={electrolyteRows} />
            <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, fontStyle: "italic" }}>Element-to-compound conversion is approximate — verify against a CoA before a production batch.</p>
          </Card>
          <Card title="Why two sodium sources, not one?">
            <p style={{ fontFamily: fontBody, fontSize: 14, lineHeight: 1.6, color: charcoal, margin: 0 }}>
              Tri-sodium citrate is alkalising — it buffers, tastes softer, and contributes sodium without a harsh salty edge.
              Himalayan salt (sodium chloride) is what actually drives SGLT1, the transporter that co-carries glucose,
              sodium and water across the gut wall — the mechanism behind faster absorption. Splitting the dose 50/50 gets
              the buffering and flavour benefit of citrate alongside the direct absorption-driving effect of real salt,
              rather than leaning on just one.
            </p>
          </Card>
          {magWarning && <Warn>⚠️ {magWarning.text}</Warn>}
        </>
      )}

      <Card title={`${withElectrolytes ? "3" : "2"}. Flavour`}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <Pill active={flavourCategory === "sweet"} onClick={() => { setFlavourCategory("sweet"); setFlavour(Object.keys(CARB_FLAVOURS)[0]); }}>Sweet</Pill>
          <Pill active={flavourCategory === "savoury"} onClick={() => { setFlavourCategory("savoury"); setFlavour(Object.keys(SAVOURY_FLAVOURS)[0]); }}>Savoury</Pill>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {flavourNames.map((f) => <Pill key={f} active={flavour === f} onClick={() => setFlavour(f)}>{f}</Pill>)}
        </div>
        <IngredientTable rows={flavourRows} />
        {sweetExtraStevia && (
          <p style={{ fontFamily: fontBody, fontSize: 12.5, color: clay, marginTop: 12, fontWeight: 600 }}>
            ★ Salt from the electrolytes will dull this flavour's fruit notes slightly. Consider adding a trace (~0.01-0.02g/100g) of stevia if it tastes flatter than expected once mixed.
          </p>
        )}
        {flavourCategory === "savoury" && withElectrolytes && (
          <p style={{ fontFamily: fontBody, fontSize: 12.5, color: clay, marginTop: 12, fontWeight: 600 }}>
            ★ Savoury and race electrolytes are naturally complementary — the added salt line above has already been halved to avoid over-salting on top of the sachet's own sodium.
          </p>
        )}
      </Card>

      <Card title="Mixing instructions">
        <MethodSteps steps={[
          "Sieve the pectin, calcium lactate, ascorbic acid, lecithin and silicon dioxide together into a small bowl, then whisk into 2 tbsp of the maltodextrin. This coats the pectin so it can't clump.",
          "Weigh the remaining maltodextrin and fructose into a large bowl. Add the micro pre-mix from step 1. Whisk 60 seconds until uniform.",
          withElectrolytes ? "Add the race electrolyte ingredients and whisk in thoroughly." : "Electrolytes are being kept separate — mix them into their own bottle at race time instead.",
          "Add the flavour ingredients and whisk a final 30-60 seconds.",
          "Sieve the finished mix once more if any lumps remain.",
          "Portion into bottle-sized sachets by weight. Store airtight, cool, dark.",
          "To mix a bottle: sprinkle powder ONTO water (never the reverse), shake hard 20s, rest 60s, shake again.",
        ]} />
      </Card>
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

  function onTypeChange(t) {
    setType(t);
    setFlavour(Object.keys(ELECTROLYTE_FLAVOURS[t])[0]);
  }

  const base = type === "Daily" ? dailyBase() : raceBase(raceSodiumMg);
  const baseRows = base.map((e) => {
    const compoundG = compoundGrams(e.mg, e.pct);
    const total = e.el === "extract" ? (e.mg / 1000) * servings : compoundG * servings;
    return { name: e.name, doseLabel: `${e.mg}mg ${e.el}`, amount: `${total.toFixed(2)}g`, role: e.role, format: "Powder" };
  });

  const flavourRows = (ELECTROLYTE_FLAVOURS[type][flavour] || []).map((f) => ({
    name: f.name, doseLabel: `${f.dose}g / sachet`, amount: `${(f.dose * servings).toFixed(2)}g`, role: f.role, format: f.format,
  }));

  const magWarning = type === "Race" ? cumulativeMgWarning(80, servings) : null;
  const longRace = servings >= 16;

  return (
    <div>
      <PageTitle eyebrow="Step 2" sub="Daily or Race, how many sachets, then a flavour. Everything scales together.">
        Electrolyte Builder
      </PageTitle>

      <Card>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, color: teal, fontFamily: fontBody, fontWeight: 600, marginBottom: 8 }}>Type</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Pill active={type === "Daily"} onClick={() => onTypeChange("Daily")}>Daily</Pill>
            <Pill active={type === "Race"} onClick={() => onTypeChange("Race")}>Race</Pill>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <NumberInput label="Number of sachets" value={servings} onChange={setServings} />
          {type === "Race" && (
            <NumberInput label="Sodium target (mg/sachet)" value={raceSodiumMg} onChange={setRaceSodiumMg} hint="Default 1000mg — drop for cooler/shorter races" />
          )}
        </div>
      </Card>

      {type === "Race" && longRace && (
        <Warn>
          ⚠️ {servings} sachets is a long race (roughly {servings}+ hours at one sachet/hour). Watch magnesium and consider
          tapering to one sachet per 90 minutes after hour 10 rather than hourly — see the cumulative check below.
        </Warn>
      )}
      {magWarning && <Warn>⚠️ {magWarning.text}</Warn>}

      <Card title={`1. ${type} electrolyte base`}>
        <IngredientTable rows={baseRows} />
        <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, fontStyle: "italic" }}>Element-to-compound conversion is approximate — verify against a CoA before a production batch.</p>
      </Card>

      {type === "Race" && (
        <Card title="Why two sodium sources?">
          <p style={{ fontFamily: fontBody, fontSize: 14, lineHeight: 1.6, color: charcoal, margin: 0 }}>
            Tri-sodium citrate buffers and tastes softer; Himalayan salt directly drives SGLT1, the sodium-glucose
            co-transporter responsible for faster fluid and electrolyte absorption. Splitting the dose gets both benefits
            rather than leaning on just one source.
          </p>
        </Card>
      )}

      <Card title={`2. Flavour — ${flavour}`}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {flavourNames.map((f) => <Pill key={f} active={flavour === f} onClick={() => setFlavour(f)}>{f}</Pill>)}
        </div>
        <IngredientTable rows={flavourRows} />
      </Card>

      <Card title="Mixing instructions">
        <MethodSteps steps={[
          "Weigh all base minerals into a bowl. Milligram-scale precision matters for piperine and any capped ingredient — do not estimate by volume.",
          "Add the flavour ingredients and whisk thoroughly.",
          "Sieve the finished blend to break up any clumps, especially from the citrate salts.",
          "Portion into individual sachets by weight, not by scoop.",
          "To use: dissolve one sachet in 500ml water. Shake hard, rest 60s, shake again if any grit remains.",
        ]} />
      </Card>
    </div>
  );
}

// ================= PAGE: GELS =================
function GelsPage() {
  const [mode, setMode] = useState("purefruit"); // "purefruit" | "carbmix"
  const [numGels, setNumGels] = useState(10);
  const [ratio, setRatio] = useState("2:1");
  const [carbsPerGel, setCarbsPerGel] = useState(30);
  const flavourNames = Object.keys(GEL_FLAVOURS);
  const [flavour, setFlavour] = useState(flavourNames[0]);

  const [cmFlavour, setCmFlavour] = useState(Object.keys(CARB_FLAVOURS)[0]);
  const [powderPerGel, setPowderPerGel] = useState(45.5);
  const [waterPerGel, setWaterPerGel] = useState(35);

  const r = ratio === "2:1" ? 2 : 1.25;
  const riceEff = 0.56, agaveEff = 0.60;
  const riceSyrupPerGel = (carbsPerGel * r) / (r + 1) / riceEff;
  const agavePerGel = (carbsPerGel * 1) / (r + 1) / agaveEff;

  const pfBaseRows = [
    { name: "Organic rice syrup", doseLabel: `${riceSyrupPerGel.toFixed(1)}g/gel`, amount: `${(riceSyrupPerGel * numGels).toFixed(0)}g`, role: "Primary glucose source + binder", format: "Syrup" },
    { name: "Organic agave syrup", doseLabel: `${agavePerGel.toFixed(1)}g/gel`, amount: `${(agavePerGel * numGels).toFixed(0)}g`, role: "Primary fructose source", format: "Syrup" },
    { name: "Electrolyte premix (no Mg)", doseLabel: "1.5g/gel", amount: `${(1.5 * numGels).toFixed(0)}g`, role: "Sodium-forward", format: "Powder" },
    { name: "Ascorbic acid", doseLabel: "0.10g/gel", amount: `${(0.10 * numGels).toFixed(1)}g`, role: "Antioxidant, shelf-life", format: "Powder" },
  ];
  const pfFlavourRows = (GEL_FLAVOURS[flavour] || []).map((f) => ({ name: f.name, doseLabel: `${f.dose}g/gel`, amount: `${(f.dose * numGels).toFixed(1)}g`, role: f.role, format: f.format }));

  const totalPowder = powderPerGel * numGels;
  const totalWater = waterPerGel * numGels;
  const cmFlavourRows = (CARB_FLAVOURS[cmFlavour]?.ingredients || []).map((f) => ({
    name: f.name, doseLabel: `${f.dose}g/100g powder`, amount: `${((totalPowder * f.dose) / 100).toFixed(2)}g`, role: f.role, format: f.format,
  }));

  return (
    <div>
      <PageTitle eyebrow="Step 3" sub="Two ways to make a gel: PureFruit's natural syrup base, or your own Carb Mix powder at gel concentration.">
        Gel Builder
      </PageTitle>

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
            <div style={{ display: "flex", gap: 10 }}>
              <Pill active={ratio === "2:1"} onClick={() => setRatio("2:1")}>2:1 — 80-90g/hr pairing</Pill>
              <Pill active={ratio === "1:0.8"} onClick={() => setRatio("1:0.8")}>1:0.8 — 100g/hr+</Pill>
            </div>
          </Card>
          <Card title="1. Base gel formula"><IngredientTable rows={pfBaseRows} /></Card>
          <Card title={`2. Flavour — ${flavour}`}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {flavourNames.map((f) => <Pill key={f} active={flavour === f} onClick={() => setFlavour(f)}>{f}</Pill>)}
            </div>
            <IngredientTable rows={pfFlavourRows} />
          </Card>
          <Card title="Mixing instructions">
            <MethodSteps steps={[
              "Warm the rice syrup and agave together gently to ~40°C — pourable, not caramelising.",
              "Fold in the flavour's fruit powder(s) and acid blend while warm.",
              "Stir in the electrolyte premix and ascorbic acid last, once off the heat.",
              "Fill into narrow foil stick packs or a reusable soft flask while still warm and pourable.",
              "Cool fully before sealing or capping.",
            ]} />
          </Card>
        </>
      )}

      {mode === "carbmix" && (
        <>
          <Card>
            <p style={{ fontFamily: fontBody, fontSize: 14, color: charcoal, lineHeight: 1.6, marginTop: 0 }}>
              The Carb Mix base already contains LM Pectin NH and calcium lactate — mixing that same
              powder with much less water than a bottle forms a genuine gel. Default ratio is 45.5g
              powder to 35ml water per gel; adjust if your own testing needs it firmer or looser.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <NumberInput label="Number of gels" value={numGels} onChange={setNumGels} width="100%" />
              <NumberInput label="Powder per gel (g)" value={powderPerGel} onChange={setPowderPerGel} width="100%" />
              <NumberInput label="Water per gel (ml)" value={waterPerGel} onChange={setWaterPerGel} width="100%" />
            </div>
          </Card>

          <Card title="1. Totals for this batch">
            <IngredientTable rows={[
              { name: "Carb Mix powder (your chosen flavour)", doseLabel: `${powderPerGel}g/gel`, amount: `${totalPowder.toFixed(0)}g`, role: "Use your existing Carb Mix batch", format: "Powder" },
              { name: "Water", doseLabel: `${waterPerGel}ml/gel`, amount: `${totalWater.toFixed(0)}ml`, role: "Added TO the powder, not the reverse", format: "Liquid" },
            ]} />
          </Card>

          <Card title={`2. Flavour reference — ${cmFlavour} (already in your powder if you flavoured it on the Carb Mix page)`}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {Object.keys(CARB_FLAVOURS).map((f) => <Pill key={f} active={cmFlavour === f} onClick={() => setCmFlavour(f)}>{f}</Pill>)}
            </div>
            <IngredientTable rows={cmFlavourRows} />
            <p style={{ fontFamily: fontBody, fontSize: 12, color: muted, marginTop: 12, fontStyle: "italic" }}>
              This shows what's already in your flavoured Carb Mix powder — you don't add flavour again separately, the gel uses the same batch.
            </p>
          </Card>

          <Card title="Mixing instructions">
            <MethodSteps steps={[
              "Measure the water into a bowl first.",
              "Sprinkle the powder onto the water while stirring — never the reverse, or the pectin clumps.",
              "Stir continuously for 60 seconds until smooth and lump-free.",
              "Rest 4 minutes, untouched. This is when the pectin cross-links with the calcium lactate — do not skip this.",
              "Load into a flask or reusable soft flask, avoiding air pockets.",
              "Seal, stand upright 5 minutes, then refrigerate overnight before use. Store 8-12°C — colder can reverse the gel set.",
            ]} />
          </Card>
        </>
      )}
    </div>
  );
}

// ================= PAGE: BARS =================
function BarsPage() {
  const [openCategory, setOpenCategory] = useState("Race");
  const [openBar, setOpenBar] = useState(null);
  const [multipliers, setMultipliers] = useState({});
  const getMultiplier = (name) => multipliers[name] ?? 1;

  return (
    <div>
      <PageTitle eyebrow="Step 4" sub="Click a bar to open it up — set how many you're making, get the full scaled ingredient list and method.">Bars</PageTitle>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {Object.keys(BARS).map((cat) => <Pill key={cat} active={openCategory === cat} onClick={() => { setOpenCategory(cat); setOpenBar(null); }}>{cat}</Pill>)}
      </div>
      {openCategory === "Recovery" && (
        <p style={{ fontFamily: fontBody, fontSize: 13.5, color: muted, marginBottom: 16, fontStyle: "italic" }}>
          Five variants now — two original macros (High Protein, Black Forest 3:1) plus flavour spins built for home
          snacking rather than just post-run refuel: Chocolate Peanut Butter, Berry, Mocha, and Apple Cinnamon.
        </p>
      )}
      {Object.entries(BARS[openCategory]).map(([name, bar]) => {
        const mult = getMultiplier(name);
        return (
          <Accordion key={name} title={name} badge={bar.badge} open={openBar === name} onToggle={() => setOpenBar(openBar === name ? null : name)}>
            <div style={{ marginBottom: 20 }}>
              <NumberInput label="How many bars?" value={mult} onChange={(v) => setMultipliers((m) => ({ ...m, [name]: v }))} width={140} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <IngredientTable rows={bar.perBar.map((ing) => ({ name: ing.name, doseLabel: `${ing.g}g / bar`, amount: `${(ing.g * mult).toFixed(1)}g`, role: ing.role, format: "—" }))} />
            </div>
            <div>
              <h4 style={{ fontFamily: fontDisplay, fontSize: 15, color: teal, margin: "0 0 12px 0" }}>Method</h4>
              <MethodSteps steps={bar.method} />
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
      <PageTitle eyebrow="Step 5" sub="Every flavour across the whole range in one place, including savoury and both electrolyte tiers. Click one to see exactly what's in it.">All Flavours</PageTitle>
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

  const r = ratio === "2:1" ? 2 : 1.25;
  const totalCarbs = hours * carbsPerHr;
  const totalPowder = Math.round(totalCarbs / 0.99);
  const bottles = Math.ceil(hours);
  const glucosePerHr = carbsPerHr * (r / (r + 1));
  const overCeiling = glucosePerHr > 63;
  const atCeiling = Math.abs(glucosePerHr - 60) < 3;
  const magWarning = cumulativeMgWarning(80, hours);

  return (
    <div>
      <PageTitle eyebrow="Step 6" sub="Total race requirement plus the tips that actually change race-day outcomes.">Race Day Calculator</PageTitle>

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
            {[["Total powder needed", `${totalPowder}g`], ["Bottles / gels", `≈${bottles}`], ["Glucose / hr", `${glucosePerHr.toFixed(1)}g`]].map(([label, val], i) => (
              <div key={i}>
                <div style={{ color: "#B9D4CF", fontSize: 11.5, fontFamily: fontBody, marginBottom: 4 }}>{label}</div>
                <div style={{ color: "#fff", fontSize: 22, fontFamily: fontMono, fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 4, fontSize: 13, fontFamily: fontBody, background: overCeiling ? clayLight : atCeiling ? "#E4EEE9" : paperDeep, color: overCeiling ? "#8A4A1E" : teal }}>
          {overCeiling ? `Glucose exceeds the ~60g/hr SGLT1 ceiling by ${(glucosePerHr - 60).toFixed(1)}g/hr.` : atCeiling ? "Glucose sits right at the SGLT1 ceiling — optimal." : "Comfortably under the SGLT1 ceiling."}
        </div>
      </Card>

      {hours >= 16 && (
        <Warn>⚠️ {hours}-hour race: taper electrolyte sachet frequency from hourly to one per 90 minutes after hour 10, and watch total magnesium — see below.</Warn>
      )}
      {magWarning && <Warn>⚠️ At one sachet/hour, {magWarning.text}</Warn>}

      <Card title="Carb loading">
        <IngredientTable rows={[
          { name: "Under 90 min", doseLabel: "—", amount: "Normal diet", role: "No special protocol needed", format: "—" },
          { name: "90 min – 3 hrs", doseLabel: "24hrs before", amount: "7-8g/kg", role: "One high-carb day + taper", format: "—" },
          { name: "3+ hrs (ultra)", doseLabel: "36-48hrs before", amount: "8-12g/kg", role: "Full glycogen supercompensation", format: "—" },
        ]} />
      </Card>

      <Card title="The two-bottle rule">
        <p style={{ fontFamily: fontBody, fontSize: 14.5, lineHeight: 1.65, color: charcoal, margin: 0 }}>
          Above ~10% concentration, carb drinks pull water into the gut instead of being absorbed. Carry a concentrated
          carb bottle and a separate electrolyte bottle, alternate sips — they mix in the stomach to a safe ~9%. Drain
          the carb bottle alone and you're back to the problem.
        </p>
      </Card>

      <Card title="Caffeine, if you're using it">
        <IngredientTable rows={[
          { name: "Hours 0-4", doseLabel: "—", amount: "None", role: "Save it — you're fresh", format: "—" },
          { name: "Hours 4-8", doseLabel: "—", amount: "50-75mg", role: "First dose, as alertness dips", format: "—" },
          { name: "Hours 8-14", doseLabel: "—", amount: "50-75mg", role: "Time it to a hard section", format: "—" },
          { name: "Total race cap", doseLabel: "—", amount: "300-400mg", role: "Spread across doses, never stacked", format: "—" },
        ]} />
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

// ================= NAV + APP SHELL =================
const NAV = [
  { id: "carbmix", label: "1 · Carb Mix" },
  { id: "electrolytes", label: "2 · Electrolytes" },
  { id: "gels", label: "3 · Gels" },
  { id: "bars", label: "4 · Bars" },
  { id: "flavours", label: "5 · All Flavours" },
  { id: "raceday", label: "6 · Race Day" },
];

const PAGES = { carbmix: CarbMixPage, electrolytes: ElectrolytesPage, gels: GelsPage, bars: BarsPage, flavours: AllFlavoursPage, raceday: RaceDayPage };

export default function PolarEnduranceApp() {
  const [active, setActive] = useState("carbmix");
  const [mobileOpen, setMobileOpen] = useState(false);
  const Page = PAGES[active];

  return (
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
            <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }} style={{
              textAlign: "left", background: active === item.id ? tealLight : "transparent", border: "none",
              borderLeft: active === item.id ? `3px solid ${clay}` : "3px solid transparent",
              color: active === item.id ? "#fff" : "#B9D4CF", padding: "11px 14px", fontFamily: fontBody,
              fontSize: 14, fontWeight: active === item.id ? 600 : 500, cursor: "pointer", borderRadius: 3,
            }}>{item.label}</button>
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
  );
}
