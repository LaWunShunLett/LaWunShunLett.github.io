document.body.classList.add("preload");

document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const loadingEl = document.getElementById("pdLoading");
  const contentEl = document.getElementById("pdContent");

  /* ===============================
     Loading / Content control
  =============================== */
  const showLoading = (msg = "Loading…") => {
    if (loadingEl) loadingEl.style.display = "block";
    if (contentEl) contentEl.classList.add("is-hidden");
  };

  const showContent = () => {
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.classList.remove("is-hidden");
  };

  /* ===============================
     Page transition overlay control
     (covers flash during refresh)
  =============================== */
  const releasePage = () => {
    // remove preload class (if present)
    document.body.classList.remove("preload");

    const overlay = document.getElementById("pageTransition");
    if (!overlay) return;

    // fade out overlay, then remove it
    overlay.classList.add("is-fade");
    overlay.addEventListener(
      "transitionend",
      () => {
        overlay.remove();
      },
      { once: true }
    );
  };

  /* ===============================
     Simple helper setters
  =============================== */
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? "";
  };

  const setList = (id, items) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    (Array.isArray(items) ? items : []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  };

  // Inline media slots
  const SLOTMAP = {
    afterOverview: "pdMediaAfterOverview",
    afterProblem: "pdMediaAfterProblem",
    afterSolution: "pdMediaAfterSolution",
    afterFeatures: "pdMediaAfterFeatures",
  };

  const clearInlineMediaSlots = () => {
    Object.values(SLOTMAP).forEach(id => {
      const el = document.getElementById(id);
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

      // IMAGE
      if (m.type === "image") {
        const img = document.createElement("img");
        img.className = "pd-figure-img";
        img.alt = m.alt || m.title || "";
        img.loading = "lazy";
        img.decoding = "async";
        img.src = m.src || m.id || "";
        figure.appendChild(img);
      }

      // YOUTUBE
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

      // FILE VIDEO
      if (m.type === "fileVideo") {
        const video = document.createElement("video");
        video.className = "pd-video-player";

        // Prevent early control-bar flash
        video.controls = false;
        if (m.poster) video.poster = m.poster;

        video.addEventListener("canplay", () => {
          video.controls = true;
        }, { once: true });

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

  /* ===============================
     Guard
  =============================== */
  if (!id) {
    showLoading("No project id in URL.");
    releasePage();
    return;
  }

  showLoading();

  /* ===============================
     Load both datasets
  =============================== */
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
    releasePage();
    return;
  }

  const base = projects.find(p => p.id === id);
  const detail = details.find(d => d.id === id);

  if (!base || !detail) {
    showLoading("Project not found.");
    releasePage();
    return;
  }

  const proj = { ...base, ...detail };

  /* ===============================
     Header / meta
  =============================== */
  const title = proj.title || "Project";
  const year = proj.year || "";
  const role = proj.role || "";

  setText("pdTitle", title);

  const metaEl = document.getElementById("pdMeta");
  if (metaEl) {
    metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;
  }

  const tagsWrap = document.getElementById("pdTags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";
    const tags = Array.isArray(proj.tags) ? proj.tags : [];
    const list = role ? [role, ...tags] : tags;

    list.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  /* ===============================
     Content
  =============================== */
  setText("pdOverview", proj.overview || "");
  setList("pdOverviewPoints", proj.overviewPoints || []);
  setText("pdProblem", proj.problem || "");
  setText("pdSolution", proj.solution || "");
  setText("pdTech", Array.isArray(proj.tech) ? proj.tech.join(", ") : (proj.tech || ""));
  setList("pdResponsibilities", proj.responsibilities || []);
  setList("pdFeatures", proj.features || []);

  /* ===============================
     Hero image
  =============================== */
  const heroImage = proj.heroImage || proj.image || "";
  const heroAlt = proj.heroAlt || proj.imageAlt || title;

  const imgEl = document.getElementById("pdImage");
  if (imgEl && heroImage) {
    imgEl.alt = heroAlt;
    imgEl.src = heroImage;
  }

  /* ===============================
     Inline media
  =============================== */
  renderInlineMedia(proj);

  /* ===============================
     Source button
  =============================== */
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

  /* ===============================
     Back button
  =============================== */
  document.getElementById("pdBack")?.addEventListener("click", () => {
    history.length > 1 ? history.back() : (window.location.href = "projects.html");
  });

  showContent();
  releasePage();
});
requestAnimationFrame(() => {
  document.body.classList.remove("preload");
});
