// featured_projects.js (root) - swipe carousel (no pagination)
document.addEventListener("DOMContentLoaded", async () => {
  const track = document.getElementById("featuredGrid");
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

  // Choose what you want featured (example: first 8)
  const featured = projects.slice(0, 8);

  // Render cards
  track.innerHTML = "";
  featured.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    frag.querySelector(".project-name").textContent = p.title || "";
    frag.querySelector(".project-meta").textContent =
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
    frag.querySelector(".project-desc").textContent = p.desc || "";

    const img = frag.querySelector("img");
    img.src = p.image || "";
    img.alt = p.imageAlt || p.title || "";

    const tagsWrap = frag.querySelector(".project-tags");
    tagsWrap.innerHTML = "";
    (p.tags || []).slice(0, 5).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });

    const btn = frag.querySelector(".project-cta");
    btn.addEventListener("click", () => {
      window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
    });

    track.appendChild(frag);
  });

  // Optional: drag-to-scroll for desktop mouse
  enableDragScroll(track);
});

function enableDragScroll(el) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
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
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.2;
    el.scrollLeft = scrollLeft - walk;
  });
}
