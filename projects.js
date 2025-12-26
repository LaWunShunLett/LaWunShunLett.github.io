document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  if (!grid || !tpl) {
    console.error("Missing #projectsGrid or #projectCardTpl");
    return;
  }

  // 1) Load projects.json
  let projects = [];
  try {
    const res = await fetch("./projects.json");
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  // 2) Render cards
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

    const nameEl = frag.querySelector(".project-name");
    if (nameEl) nameEl.textContent = p.title || "";

    const metaEl = frag.querySelector(".project-meta");
    if (metaEl) {
      metaEl.textContent =
        `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
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
          console.error("Missing id in projects.json for:", p.title);
          return;
        }
        window.location.href =
          `projects_details.html?id=${encodeURIComponent(p.id)}`;
      });
    }

    grid.appendChild(frag);
  });

  // 3) Filters
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
});
