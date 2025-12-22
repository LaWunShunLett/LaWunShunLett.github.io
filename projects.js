// projects.js

// ---------- Mobile hamburger ----------
(function () {
  const btn = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  if (!btn || !mobileNav) return;

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    mobileNav.classList.toggle("open");
  });

  // close menu after click
  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      btn.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("open");
    });
  });
})();

// ---------- Filters ----------
(function () {
  const filters = document.querySelectorAll(".proj-filter");
  const cards = document.querySelectorAll(".proj-card");
  if (!filters.length || !cards.length) return;

  function setActive(btn) {
    filters.forEach(b => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
  }

  function matches(card, filter) {
    if (filter === "all") return true;
    const tags = (card.getAttribute("data-tags") || "").toLowerCase();
    return tags.includes(filter);
  }

  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      setActive(btn);

      cards.forEach(card => {
        card.style.display = matches(card, filter) ? "" : "none";
      });
    });
  });
})();

// ---------- Modal (hover pop-up + click to open details) ----------
(function () {
  const modal = document.getElementById("projModal");
  const titleEl = document.getElementById("projModalTitle");
  const metaEl = document.getElementById("projModalMeta");
  const descEl = document.getElementById("projModalDesc");
  const listEl = document.getElementById("projModalList");
  const btnEl = document.getElementById("projModalBtn");

  if (!modal) return;

  function openModal(data) {
    titleEl.textContent = data.title || "Project";
    metaEl.textContent = `${data.year || ""} • ${data.role || ""}`.replace(/^ • | • $/g, "");
    descEl.textContent = data.desc || "";

    // highlights -> bullet list
    listEl.innerHTML = "";
    const highlights = (data.highlights || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (highlights.length) {
      highlights.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "More details coming soon.";
      listEl.appendChild(li);
    }

    // later you can point this to a real detail page
    btnEl.href = "#";
    btnEl.textContent = "Open project page";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    // lock background scroll
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  // open on card click
  document.querySelectorAll(".proj-card-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openModal({
        title: link.dataset.title,
        year: link.dataset.year,
        role: link.dataset.role,
        desc: link.dataset.desc,
        highlights: link.dataset.highlights
      });
    });
  });

  // close handlers
  modal.addEventListener("click", (e) => {
    if (e.target && e.target.hasAttribute("data-close")) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
})();
