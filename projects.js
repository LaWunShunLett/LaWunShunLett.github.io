document.addEventListener("DOMContentLoaded", async () => {
  // ---------- Modal refs (matches your existing projects.css) ----------
  const modal = document.getElementById("projectModal");
  const closeEls = document.querySelectorAll("[data-close]");

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  closeEls.forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ---------- Helpers (adapted from your projects_details.js) ----------
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
        img.alt = m.alt || "";
        if (m.title) img.title = m.title;
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
          source.type = s.type;
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

  const renderTags = (proj) => {
    const tagsWrap = document.getElementById("pdTags");
    if (!tagsWrap) return;

    const tags = Array.isArray(proj.tags) ? proj.tags.slice() : [];
    const role = proj.role;
    const tagsWithRole = role ? [role, ...tags] : tags;

    tagsWrap.innerHTML = "";
    tagsWithRole.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  };

  const renderActions = (proj) => {
    const actions = document.getElementById("pdActions");
    if (!actions) return;

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
  };

  const fillDetails = (proj) => {
    // Title/meta
    setText("pdTitle", proj.title || "Project");

    const metaEl = document.getElementById("pdMeta");
    if (metaEl) {
      const year = proj.year ? String(proj.year) : "";
      const role = proj.role ? String(proj.role) : "";
      metaEl.textContent = [year, role].filter(Boolean).join(" · ");
    }

    // Tags
    renderTags(proj);

    // Hero image
    const heroImage = proj.heroImage || proj.image || "";
    const heroAlt = proj.heroAlt || proj.imageAlt || proj.title || "";
    const imgEl = document.getElementById("pdImage");
    if (imgEl) {
      imgEl.alt = heroAlt;
      if (heroImage) imgEl.src = heroImage;
    }

    // Sections
    setText("pdOverview", proj.overview || "");
    setList("pdOverviewPoints", proj.overviewPoints || []);
    setText("pdProblem", proj.problem || "");
    setText("pdSolution", proj.solution || "");

    const tech = Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech;
    setText("pdTech", tech || "");

    setList("pdResponsibilities", proj.responsibilities || []);
    setList("pdFeatures", proj.features || []);

    // Media + actions
    renderInlineMedia(proj);
    renderActions(proj);

    // Scroll modal card to top
    const card = modal?.querySelector(".project-modal-card");
    if (card) card.scrollTop = 0;
  };

  // ---------- 1) build cards from projects.json ----------
  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  if (!grid || !tpl) {
    console.error("Missing #projectsGrid or #projectCardTpl in projects.html");
    return;
  }

  // Load BOTH base + details JSON and merge
  let baseProjects = [];
  let detailProjects = [];

  try {
    const [resBase, resDetail] = await Promise.all([
      fetch("./projects.json"),
      fetch("./projects_details.json"),
    ]);

    if (!resBase.ok) throw new Error(`projects.json HTTP ${resBase.status}`);
    if (!resDetail.ok) throw new Error(`projects_details.json HTTP ${resDetail.status}`);

    baseProjects = await resBase.json();
    detailProjects = await resDetail.json();
  } catch (err) {
    console.error("Failed to load projects data", err);
    return;
  }

  const detailMap = new Map(detailProjects.map((d) => [d.id, d]));
  const projects = baseProjects.map((p) => ({ ...p, ...(detailMap.get(p.id) || {}) }));

  grid.innerHTML = "";

  projects.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    const card = frag.querySelector(".project-card");
    if (card) card.setAttribute("data-tags", (p.filter || []).join(","));

    const img = frag.querySelector("img");
    if (img) {
      img.src = p.image || p.heroImage || "";
      img.alt = p.imageAlt || p.heroAlt || p.title || "Project image";
    }

    const nameEl = frag.querySelector(".project-name");
    if (nameEl) nameEl.textContent = p.title || "";

    const metaEl = frag.querySelector(".project-meta");
    if (metaEl) {
      metaEl.textContent = `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
    }

    const descEl = frag.querySelector(".project-desc");
    if (descEl) descEl.textContent = p.desc || "";

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
        if (!p.id) {
          console.error("No id for project:", p.title);
          return;
        }
        fillDetails(p);
        openModal();
      });
    }

    grid.appendChild(frag);
  });

  // ---------- 2) filters (AFTER cards exist) ----------
  const filterBtns = document.querySelectorAll(".filter-btn");

  const setActive = (btn) => {
    filterBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  };

  const applyFilter = (filter) => {
    const f = (filter || "").toLowerCase();
    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
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
});
