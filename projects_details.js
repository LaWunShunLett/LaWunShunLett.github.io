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
      fetch("./projects_details.json")
    ]);

    projects = await pRes.json();
    details = await dRes.json();
  } catch (err) {
    console.error("Failed to load project data", err);
    return;
  }

  const base   = projects.find(p => p.id === id) || {};
  const detail = details.find(d => d.id === id) || {};

  const title     = detail.title || base.title || "Project";
  const year      = detail.year  || base.year  || "";
  const role      = detail.role  || base.role  || "";
  const summary   = detail.summary || base.desc || "";
  const tech      = detail.tech    || base.tech || "";
  const heroImage = detail.heroImage || base.image || "";
  const heroAlt   = detail.heroAlt   || base.imageAlt || title;

  // tags from JSON (base or details)
  let tags = detail.tags || base.tags || [];

  // include role as first tag
  if (role) {
    tags = [role, ...tags];
  }

  const titleEl   = document.getElementById("pdTitle");
  const metaEl    = document.getElementById("pdMeta");
  const summaryEl = document.getElementById("pdSummary");
  const problemEl = document.getElementById("pdProblem");
  const solutionEl = document.getElementById("pdSolution");
  const techEl    = document.getElementById("pdTech");
  const imgEl     = document.getElementById("pdImage");

  if (titleEl) titleEl.textContent = title;
  if (metaEl) {
    metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;
  }

  // render tags row
  const tagsWrap = document.getElementById("pdTags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";
    tags.forEach(t => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span);
    });
  }

  if (summaryEl) summaryEl.textContent = summary;
  if (problemEl) problemEl.textContent = detail.problem || "";
  if (solutionEl) solutionEl.textContent = detail.solution || "";
  if (techEl) techEl.textContent = tech;

  if (imgEl) {
    imgEl.src = heroImage;
    imgEl.alt = heroAlt;
  }

  // responsibilities
  const respUl = document.getElementById("pdResponsibilities");
  if (respUl) {
    (detail.responsibilities || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      respUl.appendChild(li);
    });
  }

  // features
  const featUl = document.getElementById("pdFeatures");
  if (featUl) {
    (detail.features || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      featUl.appendChild(li);
    });
  }

  // gallery
  const galleryEl = document.getElementById("pdGallery");
  if (galleryEl) {
    (detail.gallery || []).forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = title;
      galleryEl.appendChild(img);
    });
  }

  // YouTube
  if (detail.youtube) {
    const container = document.getElementById("pdVideoContainer");
    if (container) {
      container.innerHTML = `
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
});
