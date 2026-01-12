/* styleRail.js
   Minimaler, modularer Style-Rail-Renderer (Carousel) für die Wizard-App.
   - Lädt ./presets.json (hierarchisch)
   - Rendert Breadcrumbs + Rail (Cards) wie in style_index.html
   - Meldet Auswahl an die App zurück (onCommit(meta))

   API:
     const rail = createStyleRail({ mountEl, dataUrl, onCommit })
     rail.sync({ committedId })   // optional (setzt Rail auf einen bestehenden Style)
     rail.destroy()
*/

(function(){
  function $(root, sel){ return root.querySelector(sel); }
  function esc(s){
    return String(s ?? "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
  function normalizeThumb(raw){
    const t = (typeof raw === "string" ? raw.trim() : "");
    if(!t) return "";
    if(/^https?:\/\//i.test(t)) return t;
    if(t.startsWith("./") || t.startsWith("/") ) return t;
    if(t.startsWith("thumbs/")) return "./" + t;
    return "./" + t;
  }
  const FALLBACK_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 240 160'><rect width='240' height='160' fill='%23e7ecf6'/><path d='M64 56h112v8H64zm0 24h112v8H64zm0 24h72v8H64z' fill='%238aa1c7'/></svg>";

  function dedupePromptParts(parts){
    const seen = new Set();
    const out = [];
    for(const p of parts || []){
      const k = String(p ?? "").trim().toLowerCase();
      if(!k) continue;
      if(seen.has(k)) continue;
      seen.add(k);
      out.push(String(p).trim());
    }
    return out;
  }

  function createStyleRail(opts){
    const mountEl = opts?.mountEl;
    const dataUrl = opts?.dataUrl || "./presets.json";
    const onCommit = typeof opts?.onCommit === "function" ? opts.onCommit : null;

    if(!mountEl) throw new Error("createStyleRail: mountEl fehlt");

    // If mount has grid classes from older UI, remove them to avoid layout conflicts
    mountEl.classList.remove("grid","grid--3");
    mountEl.innerHTML = "";
    mountEl.setAttribute("data-style-rail-mount", "1");

    const rootWrap = document.createElement("div");
    rootWrap.className = "styleNav";
    rootWrap.innerHTML = `
      <nav class="snBreadcrumbs" aria-label="Breadcrumbs"></nav>

      <div class="snRailWrap" aria-label="Style Fenster">
        <div class="snFade left" aria-hidden="true"></div>
        <div class="snFade right" aria-hidden="true"></div>
        <div class="snRail" tabindex="0" role="list" aria-label="Stile (Carousel)"></div>
      </div>
    `;
    mountEl.appendChild(rootWrap);

    const elCrumbs = $(rootWrap, ".snBreadcrumbs");
    const elTitle = rootWrap.querySelector(".snTitle");
    const elMeta = rootWrap.querySelector(".snMeta");
    const elRail = rootWrap.querySelector(".snRail");
    const btnHome = rootWrap.querySelector('[data-act="home"]');
const btnBack = rootWrap.querySelector('[data-act="back"]');
const btnLeft = rootWrap.querySelector('[data-act="left"]');
const btnRight = rootWrap.querySelector('[data-act="right"]');

                
    let treeRoot = null;
    const byId = new Map();     // id -> node
    const parentById = new Map(); // id -> parentId (root has null)
    let path = ["root"];        // current node path (ids)
    let selectedChildId = null; // selection at current level (child id)
    let committedMeta = null;

    let destroyed = false;
    let pendingSyncId = null;

    function nodeIsLeaf(n){
      return !(n && Array.isArray(n.children) && n.children.length);
    }
    function indexTree(node, parentId){
      if(!node || !node.id) return;
      byId.set(node.id, node);
      parentById.set(node.id, parentId ?? null);
      const kids = Array.isArray(node.children) ? node.children : [];
      for(const ch of kids){
        indexTree(ch, node.id);
      }
    }
    function getNode(id){ return byId.get(id) || null; }
    function currentNode(){ return getNode(path[path.length-1]) || treeRoot; }
    function childrenOfCurrent(){
      const n = currentNode();
      return Array.isArray(n?.children) ? n.children : [];
    }

    function buildPromptPartsForPreview(){
      const nodes = path.map(getNode).filter(Boolean);
      const child = selectedChildId ? getNode(selectedChildId) : null;

      const parts = [];
      for(const n of nodes){
        if(Array.isArray(n.promptParts)) parts.push(...n.promptParts);
      }
      // preview next without navigating
      if(child && !path.includes(child.id) && Array.isArray(child.promptParts)){
        parts.push(...child.promptParts);
      }
      return dedupePromptParts(parts);
    }

    function buildMeta(){
      const baseIds = [...path];
      if(selectedChildId && !baseIds.includes(selectedChildId)) baseIds.push(selectedChildId);

      const nodes = baseIds.map(getNode).filter(Boolean);
      const lastId = baseIds[baseIds.length-1] || "root";
      const lastNode = getNode(lastId) || { id:lastId, title:lastId };

      const promptParts = buildPromptPartsForPreview();

      const meta = {
        id: lastId,
        title: lastNode.title || lastId,
        description: lastNode.description || "",
        tags: Array.isArray(lastNode.tags) ? lastNode.tags : [],
        thumb: typeof lastNode.thumb === "string" ? lastNode.thumb : "",
        isLeaf: nodeIsLeaf(lastNode),
        pathIds: baseIds,
        pathTitles: nodes.map(n => n.title || n.id),
        promptParts
      };
      return meta;
    }

    function commit(reason){
      committedMeta = buildMeta();if(onCommit) onCommit(committedMeta);
    }

    function renderCrumbs(){
      if(!elCrumbs) return;
      elCrumbs.innerHTML = "";
      const nodes = path.map(getNode).filter(Boolean);
      nodes.forEach((n, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "snCrumb";
        btn.textContent = n.title || n.id;
        if(idx === nodes.length-1){
          btn.setAttribute("aria-current", "page");
        }
        btn.addEventListener("click", () => {
          if(destroyed) return;
          path = path.slice(0, idx+1);
          // auto select first child (like style_index)
          const kids = childrenOfCurrent();
          selectedChildId = kids[0]?.id || null;
          renderAll();
          if(selectedChildId) commit("Ausgewählt");
        });
        elCrumbs.appendChild(btn);
      });
    }

    function renderHead(){
      const n = currentNode() || treeRoot;
      if(!n) return;
      if(elTitle) elTitle.textContent = n.title || "";
      const kids = Array.isArray(n.children) ? n.children.length : 0;
      if(elMeta) elMeta.textContent = kids ? `${kids} Optionen` : "-";
      if(btnBack) btnBack.disabled = path.length <= 1;
    }

    function scrollCardIntoView(cardEl){
      if(!cardEl || !elRail) return;
      const r = elRail.getBoundingClientRect();
      const c = cardEl.getBoundingClientRect();
      const targetLeft = (c.left - r.left) + elRail.scrollLeft - (r.width/2) + (c.width/2);
      elRail.scrollTo({ left: targetLeft, behavior: "smooth" });
    }

    function renderRail(){
      if(!elRail) return;
      elRail.innerHTML = "";
      const kids = childrenOfCurrent();

      kids.forEach((child) => {
        const leaf = nodeIsLeaf(child);
        const selected = selectedChildId === child.id;

        const card = document.createElement("div");
        card.className = "snCard" + (selected ? " selected" : "") + (leaf ? " leaf" : "");
        card.dataset.id = child.id;
        card.setAttribute("role", "listitem");
        card.tabIndex = 0;

        const thumbUrl = normalizeThumb(child.thumb);
        const thumbSrc = thumbUrl || FALLBACK_THUMB;
        const thumbImg = `<img src="${esc(thumbSrc)}" alt="${esc(child.title)} Thumbnail" loading="lazy">`;

        const tags = Array.isArray(child.tags) ? child.tags : [];
        const tagsHtml = tags.slice(0, 3).map(t => `<span class="snTag">${esc(t)}</span>`).join("");

        const plus = leaf ? "" : `<div class="snBadgePlus" role="button" tabindex="0" aria-label="Öffnen">+</div>`;

        card.innerHTML = `
          <div class="snPoster">
            ${thumbImg}
            ${plus}
          </div>
          <div class="snBody">
            <div class="snName">${esc(child.title || child.id)}</div>
            <div class="snDesc">${esc(child.description || "")}</div>
            <div class="snTags">${tagsHtml}</div>
          </div>
        `;
        const imgEl = card.querySelector("img");
        if(imgEl){
          imgEl.addEventListener("error", () => {
            imgEl.src = FALLBACK_THUMB;
          }, { once: true });
        }

        function selectCard(){
          selectedChildId = child.id;
          renderRail(); // just update selection
          commit("Ausgewählt");
          // keep scroll centered
          const newCard = Array.from(elRail.children).find(x => x.classList.contains("snCard") && x.dataset && x.dataset.id === child.id);
          scrollCardIntoView(newCard || card);
        }

        function drillDown(){
          if(leaf) return;
          path = [...path, child.id];
          const nextKids = childrenOfCurrent();
          selectedChildId = nextKids[0]?.id || null;
          renderAll();
          if(selectedChildId) commit("Ausgewählt");
        }

        card.addEventListener("click", (e) => {
          // clicking plus should not also select twice
          const isPlus = e?.target?.classList?.contains("snBadgePlus");
          if(isPlus) return;
          selectCard();
        });

        card.addEventListener("dblclick", () => {
          if(!leaf) drillDown();
        });

        card.addEventListener("keydown", (e) => {
          if(e.key === "Enter"){
            selectCard();
          }else if(e.key === " "){
            e.preventDefault();
            if(!leaf) drillDown();
            else selectCard();
          }else if(e.key === "ArrowLeft" || e.key === "ArrowRight"){
            // let rail-level handler do it
          }
        });

        const plusBtn = card.querySelector(".snBadgePlus");
        if(plusBtn){
          plusBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            drillDown();
          });
          plusBtn.addEventListener("keydown", (e) => {
            if(e.key === "Enter" || e.key === " "){
              e.preventDefault();
              drillDown();
            }
          });
        }

        elRail.appendChild(card);
      });

      // ensure a selection
      if(!selectedChildId && kids.length){
        selectedChildId = kids[0].id;
        // do not commit automatically here; keep passive
      }

      // focus selected card if rail itself is focused
      const selectedCard = Array.from(elRail.children).find(x => x.classList.contains("snCard") && x.classList.contains("selected"));
      if(selectedCard) scrollCardIntoView(selectedCard);
    }

    function renderAll(){
      renderCrumbs();
      renderHead();
      renderRail();
    }

    function goHome(){
      path = ["root"];
      const kids = childrenOfCurrent();
      selectedChildId = kids[0]?.id || null;
      renderAll();
      if(selectedChildId) commit("Ausgewählt");
    }

    function goBack(){
      if(path.length <= 1) return;
      path = path.slice(0, -1);
      const kids = childrenOfCurrent();
      selectedChildId = kids[0]?.id || null;
      renderAll();
      if(selectedChildId) commit("Ausgewählt");
    }

    function scrollByAmount(dir){
      if(!elRail) return;
      const amt = Math.max(260, Math.floor(elRail.clientWidth * 0.75));
      elRail.scrollBy({ left: dir * amt, behavior: "smooth" });
    }

    function chainToRoot(id){
      const chain = [];
      let cur = id;
      let guard = 0;
      while(cur && guard < 1000){
        chain.push(cur);
        cur = parentById.get(cur);
        guard++;
      }
      chain.reverse();
      if(chain[0] !== "root"){
        // if something weird, just fallback
        return ["root", id].filter(Boolean);
      }
      return chain;
    }

    function applySync(committedId){
      if(!treeRoot) { pendingSyncId = committedId; return; }
      if(!committedId || !byId.has(committedId)){
        // reset to root view (keep selection)
        if(path[0] !== "root") path = ["root"];
        renderAll();
        return;
      }

      // show committed item selected at its parent level
      const chain = chainToRoot(committedId); // includes root and committedId
      if(chain.length === 1){
        path = ["root"];
        selectedChildId = null;
      }else{
        path = chain.slice(0, -1);
        selectedChildId = committedId;
      }
      renderAll();
    }

    function onRailKeydown(e){
      if(!elRail) return;
      const kids = childrenOfCurrent();
      if(!kids.length) return;

      const idx = Math.max(0, kids.findIndex(k => k.id === selectedChildId));
      if(e.key === "ArrowLeft"){
        e.preventDefault();
        const ni = (idx - 1 + kids.length) % kids.length;
        selectedChildId = kids[ni].id;
        renderRail();
        // do not auto-commit on arrow; only on Enter
      }else if(e.key === "ArrowRight"){
        e.preventDefault();
        const ni = (idx + 1) % kids.length;
        selectedChildId = kids[ni].id;
        renderRail();
      }else if(e.key === "Enter"){
        e.preventDefault();
        commit("Ausgewählt");
      }else if(e.key === " "){
        e.preventDefault();
        const n = getNode(selectedChildId);
        if(n && !nodeIsLeaf(n)){
          path = [...path, n.id];
          const nk = childrenOfCurrent();
          selectedChildId = nk[0]?.id || null;
          renderAll();
          if(selectedChildId) commit("Ausgewählt");
        }else{
          commit("Ausgewählt");
        }
      }else if(e.key === "Escape"){
        e.preventDefault();
        goBack();
      }
    }

    function wire(){
      if(btnHome) btnHome.addEventListener("click", () => { if(!destroyed) goHome(); });
      if(btnBack) btnBack.addEventListener("click", () => { if(!destroyed) goBack(); });
      if(btnLeft) btnLeft.addEventListener("click", () => { if(!destroyed) scrollByAmount(-1); });
      if(btnRight) btnRight.addEventListener("click", () => { if(!destroyed) scrollByAmount(1); });
      if(elRail) elRail.addEventListener("keydown", onRailKeydown);
    }

    async function load(){
      try{
        const url = dataUrl + (dataUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
        const res = await fetch(url, { cache: "no-store" });
        if(!res.ok) throw new Error("Presets konnten nicht geladen werden (" + res.status + ")");
        const json = await res.json();
        treeRoot = json?.root || json || null;
        if(!treeRoot || treeRoot.id !== "root"){
          // try to coerce if top-level is root-ish
          if(treeRoot?.root) treeRoot = treeRoot.root;
        }
        if(!treeRoot || !treeRoot.id) throw new Error("presets.json hat kein root-Objekt");

        byId.clear();
        parentById.clear();
        indexTree(treeRoot, null);

        // initial selection
        path = ["root"];
        const kids = childrenOfCurrent();
        selectedChildId = kids[0]?.id || null;

        renderAll();

        // apply pending sync selection (e.g., when returning to screen 3)
        if(pendingSyncId){
          const tmp = pendingSyncId;
          pendingSyncId = null;
          applySync(tmp);
        }

      }catch(err){
        if(elTitle) elTitle.textContent = "Fehler beim Laden";
        if(elMeta) elMeta.textContent = "—";
        if(elRail) elRail.innerHTML = `<div class="muted" style="padding:12px">` + esc(err?.message || "Unbekannter Fehler") + `</div>`;
              }
    }

    wire();
    load();

    return {
      sync: ({ committedId } = {}) => applySync(committedId),
      getCommittedMeta: () => committedMeta,
      destroy: () => {
        destroyed = true;
        // (intentionally light – mount is removed with page unload)
      }
    };
  }

  window.createStyleRail = createStyleRail;
})();
