// featured_projects.js (root)
// Renders Featured Projects cards + pagination on index.html

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("featuredGrid");
  const pager = document.getElementById("featuredPagination");
  const tpl = document.getElementById("projectCardTpl");

  if (!grid || !pager || !tpl) {
    console.error("Missing #featuredGrid, #featuredPagination, or #projectCardTpl");
    return;
  }

  // Load projects.json
  let projects = [];
  try {
    const res = await fetch("./projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  // OPTIONAL: sort newest first (by year number if possible)
  projects.sort((a, b) => {
    const ay = Number(a.year) || 0;
    const by = Number(b.year) || 0;
    return by - ay;
  });

  const pageSize = 3;
  let page = 1;
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));

  function renderPage() {
    grid.innerHTML = "";

    const start = (page - 1) * pageSize;
    const items = projects.slice(start, start + pageSize);

    items.forEach((p) => {
      const frag = tpl.content.cloneNode(true);

      frag.querySelector(".project-name").textContent = p.title || "";
      frag.querySelector(".project-meta").textContent =
        `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
      frag.querySelector(".project-desc").textContent = p.desc || "";

      const img = frag.querySelector("img");
      if (img) {
        img.src = p.image || "";
        img.alt = p.imageAlt || p.title || "Project image";
      }

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

      // Go to details page (same behavior as your projects page)
      const btn = frag.querySelector(".project-cta");
      if (btn) {
        btn.addEventListener("click", () => {
          if (!p.id) {
            console.error("Missing id in projects.json for:", p.title);
            return;
          }
          window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
        });
      }

      grid.appendChild(frag);
    });

    renderPager();
  }

  function renderPager() {
    pager.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "page-dot" + (i === page ? " is-active" : "");
      b.setAttribute("aria-label", `Go to page ${i}`);
      b.textContent = String(i);
      b.addEventListener("click", () => {
        page = i;
        renderPage();
      });
      pager.appendChild(b);
    }
  }

  renderPage();
});
