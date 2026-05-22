// Reads window.SITE (from content.js) and renders a project detail page.
// URL must include ?slug=<project-slug>. Edit content.js to update content.

(function render() {
  const s = window.SITE;
  if (!s) return;

  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  // Renders a `blocks` array of mixed strings (paragraphs) and { list, items } objects.
  // List items may be plain strings or { lead, text, sub } objects for nested bullets.
  function renderProseBlocks(blocks) {
    return blocks.map((block) => {
      if (typeof block === "string") {
        return `<p class="prose-p">${esc(block)}</p>`;
      }
      const tag = block.list === "ol" ? "ol" : "ul";
      const items = block.items.map((item) => {
        if (typeof item === "string") {
          return `<li>${esc(item)}</li>`;
        }
        let inner = "";
        if (item.lead) inner += `<strong>${esc(item.lead)}</strong>`;
        if (item.text) inner += `${item.lead ? " " : ""}${esc(item.text)}`;
        if (item.sub)  inner += `<ul class="prose-sub"><li>${esc(item.sub)}</li></ul>`;
        return `<li>${inner}</li>`;
      }).join("");
      return `<${tag} class="prose-list prose-list--${tag}">${items}</${tag}>`;
    }).join("");
  }

  const slug = new URLSearchParams(location.search).get("slug");
  const project = s.projects.find((p) => p.slug === slug);

  if (!project) {
    document.title = "Not Found — Jevin Nishioka";
    document.querySelector("[data-title]").textContent = "Project not found.";
    return;
  }

  document.title = `${project.title} — Jevin Nishioka`;
  document.querySelector("[data-title]").textContent = project.title;
  document.querySelector("[data-body]").textContent = project.body;

  const dateEl = document.querySelector("[data-date]");
  dateEl.textContent = project.date;
  dateEl.setAttribute("datetime", project.datetime);

  const d = project.detail;

  // Why I built this (optional)
  if (d.why && d.why.length > 0) {
    document.querySelector("[data-why-rule]").hidden = false;
    document.querySelector("[data-why-section]").hidden = false;
    document.querySelector("[data-why]").innerHTML = renderProseBlocks(d.why);
  }

  // What it is (optional) — supports an intro prose array, a YAML config sample,
  // and an architecture diagram shown alongside the YAML.
  if (d.what && (d.what.intro?.length > 0 || d.what.yaml || d.what.diagram)) {
    document.querySelector("[data-what-rule]").hidden = false;
    document.querySelector("[data-what-section]").hidden = false;
    let whatHtml = "";
    if (d.what.intro?.length > 0) {
      whatHtml += renderProseBlocks(d.what.intro);
    }
    if (d.what.yaml || d.what.diagram) {
      let row = "";
      if (d.what.yaml) {
        row += `<pre class="arch-yaml"><code>${esc(d.what.yaml)}</code></pre>`;
      }
      if (d.what.diagram) {
        const cap = d.what.diagram.caption
          ? `<figcaption class="chart-caption">${esc(d.what.diagram.caption)}</figcaption>`
          : "";
        row += `<figure class="chart"><img src="${esc(d.what.diagram.src)}" alt="${esc(d.what.diagram.alt || "Architecture diagram")}" />${cap}</figure>`;
      }
      whatHtml += `<div class="what-figure-row">${row}</div>`;
    }
    document.querySelector("[data-what]").innerHTML = whatHtml;
  }

  // Decisions
  const decisionsEl = document.querySelector("[data-decisions]");
  if (!d.decisions || d.decisions.length === 0) {
    decisionsEl.innerHTML = `<div class="placeholder-box">Add decision entries to content.js under this project's <code>detail.decisions</code> array.</div>`;
  } else {
    decisionsEl.innerHTML = d.decisions
      .map((dec, i) => `
        <div class="decision-item">
          <span class="decision-num">${String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 class="decision-heading">${esc(dec.heading)}</h3>
            <p class="decision-body">${esc(dec.body)}</p>
          </div>
        </div>`)
      .join("");
  }

  // Demo (optional)
  if (d.demo) {
    document.querySelector("[data-demo-rule]").hidden = false;
    document.querySelector("[data-demo-section]").hidden = false;
    const demoEl = document.querySelector("[data-demo]");
    if (d.demo.type === "video") {
      demoEl.innerHTML = `<video src="${esc(d.demo.src)}" controls class="demo-media"></video>`;
    } else {
      demoEl.innerHTML = `<img src="${esc(d.demo.src)}" alt="${esc(d.demo.alt || "Demo")}" class="demo-media" />`;
    }
  }

  // Experiments (optional — only shown if detail.experiments is populated)
  if (d.experiments && d.experiments.length > 0) {
    document.querySelector("[data-experiments-rule]").hidden = false;
    document.querySelector("[data-experiments-section]").hidden = false;
    document.querySelector("[data-experiments]").innerHTML = d.experiments
      .map((e) => `
        <figure class="chart">
          <img src="${esc(e.src)}" alt="${esc(e.alt)}" />
          <figcaption class="chart-caption">${esc(e.alt)}</figcaption>
        </figure>`)
      .join("");
  }

  // Other Experiments I've run (optional)
  if (d.otherExperiments && d.otherExperiments.length > 0) {
    document.querySelector("[data-other-experiments-rule]").hidden = false;
    document.querySelector("[data-other-experiments-section]").hidden = false;
    document.querySelector("[data-other-experiments]").innerHTML = renderProseBlocks(d.otherExperiments);
  }

  // Artifacts
  const artifactsEl = document.querySelector("[data-artifacts]");
  if (!d.artifacts || d.artifacts.length === 0) {
    artifactsEl.innerHTML = `<li class="artifact-item" style="color:var(--muted);font-style:italic">No artifacts listed.</li>`;
  } else {
    artifactsEl.innerHTML = d.artifacts
      .map((a) => `
        <li class="artifact-item">
          <a href="${esc(a.href)}" target="_blank" rel="noopener">${esc(a.label)}</a>
        </li>`)
      .join("");
  }
})();
