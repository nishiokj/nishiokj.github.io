// Reads window.SITE (from content.js) and fills in the page.
// You shouldn't need to edit this — edit content.js instead.

(function render() {
  const s = window.SITE;
  if (!s) return;

  const NBSP = " ";
  const nb = (str) => String(str).replace(/ /g, NBSP); // keep multi-word labels on one line

  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  // Masthead
  document.querySelector("[data-name]").textContent = s.name;
  document.querySelector("[data-bio]").textContent = s.bio;
  document.title = s.name;

  document.querySelector("[data-links]").innerHTML = s.links
    .map((l) => {
      const external = /^https?:/i.test(l.href);
      const attrs = external ? ' target="_blank" rel="noopener me"' : "";
      return `<li><a href="${esc(l.href)}"${attrs}>${esc(l.label)}</a></li>`;
    })
    .join("");

  // Projects
  document.querySelector("[data-projects]").innerHTML = s.projects
    .map((p) => {
      const title = p.slug
        ? `<a href="project.html?slug=${esc(p.slug)}">${esc(p.title)}</a>`
        : p.href
        ? `<a href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
        : esc(p.title);
      const artifact = p.artifact
        ? `<div class="project-artifact"><img src="${esc(p.artifact.src)}" alt="${esc(p.artifact.alt)}" class="artifact-img" /></div>`
        : "";
      return `
      <div class="project">
        <dt class="project-title">
          <h2>${title}</h2>
        </dt>
        <time class="project-date" datetime="${esc(p.datetime)}">${esc(nb(p.date))}</time>
        ${artifact}
        <dd class="project-body">${esc(p.body)}${p.slug ? ` <a href="project.html?slug=${esc(p.slug)}" class="read-more">Read more →</a>` : ""}</dd>
      </div>`;
    })
    .join("");

  // Footer
  const t = document.querySelector("[data-updated]");
  t.textContent = nb(s.footer.updated);
  t.setAttribute("datetime", s.footer.updatedDatetime);
  document.querySelector("[data-copyright]").textContent = s.footer.copyright;
})();
