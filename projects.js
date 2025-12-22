// 1) Make animations visible (IMPORTANT)
// If body keeps class="preload", elements with .anim stay hidden.
window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});

// 2) Mobile hamburger
(function () {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.classList.toggle("open", !isOpen);
  });
})();

// 3) Filter buttons
(function () {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  function setActive(btn) {
    filterBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  }

  function applyFilter(filter) {
    cards.forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const show = filter === "all" || tags.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      setActive(btn);
      applyFilter(btn.getAttribute("data-filter"));
    });
  });
})();

// 4) Modal
(function () {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  const titleEl = document.getElementById("pmTitle");
  const metaEl = document.getElementById("pmMeta");
  const descEl = document.getElementById("pmDesc");
  const techEl = document.getElementById("pmTech");

  function openModal(data) {
    titleEl.textContent = data.title || "Project";
    metaEl.textContent = `${data.year || ""}${data.year ? " · " : ""}${data.role || ""}`.trim();
    descEl.textContent = data.desc || "";
    techEl.textContent = data.tech || "";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

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
})();
