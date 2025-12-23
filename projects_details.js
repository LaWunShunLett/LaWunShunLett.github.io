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

  const base = projects.find(p => p.id === id) || {};
  const detail = details.find(d => d.id === id) || {};

  const title = detail.title || base.title || "Project";
  const year = detail.year || base.year || "";
  const role = detail.role || base.role || "";
  const summary = detail.summary || base.desc || "";
  const tech = detail.tech || base.tech || "";
  const heroImage = detail.heroImage || base.image || "";
  const heroAlt = detail.heroAlt || base.imageAlt || title;

  document.getElementById("pdTitle").textContent = title;
  document.getElementById("pdMeta").textContent =
    `${year}${year && role ? " · " : ""}${role}`;
  document.getElementById("pdSummary").textContent = summary;
  document.getElementById("pdProblem").textContent = detail.problem || "";
  document.getElementById("pdSolution").textContent = detail.solution || "";
  document.getElementById("pdTech").textContent = tech;

  const imgEl = document.getElementById("pdImage");
  imgEl.src = heroImage;
  imgEl.alt = heroAlt;

  // responsibilities list
  const respUl = document.getElementById("pdResponsibilities");
  (detail.responsibilities || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    respUl.appendChild(li);
  });

  // features list
  const featUl = document.getElementById("pdFeatures");
  (detail.features || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    featUl.appendChild(li);
  });

  // gallery
  const galleryEl = document.getElementById("pdGallery");
  (detail.gallery || []).forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = title;
    galleryEl.appendChild(img);
  });

  // YouTube
  if (detail.youtube) {
    const container = document.getElementById("pdVideoContainer");
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

  // back button
  const backBtn = document.getElementById("pdBack");
  backBtn.addEventListener("click", () => {
    window.location.href = "projects.html#projectsGrid";
  });
});
