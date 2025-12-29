// featured_projects.js (root) - swipe carousel (no pagination)
document.addEventListener("DOMContentLoaded", async () => {
  const track = document.getElementById("featuredGrid"); // <-- must match your HTML
  const tpl = document.getElementById("projectCardTpl");

  if (!track || !tpl) return;

  let raw;
  try {
    // Use your real details file in root
    const res = await fetch("./projects_details.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    raw = await res.json();
  } catch (e) {
    console.error("Failed to load projects_details.json", e);
    return;
  }

  // Support both: array OR { projects: [...] }
  const projects = Array.isArray(raw) ? raw : (raw.projects || []);

  // Choose what you want featured (first 8)
  const featured = projects.slice(0, 8);

  // Render cards
  track.innerHTML = "";
  featured.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    const title = p.title || "";
    const year = p.year || "";
    const role = p.role || "";

    frag.querySelector(".project-name").textContent = title;
    frag.querySelector(".project-meta").textContent =
      `${year}${year && role ? " · " : ""}${role}`;

    // prefer shortDesc, fallback to desc, fallback to first text section content
    const fallbackDesc =
      (p.sections || []).find(s => s.type === "text" && s.content)?.content || "";
    frag.querySelector(".project-desc").textContent =
      p.shortDesc || p.desc || fallbackDesc;

    const img = frag.querySelector("img");
    img.src = p.heroImage || p.image || "";
    img.alt = p.heroAlt || p.imageAlt || title;

    const tagsWrap = frag.querySelector(".project-tags");
    tagsWrap.innerHTML = "";
    (p.tags || []).slice(0, 5).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag"; // must match your CSS pill class
      span.textContent = t;
      tagss
      tagsWrap.appendChild(span);
    });

    const btn = frag.querySelector(".project-cta");
    btn.addEventListener("click", () => {
      window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
    });

    track.appendChild(frag);
  });

  // Enable drag-to-scroll on desktop
  enableDragScroll(track);
});

function enableDragScroll(el) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  el.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - el.getBoundingClientRect().left;
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
    const x = e.pageX - el.getBoundingClientRect().left;
    const walk = (x - startX) * 1.2;
    el.scrollLeft = scrollLeft - walk;
  });
}
