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
  // List items may be plain strings or { lead, text } objects for sectioned prose.
  function renderProseBlocks(blocks) {
    return blocks.map((block) => {
      if (typeof block === "string") {
        return `<p class="prose-p">${esc(block)}</p>`;
      }
      const tag = block.list === "ol" ? "ol" : "ul";
      const sectioned = block.items.some((item) => typeof item !== "string" && item.lead);
      const items = block.items.map((item) => {
        if (typeof item === "string") {
          return `<li>${esc(item)}</li>`;
        }
        const heading = item.lead
          ? `<h3 class="prose-subhead">${esc(item.lead.replace(/\.$/, ""))}</h3>`
          : "";
        const body = item.text || "";
        return `<li class="prose-section-item">${heading}${body ? `<p class="prose-subcopy">${esc(body)}</p>` : ""}</li>`;
      }).join("");
      const sectionClass = sectioned ? " prose-list--sectioned" : "";
      return `<${tag} class="prose-list prose-list--${tag}${sectionClass}">${items}</${tag}>`;
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
    document.querySelector("[data-what-label]").textContent = d.what.label || "What it is";
    let whatHtml = "";
    if (d.what.intro?.length > 0) {
      whatHtml += renderProseBlocks(d.what.intro);
    }
    if (d.what.yaml || d.what.diagram) {
      const diagramFigure = (dg) => {
        const cap = dg.caption
          ? `<figcaption class="chart-caption">${esc(dg.caption)}</figcaption>`
          : "";
        return `<figure class="chart"><img src="${esc(dg.src)}" alt="${esc(dg.alt || "Architecture diagram")}" />${cap}</figure>`;
      };
      if (d.what.yaml) {
        // YAML config, with the diagram (if any) sitting alongside it.
        let row = `<pre class="arch-yaml"><code>${esc(d.what.yaml)}</code></pre>`;
        if (d.what.diagram) row += diagramFigure(d.what.diagram);
        whatHtml += `<div class="what-figure-row">${row}</div>`;
      } else {
        // Diagram on its own — held at its natural width by .arch-diagram.
        whatHtml += `<div class="arch-diagram">${diagramFigure(d.what.diagram)}</div>`;
      }
    }
    document.querySelector("[data-what]").innerHTML = whatHtml;
  }

  // Decisions
  const decisionsEl = document.querySelector("[data-decisions]");
  if (d.decisions && d.decisions.length > 0) {
    document.querySelector("[data-decisions-rule]").hidden = false;
    document.querySelector("[data-decisions-section]").hidden = false;
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
    document.querySelector("[data-demo-label]").textContent = d.demoLabel || "Demo";
    const demoEl = document.querySelector("[data-demo]");
    const demoItems = Array.isArray(d.demo) ? d.demo : [d.demo];
    const demoGridClass = demoItems.length > 1 ? "demo-grid demo-grid--multi" : "demo-grid";
    demoEl.innerHTML = `<div class="${demoGridClass}">${demoItems.map((demo) => {
      const media = demo.type === "video"
        ? `<video src="${esc(demo.src)}" controls class="demo-media"></video>`
        : `<img src="${esc(demo.src)}" alt="${esc(demo.alt || "Demo")}" class="demo-media" />`;
      return `<div class="demo-tile">${media}</div>`;
    }).join("")}</div>`;
  }

  // Code samples (optional)
  if (d.samples && d.samples.length > 0) {
    document.querySelector("[data-samples-rule]").hidden = false;
    document.querySelector("[data-samples-section]").hidden = false;
    document.querySelector("[data-samples]").innerHTML = d.samples
      .map((sample) => `
        <figure class="sample-block">
          <figcaption class="sample-caption">
            <span>${esc(sample.label)}</span>
            ${sample.href ? `<a href="${esc(sample.href)}" target="_blank" rel="noopener">Open file</a>` : ""}
          </figcaption>
          <pre class="sample-code"><code>${esc(sample.code)}</code></pre>
        </figure>`)
      .join("");
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
