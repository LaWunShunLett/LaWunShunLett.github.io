document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");
  if (!grid || !tpl) return;

  let projects = [];
  try {
    const res = await fetch("./projects.json");
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

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

    frag.querySelector(".project-name")?.append(p.title || "");
    frag.querySelector(".project-meta")?.append(
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`
    );
    frag.querySelector(".project-desc")?.append(p.desc || "");

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
    if (btn) btn.disabled = true; // pure: no details behavior

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
      card.classList.toggle("is-hidden", !(f === "all" || tags.includes(f)));
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn);
      applyFilter(btn.getAttribute("data-filter"));
    });
  });
});
