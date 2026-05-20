// ============================================================================
//  Edit this file to update the site. Refresh the page to see changes.
//
//  Rules:
//    - Strings go inside quotes: "like this" or `like this`
//    - For long descriptions use backticks; line breaks inside are fine.
//    - Trailing commas are OK. Comments (// like this) are OK.
//    - Special characters like — (em-dash) can be typed directly.
// ============================================================================

window.SITE = {
  name: "Jevin Nishioka",

  bio: "SWE consultant shipping production cloud infrastructure for financial services and defense clients. Nights and weekends go into AI agent runtimes, evaluation harnesses, and synthetic-data pipelines.",

  links: [
    { label: "GitHub",   href: "https://github.com/nishiokj" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jevin-nishioka-088445210/" },
    { label: "jevnishioka1@gmail.com", href: "mailto:jevnishioka1@gmail.com" },
  ],

  // Projects render newest-first. Add a `slug` to get a detail page at project.html?slug=...
  projects: [
    {
      title:    "Genie",
      slug:     "synthetic-data-pipeline",
      subtitle: "Staged generator for benchmark cases.",
      body:     "Opinionated data generation workflow based on Adversarial revision + LLM-as-Judge pattern, which aids in reducing common quality issues in synthetic data.",
      artifact: null,   // { src: "...", alt: "..." }
      date:     "Apr 2026",
      datetime: "2026-04",
      detail: {
        decisions: [
          {
            heading: "SOTA harnesses collapsed into the minimal hard-verifiable shape",
            body:    `Even with aggressive prompting and unlimited tool looping, existing harnesses reward-hacked the benchmark spec itself — producing small, syntactically obscure fixes that were technically hard to verify but trivially simple as engineering problems. This is specification gaming: the model found the cheapest path to satisfying the stated objective without satisfying the intent.`,
          },
          {
            heading: "Adversarial revision as selection pressure toward genuine complexity",
            body:    `The adversarial critic has no incentive to accept the minimal shape. It flags shallow fixes, surfaces obvious solutions, and pushes the generator toward genuine complexity. The judge arbitrates. Between the three you get selection pressure toward cases that are actually hard — not just hard to verify. A hunch, validated experimentally.`,
          },
          {
            heading: "Empirical validation across model combinations",
            body:    `Ran a series of epistemic experiments varying generators, adversaries, and judges across different model combinations. The adversarial revision + LLM-as-Judge pattern consistently produced higher rates of quality gate acceptance compared to direct generation. The results held across combinations, suggesting the mechanism is robust rather than model-specific.`,
          },
        ],
        demo:         null,
        artifacts: [
          { label: "Source on GitHub", href: "https://github.com/nishiokj/synthetic-data-generator" },
        ],
      },
    },
    {
      title:    "Bucephalus",
      slug:     "agentlab",
      subtitle: "Experiment Runner for controlled agent evaluation.",
      body:     "Durable Experiment Runner that can scale tasks in parallel while targeting Docker Daemon or Modal backends. Custom DSL + Transport Envelopes enable declarative configurations.",
      artifact: null,   // { src: "...", alt: "..." }
      date:     "Dec 2025",
      datetime: "2025-12",
      detail: {
        why: [
          `Feedback loops. Agents generate mountains of content. How do we 'verify' any of this? This is an epistemic problem. I find it interesting and widely applicable:`,
          {
            list: "ul",
            items: [
              {
                lead: "Benchmarks.",
                sub:  `How do you create a benchmark task that can be verified deterministically? A lot of benchmarks have answered this question by making the problem as narrow as possible, and thus easy to 'verify'. Think verifying a fill-in-the-blank vs. an essay.`,
              },
              {
                lead: "Unit Testing",
                sub:  `How do we know that passing unit tests actually 'verify' that a code base is in a goal state when the agent generated the code and the test suite? An agent writing the unit tests for agent-delivered code is the equivalent of an orangutan signing off on a B-2. Not to mention, we need to assume the guy who built the B-2 did so by following a markdown file written by a second guy describing how he thinks a B-2 should look. Each step is characterized by a lossy materialization of intent from the previous step and a lack of a hard feedback loop.`,
              },
              {
                lead: "Regression / Evals",
                sub:  `Same idea. We need Benchmark-like shapes here but individual enterprises need their own for their use cases. This is part of why process-shaped implementation projects will take off first. You can plug and play an Agent in your claims process against historical cases and quickly gauge how it will perform.`,
              },
            ],
          },
          `I believe that we will continue to want to answer "What do I make of this huge pile of code? Which model performs best for my use case in production?" and this becomes disproportionately harder as we scale what we're examining. Although, I do think this is not universally true. As Agents become increasingly competent at long-horizon decision-making, forecasting, and acting rationally, the less we should be asking "Is this patch good?" and the more we should be observing "Which agent is making the most money in our simulated marketplace?" or "How accurately does the agent predict the Mayor of Topeka in 1908 using newspaper clippings from the year leading up to the election, fed in incrementally so it can update a rolling prediction?" This of course leads to a different class of problems, but even these are experiments.`,
        ],
        what: {
          // Add a couple of sentences here as paragraph strings, e.g.:
          //   "Bucephalus runs experiments declared in YAML across parallel trials.",
          intro: [
          ],
          yaml: `experiment:
  id: swebench_claude_cli
  name: SWE-Bench Claude CLI

runtime:
  compute: { backend: local-docker, config: { max_parallel: 4 } }
  storage: { backend: local-fs }
  traces:  { backend: local-stdout }
  secrets:
    - { name: ANTHROPIC_API_KEY, from: env }
  network:
    task_sandbox: none
    agent: full

matrix:
  variants:
    - id: baseline
      baseline: true
      config: { model: claude-sonnet-4-6 }
  tasks: { source: file, path: swebench_mini.jsonl }
  repeats: 1

scheduling:
  max_concurrency: 4
  comparison: paired

trial_runtime:
  task:
    interface: writable_workspace
    workspace:
      source: container_image
      image: { from: task_row }
  agent:
    image: ghcr.io/jn/cli-agent:0.4
    command: ["agent", "run", "--model", "$model"]
    env: { ANTHROPIC_API_KEY: "$ANTHROPIC_API_KEY" }
    outputs:
      patch: { capture: { type: workspace_diff } }
  grader:
    strategy: in_task_runtime

metrics:
  - { id: resolved, source: output, json_pointer: /resolved }
  - { id: turns, source: events, event_type: model_call_end, aggregate: count }
`,
        },
        decisions: [
          {
            heading: "Declarative configuration",
            body:    `I think this provides the correct surface for the idea that many experiments will need to be run. Going back to "how do I verify this large piece of content", being able to look at a single YAML file and understand what existed during that experiment and where the metrics were derived from really helps provide context for the results.`,
          },
          {
            heading: "Rust",
            body:    `Experiments need to be able to run for hours or possibly even days. Memory safety is crucial.`,
          },
          {
            heading: "Runtimes, Externals, Ephemerals",
            body:    `Runtimes are likely where a given task is executed. Often your agent container. Externals are the external deps whose state is outside of our jurisdiction. Declaring these is important if you need hard accounting of network egress, credentials, tokens, etc. Ephemerals are things that exist in a fixed scope owned by the Experiment Runner. Think sidecars, MCP servers, memory systems. The glue that makes this work is the Transport Envelope. This is what allows us to be purely declarative for most use cases despite the diversity of shape at the boundary of the primitives. The envelopes carry the task prompt to the agent's container, and patches / results back to graders when the grader is its own Runtime.`,
          },
          {
            heading: "Transactional trial results",
            body:    `Recoverability exists from the perspective of the Experiment. If the runner is shut down, the mid-flight trials are not recovered as in-progress, and their partial work will be rolled back. Why? Reverting Trial-level state is very difficult, and even if you succeed, you are likely to have a cache miss which confounds the trial result anyway. Much better to just have a clean slate.`,
          },
        ],
        demo: null,
        experiments: [
          { src: "charts/synth-adversary-awareness.svg", alt: "Forest plot: committed rate across 8 synth-data generator variants on 10 tasks." },
          { src: "charts/kimi26-vs-gpt55-low.svg",       alt: "Forest plot: Kimi 2.6 versus GPT-5.5 low on a SWE-bench tail smoke test." },
          { src: "charts/gpt54-vs-gpt55.svg",            alt: "Forest plot: GPT-5.4 medium versus GPT-5.5 low on the same tail task." },
        ],
        otherExperiments: [
          {
            list: "ul",
            items: [
              `Sandboxing an agent with the Bucephalus binary, documentation, an agent application, and a benchmark. I measured how often and how quickly an agent could build an experiment and get it running. This is how I measured the clarity of my documentation and primitive design.`,
              `SWE-Bench Lite with my filesystem agent. Unfortunately a lot of the tasks were in the model training data.`,
              `Ran an experiment to measure how using an Adversary + Revision stage could improve the quality of synthetic data.`,
            ],
          },
        ],
        artifacts: [
          { label: "Source on GitHub", href: "https://github.com/nishiokj/AgentLab" },
        ],
      },
    },
    {
      title:    "Nova",
      slug:     "nova",
      subtitle: "Config-driven multi-agent runtime, on Bun.",
      body:     "Model-agnostic harness for orchestrating filesystem agents and subagents.",
      artifact: null,   // { src: "...", alt: "..." }
      date:     "Oct 2025",
      datetime: "2025-10",
      detail: {
        why: [
          `You could be reading this and wondering "what does this do that Claude Code, Codex, OpenClaw, etc. doesn't?". The answer is nothing. Or nothing really of note. I started this project all the way back in Fall 2025, pre-OpenClaw and when Codex was mud and sticks.`,
          `Nova started as a voice agent on a Raspberry Pi. Which I moved away from after I ported it from Python to TypeScript and did not want to mess with a new VAD/beamforming package.`,
          `I made a lot of mistakes and learned a lot of lessons.`,
          {
            list: "ul",
            items: [
              {
                lead: "Plan, Execute, Reflect as built-in program scaffolding.",
                text: `This was restrictive, slow, and carried way too much task state in program memory. I had an epiphany which was "Let them cook". The harness should not be opinionated about 'how' the agent works. You provide the boundaries, or the 'what' it can do.`,
              },
              {
                lead: "Testing with a slow model to save money.",
                text: `Shoutout to Z.ai. The GLM series is great, but they are SLOW. You will be tempted to use a subscription to a Chinese open-source lab when wasting tokens iterating early on. I would advise against it. This mistake was made worse by the API not supporting structured outputs, and the tool-calling accuracy I would call a 'mixed bag' if I were trying to be charitable. If I were trying to be negative, I would call it a 'mixed bag' because a blind man reaching into a mixed bag of my tool definitions would've pulled the right one out just as often. And he might even have remembered to fence his JSON.`,
              },
              {
                lead: "Observability.",
                text: `If you don't have something for observing traces locally, build one. It will not take long. This is table stakes. Feedback loops.`,
              },
            ],
          },
        ],
        decisions: [
          {
            heading: "Built before the harness problem was solved",
            body:    `Nova predates Claude Code and Codex reaching production quality. At the time, no harness had solved filesystem agent orchestration in a way that felt trustworthy for real work. The problem was real and the tooling wasn't there, so it got built.`,
          },
          {
            heading: "Trim to the core rather than ship half-baked features",
            body:    `Had ambitions for additional capabilities, some of which were partially implemented. When Claude Code and Codex matured and the landscape shifted, the right call was to cut everything that wasn't solid and tighten what remained rather than maintain half-finished work. Knowing when to cut is the decision.`,
          },
        ],
        demo:         null,
        artifacts: [
          { label: "Source on GitHub", href: "https://github.com/nishiokj/Nova" },
        ],
      },
    },
  ],

  footer: {
    updated:         "May 2026",
    updatedDatetime: "2026-05",
    copyright:       "© 2026 Jevin Nishioka",
  },
};
