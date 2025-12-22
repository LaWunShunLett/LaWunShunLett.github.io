// projects.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Mobile hamburger (same IDs you already use) ----------
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open");
    });
  }

  // ---------- Filter logic ----------
  const pills = document.querySelectorAll(".filter-pill");
  const cards = document.querySelectorAll(".project-card");

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // active state
      pills.forEach(p => {
        p.classList.remove("is-active");
        p.setAttribute("aria-selected", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-selected", "true");

      const filter = pill.dataset.filter;

      cards.forEach((card) => {
        const category = card.dataset.category;
        const show = (filter === "all") || (category === filter);

        card.classList.toggle("is-hidden", !show);

        // also close popups when filtering
        card.classList.remove("is-open");
      });
    });
  });

  // ---------- Mobile tap-to-open popup ----------
  // On small screens, tapping the card opens preview overlay.
  const isTouch = window.matchMedia("(max-width: 680px)").matches;

  if (isTouch) {
    cards.forEach((card) => {
      const closeBtn = card.querySelector(".pop-close");
      const link = card.querySelector(".project-link");

      // tap card opens pop
      card.addEventListener("click", (e) => {
        // if they clicked the close button, handle below
        if (e.target === closeBtn) return;

        // allow normal link clicks
        if (link && (e.target === link || link.contains(e.target))) return;

        // toggle open
        cards.forEach(c => { if (c !== card) c.classList.remove("is-open"); });
        card.classList.toggle("is-open");
      });

      // close button
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          card.classList.remove("is-open");
        });
      }
    });

    // tapping outside closes
    document.addEventListener("click", (e) => {
      const inside = e.target.closest(".project-card");
      if (!inside) cards.forEach(c => c.classList.remove("is-open"));
    });
  }
});
