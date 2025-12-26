document.addEventListener("DOMContentLoaded", async () => {
  const projectsView = document.getElementById("projectsView");
  const detailsView = document.getElementById("detailsView");

  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  const pdBack = document.getElementById("pdBack");
  const pdTitle = document.getElementById("pdTitle");
  const pdMeta = document.getElementById("pdMeta");
  const pdImage = document.getElementById("pdImage");
  const pdOverview = document.getElementById("pdOverview");

  if (!projectsView || !detailsView || !grid || !tpl) {
    console.error("Missing required elements in projects.html");
    return;
  }

  const showProjects = () => {
    detailsView.style.display = "none";
    projectsView.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showDetails = () => {
    projectsView.style.display = "none";
    detailsView.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  pdBack?.addEventListener("click", showProjects);

  let projects = [];
  try {
    const res = await fetch("./projects.json");
    if (!res.ok) throw new Error(`projects.json HTTP ${res.status}`);
    projects = await res.json();
  } catch (e) {
    console.error("Failed to load projects.json", e);
    return;
  }

  grid.innerHTML = "";
  projects.forEach((p) => {
    const frag = tpl.content.cloneNode(true);

    const img = frag.querySelector("img");
    if (img) {
      img.src = p.image || "";
      img.alt = p.imageAlt || p.title || "Project image";
    }

    frag.querySelector(".project-name").textContent = p.title || "";
    frag.querySelector(".project-meta").textContent =
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
    frag.querySelector(".project-desc").textContent = p.desc || "";

    const btn = frag.querySelector(".project-cta");
    btn.textContent = "View details →";
    btn.addEventListener("click", () => {
      if (pdTitle) pdTitle.textContent = p.title || "";
      if (pdMeta) pdMeta.textContent = `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`;
      if (pdImage) {
        pdImage.src = p.image || "";
        pdImage.alt = p.imageAlt || p.title || "Project image";
      }
      if (pdOverview) pdOverview.textContent = p.desc || "";
      showDetails();
    });

    grid.appendChild(frag);
  });

  showProjects();
});
