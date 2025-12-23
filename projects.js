document.addEventListener("DOMContentLoaded", async () => {
  // 1) hamburger extra behavior if you need it, or skip if scripts.js already covers

  // 2) build cards from projects.json
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

    grid.appendChild(frag);
  });

  // 3) filters & modal logic (unchanged)
});
