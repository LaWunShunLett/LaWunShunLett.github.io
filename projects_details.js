document.addEventListener("DOMContentLoaded", async () => {
  requestAnimationFrame(() => document.body.classList.remove("preload"));

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const loadingEl = document.getElementById("pdLoading");
  const contentEl = document.getElementById("pdContent");

  const showLoading = (msg = "Loading…") => {
    if (loadingEl) {
      loadingEl.style.display = "block";
      loadingEl.textContent = msg;
    }
    if (contentEl) contentEl.classList.add("is-hidden");
  };

  const showContent = () => {
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.classList.remove("is-hidden");
  };

  const setText = (elId, value) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = value ?? "";
  };

  const setList = (elId, items) => {
    const el = document.getElementById(elId);
    if (!el) return;

    const arr = Array.isArray(items)
      ? items
      : typeof items === "string"
        ? items.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const tag = el.tagName.toLowerCase();

    // If not a UL/OL, render as text
    if (tag !== "ul" && tag !== "ol") {
      el.textContent = arr.join(", ");
      return;
    }

    el.innerHTML = "";
    arr.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  };

  // --- Inline media slots ---
  const SLOTMAP = {
    afterOverview: "pdMediaAfterOverview",
    afterProblem: "pdMediaAfterProblem",
    afterSolution: "pdMediaAfterSolution",
    afterFeatures: "pdMediaAfterFeatures",
  };

  const clearInlineMediaSlots = () => {
    Object.values(SLOTMAP).forEach((slotId) => {
      const el = document.getElementById(slotId);
      if (el) el.innerHTML = "";
    });
  };

  const renderInlineMedia = (project) => {
    clearInlineMediaSlots();
    const media = Array.isArray(project?.inlineMedia) ? project.inlineMedia : [];

    media.forEach((m) => {
      const slotId = SLOTMAP[m.slot];
      const slotEl = document.getElementById(slotId);
      if (!slotEl) return;

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

      if (m.type === "image") {
        const img = document.createElement("img");
        img.className = "pd-figure-img";
        img.src = m.src || m.id || "";
        img.alt = m.alt || m.title || "";
        figure.appendChild(img);
      }

      if (m.type === "youtube") {
        const iframe = document.createElement("iframe");
        iframe.className = "pd-embed";
        iframe.src = `https://www.youtube.com/embed/${m.id}`;
        iframe.title = m.title || "YouTube video";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        figure.appendChild(iframe);
      }

      if (m.type === "fileVideo") {
        const video = document.createElement("video");
        video.className = "pd-video-player";
        video.controls = true;
        if (m.poster) video.poster = m.poster;

        const sources = Array.isArray(m.sources) ? m.sources : [];
        sources.forEach((s) => {
          const source = document.createElement("source");
          source.src = s.src;
          source.type = s.type || "";
          video.appendChild(source);
        });

        figure.appendChild(video);
      }

      if (m.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "pd-figure-cap";
        cap.textContent = m.caption;
        figure.appendChild(cap);
      }

      slotEl.appendChild(figure);
    });
  };

  // Start in loading state
  if (!id) {
    showLoading("No project id in URL.");
    return;
  }

  showLoading("Loading…");

  let projects = [];
  let details = [];

  try {
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json"),
      fetch("./projects_details.json"),
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

  const base = projects.find((p) => p.id === id);
  const detail = details.find((d) => d.id === id);

  if (!base || !detail) {
    showLoading("Project not found.");
    return;
  }

  // Merge: details override base
  const proj = { ...base, ...detail };

  // Title/meta/tags
  const title = proj.title || "Project";
  const year = proj.year || "";
  const role = proj.role || "";

  setText("pdTitle", title);

  const metaEl = document.getElementById("pdMeta");
  if (metaEl) metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;

  const tags = Array.isArray(proj.tags) ? proj.tags.slice() : [];
  const tagsWithRole = role ? [role, ...tags] : tags;

  const tagsWrap = document.getElementById("pdTags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";
    tagsWithRole.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  // Main sections
  setText("pdOverview", proj.overview || "");
  setList("pdOverviewPoints", proj.overviewPoints || []);
  setText("pdProblem", proj.problem || "");
  setText("pdSolution", proj.solution || "");

  // tech may be array or string
  const tech = Array.isArray(proj.tech) ? proj.tech.join(", ") : (proj.tech || "");
  setText("pdTech", tech);

  setList("pdResponsibilities", proj.responsibilities || []);
  setList("pdFeatures", proj.features || []);

  // Hero image
  const heroImage = proj.heroImage || proj.image || "";
  const heroAlt = proj.heroAlt || proj.imageAlt || title;

  const imgEl = document.getElementById("pdImage");
  if (imgEl) {
    imgEl.alt = heroAlt;
    if (heroImage) imgEl.src = heroImage;
  }

  // Inline media
  renderInlineMedia(proj);

  // Source code button
  const actions = document.getElementById("pdActions");
  if (actions) {
    actions.innerHTML = "";
    if (proj.sourceCode) {
      const a = document.createElement("a");
      a.href = proj.sourceCode;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "pd-source-btn";
      a.textContent = "Source code";
      actions.appendChild(a);
    }
  }

  // Back button
  const backBtn = document.getElementById("pdBack");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "projects.html#projectsGrid";
    });
  }

  showContent();
});

