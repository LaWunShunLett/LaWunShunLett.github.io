document.addEventListener("DOMContentLoaded", async () => {
  // keep main content hidden until ready (your anim system)
  document.body.classList.add("preload");

  const qs = new URLSearchParams(window.location.search);
  const id = qs.get("id");

  const $ = (x) => document.getElementById(x);

  const release = () => {
    requestAnimationFrame(() => {
      document.body.classList.remove("preload");
    });
  };

  // Back button
  $("pdBack")?.addEventListener("click", () => {
    history.length > 1 ? history.back() : (window.location.href = "projects.html");
  });

  if (!id) {
    release();
    return;
  }

  // Fill basic fields
  const setText = (elId, text) => {
    const el = $(elId);
    if (el) el.textContent = text ?? "";
  };

  const renderTags = (tags, role) => {
    const wrap = $("pdTags");
    if (!wrap) return;
    wrap.innerHTML = "";

    const list = [];
    if (role) list.push(role);
    (Array.isArray(tags) ? tags : []).forEach(t => list.push(t));

    list.forEach((t) => {
      const span = document.createElement("span");
      span.className = "pd-tag";
      span.textContent = t;
      wrap.appendChild(span);
    });
  };

  const renderLinks = (links) => {
    const actions = $("pdActions");
    if (!actions) return;
    actions.innerHTML = "";

    (Array.isArray(links) ? links : []).forEach((link) => {
      if (!link?.url) return;
      const a = document.createElement("a");
      a.className = "pd-source-btn";
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = link.label || "Open";
      actions.appendChild(a);
    });
  };

  const renderSection = (section) => {
    const container = document.createElement("div");
    container.className = "pd-section";

    // Title
    if (section.title) {
      const h2 = document.createElement("h2");
      h2.className = "pd-section-title";
      h2.textContent = section.title;
      container.appendChild(h2);
    }

    // TEXT
    if (section.type === "text") {
      const p = document.createElement("p");
      p.className = "pd-text";
      p.textContent = section.content || "";
      container.appendChild(p);
    }

    // LIST
    if (section.type === "list") {
      const ul = document.createElement("ul");
      ul.className = "pd-list";
      (Array.isArray(section.items) ? section.items : []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }

    // IMAGE
    if (section.type === "image") {
      const slot = document.createElement("div");
      slot.className = "pd-media-slot";

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

      const img = document.createElement("img");
      img.className = "pd-figure-img";
      img.loading = "lazy";
      img.decoding = "async";
      img.src = section.src || "";
      img.alt = section.alt || section.title || "";

      figure.appendChild(img);

      if (section.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "pd-figure-cap";
        cap.textContent = section.caption;
        figure.appendChild(cap);
      }

      slot.appendChild(figure);
      container.appendChild(slot);
    }

    // YOUTUBE
    if (section.type === "youtube") {
      const slot = document.createElement("div");
      slot.className = "pd-media-slot";

      const iframe = document.createElement("iframe");
      iframe.className = "pd-embed";
      iframe.loading = "lazy";
      iframe.src = `https://www.youtube.com/embed/${section.id}`;
      iframe.title = section.title || "YouTube video";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;

      slot.appendChild(iframe);
      container.appendChild(slot);
    }

    // FILE VIDEO
    if (section.type === "fileVideo") {
      const slot = document.createElement("div");
      slot.className = "pd-media-slot";

      const video = document.createElement("video");
      video.className = "pd-video-player";
      video.controls = true;
      if (section.poster) video.poster = section.poster;

      (Array.isArray(section.sources) ? section.sources : []).forEach((s) => {
        const source = document.createElement("source");
        source.src = s.src;
        source.type = s.type || "";
        video.appendChild(source);
      });

      slot.appendChild(video);
      container.appendChild(slot);
    }

    return container;
  };

  try {
    const res = await fetch("./projects_details.json", { cache: "no-store" });
    const data = await res.json();

    const list = Array.isArray(data) ? data : (data.projects || []);
    const proj = list.find((p) => p.id === id);

    if (!proj) {
      release();
      return;
    }

    // title
    setText("pdTitle", proj.title || "Project");

    // meta
    const meta = `${proj.year || ""}${proj.year && proj.role ? " · " : ""}${proj.role || ""}`;
    setText("pdMeta", meta);

    // tags
    renderTags(proj.tags, proj.role);

    // hero image
    const imgEl = $("pdImage");
    if (imgEl && proj.heroImage) {
      imgEl.src = proj.heroImage;
      imgEl.alt = proj.heroAlt || proj.title || "";
    }

    // sections
    const sectionsWrap = $("pdSections");
    if (sectionsWrap) {
      sectionsWrap.innerHTML = "";
      (Array.isArray(proj.sections) ? proj.sections : []).forEach((sec) => {
        sectionsWrap.appendChild(renderSection(sec));
      });
    }

    // links
    renderLinks(proj.links);

    // done -> start your anim pop
    release();
  } catch (err) {
    console.error(err);
    release();
  }
});
