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

  const linkIcon = (link) => {
    const label = String(link.label).toLowerCase();
    const href = String(link.href).toLowerCase();
    if (label.includes("github") || href.includes("github.com")) return "icons/github-icon.png";
    if (label.includes("linkedin") || href.includes("linkedin.com")) return "icons/linkedin-icon.webp";
    if (href.startsWith("mailto:")) return "icons/mail-lucide.svg";
    return "";
  };

  const formatProjectDate = (datetime, fallback) => {
    const [year, month] = String(datetime || "").split("-");
    const date = year && month ? new Date(Number(year), Number(month) - 1, 1) : null;
    if (!date || Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
  };

  // Masthead
  document.querySelector("[data-name]").textContent = s.name;
  const bioParas = Array.isArray(s.bio) ? s.bio : [s.bio];
  document.querySelector("[data-bio]").innerHTML = bioParas
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  document.title = s.name;

  document.querySelector("[data-links]").innerHTML = s.links
    .map((l) => {
      const external = /^https?:/i.test(l.href);
      const attrs = external ? ' target="_blank" rel="noopener me"' : "";
      const icon = linkIcon(l);
      const content = icon
        ? `<img src="${esc(icon)}" alt="" aria-hidden="true" /><span class="sr-only">${esc(l.label)}</span>`
        : esc(l.label);
      return `<li><a href="${esc(l.href)}" aria-label="${esc(l.label)}"${attrs}>${content}</a></li>`;
    })
    .join("");

  // Projects intro (optional)
  const introEl = document.querySelector("[data-projects-intro]");
  if (introEl && s.projectsIntro && s.projectsIntro.length > 0) {
    introEl.innerHTML = s.projectsIntro
      .map((p) => `<p>${typeof p === "string" ? esc(p) : p.html}</p>`)
      .join("");
    introEl.hidden = false;
  }

  // Projects
  document.querySelector("[data-projects]").innerHTML = s.projects
    .map((p, i) => {
      const detailHref = p.slug
        ? `project.html?slug=${esc(p.slug)}`
        : p.href
        ? esc(p.href)
        : null;
      const external = p.href && !p.slug;
      const linkAttrs = external ? ' target="_blank" rel="noopener"' : "";
      const title = detailHref
        ? `<a href="${detailHref}"${linkAttrs}>${esc(p.title)}</a>`
        : esc(p.title);
      const stack = p.stack?.length
        ? `<ul class="project-stack">${p.stack.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
        : "";
      return `
      <div class="project">
        <dt class="project-title">
          ${"" /* p.tag ? `<span class="project-tag">${esc(p.tag)}</span>` : "" */}
          <div class="project-heading-row">
            <h2>${title}</h2>
            <time class="project-date" datetime="${esc(p.datetime)}">${esc(nb(formatProjectDate(p.datetime, p.date)))}</time>
          </div>
          ${stack}
        </dt>
        <dd class="project-body">
          <span>${esc(p.body)}</span>
          ${p.slug ? `<a href="project.html?slug=${esc(p.slug)}" class="read-more">Read more →</a>` : ""}
        </dd>
      </div>`;
    })
    .join("");

  // Footer
  const t = document.querySelector("[data-updated]");
  t.textContent = nb(s.footer.updated);
  t.setAttribute("datetime", s.footer.updatedDatetime);
  document.querySelector("[data-copyright]").textContent = s.footer.copyright;
})();
