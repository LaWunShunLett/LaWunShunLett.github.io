document.addEventListener("DOMContentLoaded", async () => {
  const projectsView = document.getElementById("projectsView");
  const detailsView = document.getElementById("detailsView");

  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  // details elements (pd-*)
  const pdBack = document.getElementById("pdBack");
  const pdTitle = document.getElementById("pdTitle");
  const pdMeta = document.getElementById("pdMeta");
  const pdTags = document.getElementById("pdTags");
  const pdImage = document.getElementById("pdImage");
  const pdOverview = document.getElementById("pdOverview");
  const pdOverviewPoints = document.getElementById("pdOverviewPoints");
  const pdProblem = document.getElementById("pdProblem");
  const pdSolution = document.getElementById("pdSolution");
  const pdTech = document.getElementById("pdTech");
  const pdResponsibilities = document.getElementById("pdResponsibilities");
  const pdFeatures = document.getElementById("pdFeatures");
  const pdActions = document.getElementById("pdActions");

  const slotAfterOverview = document.getElementById("pdMediaAfterOverview");
  const slotAfterProblem = document.getElementById("pdMediaAfterProblem");
  const slotAfterSolution = document.getElementById("pdMediaAfterSolution");
  const slotAfterFeatures = document.getElementById("pdMediaAfterFeatures");

  const SLOTMAP = {
    afterOverview: slotAfterOverview,
    afterProblem: slotAfterProblem,
    afterSolution: slotAfterSolution,
    afterFeatures: slotAfterFeatures,
  };

  if (!projectsView || !detailsView || !grid || !tpl) {
    console.error("Missing required containers (#projectsView/#detailsView/#projectsGrid/#projectCardTpl).");
    return;
  }

  const showProjects = () => {
    detailsView.style.display = "none";
    projectsView.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showDetails = () => {
    projectsView.style.display = "none";
    detailsView.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  pdBack?.addEventListener("click", showProjects);

  const setText = (el, value) => {
    if (el) el.textContent = value ?? "";
  };

  const setList = (el, items) => {
    if (!el) return;
    const arr = Array.isArray(items)
      ? items
      : typeof items === "string"
        ? items.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    el.innerHTML = "";
    arr.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  };

  const clearInlineMediaSlots = () => {
    Object.values(SLOTMAP).forEach((slotEl) => {
      if (slotEl) slotEl.innerHTML = "";
    });
  };

  const renderInlineMedia = (project) => {
    clearInlineMediaSlots();
    const media = Array.isArray(project?.inlineMedia) ? project.inlineMedia : [];

    media.forEach((m) => {
      const slotEl = SLOTMAP[m.slot];
      if (!slotEl) return;

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

      if (m.type === "image") {
        const img = document.createElement("img");
        img.className = "pd-figure-img";
        img.src = m.src || m.id || "";
        img.alt = m.alt || m.title || "Image";
        figure.appendChild(img);
      } else if (m.type === "youtube") {
        const iframe = document.createElement("iframe");
        iframe.className = "pd-embed";
        iframe.src = `https://www.youtube.com/embed/${m.id}`;
        iframe.title = m.title || "YouTube video";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        figure.appendChild(iframe);
      } else if (m.type === "fileVideo") {
        const video = document.createElement("video");
        video.className = "pd-video-player";
        video.controls = true;
        if (m.poster) video.poster = m.poster;

        const sources = Array.isArray(m.sources) ? m.sources : [];
        sources.forEach((s) => {
          const source = document.createElement("source");
          source.src = s.src;
          if (s.type) source.type = s.type;
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

  // Load data
  let baseProjects = [];
  let detailProjects = [];
  try {
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json"),
      fetch("./projects_details.json"),
    ]);
    if (!pRes.ok) throw new Error(`projects.json HTTP ${pRes.status}`);
    if (!dRes.ok) throw new Error(`projects_details.json HTTP ${dRes.status}`);
    baseProjects = await pRes.json();
    detailProjects = await dRes.json();
  } catch (err) {
    console.error("Failed to load project data:", err);
    return;
  }

  const openDetailsById = (id) => {
    const base = baseProjects.find((p) => p.id === id);
    const detail = detailProjects.find((d) => d.id === id);

    if (!base && !detail) {
      console.error("Project not found:", id);
      return;
    }

    const proj = { ...(base || {}), ...(detail || {}) };

    setText(pdTitle, proj.title || "");
    setText(pdMeta, `${proj.year || ""}${proj.year && proj.role ? " · " : ""}${proj.role || ""}`);

    if (pdTags) {
      const tags = Array.isArray(proj.tags) ? proj.tags.slice() : [];
      const tagsWithRole = proj.role ? [proj.role, ...tags] : tags;

      pdTags.innerHTML = "";
      tagsWithRole.forEach((t) => {
        const span = document.createElement("span");
        span.className = "pd-tag";
        span.textContent = t;
        pdTags.appendChild(span);
      });
    }

    if (pdImage) {
      const heroImage = proj.heroImage || proj.image || "";
      const heroAlt = proj.heroAlt || proj.imageAlt || proj.title || "Project image";
      pdImage.alt = heroAlt;
      if (heroImage) pdImage.src = heroImage;
    }

    setText(pdOverview, proj.overview || "");
    setList(pdOverviewPoints, proj.overviewPoints || []);
    setText(pdProblem, proj.problem || "");
    setText(pdSolution, proj.solution || "");

    const techText = Array.isArray(proj.tech) ? proj.tech.join(", ") : (proj.tech || "");
    setText(pdTech, techText);

    setList(pdResponsibilities, proj.responsibilities || []);
    setList(pdFeatures, proj.features || []);

    renderInlineMedia(proj);

    if (pdActions) {
      pdActions.innerHTML = "";
      if (proj.sourceCode) {
        const a = document.createElement("a");
        a.href = proj.sourceCode;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "pd-source-btn";
        a.textContent = "Source code";
        pdActions.appendChild(a);
      }
    }

    showDetails();
  };

  // Render cards
  grid.innerHTML = "";
  baseProjects.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    const card = frag.querySelector(".project-card");
    if (card) card.setAttribute("data-tags", (p.filter || []).join(","));

    const img = frag.querySelector("img");
    if (img) {
      img.src = p.image || "";
      img.alt = p.imageAlt || p.title || "Project image";
    }

    frag.querySelector(".project-name")?.textContent = p.title || "";
    frag.querySelector(".project-meta")?.textContent =
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
    frag.querySelector(".project-desc")?.textContent = p.desc || "";

    const tagsWrap = frag.querySelector(".project-tags");
    if (tagsWrap) {
      tagsWrap.innerHTML = "";
      (p.tags || []).forEach((t) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tagsWrap.appendChild(span);
      });
    }

    const btn = frag.querySelector(".project-cta");
    if (btn) {
      btn.textContent = "View details →";
      btn.addEventListener("click", () => {
        if (!p.id) return;
        openDetailsById(p.id);
      });
    }

    grid.appendChild(frag);
  });

  // Filters
  const filterBtns = document.querySelectorAll(".filter-btn");

  const setActive = (btn) => {
    filterBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  };

  const applyFilter = (filter) => {
    const f = (filter || "").toLowerCase();
    document.querySelectorAll(".project-card").forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const show = f === "all" || tags.includes(f);
      card.classList.toggle("is-hidden", !show);
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn);
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  // Start on grid
  showProjects();
});
