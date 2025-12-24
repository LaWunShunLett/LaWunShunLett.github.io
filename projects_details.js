document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const loadingEl = document.getElementById("pdLoading");
  const contentEl = document.getElementById("pdContent");

  const showLoading = (msg = "Loading…") => {
    if (loadingEl) {
      loadingEl.style.display = "block";
      loadingEl.textContent = msg;
    }
    if (contentEl) contentEl.classList.add("is-hidden");
  };

  const showContent = () => {
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.classList.remove("is-hidden");
  };

  if (!id) {
    showLoading("No project id in URL.");
    console.error("No project id in URL");
    return;
  }

  showLoading("Loading…");

  let projects = [];
  let details = [];

  try {
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json"),
      fetch("./projects_details.json"),
    ]);

    if (!pRes.ok) throw new Error(`projects.json HTTP ${pRes.status}`);
    if (!dRes.ok) throw new Error(`projects_details.json HTTP ${dRes.status}`);

    projects = await pRes.json();
    details = await dRes.json();
  } catch (err) {
    showLoading("Failed to load project data.");
    console.error("Failed to load project data", err);
    return;
  }

  const base = projects.find((p) => p.id === id) || {};
  const detail = details.find((d) => d.id === id) || {};

  if (!base.id && !detail.id) {
    showLoading("Project not found.");
    console.error("Project not found for id:", id);
    return;
  }

  const title = detail.title || base.title || "Project";
  const year = detail.year || base.year || "";
  const role = detail.role || base.role || "";
  const summary = detail.summary || base.desc || "";
  const tech = detail.tech || base.tech || "";
  const heroImage = detail.heroImage || base.image || "";
  const heroAlt = detail.heroAlt || base.imageAlt || title;

  let tags = detail.tags || base.tags || [];
  if (role) tags = [role, ...tags];

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  setText("pdTitle", title);

  const metaEl = document.getElementById("pdMeta");
  if (metaEl) metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;

  // Tags
  const tagsWrap = document.getElementById("pdTags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";
    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  setText("pdSummary", summary);
  setText("pdProblem", detail.problem || "");
  setText("pdSolution", detail.solution || "");
  setText("pdTech", tech);

  // Image
  const imgEl = document.getElementById("pdImage");
  if (imgEl) {
    imgEl.src = heroImage;
    imgEl.alt = heroAlt;
  }

  // Responsibilities
  const respUl = document.getElementById("pdResponsibilities");
  if (respUl) {
    respUl.innerHTML = "";
    (detail.responsibilities || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      respUl.appendChild(li);
    });
  }

  // Features
  const featUl = document.getElementById("pdFeatures");
  if (featUl) {
    featUl.innerHTML = "";
    (detail.features || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      featUl.appendChild(li);
    });
  }

  // Gallery
  const galleryEl = document.getElementById("pdGallery");
  if (galleryEl) {
    galleryEl.innerHTML = "";
    (detail.gallery || []).forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = title;
      galleryEl.appendChild(img);
    });
  }

  // YouTube
  const videoContainer = document.getElementById("pdVideoContainer");
  if (videoContainer) {
    videoContainer.innerHTML = "";
    if (detail.youtube) {
      videoContainer.innerHTML = `
        <div class="pd-video-frame">
          <iframe
            src="${detail.youtube}"
            title="${title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      `;
    }
  }

  // Back button
  const backBtn = document.getElementById("pdBack");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "projects.html#projectsGrid";
    });
  }

  showContent();
});
