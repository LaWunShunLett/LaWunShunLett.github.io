// Page-load reveal
window.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.body.classList.remove("preload");
  });
});

// Hamburger toggle
const hamburger = document.querySelector(".hamburger");
const mobileNav = document.querySelector(".mobile-nav");

hamburger.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("active");
  mobileNav.classList.toggle("active");
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

// Close menu when clicking a mobile link
document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    mobileNav.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// Smooth scroll for all internal links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
