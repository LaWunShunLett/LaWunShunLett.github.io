// Page-load reveal (anim)
window.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.body.classList.remove("preload");
  });
});
const homeLogo = document.getElementById("homeLogo");

document.getElementById("homeLogo").onclick = () => {
  window.location.href = "index.html";
};
// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a mobile link
  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// Smooth scroll for internal anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
/* ===============================
   Image deterrence (not foolproof)
   =============================== */

// Disable right-click on images only
document.addEventListener("contextmenu", (e) => {
  if (e.target && e.target.tagName === "IMG") {
    e.preventDefault();
  }
});

// Prevent dragging images
document.addEventListener("dragstart", (e) => {
  if (e.target && e.target.tagName === "IMG") {
    e.preventDefault();
  }
});

