document.addEventListener("DOMContentLoaded", async () => {
  // Keep ALL .anim elements hidden until data is ready
  // (Topbar is unaffected as long as it doesn't have .anim classes)
  document.body.classList.add("preload");

  const qs = new URLSearchParams(window.location.search);
  const id = qs.get("id");

  const $ = (x) => document.getElementById(x);

  const release = () => {
    // Start your existing .anim pop animation
    requestAnimationFrame(() => document.body.classList.remove("preload"));
  };

  const setText = (elId, text) => {
    const el = $(elId);
    if (!el) return;
    el.textContent = text ?? "";
  };

  const setList = (elId, items) => {
    const el = $(elId);
    if (!el) return;
    el.innerHTML = "";

    const arr = Array.isArray(items) ? items : [];
    arr.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  };

  // Inline media slots
  const SLOTMAP = {
    afterOverview: "pdMediaAfterOverview",
    afterProblem: "pdMediaAfterProblem",
    afterSolution: "pdMediaAfterSolution",
    afterFeatures: "pdMediaAfterFeatures",
  };

  const clearMediaSlots = () => {
    Object.values(SLOTMAP).forEach((slotId) => {
      const el = $(slotId);
      if (el) el.innerHTML = "";
    });
  };

  const renderInlineMedia = (project) => {
    clearMediaSlots();

    const media = Array.isArray(project?.inlineMedia) ? project.inlineMedia : [];
    media.forEach((m) => {
      const slotId = SLOTMAP[m.slot];
      const slotEl = $(slotId);
      if (!slotEl) return;

      const figure = document.createElement("figure");
      figure.className = "pd-figure";

      // IMAGE
      if (m.type === "image") {
        const img = document.createElement("img");
        img.className = "pd-figure-img";
        img.alt = m.alt || m.title || "";
        img.loading = "lazy";
        img.decoding = "async";
        img.src = m.src || m.id || "";
        figure.appendChild(img);
      }

      // YOUTUBE
      if (m.type === "youtube") {
        const iframe = document.createElement("iframe");
        iframe.className = "pd-embed";
        iframe.src = `https://www.youtube.com/embed/${m.id}`;
        iframe.title = m.title || "YouTube video";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        figure.appendChild(iframe);
      }

      // FILE VIDEO
      if (m.type === "fileVideo") {
        const video = document.createElement("video");
        video.className = "pd-video-player";

        // Prevent the controls/black flash until it's playable
        video.controls = false;
        if (m.poster) video.poster = m.poster;

        video.addEventListener(
          "canplay",
          () => {
            video.controls = true;
          },
          { once: true }
        );

        (Array.isArray(m.sources) ? m.sources : []).forEach((s) => {
          const source = document.createElement("source");
          source.src = s.src;
          source.type = s.type || "";
          video.appendChild(source);
        });

        figure.appendChild(video);
      }

      if (m.caption) {
        const cap = document.createElement("figcaption");
        cap.className = "pd-figure-cap";
        cap.textContent = m.caption;
        figure.appendChild(cap);
      }

      slotEl.appendChild(figure);
    });
  };

  // Back button (works even if history is empty)
  $("pdBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else window.location.href = "projects.html";
  });

  // If no id in URL, just release animations and stop
  if (!id) {
    release();
    return;
  }

  try {
    // Load both files (same folder)
    const [pRes, dRes] = await Promise.all([
      fetch("./projects.json", { cache: "force-cache" }),
      fetch("./projects_details.json", { cache: "force-cache" }),
    ]);

    if (!pRes.ok) throw new Error(`projects.json HTTP ${pRes.status}`);
    if (!dRes.ok) throw new Error(`projects_details.json HTTP ${dRes.status}`);

    const projects = await pRes.json();
    const details = await dRes.json();

    const base = projects.find((p) => p.id === id);
    const detail = details.find((d) => d.id === id);

    if (!base || !detail) {
      // still show page (no blank)
      setText("pdTitle", "Project not found");
      release();
      return;
    }

    const proj = { ...base, ...detail };

    // ===== Fill header/meta =====
    const year = proj.year || "";
    const role = proj.role || "";
    setText("pdTitle", proj.title || "Project");
    setText("pdMeta", `${year}${year && role ? " · " : ""}${role}`);

    // Tags (optional)
    const tagsWrap = $("pdTags");
    if (tagsWrap) {
      tagsWrap.innerHTML = "";
      const tags = Array.isArray(proj.tags) ? proj.tags : [];
      const list = role ? [role, ...tags] : tags;

      list.forEach((t) => {
        const span = document.createElement("span");
        span.className = "pd-tag";
        span.textContent = t;
        tagsWrap.appendChild(span);
      });
    }

    // ===== Main content =====
    setText("pdOverview", proj.overview || "");
    setList("pdOverviewPoints", proj.overviewPoints || []);
    setText("pdProblem", proj.problem || "");
    setText("pdSolution", proj.solution || "");

    const techText = Array.isArray(proj.tech) ? proj.tech.join(", ") : (proj.tech || "");
    setText("pdTech", techText);

    setList("pdResponsibilities", proj.responsibilities || []);
    setList("pdFeatures", proj.features || []);

    // ===== Hero image =====
    const imgEl = $("pdImage");
    if (imgEl) {
      const hero = proj.heroImage || proj.image || "";
      if (hero) {
        imgEl.alt = proj.heroAlt || proj.imageAlt || proj.title || "";
        imgEl.src = hero;
      }
    }

    // ===== Inline media =====
    renderInlineMedia(proj);

    // ===== Source button =====
    const actions = $("pdActions");
    if (actions) {
      actions.innerHTML = "";
      if (proj.sourceCode) {
        const a = document.createElement("a");
        a.href = proj.sourceCode;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "pd-source-btn";
        a.textContent = "Source code";
        actions.appendChild(a);
      }
    }

    // ✅ Only after everything is rendered -> start the anim pop
    release();
  } catch (err) {
    console.error(err);
    // Never leave it blank — reveal anyway
    setText("pdTitle", "Failed to load project");
    release();
  }
});
