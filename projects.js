// projects.js

document.addEventListener("DOMContentLoaded", () => {
  // Remove preload if you use it in your global animations
  document.body.classList.remove("preload");

  // ---------- Mobile hamburger (same behavior as your other pages) ----------
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open");
    });
  }

  // ---------- Filter ----------
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(document.querySelectorAll(".project-card"));

  function setActiveFilter(btn) {
    filterButtons.forEach(b => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
  }

  function applyFilter(filter) {
    cards.forEach(card => {
      const cat = (card.dataset.category || "").toLowerCase();
      const show = (filter === "all") || (cat === filter);
      card.style.display = show ? "" : "none";
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = (btn.dataset.filter || "all").toLowerCase();
      setActiveFilter(btn);
      applyFilter(filter);
    });
  });

  // ---------- Modal ----------
  const modal = document.getElementById("projectModal");
  const modalClose = document.getElementById("modalClose");

  const modalTitle = document.getElementById("modalTitle");
  const modalMeta = document.getElementById("modalMeta");
  const modalDesc = document.getElementById("modalDesc");
  const modalTech = document.getElementById("modalTech");

  function openModal(card) {
    if (!modal) return;

    modalTitle.textContent = card.dataset.title || "Project";
    modalMeta.textContent = `${card.dataset.year || ""} · ${card.dataset.role || ""}`.trim();
    modalDesc.textContent = card.dataset.desc || "";
    modalTech.textContent = card.dataset.tech || "—";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    // accessibility
    modalClose?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  // open by button or card click
  cards.forEach(card => {
    const btn = card.querySelector(".project-cta");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(card);
    });

    card.addEventListener("click", () => openModal(card));

    // open with Enter key
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openModal(card);
      if (e.key === "Escape") closeModal();
    });
  });

  // close modal
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.close === "true") closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
