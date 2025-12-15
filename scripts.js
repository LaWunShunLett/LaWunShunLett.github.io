// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
menuBtn?.addEventListener("click", () => menu.classList.toggle("open"));

// Theme toggle (saved)
const themeBtn = document.getElementById("themeBtn");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

function updateThemeIcon() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  themeBtn.textContent = isLight ? "☀️" : "🌙";
}
updateThemeIcon();

themeBtn.addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const next = isLight ? "" : "light";
  if (next) document.documentElement.setAttribute("data-theme", next);
  else document.documentElement.removeAttribute("data-theme");
  localStorage.setItem("theme", next || ""); // store
  updateThemeIcon();
});

// Reveal on scroll
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("visible");
  });
}, { threshold: 0.12 });
reveals.forEach(el => io.observe(el));

// Active nav highlight on scroll
const sections = ["about","projects","skills","contact"].map(id => document.getElementById(id));
const navLinks = Array.from(document.querySelectorAll(".navlink"));

const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.remove("active"));
      const id = e.target.getAttribute("id");
      const link = navLinks.find(a => a.getAttribute("href") === `#${id}`);
      link?.classList.add("active");
    }
  });
}, { threshold: 0.55 });
sections.forEach(s => s && spy.observe(s));

// Projects filter
const filterWrap = document.getElementById("filters");
const cards = Array.from(document.querySelectorAll(".card"));

filterWrap.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;

  document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const f = btn.dataset.filter;
  cards.forEach(card => {
    const tags = (card.dataset.tags || "").split(",").map(s => s.trim());
    const show = (f === "all") || tags.includes(f);
    card.style.display = show ? "" : "none";
  });
});

// Modal for project details
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const mTitle = document.getElementById("mTitle");
const mDesc = document.getElementById("mDesc");
const mStack = document.getElementById("mStack");

function openModal(card) {
  mTitle.textContent = card.dataset.title || "Project";
  mDesc.textContent = card.dataset.desc || "";
  mStack.textContent = card.dataset.stack || "";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}
function hideModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

cards.forEach(card => {
  card.querySelector("button")?.addEventListener("click", () => openModal(card));
});

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) hideModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideModal();
});
