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
      title:    "Substrate",
      slug:     "substrate",
      body:     "Rust-based tool execution substrate that separates an agent's control layer from execution, so tool implementations don't have to be rebuilt per language and product.",
      date:     "May 2026",
      datetime: "2026-05",
      detail: {
        // Add why / what / decisions / demo / artifacts. See the Bucephalus entry for the full shape.
        what: {
          intro: [
          ],
          diagram: {
            src:     "projects/substrate/architecture.svg",
            alt:     "Substrate architecture — an agent app issues a tool call through a language SDK, which is routed either as a direct call or through a broker to a worker; both reach the Substrate server, which consults a policy and workspace resolver and is backed by stores for sessions, a sandbox, an effect ledger, and artifacts.",
            caption: "A tool call's path — the agent app calls in through a language SDK, gets routed directly or through the broker to a worker, and the Substrate server runs it against a resolved policy and workspace, persisting sessions, a sandbox, an effect ledger, and artifacts.",
          },
        },
        decisions: [],
        artifacts: [],
      },
    },
    {
      title:    "Genie",
      slug:     "genie",
      body:     "Opinionated data generation workflow based on the adversarial revision + LLM-as-Judge pattern, which aids in reducing common quality issues in synthetic data.",
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
      slug:     "bucephalus",
      body:     "Rust-based experiment harness designed around the idea that experiments will need to be long-lived, agent-driven, and support a variety of shapes.",
      date:     "Dec 2025",
      datetime: "2025-12",
      detail: {
        why: [
          `Feedback loops. Agents generate mountains of content. How do we 'verify' any of this? This is an epistemic problem. I find it interesting and widely applicable:`,
          {
            list: "ul",
            items: [
              {
                lead: "Benchmarks",
                text: `How do you create a benchmark case that can be verified deterministically? A lot of benchmarks have answered this question by making the problem as narrow as possible, and thus easy to 'verify'. Think assigning a score to a fill-in-the-blank vs. an essay.`,
              },
              {
                lead: "Unit Testing",
                text: `An agent writing the unit tests for agent-delivered code is the equivalent of an orangutan signing off on a B-2. Not to mention, we need to assume the guy who built the B-2 did so by following a markdown file written by a second guy describing how he thinks a B-2 should look. Each step is characterized by a lossy materialization of intent from the previous step and a lack of a hard feedback loop.`,
              },
              {
                lead: "Regression / Evals",
                text: `A similar issue surfaces as benchmarks, only these will need to be more custom to individual agent deployments, and thus we may need an order of magnitude more. This is part of why process-shaped implementation projects will take off first. You can plug and play an agent in your claims process against historical cases and quickly gauge how it will perform.`,
              },
            ],
          },
          `I believe that we will continue to want to answer "What do I make of this huge pile of code? Which model performs best for my use case in production?" and this becomes disproportionately harder as we scale what we're examining. Although, I do think this is not universally true. As agents become increasingly competent at long-horizon decision-making, forecasting, and acting rationally, the less we should be asking "Is this patch good?" and the more we should be observing "Which agent is making the most money in our simulated marketplace?" or "How accurately does the agent predict the Mayor of Topeka in 1908 using newspaper clippings from the year leading up to the election, fed in incrementally so it can update a rolling prediction?" This of course leads to a different class of problems, but even these are experiments.`,
        ],
        what: {
          // Add a couple of sentences here as paragraph strings, e.g.:
          //   "Bucephalus runs experiments declared in YAML across parallel trials.",
          intro: [
          ],
          diagram: {
            src: "projects/bucephalus/single-trial.svg",
            alt: "Bucephalus architecture — a host-side runner and supervisor, a backend trial container running the agent app and grading script, and a shared workspace backed by R2.",
            caption: "A single trial — ① the runner starts a supervisor, ② which launches the agent in a trial container, ③ the agent writes to the shared workspace (R2), ④ patch extracted from workspace, ⑤ execute grader with patch, ⑥ and results persist to SQLite.",
          },
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
            heading: "Stages, Ephemerals, Externals",
            body:    `A trial runs against a case: a declared problem, unwrapped and materialized into a workspace. The trial runtime is the chain of stages that operate on that workspace — the agent, the grader, any others — wired by the runner, which carries each stage's output into the next as a Transport Envelope. A stage declares only its own input and output and never knows what runs before or after it. That wiring is the line between the three primitives. A Stage is a link in the chain — transport is ours. An Ephemeral runs off the chain, but the runner still owns its lifecycle: sidecars, MCP servers, memory systems, spun up for the trial and torn down with it. An External is off the chain and outside our jurisdiction entirely — network egress, credentials, third-party APIs; declaring them is what gives you hard accounting of everything that crossed the boundary. So the test is two questions: is it a link we wired? Then it's a Stage. If not, do we own its lifecycle? Ephemeral if yes, External if no. The workspace itself is none of the three — not machinery, but the subject the machinery acts on. The Transport Envelope is the uniform shape that keeps all of this declarative even as the things at the boundary diverge.`,
          },
          {
            heading: "Transactional trial results",
            body:    `Recovery happens at the experiment level, not the trial. If the runner is shut down, in-progress trials are not resumed — their partial work is rolled back. Reverting a trial's mid-flight state is hard, and even if you manage it, you'll likely hit a cache miss that confounds the result anyway. A clean slate is simpler and more trustworthy.`,
          },
        ],
        demo: null,
        experiments: [
          { src: "charts/synth-adversary-awareness.svg", alt: "Forest plot: committed rate across 8 synth-data generator variants on 10 cases." },
          { src: "charts/kimi26-vs-gpt55-low.svg",       alt: "Forest plot: Kimi 2.6 versus GPT-5.5 low on a SWE-bench tail smoke test." },
          { src: "charts/gpt54-vs-gpt55.svg",            alt: "Forest plot: GPT-5.4 medium versus GPT-5.5 low on the same tail case." },
        ],
        otherExperiments: [
          {
            list: "ul",
            items: [
              `Sandboxing an agent with the Bucephalus binary, documentation, an agent application, and a benchmark. I measured how often and how quickly an agent could build an experiment and get it running. This is how I measured the clarity of my documentation and primitive design.`,
              `SWE-bench Lite with my filesystem agent. Unfortunately a lot of the cases were in the model training data.`,
              `Ran an experiment to measure how using an adversary + revision stage could improve the quality of synthetic data.`,
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
      body:     "Model-agnostic harness for orchestrating filesystem agents and subagents.",
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
                lead: "Plan, Execute, Reflect as built-in program scaffolding",
                text: `This was restrictive, slow, and carried way too much task state in program memory. I had an epiphany which was "Let them cook". The harness should not be opinionated about 'how' the agent works. You provide the boundaries, or the 'what' it can do.`,
              },
              {
                lead: "Testing with a slow model to save money",
                text: `Shoutout to Z.ai. The GLM series is great, but they are SLOW. You will be tempted to use a subscription to a Chinese open-source lab when wasting tokens iterating early on. I would advise against it. This mistake was made worse by the API not supporting structured outputs, and the tool-calling accuracy I would call a 'mixed bag' if I were trying to be charitable. If I were trying to be negative, I would call it a 'mixed bag' because a blind man reaching into a mixed bag of my tool definitions would've pulled the right one out just as often. And he might even have remembered to fence his JSON.`,
              },
              {
                lead: "Observability",
                text: `If you don't have something for observing traces locally, build one. It will not take long. This is table stakes. Feedback loops.`,
              },
            ],
          },
        ],
        decisions: [],
        demo: {
          type: "image",
          src:  "Screenshot 2026-05-22 at 1.11.57 PM (2).png",
          alt:  "Nova agent monitor showing an active run with execution flow, tool calls, token counts, and touched files.",
        },
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
