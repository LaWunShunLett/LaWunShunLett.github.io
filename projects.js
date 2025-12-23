document.addEventListener("DOMContentLoaded", async () => {
  // make animations visible
  document.body.classList.remove("preload");

  // --- hamburger toggle ---
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  const closeMenu = () => {
    if (!hamburger || !mobileNav) return;
    hamburger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("open");
  };

  if (hamburger && mobileNav) {
    const toggleMenu = () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("open", !isOpen);
    };

    hamburger.addEventListener("click", toggleMenu);

    mobileNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

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

    grid.appendChild(frag);
  });

  // --- 2) filters (run AFTER cards are in the DOM) ---
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

  // --- 3) modal (wire AFTER cards exist) ---
  const modal = document.getElementById("projectModal");
  if (modal) {
    const titleEl = document.getElementById("pmTitle");
    const metaEl = document.getElementById("pmMeta");
    const descEl = document.getElementById("pmDesc");
    const techEl = document.getElementById("pmTech");

    const openModal = (data) => {
      titleEl.textContent = data.title || "Project";
      metaEl.textContent = `${data.year || ""}${data.year ? " · " : ""}${data.role || ""}`.trim();
      descEl.textContent = data.desc || "";
      techEl.textContent = data.tech || "";

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeMenu();
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    document.querySelectorAll(".project-cta").forEach(btn => {
      btn.addEventListener("click", () => {
        openModal({
          title: btn.dataset.title,
          year: btn.dataset.year,
          role: btn.dataset.role,
          desc: btn.dataset.desc,
          tech: btn.dataset.tech,
        });
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target.matches("[data-close]")) closeModal();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // --- 4) disable right-click on images ---
  document.addEventListener("contextmenu", (e) => {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
    }
  });
});
