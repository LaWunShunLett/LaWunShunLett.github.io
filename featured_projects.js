// featured_projects.js (root)
// Renders Featured Projects as a swipe/drag horizontal row (no pagination)

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("featuredGrid");
  const tpl = document.getElementById("projectCardTpl");

  if (!grid || !tpl) {
    console.error("Missing #featuredGrid or #projectCardTpl");
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

  // Newest first (same as before)
  projects.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));

  // Choose how many featured cards you want
  const featured = projects.slice(0, 8);

  // Render cards
  grid.innerHTML = "";
  featured.forEach((p) => {
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

    const btn = frag.querySelector(".project-cta");
    if (btn) {
      btn.addEventListener("click", () => {
        if (!p.id) return;
        window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
      });
    }

    grid.appendChild(frag);
  });

  // Enable mouse drag + touch swipe feel on desktop
  enableDragScroll(grid);
});

function enableDragScroll(el) {
  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragged = false;

  el.style.cursor = "grab";

  el.addEventListener("pointerdown", (e) => {
    isDown = true;
    dragged = false;
    startX = e.clientX;
    startScrollLeft = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  });

  el.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) dragged = true;
    el.scrollLeft = startScrollLeft - dx;
  });

  const end = () => {
    isDown = false;
    el.style.cursor = "grab";
    el.style.userSelect = "";
  };

  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);

  // Prevent accidental clicks while dragging
  el.addEventListener(
    "click",
    (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}
