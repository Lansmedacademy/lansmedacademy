/* ============================================================================
   LANS MED Academy — CMS → Frontend connector  (cms-content.js)
   ----------------------------------------------------------------------------
   WHAT THIS DOES
   - Loads the content you publish in /admin (notes, blog, youtube videos…)
   - Shows it on the homepage using your EXISTING card designs
   - Makes the subject cards + note cards clickable
   - Opens a clean reading modal for notes, blog posts and video embeds
   - Falls back to nice demo cards when a content file is empty/missing

   SAFE BY DESIGN
   - Only READS files and writes into existing containers by their IDs.
   - Never touches Google Analytics, Search Console, Netlify Forms, SEO tags,
     the <head>, or your styling.
   - If something isn't found, it quietly shows demo content instead.

   PATHS
   - Decap (in your setup) saves to  admin/content/<name>.json
   - We also try        content/<name>.json   as a fallback, so it works
     no matter which convention your config.yml uses.
   ============================================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------- */
  /* 1) SMALL HELPERS                                                        */
  /* ---------------------------------------------------------------------- */

  // Try several paths and return the first JSON that loads. Returns null if none.
  async function loadContent(name) {
    const candidates = ["admin/content/" + name + ".json", "content/" + name + ".json"];
    for (const path of candidates) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (res.ok) return await res.json();
      } catch (e) { /* try next path */ }
    }
    return null;
  }

  // Decap may store the list under different keys. Grab the first array we find.
  function asList(data, keys) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    for (const k of keys) if (Array.isArray(data[k])) return data[k];
    for (const k in data) if (Array.isArray(data[k])) return data[k]; // last resort
    return [];
  }

  // Escape user text before putting it in HTML.
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Brand colour per subject (matches your demo palette).
  const COLORS = {
    Anatomy: "#e0524e", Physiology: "#0ea394", Pharmacology: "#15a06b", Pathology: "#d9a441",
    Biochemistry: "#0ea394", "Internal Medicine": "#e0524e", Surgery: "#15a06b",
    Radiology: "#0ea394", Histology: "#d9a441", "Clinical Medicine": "#0ea394",
    "Clinical Pearls": "#0ea394", "Medical School Tips": "#e0524e", Endocrinology: "#15a06b"
  };
  const colorFor = (k) => COLORS[k] || "#0ea394";

  // The subject filters required on the Notes section.
  const SUBJECTS = ["Anatomy", "Physiology", "Pathology", "Pharmacology", "Biochemistry",
    "Internal Medicine", "Surgery", "Radiology", "Histology"];

  // Lazy-load a Markdown parser only when a note/post body needs it.
  let markedPromise = null;
  function ensureMarked() {
    if (window.marked) return Promise.resolve();
    if (markedPromise) return markedPromise;
    markedPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js";
      s.onload = resolve; s.onerror = resolve;
      document.head.appendChild(s);
    });
    return markedPromise;
  }
  async function mdToHtml(text) {
    if (!text) return "";
    await ensureMarked();
    return window.marked ? window.marked.parse(text) : "<p>" + esc(text) + "</p>";
  }

  /* ---------------------------------------------------------------------- */
  /* 2) REUSABLE READING MODAL (notes, blog posts, video embeds)             */
  /* ---------------------------------------------------------------------- */
  function ensureModal() {
    let m = document.getElementById("cmsModal");
    if (m) return m;
    m = document.createElement("div");
    m.id = "cmsModal";
    m.className = "cms-modal";
    m.innerHTML =
      '<div class="cms-modal-box">' +
      '  <button class="cms-modal-close" aria-label="Close">×</button>' +
      '  <div class="cms-modal-content"></div>' +
      "</div>";
    document.body.appendChild(m);
    m.addEventListener("click", (e) => { if (e.target === m) closeModal(); });
    m.querySelector(".cms-modal-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    return m;
  }
  function openModal(html) {
    const m = ensureModal();
    m.querySelector(".cms-modal-content").innerHTML = html;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    const m = document.getElementById("cmsModal");
    if (m) { m.classList.remove("open"); m.querySelector(".cms-modal-content").innerHTML = ""; } // stop video playback
    document.body.style.overflow = "";
  }

  /* ---------------------------------------------------------------------- */
  /* 3) MEDICAL NOTES  (load → render → filter → clickable → modal)          */
  /* ---------------------------------------------------------------------- */

  // Demo notes used only if the notes file has no entries.
  const DEMO_NOTES = [
    { title: "The Cardiac Cycle in 7 Steps", subject: "Physiology", level: "Year 1", description: "Pressure–volume changes, valves and heart sounds made intuitive." },
    { title: "Beta-Blockers: One Table", subject: "Pharmacology", level: "Year 2", description: "Selectivity, indications and side effects in a single high-yield grid." },
    { title: "Mechanisms of Cell Injury", subject: "Pathology", level: "Year 3", description: "Reversible vs irreversible injury with the key morphological clues." },
    { title: "Cranial Nerves Made Easy", subject: "Anatomy", level: "Year 1", description: "Functions, foramina and lesions for all twelve, with mnemonics." }
  ];

  let NOTES = [];            // active note list (CMS or demo)
  let notesFilter = "all";   // current subject filter
  let notesQuery = "";       // current search text
  let notesGridEl = null;

  function noteCard(n) {
    const col = colorFor(n.subject);
    const pdf = n.pdf
      ? '<a class="dl" href="' + esc(n.pdf) + '" target="_blank" rel="noopener" download>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12M7 11l5 4 5-4M5 21h14"/></svg> Download PDF</a>'
      : '<span class="dl" style="color:var(--muted);cursor:default;">Read note →</span>';
    const el = document.createElement("div");
    el.className = "note";
    el.style.cursor = "pointer";       // whole card is clickable (task 5)
    el.innerHTML =
      '<div class="meta">' +
        '<span class="subj" style="color:' + col + ';background:color-mix(in srgb,' + col + ' 14%,transparent)">' + esc(n.subject || "Notes") + '</span>' +
        (n.level ? '<span class="yr">' + esc(n.level) + '</span>' : "") +
      '</div>' +
      '<h4>' + esc(n.title) + '</h4>' +
      '<p>' + esc(n.description || "") + '</p>' +
      '<div class="foot">' + pdf +
        '<button class="bm" aria-label="Bookmark"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button>' +
      '</div>';
    // Clicking the card opens the full note (but not when clicking PDF/bookmark).
    el.addEventListener("click", (e) => {
      if (e.target.closest(".dl[href]") || e.target.closest(".bm")) return;
      openNote(n);
    });
    el.querySelector(".bm").addEventListener("click", (e) => { e.stopPropagation(); e.currentTarget.classList.toggle("saved"); });
    return el;
  }

  function drawNotes() {
    if (!notesGridEl) return;
    notesGridEl.innerHTML = "";
    const list = NOTES.filter((n) => {
      const okF = notesFilter === "all" || n.subject === notesFilter || n.level === notesFilter;
      const hay = ((n.title || "") + " " + (n.description || "") + " " + ((n.tags || []).join(" "))).toLowerCase();
      return okF && hay.includes(notesQuery);
    });
    if (!list.length) {
      notesGridEl.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;">No notes here yet — try another subject.</p>';
      return;
    }
    list.forEach((n) => notesGridEl.appendChild(noteCard(n)));
  }

  // Open the full note in the reading modal (task 6 & 7).
  async function openNote(n) {
    const col = colorFor(n.subject);
    const img = n.image ? '<img src="' + esc(n.image) + '" alt="' + esc(n.title) + '" style="width:100%;border-radius:14px;margin-bottom:16px;">' : "";
    const body = n.body ? await mdToHtml(n.body) : ("<p>" + esc(n.description || "") + "</p>");
    const tags = (n.tags && n.tags.length) ? '<p style="margin-top:14px;">' + n.tags.map((t) => '<span class="cms-tag-pill">' + esc(t) + '</span>').join(" ") + "</p>" : "";
    const pdf = n.pdf
      ? '<p style="margin-top:18px;"><a class="cms-pdf-btn" href="' + esc(n.pdf) + '" target="_blank" rel="noopener" download>⬇ Download PDF</a></p>'
      : "";
    openModal(
      img +
      '<span class="cms-modal-tag" style="color:' + col + '">' + esc(n.subject || "") + (n.level ? " · " + esc(n.level) : "") + "</span>" +
      '<h2 style="margin:6px 0 12px;">' + esc(n.title) + "</h2>" +
      '<div class="cms-prose">' + body + "</div>" + tags + pdf
    );
  }

  async function setupNotes() {
    notesGridEl = document.getElementById("notesGrid");
    if (!notesGridEl) return;

    // Load CMS notes; if none, use demo notes (task 13).
    const data = await loadContent("notes");
    const cms = asList(data, ["notes", "items", "posts"]);
    NOTES = cms.length ? cms : DEMO_NOTES;

    // Rebuild the filter bar + search with fresh nodes so any old handlers are
    // dropped, then wire ours. Filters always show every required subject (task 4).
    const oldFilters = document.getElementById("noteFilters");
    const oldSearch = document.getElementById("noteSearch");
    let filters = oldFilters, search = oldSearch;
    if (oldFilters) { filters = oldFilters.cloneNode(false); oldFilters.replaceWith(filters); }
    if (oldSearch) { search = oldSearch.cloneNode(true); oldSearch.replaceWith(search); }

    if (filters) {
      filters.innerHTML =
        '<button class="chip active" data-f="all">All</button>' +
        SUBJECTS.map((s) => '<button class="chip" data-f="' + esc(s) + '">' + esc(s) + "</button>").join("");
      filters.addEventListener("click", (e) => {
        if (!e.target.classList.contains("chip")) return;
        setNotesFilter(e.target.dataset.f, false);
      });
    }
    if (search) {
      search.addEventListener("input", (e) => { notesQuery = e.target.value.toLowerCase(); drawNotes(); });
    }
    drawNotes();
  }

  // Helper so the subject cards can drive the Notes filter.
  function setNotesFilter(subject, scroll) {
    notesFilter = subject || "all";
    const filters = document.getElementById("noteFilters");
    if (filters) {
      filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.f === notesFilter));
      if (!filters.querySelector(".chip.active")) {
        const allc = filters.querySelector('.chip[data-f="all"]'); if (allc) allc.classList.add("active");
      }
    }
    drawNotes();
    if (scroll) {
      const sec = document.getElementById("notes");
      if (sec) sec.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 4) MAKE THE SUBJECT / CATEGORY CARDS CLICKABLE (task 1 & 4)             */
  /* ---------------------------------------------------------------------- */
  function wireCategoryCards() {
    const section = document.getElementById("categories");
    if (!section) return;
    section.querySelectorAll(".cat").forEach((card) => {
      const h = card.querySelector("h3");
      if (!h) return;
      const subject = h.textContent.trim();
      card.style.cursor = "pointer";
      card.addEventListener("click", () => setNotesFilter(subject, true));
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 5) BLOG  (task 8)                                                       */
  /* ---------------------------------------------------------------------- */
  const DEMO_BLOG = [
    { title: "5 Clinical Signs Every Student Must Know", category: "Clinical Pearls", summary: "Quick, high-yield bedside signs that separate strong clinicians from the rest.", body: "Add your first blog post in **/admin → Blog Posts**." },
    { title: "How to Study Anatomy Without Burning Out", category: "Medical School Tips", summary: "A sustainable, spaced-repetition system for mastering anatomy in your first year.", body: "Add your first blog post in **/admin → Blog Posts**." },
    { title: "Memorise Drug Side Effects the Smart Way", category: "Pharmacology", summary: "Group drugs by mechanism and the side effects start to make sense.", body: "Add your first blog post in **/admin → Blog Posts**." }
  ];

  async function setupBlog() {
    const grid = document.getElementById("blogGrid");
    if (!grid) return;
    const data = await loadContent("blog");
    const posts = asList(data, ["posts", "items"]);
    const list = posts.length ? posts.slice().reverse() : DEMO_BLOG;

    grid.innerHTML = "";
    list.forEach((p) => {
      const col = colorFor(p.category);
      const top = p.image
        ? '<div class="top" style="background-image:url(\'' + esc(p.image) + '\');background-size:cover;background-position:center;"></div>'
        : '<div class="top" style="background:linear-gradient(135deg,' + col + ',var(--navy))"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M4 5h16M4 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5M8 9h8M8 13h6"/></svg></div>';
      const el = document.createElement("div");
      el.className = "post";
      el.style.cursor = "pointer";
      el.innerHTML = top +
        '<div class="body"><span class="cat" style="color:' + col + '">' + esc(p.category || "Article") + "</span>" +
        "<h4>" + esc(p.title) + "</h4><p>" + esc(p.summary || "") + "</p>" +
        '<a class="read" href="#">Read article <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>';
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        const body = await mdToHtml(p.body || p.summary || "");
        openModal(
          '<span class="cms-modal-tag" style="color:' + col + '">' + esc(p.category || "") + "</span>" +
          '<h2 style="margin:6px 0 4px;">' + esc(p.title) + "</h2>" +
          (p.date ? '<div class="cms-modal-date">' + esc(new Date(p.date).toLocaleDateString()) + "</div>" : "") +
          '<div class="cms-prose">' + body + "</div>"
        );
      });
      grid.appendChild(el);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 6) YOUTUBE  (task 9 — real iframe embeds, watchable on-site)            */
  /* ---------------------------------------------------------------------- */

  // Pull a YouTube video ID from a full URL or a raw ID.
  function ytId(v) {
    if (!v) return "";
    const s = String(v).trim();
    const m = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{6,}$/.test(s)) return s; // already an ID
    return "";
  }

  const DEMO_VIDS = [
    { title: "Paracetamol & Why It Can Harm the Liver", category: "Pharmacology", duration: "9:14" },
    { title: "Diabetes: A Protective Mechanism Gone Wrong", category: "Endocrinology", duration: "12:40" },
    { title: "The Brachial Plexus You'll Never Forget", category: "Anatomy", duration: "7:52" }
  ];

  function openVideo(id, title) {
    if (!id) {
      openModal(
        '<h2 style="margin-bottom:10px;">Add your videos</h2>' +
        '<p class="cms-prose">Open <b>/admin → YouTube Videos</b> and paste a YouTube link for each video. ' +
        "They will then play right here on the site.<br><br>" +
        '<a class="cms-pdf-btn" href="https://www.youtube.com" target="_blank" rel="noopener">Open YouTube</a></p>'
      );
      return;
    }
    openModal(
      '<h2 style="margin-bottom:12px;">' + esc(title || "") + "</h2>" +
      '<div class="cms-embed"><iframe src="https://www.youtube.com/embed/' + esc(id) + '?rel=0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
    );
  }

  async function setupYouTube() {
    const grid = document.getElementById("ytGrid");
    if (!grid) return;
    const data = await loadContent("youtube");
    const vids = asList(data, ["videos", "items"]);
    const list = vids.length ? vids : DEMO_VIDS;

    grid.innerHTML = "";
    list.forEach((v) => {
      const id = ytId(v.url || v.id || v.youtube);
      const col = colorFor(v.category);
      // Real YouTube thumbnail when we have an ID; otherwise a branded panel.
      const thumb = id
        ? '<div class="thumb" style="background:#000"><img src="https://img.youtube.com/vi/' + esc(id) + '/hqdefault.jpg" alt="' + esc(v.title) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.92"><div class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>' + (v.duration ? '<span class="dur">' + esc(v.duration) + "</span>" : "") + "</div>"
        : '<div class="thumb" style="background:linear-gradient(135deg,' + col + ',var(--navy))"><svg class="bg" viewBox="0 0 300 170" preserveAspectRatio="none"><path d="M0 90h60l15-40 25 80 18-100 22 130 16-70h128" stroke="#fff" stroke-width="2" fill="none"/></svg><div class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>' + (v.duration ? '<span class="dur">' + esc(v.duration) + "</span>" : "") + "</div>";
      const el = document.createElement("div");
      el.className = "vid";
      el.style.cursor = "pointer";
      el.innerHTML = thumb +
        '<div class="body"><span class="cat">' + esc(v.category || "LANS MED") + "</span>" +
        "<h4>" + esc(v.title) + '</h4><div class="v-meta">LANS MED · Watch now</div></div>';
      el.addEventListener("click", () => openVideo(id, v.title));
      grid.appendChild(el);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 7) OPTIONAL: feed CMS questions into the MCQ engine if present          */
  /* ---------------------------------------------------------------------- */
  async function setupMCQs() {
    if (!window.LANSMED || typeof window.LANSMED.loadMCQs !== "function") return; // engine hook optional
    const data = await loadContent("mcqs");
    const qs = asList(data, ["questions", "items"]);
    if (!qs.length) return;
    const banks = {};
    qs.forEach((q) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) return;
      const topic = q.topic || "General";
      (banks[topic] = banks[topic] || []).push({
        q: q.question, o: q.options,
        a: Math.max(0, (parseInt(q.answer, 10) || 1) - 1), // admin uses 1-based
        e: q.explanation || ""
      });
    });
    if (Object.keys(banks).length) window.LANSMED.loadMCQs(banks);
  }

  /* ---------------------------------------------------------------------- */
  /* 8) STYLES this file needs (injected once; does NOT edit style.css)      */
  /* ---------------------------------------------------------------------- */
  function injectStyles() {
    if (document.getElementById("cms-inline-styles")) return;
    const css = document.createElement("style");
    css.id = "cms-inline-styles";
    css.textContent =
      ".cms-modal{position:fixed;inset:0;z-index:300;display:none;align-items:flex-start;justify-content:center;background:rgba(6,15,28,.6);backdrop-filter:blur(5px);padding:40px 18px;overflow-y:auto}" +
      ".cms-modal.open{display:flex}" +
      ".cms-modal-box{background:var(--surface);border:1px solid var(--line);border-radius:20px;max-width:760px;width:100%;padding:34px 36px;box-shadow:var(--shadow-lg);position:relative;animation:cmsPop .35s ease}" +
      "@keyframes cmsPop{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +
      ".cms-modal-close{position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:1.5rem;cursor:pointer;line-height:1}" +
      ".cms-modal-close:hover{border-color:var(--teal);color:var(--teal)}" +
      ".cms-modal-tag{font-size:.74rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase}" +
      ".cms-modal-date{font-size:.82rem;color:var(--muted);margin-bottom:14px}" +
      ".cms-prose{color:var(--ink-soft);line-height:1.7;font-size:1.02rem}" +
      ".cms-prose h1,.cms-prose h2,.cms-prose h3{color:var(--ink);margin:18px 0 8px}" +
      ".cms-prose p{margin:0 0 14px}.cms-prose ul,.cms-prose ol{margin:0 0 14px 22px}" +
      ".cms-prose img{max-width:100%;border-radius:12px;margin:10px 0}" +
      ".cms-prose a{color:var(--teal);text-decoration:underline}" +
      ".cms-tag-pill{display:inline-block;font-size:.74rem;font-weight:600;color:var(--muted);background:var(--bg-tint);padding:4px 10px;border-radius:100px;margin:0 4px 4px 0}" +
      ".cms-pdf-btn{display:inline-flex;align-items:center;gap:8px;background:var(--navy);color:#fff;font-weight:700;padding:11px 20px;border-radius:100px;text-decoration:none}" +
      ".cms-embed{position:relative;padding-top:56.25%;border-radius:14px;overflow:hidden;background:#000}" +
      ".cms-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}";
    document.head.appendChild(css);
  }

  /* ---------------------------------------------------------------------- */
  /* 9) RUN                                                                  */
  /* ---------------------------------------------------------------------- */
  function init() {
    injectStyles();
    setupNotes().then(wireCategoryCards);  // notes first, then let cards drive the filter
    setupBlog();
    setupYouTube();
    setupMCQs();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();