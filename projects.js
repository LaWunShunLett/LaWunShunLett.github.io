// projects.js

document.addEventListener("DOMContentLoaded", () => {
  // ----- Mobile hamburger -----
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open");
    });
  }

  // ----- Filter -----
  const pills = document.querySelectorAll(".filter-pill");
  const cards = document.querySelectorAll(".project-card");

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
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

        // close popup if filtering
        card.classList.remove("is-open");
      });
    });
  });

  // ----- Mobile tap popup -----
  const isMobile = window.matchMedia("(max-width: 680px)").matches;

  if (isMobile) {
    cards.forEach((card) => {
      const closeBtn = card.querySelector(".pop-close");
      const links = card.querySelectorAll("a");

      // open on tap
      card.addEventListener("click", (e) => {
        // allow normal link click
        for (const a of links) {
          if (a === e.target || a.contains(e.target)) return;
        }
        // if close button clicked, ignore here
        if (e.target === closeBtn) return;

        // toggle
        cards.forEach(c => { if (c !== card) c.classList.remove("is-open"); });
        card.classList.toggle("is-open");
      });

      // close
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          card.classList.remove("is-open");
        });
      }
    });

    // tap outside closes
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".project-card")) {
        cards.forEach(c => c.classList.remove("is-open"));
      }
    });
  }
});
