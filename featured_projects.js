fetch("./projects_details.json")
  .then(res => res.json())
  .then(projects => {
    const grid = document.getElementById("featuredGrid");
    const pagination = document.getElementById("featuredPagination");

    const PER_PAGE = 3;
    let page = 1;

    function render() {
      grid.innerHTML = "";
      pagination.innerHTML = "";

      const featured = projects.slice(0, 6);
      const totalPages = Math.ceil(featured.length / PER_PAGE);

      const start = (page - 1) * PER_PAGE;
      const items = featured.slice(start, start + PER_PAGE);

      items.forEach(p => {
        const card = document.createElement("article");
        card.className = "project-card";
        card.innerHTML = `
          <div class="project-media">
            <img src="${p.heroImage}" alt="${p.heroAlt}">
          </div>
          <div class="project-body">
            <h3 class="project-name">${p.title}</h3>
            <p class="project-meta">${p.year} · ${p.role}</p>
            <a class="project-cta" href="projects_details.html?id=${p.id}">
              View details →
            </a>
          </div>
        `;
        grid.appendChild(card);
      });

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === page ? "is-active" : "";
        btn.onclick = () => {
          page = i;
          render();
        };
        pagination.appendChild(btn);
      }
    }

    render();
  });
