document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error("No project id in URL");
    return;
  }

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
    console.error("Failed to load project data", err);
    return;
  }

  const base = projects.find((p) => p.id === id);
  const detail = details.find((d) => d.id === id);

  if (!base && !detail) {
    console.error("Project not found for id:", id);
    return;
  }

  const b = base || {};
  const d = detail || {};

  const title = d.title || b.title || "Project";
  const year = d.year || b.year || "";
  const role = d.role || b.role || "";
  const summary = d.summary || b.desc || "";
  const tech = d.tech || b.tech || "";
  const heroImage = d.heroImage || b.image || "";
  const heroAlt = d.heroAlt || b.imageAlt || title;

  // tags from JSON (base or details)
  let tags = d.tags || b.tags || [];
  if (role) tags = [role, ...tags];

  const titleEl = document.getElementById("pdTitle");
  const metaEl = document.getElementById("pdMeta");
  const summaryEl = document.getElementById("pdSummary");
  const problemEl = document.getElementById("pdProblem");
  const solutionEl = document.getElementById("pdSolution");
  const techEl = document.getElementById("pdTech");
  const imgEl = document.getElementById("pdImage");

  if (titleEl) titleEl.textContent = title;
  if (metaEl) metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;

  // render tags row
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

  if (summaryEl) summaryEl.textContent = summary;
  if (problemEl) problemEl.textContent = d.problem || "";
  if (solutionEl) solutionEl.textContent = d.solution || "";
  if (techEl) techEl.textContent = tech;

  if (imgEl) {
    imgEl.src = heroImage;
    imgEl.alt = heroAlt;
  }

  // responsibilities
  const respUl = document.getElementById("pdResponsibilities");
  if (respUl) {
    respUl.innerHTML = "";
    (d.responsibilities || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      respUl.appendChild(li);
    });
  }

  // features
  const featUl = document.getElementById("pdFeatures");
  if (featUl) {
    featUl.innerHTML = "";
    (d.features || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      featUl.appendChild(li);
    });
  }

  // gallery
  const galleryEl = document.getElementById("pdGallery");
  if (galleryEl) {
    galleryEl.innerHTML = "";
    (d.gallery || []).forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = title;
      galleryEl.appendChild(img);
    });
  }

  // YouTube
  if (d.youtube) {
    const container = document.getElementById("pdVideoContainer");
    if (container) {
      container.innerHTML = `
        <div class="pd-video-frame">
          <iframe
            src="${d.youtube}"
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
});
