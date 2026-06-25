// ===== Technology page interactions =====
(function () {
  // Contact-zone hotspots (over a real photo)
  const hots = document.querySelectorAll(".zone-hot");
  const panels = document.querySelectorAll(".zone-panel");
  function activate(zone) {
    hots.forEach((h) => h.classList.toggle("is-active", h.dataset.zone === zone));
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.zone === zone));
  }
  hots.forEach((h) => {
    h.addEventListener("click", () => activate(h.dataset.zone));
    h.addEventListener("mouseenter", () => activate(h.dataset.zone));
  });

  // Smooth-scroll TOC active state
  const links = document.querySelectorAll(".tech-toc a");
  const sections = [...links].map((a) => document.querySelector(a.getAttribute("href")));
  addEventListener("scroll", () => {
    let idx = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= 140) idx = i; });
    links.forEach((l, i) => l.classList.toggle("is-active", i === idx));
  }, { passive: true });
})();
