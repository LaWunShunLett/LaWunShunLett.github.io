document.addEventListener("DOMContentLoaded", async () => {
  /* =========================================
     HOLD ANIMATION UNTIL CONTENT IS READY
     (covers flash using your anim system)
  ========================================= */
  document.body.classList.add("preload");

  /* =========================================
     BASIC HELPERS
  ========================================= */
  const qs = new URLSearchParams(window.location.search);
  const id = qs.get("id");

  const byId = (id) => document.getElementById(id);

  const setText = (id, text) => {
    const el = byId(id);
    if (el) el.textContent = text ?? "";
  };

  const setList = (id, items) => {
    const el = byId(id);
    if (!el) return;
    el.innerHTML = "";
    (Array.isArray(items) ? items : []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  };

  /* =========================================
     INLINE MEDIA RENDERING
  ========================================= */
  const SLOTMAP = {
    afterOverview: "pdMediaAfterOverview",
    afterProblem: "pdMediaAfterProblem",
    afterSolution: "pdMediaAfterSolution",
    afterFeatures: "pdMediaAfterFeatures",
  };

  const clearMediaSlots = () => {
    Object.values(SLOTMAP).forEach((slot) => {
      const el = byId(slot);
      if (el) el.innerHTML = "";
    });
  };

  const renderInlineMedia = (project) => {
    clearMediaSlots();

    const media = Array.isArray(project.inlineMedia)
      ? project.inlineMedia
      : [];

    media.forEach((m) => {
      const slotId = SLOTMAP[m.slot];
      const slotEl = byId(slotId);
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
        video.controls = false;

        if (m.poster) video.poster = m.poster;

        video.addEventListener(
          "canplay",
          () => {
            video.controls = true;
          },
          { once: true }
        );

        (Array.isArray(m.sources) ? m.sources : []).forEach((s) => {
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

  /* =========================================
     GUARD
  ========================================= */
  if (!id) {
    requestAnimationFrame(() => {
      document.body.classList.remove("preload");
    });
    return;
  }

  /* =========================================
     LOAD DATA
  ========================================= */
  let projects = [];
  let details = [];

  try {
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json"),
      fetch("./projects_details.json"),
    ]);

    projects = await pRes.json();
    details = await dRes.json();
  } catch (err) {
    console.error("Failed to load project data", err);
    requestAnimationFrame(() => {
      document.body.classList.remove("preload");
    });
    return;
  }

  const base = projects.find((p) => p.id === id);
  const detail = details.find((d) => d.id === id);
  if (!base || !detail) {
    requestAnimationFrame(() => {
      document.body.classList.remove("preload");
    });
    return;
  }

  const proj = { ...base, ...detail };

  /* =========================================
     HEADER META
  ========================================= */
  const year = proj.year || "";
  const role = proj.role || "";

  setText("pdTitle", proj.title || "Project");
  setText(
    "pdMeta",
    `${year}${year && role ? " · " : ""}${role}`
  );

  const tagsWrap = byId("pdTags");
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

  /* =========================================
     CONTENT
  ========================================= */
  setText("pdOverview", proj.overview || "");
  setList("pdOverviewPoints", proj.overviewPoints || []);
  setText("pdProblem", proj.problem || "");
  setText("pdSolution", proj.solution || "");
  setText(
    "pdTech",
    Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech || ""
  );
  setList("pdResponsibilities", proj.responsibilities || []);
  setList("pdFeatures", proj.features || []);

  /* =========================================
     HERO IMAGE (NO FLASH)
  ========================================= */
  const imgEl = byId("pdImage");
  if (imgEl && proj.heroImage) {
    imgEl.alt = proj.heroAlt || proj.title || "";
    imgEl.src = proj.heroImage;
  }

  /* =========================================
     INLINE MEDIA
  ========================================= */
  renderInlineMedia(proj);

  /* =========================================
     SOURCE BUTTON
  ========================================= */
  const actions = byId("pdActions");
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

  /* =========================================
     BACK BUTTON
  ========================================= */
  byId("pdBack")?.addEventListener("click", () => {
    history.length > 1
      ? history.back()
      : (window.location.href = "projects.html");
  });

  /* =========================================
     RELEASE ANIMATION (THIS IS THE MAGIC)
  ========================================= */
  requestAnimationFrame(() => {
    document.body.classList.remove("preload");
  });
});
