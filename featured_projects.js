// featured_projects.js (root) - swipe carousel (no pagination)
document.addEventListener("DOMContentLoaded", async () => {
  const track = document.getElementById("featuredTrack");
  const tpl = document.getElementById("projectCardTpl");

  if (!track || !tpl) {
    console.warn("[Featured] Missing #featuredTrack or #projectCardTpl");
    return;
  }

  let projects = [];
  try {
    // IMPORTANT: match your real JSON filename
    const res = await fetch("./projects_details.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    projects = await res.json();
  } catch (e) {
    console.error("Failed to load projects_details.json", e);
    return;
  }

  // Pick featured projects (example: first 8)
  const featured = Array.isArray(projects) ? projects.slice(0, 8) : [];

  track.innerHTML = "";

  featured.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    // Title + meta + desc
    frag.querySelector(".project-name").textContent = p.title || "";
    frag.querySelector(".project-meta").textContent =
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;

    // Your list cards often use a short description field.
    // Use p.desc if you have it; fallback to first "Project Background" section if needed.
    const desc =
      p.desc ||
      (Array.isArray(p.sections)
        ? (p.sections.find(s => s.type === "text" && /background/i.test(s.title || ""))?.content || "")
        : "");

    frag.querySelector(".project-desc").textContent = desc;

    // Image
    const img = frag.querySelector("img");
    img.src = p.heroImage || p.image || "";
    img.alt = p.heroAlt || p.imageAlt || p.title || "";

    // Tags
    const tagsWrap = frag.querySelector(".project-tags");
    tagsWrap.innerHTML = "";
    (p.tags || []).slice(0, 5).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });

    // View details -> go to details page
    const btn = frag.querySelector(".project-cta");
    btn.addEventListener("click", () => {
      window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
    });

    track.appendChild(frag);
  });

  enableDragScroll(track);
});

function enableDragScroll(el) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX;
    scrollLeft = el.scrollLeft;
    el.classList.add("is-dragging");
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    el.classList.remove("is-dragging");
  });

  el.addEventListener("mouseleave", () => {
    isDown = false;
    el.classList.remove("is-dragging");
  });

  el.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const walk = (e.pageX - startX) * 1.2;
    el.scrollLeft = scrollLeft - walk;
  });
}
