(() => {
  const qs = new URLSearchParams(window.location.search);
  const id = qs.get("id");

  const byId = (x) => document.getElementById(x);

  const setText = (elId, value) => {
    const el = byId(elId);
    if (!el) return;
    el.textContent = value ?? "";
  };

  const setList = (elId, items) => {
    const el = byId(elId);
    if (!el) return;
    el.innerHTML = "";
    (Array.isArray(items) ? items : []).forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      el.appendChild(li);
    });
  };

  const SLOTMAP = {
    afterOverview: "pdMediaAfterOverview",
    afterProblem: "pdMediaAfterProblem",
    afterSolution: "pdMediaAfterSolution",
    afterFeatures: "pdMediaAfterFeatures",
  };

  const clearInlineMediaSlots = () => {
    Object.values(SLOTMAP).forEach((slotId) => {
      const el = byId(slotId);
      if (el) el.innerHTML = "";
    });
  };

  const renderInlineMedia = (project) => {
    clearInlineMediaSlots();

    const media = Array.isArray(project?.inlineMedia) ? project.inlineMedia : [];
    media.forEach((m) => {
      const slotId = SLOTMAP[m.slot];
      const slotEl = byId(slotId);
      if (!slotEl) return;

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

      // ---------- IMAGE ----------
      if (m.type === "image") {
        const img = document.createElement("img");
        img.className = "pd-figure-img";

        // your JSON uses src in some items and id in others
        const src = m.src || m.id || "";
        img.alt = m.alt || m.title || "";

        // fade-in when loaded (optional)
        img.classList.remove("is-ready");
        img.onload = () => img.classList.add("is-ready");
        img.src = src;

        figure.appendChild(img);
      }

      // ---------- YOUTUBE ----------
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

      // ---------- VIDEO FILE ----------
      if (m.type === "fileVideo") {
        const video = document.createElement("video");
        video.className = "pd-video-player";

        // controls can show with black background while loading — so we enable only when ready
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

  const readEmbeddedData = () => {
    const el = byId("projectsDetailsData");
    if (!el) return [];
    try {
      return JSON.parse(el.textContent.trim());
    } catch (e) {
      console.error("Invalid embedded JSON in #projectsDetailsData", e);
      return [];
    }
  };

  // ---------- Guard ----------
  if (!id) {
    setText("pdTitle", "Project not found");
    setText("pdOverview", "No project id in URL.");
    return;
  }

  // ✅ NO FETCH: instant read
  const details = readEmbeddedData();
  const proj = details.find((d) => d.id === id);

  if (!proj) {
    setText("pdTitle", "Project not found");
    setText("pdOverview", `No matching project for id: ${id}`);
    return;
  }

  // ---------- Header/meta/tags ----------
  const title = proj.title || "Project";
  const year = proj.year || "";
  const role = proj.role || "";

  setText("pdTitle", title);

  const metaEl = byId("pdMeta");
  if (metaEl) metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;

  const tagsWrap = byId("pdTags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";

    // Your details json doesn’t have tags array; but you do have role and sometimes features
    const tags = Array.isArray(proj.tags) ? proj.tags : [];
    const tagsWithRole = role ? [role, ...tags] : tags;

    tagsWithRole.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  // ---------- Content ----------
  setText("pdOverview", proj.overview || "");
  setList("pdOverviewPoints", proj.overviewPoints || []);
  setText("pdProblem", proj.problem || "");
  setText("pdSolution", proj.solution || "");

  const tech = Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech || "";
  setText("pdTech", tech);

  setList("pdResponsibilities", proj.responsibilities || []);
  setList("pdFeatures", proj.features || []);

  // ---------- Hero image ----------
  const heroImage = proj.heroImage || proj.image || "";
  const heroAlt = proj.heroAlt || proj.imageAlt || title;

  const imgEl = byId("pdImage");
  if (imgEl && heroImage) {
    imgEl.alt = heroAlt;

    // If your CSS uses fade-in class, do it safely
    imgEl.classList.remove("is-ready");
    imgEl.onload = () => imgEl.classList.add("is-ready");
    imgEl.src = heroImage;
  }

  // ---------- Inline media ----------
  renderInlineMedia(proj);

  // ---------- Source button ----------
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

  // ---------- Back button ----------
  byId("pdBack")?.addEventListener("click", () => {
    history.length > 1 ? history.back() : (window.location.href = "projects.html");
  });
})();
