document.addEventListener("DOMContentLoaded", async () => {
  // Views
  const projectsView = document.getElementById("projectsView");
  const detailsView = document.getElementById("detailsView");

  // Grid + template
  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  // Detail DOM (pd-*)
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

  if (!projectsView || !detailsView || !grid || !tpl) {
    console.error("Missing required elements: projectsView/detailsView/projectsGrid/projectCardTpl");
    return;
  }

  // Helpers
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

  const setText = (el, value) => {
    if (el) el.textContent = value ?? "";
  };

  const setListFromTech = (el, tech) => {
    if (!el) return;
    const arr = Array.isArray(tech)
      ? tech
      : typeof tech === "string"
        ? tech.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    el.innerHTML = "";
    arr.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  };

  const clearUnusedSections = () => {
    // Since projects.json doesn't have problem/solution/etc, keep them empty (or hide if you want)
    setText(pdProblem, "");
    setText(pdSolution, "");
    if (pdResponsibilities) pdResponsibilities.innerHTML = "";
    if (pdFeatures) pdFeatures.innerHTML = "";
    if (pdActions) pdActions.innerHTML = "";

    // Remove inline media placeholders (not used without projects_details)
    if (slotAfterOverview) slotAfterOverview.innerHTML = "";
    if (slotAfterProblem) slotAfterProblem.innerHTML = "";
    if (slotAfterSolution) slotAfterSolution.innerHTML = "";
    if (slotAfterFeatures) slotAfterFeatures.innerHTML = "";
  };

  // Back button
  pdBack?.addEventListener("click", showProjects);

  // Load projects.json only
  let projects = [];
  try {
    const res = await fetch("./projects.json");
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  // Render cards
  grid.innerHTML = "";
  projects.forEach((p) => {
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
        // Fill details using ONLY projects.json fields
        setText(pdTitle, p.title || "");
        setText(pdMeta, `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`);

        if (pdTags) {
          pdTags.innerHTML = "";
          const tags = Array.isArray(p.tags) ? p.tags : [];
          const tagsWithRole = p.role ? [p.role, ...tags] : tags;
          tagsWithRole.forEach((t) => {
            const span = document.createElement("span");
            span.className = "pd-tag";
            span.textContent = t;
            pdTags.appendChild(span);
          });
        }

        if (pdImage) {
          pdImage.src = p.image || "";
          pdImage.alt = p.imageAlt || p.title || "Project image";
        }

        // Reuse desc as Overview
        setText(pdOverview, p.desc || "");

        // Use tech list as "Overview points" (optional)
        setListFromTech(pdOverviewPoints, p.tech);

        // Also show tech as a sentence under "Technical Details"
        const techText = Array.isArray(p.tech) ? p.tech.join(", ") : (p.tech || "");
        setText(pdTech, techText);

        clearUnusedSections();
        showDetails();
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
