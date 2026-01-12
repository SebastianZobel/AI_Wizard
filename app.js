/* app.js
   - Screen 6: Galerie (immer über Topbar erreichbar)
   - Wizard-Screens: 1..5
   - Galerie: Preview + Öffnen als Ergebnis + Löschen + Alles löschen
*/

const SHOW_DEBUG = false;
const SHOW_STATUS_PILL = false;
const ENABLE_CLEAR_GALLERY = false;
const ENABLE_DELETE_IMAGE = true;

const concepts = [
  {
    id: "service_sales_2030",
    title: "Service & Sales – next level!",
    desc: "Wie sieht exzellenter Service und Sales im CSS im Jahr 2030 aus? Was ist neu, was fühlt sich leichter an, was läuft schneller oder smarter? Ist Service persönlicher, digitaler, vorausschauender – oder alles zusammen? \n\nErzeuge ein Bild Deiner Wunschvorstellung von Service & Sales in 5 Jahren im CSS.",
    tags: ["Service", "Sales", "Next Level"],
    image: "./images/Sales_and_Service_2030.png",
    templateHint: "Zukunftsfähiger Service & Sales im CSS: nahtlos, schnell, smart und zugleich menschlich."
  },
  {
    id: "kundeninteraktion_5",
    title: "Das perfekte Kundenerlebnis",
    desc: "Versetze Dich in unsere Kundinnen und Kunden: Wie erleben sie die Kommunikation (Interaktion) mit uns im Jahr 2030? \n Welche Touchpoints gibt es, welche Emotionen, welche Momente bleiben in Erinnerung? \n\nErzeuge ein Bild davon, wie der Kunde die Interaktion mit dem CSS in 5 Jahren erlebt.",
    tags: ["Kundenerlebnis", "Touchpoints", "Emotionen"],
    image: "./images/Kundeninteraktion_in_5_Jahren.png",
    templateHint: "Perfektes Kundenerlebnis: erinnerungswürdig, mühelos, über viele Touchpoints hinweg und emotional positiv."
  },
  {
    id: "fit_fuer_zukunft",
    title: "Unsere Superpower",
    desc: "Welche Stärke zeichnet Dein Team heute aus – und macht Euch bereit für morgen? Was befähigt Euch, Veränderungen zu meistern und Zukunft aktiv zu gestalten? \n\nErzeuge ein Bild der **Superpower** Deines Teams, die Euch fit für die Zukunft macht.",
    tags: ["Team", "Superpower", "Zukunft"],
    image: "./images/Fit_fuer_die_Zukunft.png",
    templateHint: "Zeige die Kernstärke Deines Teams, die Euch zukunftssicher und widerstandsfähig macht."
  }
];

const styles = [
  { id:"cinematic",  title:"Cinematic Realism",     desc:"Filmischer Look, realistische Texturen, dramatisches Licht.", tags:["realistic","lens","dramatic"] },
  { id:"anime",      title:"Anime Illustration",    desc:"Illustration, klare Linien, cel shading, dynamisch.",        tags:["illustration","cel shading","clean lines"] },
  { id:"watercolor", title:"Watercolor / Soft Art", desc:"Sanft, Papiertextur, ruhig.",                                tags:["soft","paper texture","painterly"] },
  { id:"3d",         title:"3D Render",             desc:"CGI Look, saubere Materialien, Highlights.",                 tags:["cgi","octane","materials"] },
  { id:"noir",       title:"Noir / High Contrast",  desc:"Dunkel, harte Schatten, Nebel, mysteriös.",                 tags:["noir","fog","contrast"] },
  { id:"pixel",      title:"Pixel Art",             desc:"Retro Game Ästhetik.",                                       tags:["retro","8/16-bit","sprite"] }
];

const stepLabels = ["Konzept","Vision","Style","Generieren","Ergebnis"];

const state = {
  screen: 1,
  lastWizardScreen: 1,          // for returning from gallery
  conceptId: null,
  styleId: null,
  styleMeta: null,
  entities: "",
  action: "",
  environment: "",
  prompt: "",
  imageUrl: "",
  isGenerating: false,

  provider: "aihorde",

  pollinations: {
    model: "flux",
    seed: "random",
    width: 512,
    height: 512,
    nologo: true,
    enhance: true,
    safe: true,
    privateMode: false,
    availableModels: null,
    lastModelCheckAt: null
  },

  aihorde: {
    apikey: "ip14hvWQvjgyFcXQCg9nmQ",
    model: "Deliberate",
    steps: 25,
    cfg_scale: 7,
    sampler_name: "k_euler_a",
    n: 1
  },

  gallery: {
    selectedId: null,
    prunedMissing: false
  }
};

// ----------------------------
// DOM
// ----------------------------
const stepsEl = document.getElementById("steps");
const stepsBackBtn = document.getElementById("stepsBackBtn");
const stepsNextBtn = document.getElementById("stepsNextBtn");
const conceptGrid = document.getElementById("conceptGrid");
const styleGrid = document.getElementById("styleGrid");
const conceptPreview = document.getElementById("conceptPreview");

const entitiesEl = document.getElementById("entities");
const actionEl = document.getElementById("action");
const environmentEl = document.getElementById("environment");
const labelEntitiesEl = document.getElementById("labelEntities");
const labelActionEl = document.getElementById("labelAction");
const labelEnvironmentEl = document.getElementById("labelEnvironment");

const promptPreviewEl = document.getElementById("promptPreview");
const genBarEl = document.getElementById("genBar");
const genTextEl = document.getElementById("genText");
const pollinationsUrlPreviewEl = document.getElementById("pollinationsUrlPreview");
const debugBoxEl = document.getElementById("debugBox");

const resultWrapEl = document.getElementById("resultWrap");
const saveToGalleryBtn = document.getElementById("saveToGalleryBtn");
const newRunBtn = document.getElementById("newRunBtn");

const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");

const summaryTextEl = document.getElementById("summaryText");
const statusPillEl = document.getElementById("statusPill");
const galleryGridEl = document.getElementById("galleryGrid");
const appEl = document.querySelector(".app");

// sidebar open
const openGalleryFromSideBtn = document.getElementById("openGalleryFromSideBtn");

// provider
const providerSelectEl = document.getElementById("providerSelect");
const providerStatusBadgeEl = document.getElementById("providerStatusBadge");

// pollinations opts
const pollinationsOptionsEl = document.getElementById("pollinationsOptions");
const modelSelectEl = document.getElementById("modelSelect");
const seedInputEl = document.getElementById("seedInput");
const sizeSelectEl = document.getElementById("sizeSelect");
const enhanceToggleEl = document.getElementById("enhanceToggle");
const safeToggleEl = document.getElementById("safeToggle");
const nologoToggleEl = document.getElementById("nologoToggle");
const privateToggleEl = document.getElementById("privateToggle");
const modelStatusBadgeEl = document.getElementById("modelStatusBadge");

