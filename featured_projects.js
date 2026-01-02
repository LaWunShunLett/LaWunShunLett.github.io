// featured_projects.js (root) - swipe carousel (no pagination)
document.addEventListener("DOMContentLoaded", async () => {
  // support BOTH ids (your index.html uses featuredTrack)
  const track =
    document.getElementById("featuredTrack") ||
    document.getElementById("featuredGrid");

  const tpl = document.getElementById("projectCardTpl");
  if (!track || !tpl) return;

  let projects = [];
  try {
    const res = await fetch("./projects.json", { cache: "no-store" });
    projects = await res.json();
  } catch (e) {
    console.error("Failed to load projects.json", e);
    return;
  }

  // your JSON can be array OR {projects:[...]}
  const list = Array.isArray(projects) ? projects : (projects.projects || []);
  const featured = list.slice(0, 8);

  track.innerHTML = "";
  featured.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    frag.querySelector(".project-name").textContent = p.title || "";
    frag.querySelector(".project-meta").textContent =
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
    frag.querySelector(".project-desc").textContent =
      p.desc || p.summary || "";

    const img = frag.querySelector("img");
    img.src = p.heroImage || p.image || "";
    img.alt = p.heroAlt || p.imageAlt || p.title || "";

    const tagsWrap = frag.querySelector(".project-tags");
    tagsWrap.innerHTML = "";
    (p.tags || []).slice(0, 5).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });

    const btn = frag.querySelector(".project-cta");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
    });

    track.appendChild(frag);
  });

  enableDragScroll(track);
});

// Drag-to-scroll (desktop)
function enableDragScroll(el) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    moved = false;
    startX = e.pageX;
    scrollLeft = el.scrollLeft;
    el.classList.add("is-dragging");
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    el.classList.remove("is-dragging");
  });

  el.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const walk = (e.pageX - startX) * 1.2;
    if (Math.abs(walk) > 5) moved = true;
    el.scrollLeft = scrollLeft - walk;
  });

  // If user dragged, block accidental click
  el.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
}
