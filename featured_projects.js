document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("featuredGrid");
  const pager = document.getElementById("featuredPagination");
  const tpl = document.getElementById("projectCardTpl");
  if (!grid || !pager || !tpl) return;

  // Use the SAME data source your projects page uses
  // (If your projects page loads a different file, change this path to match.)
  const DATA_URL = "./projects.json";

  let projects = [];
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    projects = await res.json();
  } catch (e) {
    console.error("Failed to load projects:", e);
    return;
  }

  if (!Array.isArray(projects) && Array.isArray(projects.projects)) {
    projects = projects.projects;
  }

  // Optional: if you later add featured:true, this will prefer those
  const featured = projects.filter(p => p.featured === true);
  const list = featured.length ? featured : projects;

  const PAGE_SIZE = 3;
  let page = 1;

  function setText(el, text) {
    if (!el) return;
    el.textContent = text || "";
  }

  function renderCard(p) {
    const node = tpl.content.cloneNode(true);

    // These class selectors must match your projects.html card template
    setText(node.querySelector(".project-name"), p.title);
    setText(
      node.querySelector(".project-meta"),
      `${p.year || ""}${p.year && p.role ? " · " : ""}${p.role || ""}`.trim()
    );
    setText(node.querySelector(".project-desc"), p.description || p.summary || "");

    const img = node.querySelector("img");
    if (img) {
      img.src = p.heroImage || p.image || "";
      img.alt = p.heroAlt || p.title || "";
      img.loading = "lazy";
    }

    const tagsWrap = node.querySelector(".project-tags");
    if (tagsWrap) {
      tagsWrap.innerHTML = "";
      (p.tags || []).slice(0, 5).forEach(t => {
        const span = document.createElement("span");
        // IMPORTANT: use your theme tag class (from projects page)
        span.className = "tag";
        span.textContent = t;
        tagsWrap.appendChild(span);
      });
    }

    const cta = node.querySelector(".project-cta");
    const href = `projects_details.html?id=${encodeURIComponent(p.id)}`;

    // If your template uses <a> for CTA, set href. If it uses <button>, navigate on click.
    if (cta) {
      if (cta.tagName.toLowerCase() === "a") {
        cta.href = href;
      } else {
        cta.addEventListener("click", () => (window.location.href = href));
      }
    }

    // If your title is an <a>, wire it too
    const titleLink = node.querySelector(".project-name a");
    if (titleLink) titleLink.href = href;

    // If your thumbnail is clickable
    const thumbLink = node.querySelector(".project-media a");
    if (thumbLink) thumbLink.href = href;

    return node;
  }

  function render() {
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    page = Math.min(Math.max(1, page), totalPages);

    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);

    grid.innerHTML = "";
    slice.forEach(p => grid.appendChild(renderCard(p)));

    pager.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fp-page" + (i === page ? " is-active" : "");
      btn.textContent = i;
      btn.addEventListener("click", () => {
        page = i;
        render();
      });
      pager.appendChild(btn);
    }
  }

  render();
});
