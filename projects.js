// projects.js

// Remove preload class for animations (same pattern you use)
window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});

// ===== Mobile hamburger =====
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", String(!expanded));
    mobileNav.classList.toggle("open");
  });
}

// ===== Filters =====
const pills = document.querySelectorAll(".filter-pill");
const cards = document.querySelectorAll(".project-card");

pills.forEach(p => {
  p.addEventListener("click", () => {
    pills.forEach(x => {
      x.classList.remove("is-active");
      x.setAttribute("aria-selected", "false");
    });

    p.classList.add("is-active");
    p.setAttribute("aria-selected", "true");

    const f = p.dataset.filter;

    cards.forEach(card => {
      const cat = card.dataset.category;
      const show = (f === "all") || (cat === f);
      card.style.display = show ? "" : "none";
    });
  });
});

// ===== Modal =====
const modal = document.getElementById("projectModal");
const backdrop = document.getElementById("modalBackdrop");
const closeBtn = document.getElementById("modalClose");
const okBtn = document.getElementById("modalOk");

const t = document.getElementById("modalTitle");
const meta = document.getElementById("modalMeta");
const desc = document.getElementById("modalDesc");
const tech = document.getElementById("modalTech");
const link = document.getElementById("modalLink");

function openModalFromCard(card) {
  t.textContent = card.dataset.title || "Project";
  meta.textContent = `${card.dataset.year || ""} · ${card.dataset.role || ""}`.trim();
  desc.textContent = card.dataset.desc || "";
  tech.textContent = card.dataset.tech || "";

  // Optional link (disabled by default)
  link.href = "#";
  link.textContent = "Open project link";
  link.style.pointerEvents = "none";
  link.style.opacity = "0.6";

  modal.setAttribute("aria-hidden", "false");
  backdrop.setAttribute("aria-hidden", "false");

  modal.classList.add("open");
  backdrop.classList.add("open");
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  backdrop.setAttribute("aria-hidden", "true");

  modal.classList.remove("open");
  backdrop.classList.remove("open");
}

// "View details" button opens modal
document.querySelectorAll(".project-card .link-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".project-card");
    if (card) openModalFromCard(card);
  });
});

// Keyboard accessibility: Enter on card opens modal
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openModalFromCard(card);
  });
});

[closeBtn, okBtn, backdrop].forEach(el => el && el.addEventListener("click", closeModal));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
