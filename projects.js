document.addEventListener("DOMContentLoaded", async () => {
  // --- 1) build cards from projects.json ---
  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  let projects = [];
  try {
    const res = await fetch("./projects.json");
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  grid.innerHTML = "";

  projects.forEach(p => {
    const frag = tpl.content.cloneNode(true);

    const card = frag.querySelector(".project-card");
    card.setAttribute("data-tags", (p.filter || []).join(","));

    const img = frag.querySelector("img");
    img.src = p.image;
    img.alt = p.imageAlt || p.title;

    frag.querySelector(".project-name").textContent = p.title;
    frag.querySelector(".project-meta").textContent = `${p.year} · ${p.role}`;
    frag.querySelector(".project-desc").textContent = p.desc;

    const tagsWrap = frag.querySelector(".project-tags");
    tagsWrap.innerHTML = "";
    (p.tags || []).forEach(t => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });

    const btn = frag.querySelector(".project-cta");
    btn.dataset.title = p.title;
    btn.dataset.year = p.year;
    btn.dataset.role = p.role;
    btn.dataset.desc = p.desc;
    btn.dataset.tech = p.tech;
    btn.addEventListener("click", () => {
  if (p.id) {
    window.location.href = `projects_details.html?id=${encodeURIComponent(p.id)}`;
  }
});

    grid.appendChild(frag);
  });

  // --- 2) filters (AFTER cards exist) ---
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  const setActive = (btn) => {
    filterBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  };

  const applyFilter = (filter) => {
    const f = (filter || "").toLowerCase();
    cards.forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const show = f === "all" || tags.includes(f);
      card.classList.toggle("is-hidden", !show);
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      setActive(btn);
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  // --- 3) modal + other stuff (optional) ---
});
const btn = frag.querySelector(".project-cta");
btn.textContent = "View details →";

btn.addEventListener("click", () => {
  if (p.id) {
    window.location.href = `project-details.html?id=${encodeURIComponent(p.id)}`;
  }
});
