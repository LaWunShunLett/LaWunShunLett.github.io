/* projects_details.js
   Single, safe renderer for JSON-driven project details + gallery
*/
// Project Details only: force preload off after everything is ready
window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});

(async function () {
  const qs = new URLSearchParams(location.search);
  const id = qs.get("id");

  // ===== Small helpers =====
  const $ = (sel) => document.querySelector(sel);

  function setText(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || "";
  }

  function clearEl(el) {
    if (el) el.innerHTML = "";
  }

  function showLoading(msg = "Loading…") {
    // If you already have a loading UI, keep it.
    // Otherwise, just set title as fallback.
    setText("pdTitle", msg);
  }

  // ===== Guard =====
  if (!id) {
    showLoading("Project not found (missing id).");
    return;
  }

  showLoading();

  // ===== Load data =====
  let projects = [];
  let details = [];

  try {
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json", { cache: "no-store" }),
      fetch("./projects_details.json", { cache: "no-store" }),
    ]);

    if (!pRes.ok) throw new Error(`projects.json HTTP ${pRes.status}`);
    if (!dRes.ok) throw new Error(`projects_details.json HTTP ${dRes.status}`);

    projects = await pRes.json();
    details = await dRes.json();
  } catch (err) {
    console.error(err);
    showLoading("Failed to load project data.");
    return;
  }

  // details can be [ ... ] or { projects:[ ... ] }
  const detailsList = Array.isArray(details) ? details : (details.projects || []);

  const base = projects.find((p) => p.id === id);
  const detail = detailsList.find((d) => d.id === id);

  if (!base || !detail) {
    showLoading("Project not found.");
    return;
  }

  const proj = { ...base, ...detail };

  // ===== Header/meta =====
  const title = proj.title || "Project";
  const year = proj.year || "";
  const role = proj.role || "";

  setText("pdTitle", title);

  const metaEl = document.getElementById("pdMeta");
  if (metaEl) metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;

  const tagsWrap = document.getElementById("pdTags");
  if (tagsWrap) {
    clearEl(tagsWrap);
    const tags = Array.isArray(proj.tags) ? proj.tags : [];
    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  // ===== Hero image =====
  const heroImage = proj.heroImage || proj.image || "";
  const heroAlt = proj.heroAlt || proj.imageAlt || title;

  const imgEl = document.getElementById("pdImage");
  if (imgEl && heroImage) {
    imgEl.alt = heroAlt;
    imgEl.classList.remove("is-ready");
    imgEl.onload = () => imgEl.classList.add("is-ready");
    imgEl.src = heroImage;
  }

  // ===== Actions (source code) =====
  const actions = document.getElementById("pdActions");
  if (actions) {
    clearEl(actions);

    // support both "sourceCode" and "links"
    if (proj.sourceCode) {
      const a = document.createElement("a");
      a.href = proj.sourceCode;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "pd-source-btn";
      a.textContent = "Source code";
      actions.appendChild(a);
    }

    if (Array.isArray(proj.links)) {
      proj.links.forEach((link) => {
        if (!link?.url) return;
        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "pd-source-btn";
        a.textContent = link.label || "Open";
        actions.appendChild(a);
      });
    }
  }

  // ===== Back button =====
  document.getElementById("pdBack")?.addEventListener("click", () => {
    history.back();
  });

  // ===== MAIN CONTENT RENDER (sections only) =====
  const mount = document.getElementById("pdSections");
  clearEl(mount);

  // IMPORTANT: do NOT use pdGalleryMount anymore (prevents overlap)
  const oldGalleryMount = document.getElementById("pdGalleryMount");
  clearEl(oldGalleryMount);

  const sections = Array.isArray(proj.sections) ? proj.sections : [];
  sections.forEach((section) => {
    mount.appendChild(renderSection(section));
  });

  // ===== Section renderer =====
  function renderSection(section) {
    const container = document.createElement("div");
    container.className = "pd-section";

    // Title (for non-gallery, we show as a section heading)
    if (section.title && section.type !== "gallery") {
      const h2 = document.createElement("h2");
      h2.className = "pd-section-title";
      h2.textContent = section.title;
      container.appendChild(h2);
    }

    // TEXT
    if (section.type === "text") {
      const p = document.createElement("p");
      p.className = "pd-text";
      p.textContent = section.content || "";
      container.appendChild(p);
      return container;
    }

    // LIST
    if (section.type === "list") {
      const ul = document.createElement("ul");
      ul.className = "pd-list";
      (Array.isArray(section.items) ? section.items : []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      container.appendChild(ul);
      return container;
    }

    // IMAGE
    if (section.type === "image") {
      const slot = document.createElement("div");
      slot.className = "pd-media-slot";

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

      const img = document.createElement("img");
      img.className = "pd-figure-img";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = section.src || "";
      img.alt = section.alt || section.title || "";

      figure.appendChild(img);

      if (section.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "pd-figure-cap";
        cap.textContent = section.caption;
        figure.appendChild(cap);
      }

      slot.appendChild(figure);
      container.appendChild(slot);
      return container;
    }

    // YOUTUBE
    if (section.type === "youtube") {
      const slot = document.createElement("div");
      slot.className = "pd-media-slot";

      const iframe = document.createElement("iframe");
      iframe.className = "pd-embed";
      iframe.loading = "lazy";
      iframe.src = `https://www.youtube.com/embed/${section.id}`;
      iframe.title = section.title || "YouTube video";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;

      slot.appendChild(iframe);
      container.appendChild(slot);
      return container;
    }

    // FILE VIDEO
    if (section.type === "fileVideo") {
      const slot = document.createElement("div");
      slot.className = "pd-media-slot";

      const video = document.createElement("video");
      video.className = "pd-video-player";
      video.controls = true;
      if (section.poster) video.poster = section.poster;

      (Array.isArray(section.sources) ? section.sources : []).forEach((s) => {
        if (!s?.src) return;
        const source = document.createElement("source");
        source.src = s.src;
        source.type = s.type || "";
        video.appendChild(source);
      });

      slot.appendChild(video);

      if (section.caption) {
        const cap = document.createElement("div");
        cap.className = "pd-figure-cap";
        cap.textContent = section.caption;
        slot.appendChild(cap);
      }

      container.appendChild(slot);
      return container;
    }

    // GALLERY (number buttons)
    if (section.type === "gallery") {
      // Gallery title as a section title (like your screenshot)
      if (section.title) {
        const h2 = document.createElement("h2");
        h2.className = "pd-section-title";
        h2.textContent = section.title;
        container.appendChild(h2);
      }

      const galleryWrap = document.createElement("div");
      galleryWrap.className = "pd-gallery";

      const viewport = document.createElement("div");
      viewport.className = "pd-gallery-viewport";

      const track = document.createElement("div");
      track.className = "pd-gallery-track";

      const dots = document.createElement("div");
      dots.className = "pd-gallery-dots";

      const items = Array.isArray(section.items) ? section.items : [];
      let index = 0;

      function update() {
        track.style.transform = `translateX(${-index * 100}%)`;
        [...dots.children].forEach((btn, i) => {
          btn.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }

      items.forEach((item, i) => {
        const fig = document.createElement("figure");
        fig.className = "pd-gallery-item";

        const img = document.createElement("img");
        img.className = "pd-gallery-img";
        img.loading = "lazy";
        img.decoding = "async";
        img.src = item.src || "";
        img.alt = item.alt || "";

        fig.appendChild(img);

        if (item.caption) {
          const cap = document.createElement("figcaption");
          cap.className = "pd-gallery-cap";
          cap.textContent = item.caption;
          fig.appendChild(cap);
        }

        track.appendChild(fig);

        const btn = document.createElement("button");
        btn.className = "pd-dot";
        btn.type = "button";
        btn.textContent = String(i + 1);
        btn.setAttribute("aria-current", i === 0 ? "true" : "false");
        btn.addEventListener("click", () => {
          index = i;
          update();
        });

        dots.appendChild(btn);
      });

      viewport.appendChild(track);
      galleryWrap.appendChild(viewport);
      galleryWrap.appendChild(dots);

      container.appendChild(galleryWrap);

      update();
      return container;
    }

    // fallback: unknown section type
    return container;
  }
})();
