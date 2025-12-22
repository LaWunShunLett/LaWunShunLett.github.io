document.addEventListener("DOMContentLoaded", () => {
  // make animations visible
  document.body.classList.remove("preload");

  // hamburger toggle
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

    // close menu when a link is clicked
    mobileNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", closeMenu);
    });

    // optional: click outside to close (clicking header area won't close unless you add a backdrop)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // filter buttons
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  const setActive = (btn) => {
    filterBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  };

  const applyFilter = (filter) => {
    cards.forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const show = filter === "all" || tags.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      setActive(btn);
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  // modal
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

      // also close mobile menu if it was open
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
});
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("projectsGrid");
  const tpl = document.getElementById("projectCardTpl");

  const res = await fetch("./projects.json");
  const projects = await res.json(); // loads JSON [web:289]

  projects.forEach(p => {
    const frag = tpl.content.cloneNode(true); // clones template [web:261]

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
});
