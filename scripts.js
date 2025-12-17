// 1) Page-load reveal (remove preload after first paint)
window.addEventListener("DOMContentLoaded", () => {
  // Wait 1 frame so CSS applies, then reveal
  requestAnimationFrame(() => {
    document.body.classList.remove("preload");
  });
});

// 2) Smooth scroll for nav links (nice + professional)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