// aihorde opts
const aihordeOptionsEl = document.getElementById("aihordeOptions");
const aihordeKeyInputEl = document.getElementById("aihordeKeyInput");
const aihordeModelInputEl = document.getElementById("aihordeModelInput");
const aihordeStepsSelectEl = document.getElementById("aihordeStepsSelect");
const aihordeSamplerSelectEl = document.getElementById("aihordeSamplerSelect");

// gallery screen
const clearGalleryBtn = document.getElementById("clearGalleryBtn");
const galleryLayoutEl = document.querySelector(".galleryLayout");
const galleryDividerEl = document.getElementById("galleryDivider");
const galleryScreenGrid = document.getElementById("galleryScreenGrid");
const galleryPreviewWrap = document.getElementById("galleryPreviewWrap");
const galleryPromptPreview = document.getElementById("galleryPromptPreview");
const openFromGalleryBtn = document.getElementById("openFromGalleryBtn");
const deleteFromGalleryBtn = document.getElementById("deleteFromGalleryBtn");
const backToWizardBtn = document.getElementById("backToWizardBtn");

// bottom nav
const bottomNav = document.getElementById("bottomNav");

// ----------------------------
// Helpers
// ----------------------------
function setPill(text){ statusPillEl.textContent = text; }
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function cut(s, n){ const t=(s||"").trim(); return t.length>n ? t.slice(0,n)+"…" : t; }
function streamlineText(s){
  return (s || "").replace(/\s+/g, " ").replace(/^[\s,.;:]+|[\s,.;:]+$/g, "").trim();
}
function mdLite(s){
  const esc = String(s || "").replace(/[&<>]/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[ch]));
  return esc
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\n{2,}/g, "<br><br>")
    .replace(/\n/g, "<br>");
}
function setBadge(el, kind, text, title){
  if(!el) return;
  el.classList.remove("badge--ok","badge--warn","badge--error","badge--unknown");
  el.classList.add(`badge--${kind || "unknown"}`);
  el.textContent = text ?? "—";
  el.title = title || "";
}
function setTopTab(active){ // "wizard" | "gallery"
  // top tabs removed
}
function safeId(){
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
}

// ----------------------------
// Prompt
// ----------------------------
function composePrompt(){
  const concept = concepts.find(x => x.id === state.conceptId);
  const style = styles.find(x => x.id === state.styleId);

  const entities = streamlineText(state.entities);
  const action = streamlineText(state.action);
  const env = streamlineText(state.environment);

  const base = `Subject(s): ${entities}. Action: ${action}. Environment: ${env}.`;
  const conceptBlock = concept ? `Concept: ${concept.title}. Guidance: ${concept.templateHint}.` : "";
  const styleMeta = state.styleMeta || null;
  const styleTitle = (styleMeta && styleMeta.title) ? styleMeta.title : (style ? style.title : "");
  const stylePath = (styleMeta && Array.isArray(styleMeta.pathTitles) && styleMeta.pathTitles.length)
    ? styleMeta.pathTitles.join(" › ")
    : "";
  const styleTags = (styleMeta && Array.isArray(styleMeta.tags) && styleMeta.tags.length)
    ? styleMeta.tags
    : (style && Array.isArray(style.tags) ? style.tags : []);
  const styleParts = (styleMeta && Array.isArray(styleMeta.promptParts) && styleMeta.promptParts.length)
    ? styleMeta.promptParts
    : [];
  const styleBlock = styleTitle
    ? `Style: ${stylePath || styleTitle}.` +
      (styleTags.length ? ` Tags: ${styleTags.join(", ")}.` : "") +
      (styleParts.length ? ` Style guidance: ${styleParts.join(", ")}.` : "")
    : "";

  return [
    "Create one coherent, high-quality image.",
    base,
    conceptBlock,
    styleBlock,
    "Composition: clear focal subject, balanced framing, coherent lighting.",
    "Quality: detailed, sharp, no text, no watermark."
  ].filter(Boolean).join(" ");
}

// ----------------------------
// Pollinations
// ----------------------------
function buildPollinationsUrl(prompt, opts){
  const encodedPrompt = encodeURIComponent(prompt);
  const base = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

  const params = new URLSearchParams();
  params.set("model", String(opts.model ?? "flux"));
  params.set("seed", String(opts.seed ?? "random"));
  params.set("width", String(opts.width ?? 512));
  params.set("height", String(opts.height ?? 512));
  params.set("nologo", String(!!opts.nologo));
  params.set("private", String(!!opts.privateMode));
  params.set("enhance", String(!!opts.enhance));
  params.set("safe", String(!!opts.safe));
  params.set("t", String(Date.now())); // cache bust

  return `${base}?${params.toString()}`;
}

function tryLoadImage(url, timeoutMs = 90000){
  return new Promise((resolve, reject) => {
    const img = new Image();
    let done = false;

    const to = setTimeout(() => {
      if(done) return;
      done = true;
      try{ img.src = ""; }catch{}
      reject(new Error("Timeout beim Laden des Bildes."));
    }, timeoutMs);

    img.onload = () => { if(done) return; done=true; clearTimeout(to); resolve(url); };
    img.onerror = () => { if(done) return; done=true; clearTimeout(to); reject(new Error("Bild konnte nicht geladen werden.")); };

    img.src = url;
  });
}

async function generateWithPollinations(prompt){
  state.isGenerating = true;
  setPill("Generiere…");

  genTextEl.textContent = "Sende Prompt an Pollinations…";
  genBarEl.style.width = "10%";

  let progress = 10;
  const timer = setInterval(() => {
    progress = Math.min(progress + Math.floor(Math.random()*8)+2, 92);
    genBarEl.style.width = progress + "%";
  }, 250);

  const originalModel = state.pollinations.model;
  const modelCandidates = (originalModel === "flux") ? ["flux","turbo"] : [originalModel,"turbo"];
  let lastErr = null;

  try{
    for(const model of modelCandidates){
      for(let attempt=0; attempt<2; attempt++){
        state.pollinations.model = model;
        const url = buildPollinationsUrl(prompt, state.pollinations);
        pollinationsUrlPreviewEl.textContent = url;
        genTextEl.textContent = `Pollinations… (model=${model}, attempt=${attempt+1}/2)`;

        try{
          const loadedUrl = await tryLoadImage(url, 90000);
          genBarEl.style.width = "100%";
          genTextEl.textContent = "Bild fertig.";

          if(originalModel === "flux" && model === "turbo"){
            setPill("Fertig (Fallback)");
            updatePollinationsModelBadge("flux instabil ? turbo verwendet.");
          }else{
            setPill("Fertig");
            updatePollinationsModelBadge();
          }

          state.isGenerating = false;
          return loadedUrl;
        }catch(err){
          lastErr = err;
          genTextEl.textContent = `Fehler (model=${model}). Wiederhole…`;
          await sleep(400*(attempt+1));
        }
      }
    }
    throw lastErr || new Error("Pollinations: Keine Antwort / keine Worker verfügbar.");
  }finally{
    clearInterval(timer);
  }
}

