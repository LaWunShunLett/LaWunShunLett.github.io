document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id"); // [web:245]

  const loadingEl = document.getElementById("pdLoading");
  const contentEl = document.getElementById("pdContent");

  const showLoading = (msg = "Loading…") => {
    if (loadingEl) {
      loadingEl.style.display = "block";
      loadingEl.textContent = msg;
    }
    if (contentEl) {
      contentEl.classList.add("is-hidden");
      contentEl.classList.remove("is-ready");
    }
  };

  const showContent = () => {
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) {
      contentEl.classList.remove("is-hidden");
      contentEl.classList.add("is-ready");
    }
  };

  if (!id) {
    showLoading("No project id in URL.");
    return;
  }

  showLoading("Loading…");

  let projects = [];
  let details = [];

  try {
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json"),
      fetch("./projects_details.json"),
    ]); // [web:242]

    if (!pRes.ok) throw new Error(`projects.json HTTP ${pRes.status}`);
    if (!dRes.ok) throw new Error(`projects_details.json HTTP ${dRes.status}`);

    projects = await pRes.json();
    details = await dRes.json();
  } catch (err) {
    showLoading("Failed to load project data.");
    console.error(err);
    return;
  }

  const base = projects.find((p) => p.id === id) || {};
  const detail = details.find((d) => d.id === id) || {};

  if (!base.id && !detail.id) {
    showLoading("Project not found.");
    return;
  }

  // Merge: details override base
  const proj = { ...base, ...detail };

  const title = proj.title || "Project";
  const year = proj.year || "";
  const role = proj.role || "";
  const tech = proj.tech || "";
  const heroImage = proj.heroImage || proj.image || "";
  const heroAlt = proj.heroAlt || proj.imageAlt || title;

  let tags = proj.tags || [];
  if (role) tags = [role, ...tags];

  const setText = (elId, value) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = value || "";
  };

const setList = (elId, items) => {
  const el = document.getElementById(elId);
  if (!el) return;

  // normalize to array
  const arr = Array.isArray(items)
    ? items
    : (typeof items === "string"
        ? items.split(",").map(s => s.trim()).filter(Boolean)
        : []);

  // If the target element is not UL/OL, write plain text instead
  const tag = el.tagName.toLowerCase();
  if (tag !== "ul" && tag !== "ol") {
    el.textContent = arr.join(", ");
    return;
  }

  // Render list
  el.innerHTML = "";
  arr.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.appendChild(li);
  });
};
  // -------- Inline media slots --------
  const SLOT_MAP = {
    afterOverview: "pdMediaAfterOverview",
    afterProblem: "pdMediaAfterProblem",
    afterSolution: "pdMediaAfterSolution",
    afterFeatures: "pdMediaAfterFeatures",
  };

  function clearInlineMediaSlots() {
    Object.values(SLOT_MAP).forEach((slotId) => {
      const el = document.getElementById(slotId);
      if (el) el.innerHTML = "";
    });
  }

  function renderInlineMedia(project) {
    clearInlineMediaSlots();

    (project.inlineMedia || []).forEach((m) => {
      const slotId = SLOT_MAP[m.slot];
      const slotEl = document.getElementById(slotId);
      if (!slotEl) return;

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

if (m.type === "image") {
  const img = document.createElement("img");
  img.className = "pd-figure-img";
  img.src = m.src || m.id;   // allow old JSON shape too
  img.alt = m.alt || m.title || "";
  figure.appendChild(img);
}
      if (m.type === "youtube") {
        const iframe = document.createElement("iframe");
        iframe.className = "pd-embed";
        iframe.src = `https://www.youtube.com/embed/${m.id}`;
        iframe.title = m.title || title;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        figure.appendChild(iframe); // [web:183]
      }

      if (m.type === "fileVideo") {
        const video = document.createElement("video");
        video.className = "pd-video-player";
        video.controls = true;
        if (m.poster) video.poster = m.poster;

        (m.sources || []).forEach((s) => {
          const source = document.createElement("source");
          source.src = s.src;
          source.type = s.type;
          video.appendChild(source); // [web:183]
        });

        figure.appendChild(video); // [web:183]
      }

      if (m.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "pd-figure-cap";
        cap.textContent = m.caption;
        figure.appendChild(cap); // [web:183]
      }

      slotEl.appendChild(figure); // [web:183]
    });
  }
try {
  // -------- Render page fields --------
  // ... (your setText/setList/img/gallery/media code)
  showContent();
} catch (e) {
  console.error(e);
  showContent(); // still show whatever loaded
}

  // -------- Render page fields --------
  setText("pdTitle", title);

  const metaEl = document.getElementById("pdMeta");
  if (metaEl) metaEl.textContent = `${year}${year && role ? " · " : ""}${role}`;

  const tagsWrap = document.getElementById("pdTags");
  if (tagsWrap) {
    tagsWrap.innerHTML = "";
    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      tagsWrap.appendChild(span); // [web:183]
    });
  }

  setText("pdOverview", proj.overview || "");
  setText("pdSummary", proj.summary || proj.desc || "");
  setText("pdProblem", proj.problem || "");
  setText("pdSolution", proj.solution || "");
  setText("pdTech", tech);

  setList("pdOverviewPoints", proj.overviewPoints || []);
  setList("pdResponsibilities", proj.responsibilities || []);
  setList("pdFeatures", proj.features || []);

  const imgEl = document.getElementById("pdImage");
  if (imgEl) {
    imgEl.src = heroImage;
    imgEl.alt = heroAlt;
  }

  // Gallery (optional)
  const galleryEl = document.getElementById("pdGallery");
  if (galleryEl) {
    galleryEl.innerHTML = "";
    (proj.gallery || []).forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = title;
      galleryEl.appendChild(img); // [web:183]
    });
  }

  // Inline media (NEW)
  renderInlineMedia(proj);

  // Legacy single YouTube (optional): ONLY show if no inlineMedia videos and youtube exists
  const videoContainer = document.getElementById("pdVideoContainer");
  if (videoContainer) {
    videoContainer.innerHTML = "";
    if (proj.youtube && !(proj.inlineMedia || []).some(x => x.type === "youtube" || x.type === "fileVideo")) {
      videoContainer.innerHTML = `
        <div class="pd-video-frame" style="aspect-ratio:16/9;">
          <iframe
            src="${proj.youtube}"
            title="${title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            style="width:100%;height:100%;border:0;"
          ></iframe>
        </div>
      `;
    }
  }

  // Source code button
  const actions = document.getElementById("pdActions");
  if (actions) {
    actions.innerHTML = "";
    const url = proj.sourceCode;
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "pd-source-btn";
      a.textContent = "Source code";
      actions.appendChild(a); // [web:183]
    }
  }

  // Back button (optional)
  const backBtn = document.getElementById("pdBack");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "projects.html#projectsGrid";
    });
  }

  showContent();
});
window.addEventListener("load", () => {
  document.documentElement.classList.remove("preload");
});
