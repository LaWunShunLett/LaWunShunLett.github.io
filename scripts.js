document.querySelectorAll(".nav a").forEach(a => {
  a.addEventListener("click", () => {
    document.querySelectorAll(".nav a").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
  });
});