// status badge
async function refreshPollinationsModelStatus(){
  if(state.provider !== "pollinations") return;

  setBadge(providerStatusBadgeEl, "unknown", "Pollinations", "Prüfe /models …");
  setBadge(modelStatusBadgeEl, "unknown", "prüfe…", "Prüfe Verfügbarkeit via /models …");

  try{
    const res = await fetch("https://image.pollinations.ai/models", { method:"GET" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    state.pollinations.availableModels = Array.isArray(data) ? data : null;
    state.pollinations.lastModelCheckAt = Date.now();

    setBadge(providerStatusBadgeEl, "ok", "Pollinations OK", "Endpoint erreichbar.");
    updatePollinationsModelBadge();
  }catch(e){
    state.pollinations.availableModels = null;
    setBadge(providerStatusBadgeEl, "warn", "Pollinations ?", "Konnte /models nicht lesen (CORS/Netz/Down).");
    setBadge(modelStatusBadgeEl, "unknown", "unbekannt", "Keine /models-Info verfügbar.");
  }
}

function updatePollinationsModelBadge(extraHint){
  if(state.provider !== "pollinations") return;

  const list = state.pollinations.availableModels;
  const m = state.pollinations.model;

  if(!Array.isArray(list)){
    setBadge(modelStatusBadgeEl, "unknown", "unbekannt", extraHint || "Keine /models-Info (evtl. CORS).");
    return;
  }

  if(list.includes(m)){
    setBadge(modelStatusBadgeEl, "ok", `${m} verfügbar`, extraHint || "Model steht in /models.");
  }else{
    setBadge(modelStatusBadgeEl, "warn", `${m} evtl. down`, extraHint || "Model nicht in /models gelistet.");
  }
}

// ----------------------------
// AI Horde (robust)
// ----------------------------
const AIHORDE_BASE = "https://aihorde.net/api/v2";

async function aihordeHeartbeat(){
  const res = await fetch(`${AIHORDE_BASE}/status/heartbeat`, { method:"GET" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

function capToThumbsForAIHorde(){
  const maxSize = 640;
  state.pollinations.width = Math.min(state.pollinations.width, maxSize);
  state.pollinations.height = Math.min(state.pollinations.height, maxSize);
  if(state.pollinations.width !== state.pollinations.height){
    const s = Math.min(state.pollinations.width, state.pollinations.height);
    state.pollinations.width = s;
    state.pollinations.height = s;
  }
  state.aihorde.steps = Math.min(Number(state.aihorde.steps || 25), 25);
}

function isProbablyUrl(s){
  const t = String(s || "").trim();
  return /^https?:\/\/.+/i.test(t);
}

function normalizeBase64Input(input){
  let s = String(input || "").trim();

  if (s.startsWith("data:")) {
    const comma = s.indexOf(",");
    if (comma >= 0) s = s.slice(comma + 1);
  }

  s = s.replace(/\s+/g, "");
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  s = s.replace(/[^A-Za-z0-9+/=]/g, "");

  const mod = s.length % 4;
  if (mod === 2) s += "==";
  else if (mod === 3) s += "=";

  return s;
}

function mimeFromDataUrlOrHeader(original, normalized){
  const o = String(original || "").trim();
  if (o.startsWith("data:")) {
    const m = o.match(/^data:([^;]+);base64,/i);
    if (m && m[1]) return m[1];
  }
  const head = normalized.slice(0, 12);
  if (head.startsWith("iVBORw0KGgo")) return "image/png";
  if (head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("UklGR")) return "image/webp";
  if (head.startsWith("R0lGOD")) return "image/gif";
  return "application/octet-stream";
}

function base64OrUrlToImgSrc(imgField){
  if (isProbablyUrl(imgField)) return String(imgField).trim();

  const raw = String(imgField || "").trim();
  const low = raw.toLowerCase();

  if (!raw || low === "censored" || low.includes("censor") || low.includes("nsfw") || low.includes("failed")) {
    throw new Error("AI Horde: Bild wurde nicht geliefert (censored/failed).");
  }

  if (raw.startsWith("data:image/")) return raw;

  const normalized = normalizeBase64Input(raw);
  if (normalized.length < 50) {
    throw new Error("AI Horde: img-Feld ist zu kurz/ungültig (kein Base64/URL).");
  }

  const mime = mimeFromDataUrlOrHeader(raw, normalized);

  let byteChars;
  try{
    byteChars = atob(normalized);
  }catch(e){
    console.warn("AI Horde img raw (first 160):", raw.slice(0, 160));
    console.warn("AI Horde img normalized (first 160):", normalized.slice(0, 160));
    throw new Error("AI Horde: img-Feld ist keine decodierbare Base64 (atob failed).");
  }

  const bytes = new Uint8Array(byteChars.length);
  for(let i=0;i<byteChars.length;i++) bytes[i] = byteChars.charCodeAt(i);

  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

function extractAIHordeGeneration(st){
  if (!st || typeof st !== "object") return { ok:false, reason:"AI Horde: leere Statusantwort." };

  if (st.faulted) {
    const msg = st.message || st.error || "Job faulted.";
    return { ok:false, reason: `AI Horde: Job faulted: ${msg}` };
  }

  const gens = Array.isArray(st.generations) ? st.generations : [];
  if (gens.length === 0) {
    const msg = st.message || st.error || "Keine Generations im Status.";
    return { ok:false, reason: `AI Horde: Kein Ergebnis erhalten. ${msg}` };
  }

  const gen = gens.find(g => g && typeof g.img === "string" && String(g.img).trim().length > 0) || gens[0];
  const imgField = gen?.img;

  if (!imgField) {
    const msg = st.message || st.error || "Generation ohne img-Feld.";
    return { ok:false, reason: `AI Horde: ${msg}` };
  }

  return { ok:true, imgField, gen };
}

async function generateWithAIHorde(prompt){
  state.isGenerating = true;
  setPill("Queue…");

  capToThumbsForAIHorde();
  renderSummary();

  genTextEl.textContent = "AI Horde: Job wird erstellt…";
  genBarEl.style.width = "8%";
  pollinationsUrlPreviewEl.textContent = "AI Horde (async)";

  async function submitOnce(width, height, steps){
    const payload = {
      prompt,
      models: [state.aihorde.model],
      params: {
        width,
        height,
        steps,
        cfg_scale: state.aihorde.cfg_scale ?? 7,
        sampler_name: state.aihorde.sampler_name ?? "k_euler_a",
        n: state.aihorde.n ?? 1
      }
    };

    const res = await fetch(`${AIHORDE_BASE}/generate/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": state.aihorde.apikey || "0000000000"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text().catch(() => "");
    const data = text ? (()=>{ try{return JSON.parse(text);}catch{return null;} })() : null;

    if(res.status === 403){
      const rc = data?.rc || data?.error || data?.message;
      const msg = data?.message || text || "403";
      const err = new Error(`AI Horde submit fehlgeschlagen (HTTP 403). Details: ${msg}`);
      err._aihorde = { status: 403, rc, data };
      throw err;
    }

    if(res.status !== 202 && !res.ok){
      throw new Error(`AI Horde submit fehlgeschlagen (HTTP ${res.status}). ${text ? "Details: "+text : ""}`);
    }

    const json = data ?? (await res.json());
    const id = json?.id;
    if(!id) throw new Error("AI Horde: Keine Job-ID erhalten.");
    return id;
  }

  const attempts = [
    { w: state.pollinations.width, h: state.pollinations.height, steps: state.aihorde.steps, label: `${state.pollinations.width}x${state.pollinations.height}, steps=${state.aihorde.steps}` },
    { w: 512, h: 512, steps: 20, label: "512x512, steps=20 (Fallback)" },
    { w: 384, h: 384, steps: 15, label: "384x384, steps=15 (Fallback)" }
  ];

  let id = null;

  for(const a of attempts){
    genTextEl.textContent = `AI Horde: Submit… (${a.label})`;
    try{
      id = await submitOnce(a.w, a.h, a.steps);
      state.pollinations.width = a.w;
      state.pollinations.height = a.h;
      state.aihorde.steps = a.steps;

      const sizeVal = `${a.w}x${a.h}`;
      if (sizeSelectEl && [...sizeSelectEl.options].some(o => o.value === sizeVal)) sizeSelectEl.value = sizeVal;

      break;
    }catch(e){
      if(e?._aihorde?.status === 403 && String(e._aihorde.rc || "").includes("KudosUpfront")){
        setPill("AI Horde: zu teuer ? kleiner");
        await sleep(400);
        continue;
      }
      throw e;
    }
  }

  if(!id){
    throw new Error("AI Horde: Kein Submit möglich (Kudos/Limit). Nutze 384×384 oder Pollinations.");
  }

  pollinationsUrlPreviewEl.textContent = `AI Horde job id: ${id}`;
  genTextEl.textContent = "AI Horde: In Warteschlange…";
  genBarEl.style.width = "15%";

  let tries = 0;
  while(true){
    tries++;
    const chkRes = await fetch(`${AIHORDE_BASE}/generate/check/${encodeURIComponent(id)}`, { method:"GET" });
    if(!chkRes.ok) throw new Error(`AI Horde check fehlgeschlagen (HTTP ${chkRes.status}).`);

    const chk = await chkRes.json();
    const done = !!chk?.done;
    const wait = chk?.wait_time;

    genTextEl.textContent = done
      ? "AI Horde: Fertig – lade Ergebnis…"
      : `AI Horde: Warteschlange…${Number.isFinite(wait) ? ` (wait_time˜${wait}s)` : ""}`;

    genBarEl.style.width = `${Math.min(15 + tries * 6, 80)}%`;

    if(done) break;
    await sleep(2000);
  }

  const stRes = await fetch(`${AIHORDE_BASE}/generate/status/${encodeURIComponent(id)}`, { method:"GET" });
  if(!stRes.ok) throw new Error(`AI Horde status fehlgeschlagen (HTTP ${stRes.status}).`);

  const st = await stRes.json();
  const extracted = extractAIHordeGeneration(st);

  if(!extracted.ok){
    console.log("AI Horde status summary:", {
      done: st?.done, faulted: st?.faulted, message: st?.message, gens_len: Array.isArray(st?.generations) ? st.generations.length : null
    });
    throw new Error(extracted.reason || "AI Horde: Kein gültiges Ergebnis.");
  }

  let imgSrc;
  try{
    imgSrc = base64OrUrlToImgSrc(extracted.imgField);
  }catch(e){
    const alt = extracted.gen?.img_url || extracted.gen?.url || extracted.gen?.source || null;
    if (alt && isProbablyUrl(alt)) imgSrc = String(alt).trim();
    else throw e;
  }

  genBarEl.style.width = "100%";
  genTextEl.textContent = "AI Horde: Bild fertig.";
  setPill("Fertig");

  state.isGenerating = false;
  return imgSrc;
}

// ----------------------------
// UI rendering
// ----------------------------
function renderSteps(){
  stepsEl.innerHTML = "";
  stepLabels.forEach((label, idx) => {
    const n = idx + 1;
    const el = document.createElement("div");
    const isActive = state.screen === n;
    const isDone = state.screen > n;
    const canGoBack = !state.isGenerating && n < state.screen;

    el.className = "step " + (isActive ? "active" : (isDone ? "done" : "")) + (canGoBack ? " clickable" : "");
    el.innerHTML = `<span class="dot"></span><span>${n}. ${label}</span>`;

    if (canGoBack) {
      el.onclick = () => {
        state.screen = n;
        state.lastWizardScreen = n;
        render();
      };
    }

    stepsEl.appendChild(el);
  });
}

function renderConcepts(){
  conceptGrid.innerHTML = "";
  concepts.forEach(c => {
    const el = document.createElement("div");
    el.className = "choice " + (state.conceptId === c.id ? "selected" : "");
    el.tabIndex = 0;
    el.innerHTML = `
      <h3>${c.title}</h3>
      <div class="choiceImg"><img src="${c.image}" alt="${c.title}"></div>
      <div class="choiceBody">
        <p>${mdLite(c.desc)}</p>
      </div>
    `;
    const selectConcept = () => {
      state.conceptId = c.id;
      if(state.screen === 1){
        state.screen = 2;
        state.lastWizardScreen = 2;
      }
      render();
    };
    el.onclick = selectConcept;
    el.onkeydown = (e) => { if(e.key==="Enter"||e.key===" "){ selectConcept(); } };
    conceptGrid.appendChild(el);
  });
}

let styleRailInstance = null;
let styleRailInitFailed = false;

function ensureStyleRail(){
  if(styleRailInitFailed) return null;
  if(!styleGrid) return null;
  if(typeof window.createStyleRail !== "function") return null; // styleRail.js fehlt

  if(!styleRailInstance){
    try{
      styleRailInstance = window.createStyleRail({
        mountEl: styleGrid,
        dataUrl: "./presets.json",
        onCommit: (meta) => {
          state.styleId = meta?.id || null;
          state.styleMeta = meta || null;
          render();
        }
      });
    }catch(e){
      console.error("StyleRail init failed:", e);
      styleRailInitFailed = true;
      styleRailInstance = null;
      // allow fallback UI
      try{ styleGrid.classList.add("grid","grid--3"); }catch{}
      try{ styleGrid.innerHTML = ""; }catch{}
      return null;
    }
  }
  return styleRailInstance;
}

function renderStyles(){
  const rail = ensureStyleRail();
  if(rail){
    rail.sync({ committedId: state.styleId });
    return;
  }

  // Fallback: flache Styles (falls styleRail.js nicht geladen ist)
  styleGrid.innerHTML = "";
  styles.forEach(s => {
    const el = document.createElement("div");
    el.className = "choice " + (state.styleId === s.id ? "selected" : "");
    el.tabIndex = 0;
    el.innerHTML = `
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      <div class="tagrow">${s.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    `;
    el.onclick = () => { state.styleId = s.id; state.styleMeta = null; render(); };
    el.onkeydown = (e) => { if(e.key==="Enter"||e.key===" "){ state.styleId = s.id; state.styleMeta = null; render(); } };
    styleGrid.appendChild(el);
  });
}

function renderConceptPreview(){
  if(!conceptPreview) return;
  const concept = concepts.find(x => x.id === state.conceptId);
  if(!concept){
    conceptPreview.classList.add("hidden");
    conceptPreview.innerHTML = "";
    return;
  }
  conceptPreview.classList.remove("hidden");
  conceptPreview.innerHTML = `
    <div class="choice">
      <h3>${concept.title}</h3>
      <div class="choiceImg"><img src="${concept.image}" alt="${concept.title}"></div>
      <div class="choiceBody">
        <p>${mdLite(concept.desc)}</p>
      </div>
    </div>
  `;
}

function updatePromptFieldLabels(){
  const copy = {
    service_sales_2030: {
      entities: {
        label: "Wer macht den Unterschied?",
        placeholder: "z.B. Service-Profi, Kund:in mit Wearable, KI-Copilot, Sales-Team, Coach …"
      },
      action: {
        label: "Was ist der Wow-Moment?",
        placeholder: "z.B. löst das Anliegen, bevor es entsteht, berät in Sekunden, macht’s mühelos, baut Vertrauen auf, feiert den Abschluss …"
      },
      environment: {
        label: "Wo fühlt es sich richtig an?",
        placeholder: "z.B. nahtloser Service-Hub, hybrider Store, warme Lounge, AR-Beratung, ruhige Future-Zone …"
      }
    },

    kundeninteraktion_5: {
      entities: {
        label: "Wer erlebt das perfekte Kundenerlebnis?",
        placeholder: "z.B. Familie im Store, Pendler:in in der App, Business-Kunde im Portal, Community im Chat …"
      },
      action: {
        label: "Wie soll es sich anfühlen?",
        placeholder: "z.B. leicht & persönlich, verstanden in einem Schritt, positiv überrascht, empathisch gelöst, ein Moment zum Weitererzählen …"
      },
      environment: {
        label: "Wo findet das Erlebnis statt?",
        placeholder: "z.B. im Store mit Ruhezone, in der App auf dem Heimweg, im Service-Portal, im Beratungslounge, im Callcenter-Atelier …"
      }
    },

    fit_fuer_zukunft: {
      entities: {
        label: "Wer zeigt eure Stärke?",
        placeholder: "z.B. euer Team, Spezialist:innen, KI-Partner, agile Crew, Support-Squad …"
      },
      action: {
        label: "Wie sieht eure Superpower aus?",
        placeholder: "z.B. bleibt klar im Chaos, lernt blitzschnell, löst gemeinsam, macht Komplexes einfach, gibt anderen Sicherheit …"
      },
      environment: {
        label: "Wo entsteht Zukunft bei euch?",
        placeholder: "z.B. Co-Creation-Space, Innovations-Lab, Remote-Studio, Workshop-Bühne, lebendiges Office …"
      }
    },

    default: {
      entities: {
        label: "Wer ist im Fokus?",
        placeholder: "z.B. Service-Agent:in, Kund:in, Team, KI-Assistent …"
      },
      action: {
        label: "Was ist der besondere Moment?",
        placeholder: "z.B. löst proaktiv, macht’s einfach, gibt Orientierung, schafft Vertrauen …"
      },
      environment: {
        label: "Welche Stimmung trägt das Bild?",
        placeholder: "z.B. Service-Hub, digitale Umgebung, hybrides Meeting, Store-Szene …"
      }
    }
  };

  const key = state.conceptId || "default";
  const data = copy[key] || copy.default;
  if(labelEntitiesEl) labelEntitiesEl.textContent = data.entities.label;
  if(labelActionEl) labelActionEl.textContent = data.action.label;
  if(labelEnvironmentEl) labelEnvironmentEl.textContent = data.environment.label;
  if(entitiesEl) entitiesEl.placeholder = data.entities.placeholder;
  if(actionEl) actionEl.placeholder = data.action.placeholder;
  if(environmentEl) environmentEl.placeholder = data.environment.placeholder;
}

function showScreen(n){
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.toggle("active", Number(s.dataset.screen) === n);
  });
}

function validateScreen(n){
  if(n===1) return !!state.conceptId;
  if(n===2) return state.entities.trim() && state.action.trim() && state.environment.trim();
  if(n===3) return !!state.styleId;
  return true;
}

function updateInputsFromDom(){
  state.entities = entitiesEl.value;
  state.action = actionEl.value;
  state.environment = environmentEl.value;
}

function updateDomFromState(){
  entitiesEl.value = state.entities;
  actionEl.value = state.action;
  environmentEl.value = state.environment;

  if(providerSelectEl) providerSelectEl.value = state.provider;

  if(modelSelectEl) modelSelectEl.value = state.pollinations.model;
  if(seedInputEl) seedInputEl.value = state.pollinations.seed;
  if(sizeSelectEl) sizeSelectEl.value = `${state.pollinations.width}x${state.pollinations.height}`;
  if(enhanceToggleEl) enhanceToggleEl.checked = !!state.pollinations.enhance;
  if(safeToggleEl) safeToggleEl.checked = !!state.pollinations.safe;
  if(nologoToggleEl) nologoToggleEl.checked = !!state.pollinations.nologo;
  if(privateToggleEl) privateToggleEl.checked = !!state.pollinations.privateMode;

  if(aihordeKeyInputEl) aihordeKeyInputEl.value = state.aihorde.apikey;
  if(aihordeModelInputEl) aihordeModelInputEl.value = state.aihorde.model;
  if(aihordeStepsSelectEl) aihordeStepsSelectEl.value = String(state.aihorde.steps ?? 25);
  if(aihordeSamplerSelectEl) aihordeSamplerSelectEl.value = state.aihorde.sampler_name ?? "k_euler_a";
}

function renderResult(){
  resultWrapEl.innerHTML = "";
  if(!state.imageUrl){
    resultWrapEl.innerHTML = `<div class="muted">Noch kein Bild vorhanden.</div>`;
    saveToGalleryBtn.disabled = true;
    return;
  }
  const img = document.createElement("img");
  img.src = state.imageUrl;
  img.alt = "Generiertes Ergebnis";
  resultWrapEl.appendChild(img);
  saveToGalleryBtn.disabled = false;
}

function renderSummary(){
  if(!summaryTextEl) return;
  const concept = concepts.find(x => x.id === state.conceptId);
  const style = styles.find(x => x.id === state.styleId);

  summaryTextEl.textContent =
`Konzept: ${concept ? concept.title : "—"}
Entitäten: ${state.entities ? cut(state.entities, 140) : "—"}
Handlung: ${state.action ? cut(state.action, 140) : "—"}
Umgebung: ${state.environment ? cut(state.environment, 140) : "—"}
Style: ${state.styleMeta?.pathTitles?.join(" › ") || (style ? style.title : "—")}

Dienst: ${state.provider}
Größe: ${state.pollinations.width}x${state.pollinations.height}

Pollinations: model=${state.pollinations.model}, seed=${state.pollinations.seed}, enhance=${!!state.pollinations.enhance}, safe=${!!state.pollinations.safe}
AI Horde: model=${state.aihorde.model}, steps=${state.aihorde.steps}, sampler=${state.aihorde.sampler_name}, key=${state.aihorde.apikey ? cut(state.aihorde.apikey, 6) : "—"}…`;
}

// ----------------------------
// Gallery storage + render (sidebar + screen)
// ----------------------------
const GALLERY_KEY = "ki_wizard_gallery_v4_with_gallery_screen";

function loadGallery(){
  try{ return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]"); }
  catch{ return []; }
}
function saveGallery(items){
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

function renderGallerySidebar(){
  if(!state.gallery.prunedMissing){
    galleryGridEl.innerHTML = `<div class="muted">Prüfe Bilder...</div>`;
    return;
  }
  const items = loadGallery();
  galleryGridEl.innerHTML = "";
  if(items.length === 0){
    galleryGridEl.innerHTML = `<div class="muted">Noch leer.</div>`;
    return;
  }
  items.slice().reverse().slice(0, 9).forEach(item => {
    const el = document.createElement("div");
    el.className = "thumb";
    el.title = item.createdAt;
    el.innerHTML = `<img alt="Galerie Bild" src="${item.imageUrl}">`;
    el.onclick = () => {
      // open gallery and select it
      openGallery(item.id);
    };
    galleryGridEl.appendChild(el);
  });
}

function renderGalleryScreen(){
  if(!state.gallery.prunedMissing){
    galleryScreenGrid.innerHTML = `<div class="muted">Prüfe Bilder...</div>`;
    setGallerySelection(null);
    return;
  }
  const items = loadGallery().slice().reverse(); // newest first
  galleryScreenGrid.innerHTML = "";

  if(items.length === 0){
    galleryScreenGrid.innerHTML = `<div class="muted">Noch leer. Erzeuge ein Bild und speichere es in die Galerie.</div>`;
    setGallerySelection(null);
    return;
  }

  items.forEach(item => {
    const el = document.createElement("div");
    el.className = "galleryThumb" + (state.gallery.selectedId === item.id ? " selected" : "");
    el.title = item.createdAt;
    el.innerHTML = `
      <img alt="Galerie Bild" src="${item.imageUrl}">
      <div class="meta">${item.size || "—"}</div>
    `;

    el.onclick = () => setGallerySelection(item.id);
    el.ondblclick = () => {
      setGallerySelection(item.id);
      openSelectedGalleryAsResult();
    };

    galleryScreenGrid.appendChild(el);
  });

  // if nothing selected yet -> select first
  if(!state.gallery.selectedId){
    setGallerySelection(items[0].id);
  }else{
    // refresh preview of current selection
    setGallerySelection(state.gallery.selectedId, { silent: true });
  }
}

function getGalleryItemById(id){
  const items = loadGallery();
  return items.find(x => x.id === id) || null;
}

function setGallerySelection(id, opts = {}){
  state.gallery.selectedId = id;

  const item = id ? getGalleryItemById(id) : null;

  if(!item){
    galleryPreviewWrap.innerHTML = `<div class="muted">Wähle links ein Bild aus.</div>`;
    galleryPromptPreview.textContent = "-";
    if(openFromGalleryBtn) openFromGalleryBtn.disabled = true;
    if(deleteFromGalleryBtn) deleteFromGalleryBtn.disabled = true;
  }else{
    galleryPreviewWrap.innerHTML = "";
    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = "Galerie Preview";
    galleryPreviewWrap.appendChild(img);

    galleryPromptPreview.textContent = item.prompt || "-";
    if(openFromGalleryBtn) openFromGalleryBtn.disabled = false;
    if(deleteFromGalleryBtn) deleteFromGalleryBtn.disabled = false;
  }

  if(!opts.silent){
    renderGalleryScreen(); // re-render to update selected state
  }
}

function saveCurrentToGallery(){
  if(!state.imageUrl) return;

  const items = loadGallery();
  items.push({
    id: safeId(),
    createdAt: new Date().toISOString(),
    imageUrl: state.imageUrl,
    prompt: state.prompt,
    provider: state.provider,
    size: `${state.pollinations.width}x${state.pollinations.height}`,
    pollinations: { ...state.pollinations },
    aihorde: { ...state.aihorde }
  });
  saveGallery(items);
}

function deleteSelectedFromGallery(){
  if(!ENABLE_DELETE_IMAGE) return;
  const id = state.gallery.selectedId;
  if(!id) return;

  const items = loadGallery();
  const idx = items.findIndex(x => x.id === id);
  if(idx < 0) return;

  items.splice(idx, 1);
  saveGallery(items);

  // choose next selection
  const remaining = loadGallery().slice().reverse();
  state.gallery.selectedId = remaining[0]?.id || null;

  renderGallerySidebar();
  renderGalleryScreen();
  setPill("Gelöscht");
  setTimeout(() => setPill("Bereit"), 900);
}

function clearGallery(){
  if(!ENABLE_CLEAR_GALLERY) return;
  localStorage.removeItem(GALLERY_KEY);
  state.gallery.selectedId = null;
  renderGallerySidebar();
  renderGalleryScreen();
  setPill("Galerie geleert");
  setTimeout(() => setPill("Bereit"), 900);
}

function openSelectedGalleryAsResult(){
  const id = state.gallery.selectedId;
  const item = id ? getGalleryItemById(id) : null;
  if(!item) return;

  state.imageUrl = item.imageUrl;
  state.prompt = item.prompt || "";
  state.screen = 5;            // go to result screen
  state.lastWizardScreen = 5;  // for returning
  render();
}

// ----------------------------
// Provider UI
// ----------------------------
function updateProviderUI(){
  if(!providerSelectEl) return;
  const isPoll = state.provider === "pollinations";
  pollinationsOptionsEl.classList.toggle("hidden", !isPoll);
  aihordeOptionsEl.classList.toggle("hidden", isPoll);

  if(isPoll){
    setBadge(providerStatusBadgeEl, "unknown", "Pollinations", "Status wird geprüft…");
  }else{
    setBadge(providerStatusBadgeEl, "unknown", "AI Horde", "Status wird geprüft…");
    setBadge(modelStatusBadgeEl, "unknown", "—", "Nur für Pollinations relevant.");
  }
}

function readProviderFromDom(){
  if(!providerSelectEl) return;
  state.provider = providerSelectEl.value || "pollinations";
  updateProviderUI();

  if(state.provider === "aihorde"){
    capToThumbsForAIHorde();
    const sizeVal = `${state.pollinations.width}x${state.pollinations.height}`;
    if (sizeSelectEl && [...sizeSelectEl.options].some(o => o.value === sizeVal)) sizeSelectEl.value = sizeVal;
  }

  renderSummary();

  if(state.provider === "pollinations"){
    refreshPollinationsModelStatus();
  }else{
    setBadge(providerStatusBadgeEl, "unknown", "AI Horde", "Prüfe heartbeat…");
    aihordeHeartbeat()
      .then(()=> setBadge(providerStatusBadgeEl, "ok", "AI Horde OK", "Endpoint erreichbar."))
      .catch(()=> setBadge(providerStatusBadgeEl, "warn", "AI Horde ?", "Heartbeat nicht erreichbar (CORS/Netz/Down)."));
  }
}

function readPollinationsOptionsFromDom(){
  if(!modelSelectEl || !seedInputEl || !sizeSelectEl) return;
  state.pollinations.model = modelSelectEl.value.trim() || "flux";
  state.pollinations.seed = seedInputEl.value.trim() || "random";

  const [w,h] = (sizeSelectEl.value || "512x512").split("x").map(Number);
  state.pollinations.width = Number.isFinite(w) ? w : 512;
  state.pollinations.height = Number.isFinite(h) ? h : 512;

  state.pollinations.enhance = !!enhanceToggleEl.checked;
  state.pollinations.safe = !!safeToggleEl.checked;
  state.pollinations.nologo = !!nologoToggleEl.checked;
  state.pollinations.privateMode = !!privateToggleEl.checked;

  if(state.provider === "aihorde"){
    capToThumbsForAIHorde();
    const sizeVal = `${state.pollinations.width}x${state.pollinations.height}`;
    if (sizeSelectEl && [...sizeSelectEl.options].some(o => o.value === sizeVal)) sizeSelectEl.value = sizeVal;
  }

  renderSummary();
  updatePollinationsModelBadge();
}

function readAIHordeOptionsFromDom(){
  if(!aihordeKeyInputEl || !aihordeModelInputEl || !aihordeStepsSelectEl || !aihordeSamplerSelectEl) return;
  state.aihorde.apikey = (aihordeKeyInputEl.value || "").trim() || "0000000000";
  state.aihorde.model = (aihordeModelInputEl.value || "").trim() || "Deliberate";
  state.aihorde.steps = Number(aihordeStepsSelectEl.value || 25);
  state.aihorde.sampler_name = aihordeSamplerSelectEl.value || "k_euler_a";

  if(state.provider === "aihorde") capToThumbsForAIHorde();
  renderSummary();
}

// ----------------------------
// Navigation (Wizard + Gallery)
// ----------------------------
function render(){
  renderSteps();
  renderConcepts();
  renderStyles();
  renderConceptPreview();
  updatePromptFieldLabels();
  renderSummary();
  ensureGalleryPruned();
  renderGallerySidebar();
  if(appEl) appEl.classList.toggle("gallery-mode", state.screen === 6);
  if(clearGalleryBtn){
    clearGalleryBtn.disabled = !ENABLE_CLEAR_GALLERY;
    clearGalleryBtn.classList.toggle("hidden", !ENABLE_CLEAR_GALLERY);
  }
  if(deleteFromGalleryBtn){
    deleteFromGalleryBtn.disabled = !ENABLE_DELETE_IMAGE;
    deleteFromGalleryBtn.classList.toggle("hidden", !ENABLE_DELETE_IMAGE);
  }
  if(debugBoxEl){
    debugBoxEl.hidden = !SHOW_DEBUG;
    debugBoxEl.classList.toggle("hidden", !SHOW_DEBUG);
  }
  if(statusPillEl){
    statusPillEl.hidden = !SHOW_STATUS_PILL;
    statusPillEl.classList.toggle("hidden", !SHOW_STATUS_PILL);
  }
  showScreen(state.screen);
  updateDomFromState();

  // top tabs
  setTopTab(state.screen === 6 ? "gallery" : "wizard");

  // bottom nav hidden on gallery screen
  bottomNav.classList.toggle("hidden", state.screen === 6);

  // wizard nav state
  backBtn.disabled = state.isGenerating || state.screen === 1;

  if(state.screen === 4 || state.screen === 5 || state.screen === 6){
    nextBtn.disabled = true;
    nextBtn.textContent = "Weiter →";
  }else{
    nextBtn.disabled = state.isGenerating || !validateScreen(state.screen);
    nextBtn.textContent = (state.screen === 3) ? "Generieren..." : "Weiter →";
  }
  nextBtn.classList.toggle("btn--cta", state.screen === 3 && !state.isGenerating);

  // mirror nav state to top arrows
  if(stepsBackBtn) stepsBackBtn.disabled = backBtn.disabled;
  if(stepsNextBtn) stepsNextBtn.disabled = nextBtn.disabled;

  if(state.screen === 5){
    renderResult();
  }

  if(state.screen === 6){
    renderGalleryScreen();
  }
}

async function onNext(){
  updateInputsFromDom();

  if(state.screen === 3){
    state.screen = 4;
    state.lastWizardScreen = 4;
    render();

    state.prompt = composePrompt();
    promptPreviewEl.textContent = state.prompt;

    try{
      let imgUrl = "";
      if(state.provider === "pollinations"){
        imgUrl = await generateWithPollinations(state.prompt);
      }else{
        imgUrl = await generateWithAIHorde(state.prompt);
      }

      state.imageUrl = imgUrl;
      state.screen = 5;
      state.lastWizardScreen = 5;
      render();
    }catch(err){
      setPill("Fehler");
      genTextEl.textContent = err?.message || "Unbekannter Fehler.";
      genBarEl.style.width = "0%";
      state.isGenerating = false;
      render();
    }
    return;
  }

  if(state.screen < 5) {
    state.screen += 1;
    state.lastWizardScreen = state.screen;
  }
  render();
}

function onBack(){
  updateInputsFromDom();
  if(state.screen > 1) {
    state.screen -= 1;
    state.lastWizardScreen = state.screen;
  }
  render();
}

function onReset(){
  Object.assign(state, {
    screen: 1,
    lastWizardScreen: 1,
    conceptId: null,
    styleId: null,
    styleMeta: null,
    entities: "",
    action: "",
    environment: "",
    prompt: "",
    imageUrl: "",
    isGenerating: false,
    provider: "aihorde",
    pollinations: {
      model: "flux",
      seed: "random",
      width: 512,
      height: 512,
      nologo: true,
      enhance: true,
      safe: true,
      privateMode: false,
      availableModels: null,
      lastModelCheckAt: null
    },
    aihorde: {
      apikey: "ip14hvWQvjgyFcXQCg9nmQ",
      model: "Deliberate",
      steps: 25,
      cfg_scale: 7,
      sampler_name: "k_euler_a",
      n: 1
    },
    gallery: { selectedId: null }
  });

  setPill("Bereit");
  genBarEl.style.width = "0%";
  genTextEl.textContent = "Noch nicht gestartet.";
  pollinationsUrlPreviewEl.textContent = "—";

  updateProviderUI();
  render();
}

// open gallery
function openGallery(selectId = null){
  if(state.screen !== 6){
    state.lastWizardScreen = Math.min(Math.max(state.screen, 1), 5);
  }
  state.screen = 6;
  if(selectId) state.gallery.selectedId = selectId;
  state.gallery.prunedMissing = false;
  render();
}

function openWizard(){
  state.screen = state.lastWizardScreen || 1;
  render();
}

// ----------------------------
// Actions
// ----------------------------
function saveToGalleryAction(){
  if(!state.imageUrl) return;
  saveCurrentToGallery();
  renderGallerySidebar();
  setPill("In Galerie gespeichert");
  setTimeout(() => setPill("Bereit"), 1200);
}

function newRun(){
  state.entities = "";
  state.action = "";
  state.environment = "";
  state.prompt = "";
  state.imageUrl = "";
  state.screen = 2;
  state.lastWizardScreen = 2;

  setPill("Bereit");
  genBarEl.style.width = "0%";
  genTextEl.textContent = "Noch nicht gestartet.";
  pollinationsUrlPreviewEl.textContent = "—";
  render();
}

// ----------------------------
// Events
// ----------------------------
backBtn.addEventListener("click", onBack);
nextBtn.addEventListener("click", onNext);
resetBtn.addEventListener("click", onReset);

[entitiesEl, actionEl, environmentEl].forEach(el => {
  el.addEventListener("input", () => {
    updateInputsFromDom();
    renderSummary();
    if(state.screen !== 6) nextBtn.disabled = !validateScreen(state.screen);
  });
});

saveToGalleryBtn.addEventListener("click", saveToGalleryAction);
newRunBtn.addEventListener("click", newRun);

if(providerSelectEl) providerSelectEl.addEventListener("change", readProviderFromDom);

[modelSelectEl, seedInputEl, sizeSelectEl, enhanceToggleEl, safeToggleEl, nologoToggleEl, privateToggleEl]
  .filter(Boolean)
  .forEach(el => el.addEventListener("change", readPollinationsOptionsFromDom));

[aihordeKeyInputEl, aihordeModelInputEl, aihordeStepsSelectEl, aihordeSamplerSelectEl]
  .filter(Boolean)
  .forEach(el => el.addEventListener("change", readAIHordeOptionsFromDom));

// top nav actions
openGalleryFromSideBtn.addEventListener("click", () => openGallery());

// gallery screen buttons
clearGalleryBtn.addEventListener("click", clearGallery);
if(backToWizardBtn) backToWizardBtn.addEventListener("click", openWizard);
if(openFromGalleryBtn) openFromGalleryBtn.addEventListener("click", openSelectedGalleryAsResult);
if(deleteFromGalleryBtn) deleteFromGalleryBtn.addEventListener("click", deleteSelectedFromGallery);
if(stepsBackBtn) stepsBackBtn.addEventListener("click", onBack);
if(stepsNextBtn) stepsNextBtn.addEventListener("click", onNext);

// ----------------------------
// Init
// ----------------------------
updateProviderUI();
readProviderFromDom();
readPollinationsOptionsFromDom();
readAIHordeOptionsFromDom();
initGallerySplitter();
render();

setInterval(() => {
  if(state.provider === "pollinations") refreshPollinationsModelStatus();
}, 60000);
function checkImageAvailable(url, timeoutMs = 5000){
  return new Promise((resolve) => {
    const u = String(url || "").trim();
    if(!u) return resolve(false);

    const img = new Image();
    let done = false;

    const to = setTimeout(() => {
      if(done) return;
      done = true;
      try{ img.src = ""; }catch{}
      resolve(false);
    }, timeoutMs);

    img.onload = () => {
      if(done) return;
      done = true;
      clearTimeout(to);
      resolve(img.naturalWidth > 0);
    };
    img.onerror = () => {
      if(done) return;
      done = true;
      clearTimeout(to);
      resolve(false);
    };

    img.src = u;
  });
}

async function pruneGalleryMissingImages(){
  if(state.gallery.prunedMissing) return false;
  state.gallery.prunedMissing = true;

  const items = loadGallery();
  if(items.length === 0) return false;

  const checks = await Promise.all(items.map(item => checkImageAvailable(item.imageUrl)));
  const filtered = items.filter((_, idx) => checks[idx]);
  if(filtered.length !== items.length){
    saveGallery(filtered);
    return true;
  }
  return false;
}

function ensureGalleryPruned(){
  if(state.gallery.prunedMissing) return;
  pruneGalleryMissingImages().then((changed) => {
    if(!changed) return;
    renderGallerySidebar();
    if(state.screen === 6) renderGalleryScreen();
  });
}

function initGallerySplitter(){
  if(!galleryLayoutEl || !galleryDividerEl) return;
  let dragging = false;

  function setSplit(clientX){
    const rect = galleryLayoutEl.getBoundingClientRect();
    if(rect.width <= 0) return;
    const leftPx = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const leftPct = leftPx / rect.width;
    const clamped = Math.min(Math.max(leftPct, 0.35), 0.75);
    galleryLayoutEl.style.setProperty("--gallery-left", `${Math.round(clamped * 1000) / 10}%`);
  }

  galleryDividerEl.addEventListener("pointerdown", (e) => {
    dragging = true;
    galleryDividerEl.setPointerCapture(e.pointerId);
    setSplit(e.clientX);
    e.preventDefault();
  });
  galleryDividerEl.addEventListener("pointermove", (e) => {
    if(!dragging) return;
    setSplit(e.clientX);
  });
  galleryDividerEl.addEventListener("pointerup", () => { dragging = false; });
  galleryDividerEl.addEventListener("pointercancel", () => { dragging = false; });
}
