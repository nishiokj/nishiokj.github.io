(async function renderExperimentJourney() {
  const root = document.querySelector("[data-experiment-journey]");
  if (!root) return;

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const pct = (value) => `${Math.round(Number(value) * 100)}%`;

  let story;
  try {
    const response = await fetch("hero/experiment-lifecycle.json", { cache: "no-store" });
    story = await response.json();
  } catch (error) {
    root.innerHTML = "";
    return;
  }

  const state = { index: 0 };
  const slideByHash = story.slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
  if (slideByHash >= 0) state.index = slideByHash;

  function setIndex(next) {
    state.index = (next + story.slides.length) % story.slides.length;
    const slide = story.slides[state.index];
    if (window.location.hash !== `#${slide.id}`) {
      window.history.replaceState(null, "", `#${slide.id}`);
    }
    paint();
  }

  function paint() {
    const slide = story.slides[state.index];
    root.innerHTML = `
      <div class="journey-shell">
        <div class="journey-header">
          <div>
            <h2>${esc(story.title)}</h2>
            <p>${esc(story.question)}</p>
          </div>
          <dl class="journey-status">
            <div>
              <dt>run</dt>
              <dd>${esc(story.run_id)}</dd>
            </div>
            <div>
              <dt>state</dt>
              <dd>${esc(story.status)}</dd>
            </div>
          </dl>
        </div>

        <ol class="journey-rail" aria-label="Experiment journey">
          ${story.slides.map((item, index) => `
            <li class="${index === state.index ? "is-active" : ""}">
              <button type="button" data-slide-index="${index}">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${esc(railName(item.id))}</strong>
              </button>
            </li>
          `).join("")}
        </ol>

        <div class="project-spine" aria-label="Project roles">
          ${projectSpine(slide.project)}
        </div>

        <article class="journey-slide" aria-live="polite">
          <div class="journey-copy">
            <h3>${esc(slide.title)}</h3>
            <p>${esc(slide.body)}</p>
            <div class="journey-artifact">
              <span>artifact</span>
              <strong>${esc(slide.artifact)}</strong>
            </div>
          </div>
          <div class="journey-visual">
            ${visual(slide.visual)}
          </div>
        </article>

        <div class="journey-controls">
          <button type="button" data-prev aria-label="Previous slide">Previous</button>
          <span>${state.index + 1} / ${story.slides.length}</span>
          <button type="button" data-next aria-label="Next slide">Next</button>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-slide-index]").forEach((button) => {
      button.addEventListener("click", () => setIndex(Number(button.dataset.slideIndex)));
    });
    root.querySelector("[data-prev]").addEventListener("click", () => setIndex(state.index - 1));
    root.querySelector("[data-next]").addEventListener("click", () => setIndex(state.index + 1));
  }

  function railName(id) {
    return {
      question: "Question",
      corpus: "Corpus",
      case: "Case file",
      trial: "Nova trial",
      grader: "Grader",
      result: "Result",
      meaning: "Meaning",
    }[id] || id;
  }

  function visual(name) {
    return {
      question: questionVisual,
      corpus: corpusVisual,
      case: caseVisual,
      trial: trialVisual,
      grader: graderVisual,
      result: resultVisual,
      meaning: meaningVisual,
    }[name]();
  }

  function artifactList(names) {
    return story.artifacts
      .filter((artifact) => names.includes(artifact.name))
      .map((artifact) => `
        <li>
          <strong>${esc(artifact.name)}</strong>
          <span>${esc(artifact.path)}</span>
          <p>${esc(artifact.fact)}</p>
        </li>
      `)
      .join("");
  }

  function projectSpine(activeProject) {
    return story.projects.map((project, index) => {
      const active = activeProject === "All" || project.name === activeProject;
      return `
        <div class="${active ? "is-active" : ""}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${esc(project.name)}</strong>
          <em>${esc(project.role)}</em>
        </div>
      `;
    }).join("");
  }

  function questionVisual() {
    return `
      <section class="artifact-board artifact-board--question">
        <div class="decision-strip">
          <span>approve</span>
          <span>hold</span>
          <span>escalate</span>
        </div>
        <div class="question-card">
          <strong>${esc(story.question)}</strong>
          <p>Same workspace shape. Same output contract. Different cases pressure different failure modes.</p>
        </div>
        <ol class="artifact-list">
          ${artifactList(["domain contract", "Nova experiment"])}
        </ol>
      </section>
    `;
  }

  function corpusVisual() {
    return `
      <section class="artifact-board">
        <div class="case-grid">
          ${story.cases.map((item) => `
            <article class="case-tile case-tile--${esc(item.decision)}">
              <div>
                <strong>${esc(item.id)}</strong>
                <span>${esc(item.vendor)}</span>
              </div>
              <dl>
                <div><dt>invoice</dt><dd>${esc(item.invoice)}</dd></div>
                <div><dt>amount</dt><dd>${money(item.amount)}</dd></div>
                <div><dt>answer</dt><dd>${esc(item.decision)}</dd></div>
              </dl>
            </article>
          `).join("")}
        </div>
        <ol class="artifact-list artifact-list--compact">
          ${artifactList(["case corpus", "public task rows", "hidden oracles"])}
        </ol>
      </section>
    `;
  }

  function caseVisual() {
    const northstar = story.cases[0];
    return `
      <section class="artifact-board artifact-board--case">
        <div class="case-open">
          <div class="case-open-main">
            <strong>${esc(northstar.id)} / ${esc(northstar.vendor)}</strong>
            <span>${esc(northstar.invoice)} · ${money(northstar.amount)}</span>
          </div>
          <ol>
            ${story.northstar.visible_facts.map((fact) => `<li>${esc(fact)}</li>`).join("")}
          </ol>
        </div>
        <div class="oracle-split">
          <div>
            <strong>public workspace</strong>
            <ol>${story.northstar.public_records.slice(0, 6).map((record) => `<li>${esc(record)}</li>`).join("")}</ol>
          </div>
          <div>
            <strong>grader-only evidence</strong>
            <ol>${story.northstar.hidden_evidence.map((item) => `<li><span>${esc(item.key)}</span><em>${esc(item.value)}</em></li>`).join("")}</ol>
          </div>
        </div>
      </section>
    `;
  }

  function trialVisual() {
    const trial = story.trial;
    const rows = [
      ["agent", trial.agent],
      ["model", trial.model],
      ["input", trial.input],
      ["output", trial.output],
      ["events", trial.events],
      ["network", trial.network],
    ];
    return `
      <section class="artifact-board">
        <div class="trial-flow">
          <div>
            <span>workspace</span>
            <strong>case workspace</strong>
          </div>
          <div>
            <span>agent</span>
            <strong>${esc(trial.agent)}</strong>
          </div>
          <div>
            <span>trace</span>
            <strong>${esc(story.suite_result.total_events)} events</strong>
          </div>
          <div>
            <span>grade</span>
            <strong>${esc(story.suite_result.passed)} / ${esc(story.suite_result.cases)}</strong>
          </div>
        </div>
        <div class="trial-command">
          <span>nova run</span>
          <strong>--input-file ${esc(trial.input)}</strong>
          <strong>--output ${esc(trial.output)}</strong>
          <strong>--events ${esc(trial.events)}</strong>
        </div>
        <dl class="trial-table">
          ${rows.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("")}
        </dl>
      </section>
    `;
  }

  function graderVisual() {
    return `
      <section class="artifact-board">
        <ol class="check-list">
          ${story.grader.checks.map((check) => `<li>${esc(check)}</li>`).join("")}
        </ol>
        <dl class="weight-bars">
          ${story.grader.weights.map(([name, weight]) => `
            <div>
              <dt>${esc(name)}</dt>
              <dd><span><i style="width:${Math.round(Number(weight) * 100)}%"></i></span><strong>${pct(weight)}</strong></dd>
            </div>
          `).join("")}
        </dl>
      </section>
    `;
  }

  function resultVisual() {
    const result = story.suite_result;
    return `
      <section class="artifact-board artifact-board--result">
        <div class="result-summary">
          <div>
            <strong>${esc(result.passed)} / ${esc(result.cases)}</strong>
            <span>passed</span>
          </div>
          <div>
            <strong>${pct(result.mean_score)}</strong>
            <span>mean score</span>
          </div>
          <div>
            <strong>${esc(result.total_tool_calls)}</strong>
            <span>tool calls</span>
          </div>
        </div>
        <div class="result-grid">
          ${story.cases.map((item) => `
            <article class="result-tile ${item.nova.passed ? "is-pass" : "is-miss"}">
              <div>
                <strong>${esc(item.id)}</strong>
                <span>${esc(item.nova.actual_decision)} · ${pct(item.nova.score)}</span>
              </div>
              <p>${item.nova.missing_evidence.length ? esc(item.nova.missing_evidence.join(", ")) : "all required evidence present"}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function meaningVisual() {
    return `
      <section class="artifact-board artifact-board--meaning">
        <ol class="project-chain">
          ${story.projects.map((project, index) => `
            <li>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${esc(project.name)}</strong>
              <em>${esc(project.role)}</em>
              <small>${esc(project.artifact)}</small>
            </li>
          `).join("")}
        </ol>
        <ol class="artifact-list artifact-list--compact">
          ${artifactList(["domain contract", "case corpus", "Nova experiment", "deterministic grader"])}
        </ol>
      </section>
    `;
  }

  paint();

  document.addEventListener("keydown", (event) => {
    if (!root.closest("body")) return;
    if (event.key === "ArrowLeft") setIndex(state.index - 1);
    if (event.key === "ArrowRight") setIndex(state.index + 1);
  });
})();
