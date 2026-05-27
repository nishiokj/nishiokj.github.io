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

  bio: [
    `I'm an engineer who builds production systems for clients. At two Fortune 50 companies I have owned user services, CDC pipelines, and connective middleware handling hundreds of millions of PII requests a month.`,
  ],

  projectsIntro: [
    {
      html: `Independently, I have been focusing on what I believe is the most pressing question for deploying AI systems today: <strong>how do we verify enormous amounts of agent-driven content?</strong>`,
    },
  ],

  links: [
    { label: "GitHub",   href: "https://github.com/nishiokj" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jevin-nishioka-088445210/" },
    { label: "jevnishioka1@gmail.com", href: "mailto:jevnishioka1@gmail.com" },
  ],

  // Projects render newest-first. Add a `slug` to get a detail page at project.html?slug=...
  projects: [
    {
      title:    "Substrate",
      tag:      "Tool Execution Environments",
      slug:     "substrate",
      body:     "Rust-based tool execution substrate that separates an agent's control layer from execution, so tool implementations don't have to be rebuilt per language and product.",
      stack:    ["Rust", "Python SDK", "TypeScript SDK"],
      date:     "May 2026",
      datetime: "2026-05",
      detail: {
        why: [
          `This project is primarily about separating tool execution from an agent application. This buys three things I find important: First, you do not have to redefine and reimplement tools for every language or project. Second, you can separate control state from environment state. Third, you can separate the environment lifecycle from the application lifecycle. Take a LangGraph pipeline, for example. A PipelineState object gets passed from stage to stage, carrying the data needed to route through the graph. That is a clean way to model control state, especially when different agents have different roles and should be used under different conditions. The issue shows up when the agents' work becomes more complex. If an agent produces 8,000 tokens of JSON that is really supposed to represent three files, should that be serialized into PipelineState and passed to the next node? My answer is no: the environment state, or a filesystem in this case, is different from the pipeline's control state. PipelineState does not need to hold the entire filesystem; it can simply hold the data required to route through the graph. This separation becomes more obvious in use cases where a pipeline is running against an environment that already exists, or against resources whose lifecycle should not be owned by the application. The filesystem, credentials, sandboxes, sidecars, and other resources may need to be created, reused, persisted, or torn down independently of any one graph run. Those resources should live in a separate environment, with its own lifecycle. This allows the pipeline to scale independently without needing to worry much about the actual underlying resources.`,
        ],
        what: {
          label: "Design",
          intro: [
          ],
          diagram: {
            src:     "projects/substrate/architecture.svg",
            alt:     "Substrate architecture — an agent app issues a tool call through a language SDK, which is routed either as a direct call or through a broker to a worker; both reach the Substrate server, which consults a policy and workspace resolver and is backed by stores for sessions, a sandbox, an effect ledger, and artifacts.",
            caption: "A tool call's path — the agent app calls in through a language SDK, gets routed directly or through the broker to a worker, and the Substrate server runs it against a resolved policy and workspace, persisting sessions, a sandbox, an effect ledger, and artifacts.",
          },
        },
        decisions: [
          {
            heading: "Permissions scoped close to execution",
            body:    `I kept permissions resource- and session-scoped close to the actual execution layer, and restricted the tool set in v1 before forming a hard opinion on the sandboxing/isolation concerns that arise with more sophisticated tools.`,
          },
        ],
        samplesLabel: "Code snippets",
        samples: [
          {
            label: "Python minimal SDK loop",
            language: "py",
            href: "projects/substrate/minimal.py",
            code: `from substrate import Environment

prompt = "Create notes.txt with a short hello, then read it back."
env = Environment.create(host="local", workspace="new")
default_tools = env.tool_schemas()
agent = your_llm_client()  # Replace with your LLM client initialization.


def main():
    response = agent.generate(prompt, tools=default_tools)

    for tool_call in response.tool_calls():
        tool_result = env.execute(tool_call)
        agent.messages.append(tool_result)

    env.close()`,
          },
          {
            label: "TypeScript minimal SDK loop",
            language: "ts",
            href: "projects/substrate/minimal.ts",
            code: `import { Environment } from "@substrate/sdk";

const prompt = "Create notes.txt with a short hello, then read it back.";
const env = await Environment.create({ host: "local", workspace: "new" });
const defaultTools = env.toolSchemas();
const agent = yourLlmClient(); // Replace with your LLM client initialization.

async function main() {
  const response = await agent.generate(prompt, { tools: defaultTools });

  for (const toolCall of response.toolCalls()) {
    const toolResult = await env.execute(toolCall);
    agent.messages.push(toolResult);
  }

  await env.close();
}`,
          },
        ],
        artifacts: [
          { label: "Source on GitHub", href: "https://github.com/nishiokj/Substrate" },
        ],
      },
    },
    {
      title:    "Genie",
      tag:      "Synthetic data",
      slug:     "genie",
      body:     "Opinionated data generation workflow based on the adversarial revision + LLM-as-Judge pattern, which aids in reducing common quality issues in synthetic data.",
      stack:    ["Python", "LLM-as-Judge", "Adversarial revision"],
      date:     "Apr 2026",
      datetime: "2026-04",
      detail: {
        decisions: [
          {
            heading: "SOTA harnesses collapsed into the minimal hard-verifiable form",
            body:    `Even with aggressive prompting and unlimited tool looping, existing harnesses reward-hacked the benchmark spec itself — producing small, syntactically obscure fixes that were technically hard to verify but trivially simple as engineering problems. This is specification gaming: the model found the cheapest path to satisfying the stated objective without satisfying the intent.`,
          },
          {
            heading: "Adversarial revision as selection pressure toward genuine complexity",
            body:    `The adversarial critic has no incentive to accept the minimal shape. It flags shallow fixes, surfaces obvious solutions, and pushes the generator toward genuine complexity. The judge arbitrates. Among the three, you get selection pressure toward cases that are actually hard — not just hard to verify. A hunch, validated experimentally.`,
          },
          {
            heading: "Empirical validation across model combinations",
            body:    `Ran a series of epistemic experiments varying generators, adversaries, and judges across different model combinations. The adversarial revision + LLM-as-Judge pattern consistently produced higher rates of quality gate acceptance than direct generation. The results held across combinations, suggesting the mechanism is robust rather than model-specific.`,
          },
          {
            heading: "Adversarial as a primitive",
            body:    `Adversarial revision is powerful because the critic is unbiased toward the larger "goal state" — its goal state is rigorously evaluating for quality, signs of overfitting and reward hacking, and qualitative signals beyond the KPIs this run created.`,
          },
        ],
        demo: [
          {
            type: "image", src:  "Screenshot 2026-04-03 at 7.17.30 PM.png",
            alt:  "Genie interface screenshot from April 3.",
          },
        ],
        experiments: [
          {
            src: "adverserialExperiment.svg",
            alt: "Adversarial revision experiment result.",
          },
        ],
        artifacts: [
          { label: "Source on GitHub", href: "https://github.com/nishiokj/Genie" },
        ],
      },
    },
    {
      title:    "Bucephalus",
      tag:      "Agent Experimentation",
      slug:     "bucephalus",
      body:     "Rust-based experiment harness designed around the idea that experiments will need to be long-lived, agent-driven, and support a variety of shapes.",
      stack:    ["Rust", "Modal sandboxes", "SQLite", "R2"],
      date:     "Dec 2025",
      datetime: "2025-12",
      detail: {
        why: [
          {
            html: `Per <a href="https://metr.org/" target="_blank" rel="noopener">METR</a>'s <em>Task-Completion Time Horizons of Frontier Models</em>, a single agent run can stretch anywhere from four to sixteen hours. The question we're left to answer: how do we validate millions of tokens, giant diffs, and features being built without us in the loop? How do we measure how agent systems are performing while we're still developing them? This is an epistemic problem. I find it interesting and widely applicable:`,
          },
          {
            list: "ul",
            items: [
              {
                lead: "Unit Testing",
                text: `An agent writing the unit tests for agent-delivered code is the equivalent of an orangutan signing off on a B-2. Not to mention, we need to assume the guy who built the B-2 did so by following a markdown file written by a second guy describing how he thinks a B-2 should look. Each step is characterized by a lossy materialization of intent from the previous step and a lack of a hard feedback loop.`,
                pullQuote: `An agent writing the unit tests for agent-delivered code is the equivalent of an orangutan signing off on a B-2.`,
              },
              {
                lead: "Benchmarks",
                text: `How do you create a benchmark case that can be verified deterministically? A lot of benchmarks have answered this question by making the problem as narrow as possible, and thus easy to 'verify'. Think assigning a score to a fill-in-the-blank vs. an essay.`,
              },
              {
                lead: "Evals",
                text: `A similar issue surfaces with benchmarks, only these will need to be more custom to individual agent deployments, and thus we may need an order of magnitude more. This is part of why process-shaped implementation projects will take off first. You can plug and play an agent in your claims process against historical cases and quickly gauge how it will perform.`,
              },
            ],
          },
          `I believe that we will continue to want to answer "What do I make of this huge pile of code? Which model performs best for my use case in production?" and this becomes disproportionately harder as we scale what we're examining. Although, this may not be true forever. As agents become increasingly competent at long-horizon decision-making, forecasting, and acting rationally, we should ask less, "Is this patch good?" and observe more, "Which agent is making the most money in our simulated marketplace?" or "How accurately does the agent predict the Mayor of Topeka in 1908 using newspaper clippings from the year leading up to the election?" This, of course, leads to a different class of problems, but even these are experiments.`,
          `I think process-shaped systems in enterprises are quite ripe, because existing systems already provide evals, KPIs, and a lot of the hardest epistemic infrastructure. By providing a solid bar to measure against, this contextualizes results, especially if you can reuse actual production inputs. I think it is very important to leverage this. Any mechanism that reveals trusted information about a body of work an agent performed is increasingly valuable. This is why things like Karpathy's autoresearch work so well: the agent gets feedback from its actions that is relatively unfalsifiable.`,
        ],
        what: {
          label: "",
          intro: [
            {
              html: `Here is an example of a single-trial invocation of an experiment that includes the benchmark's grading script in the trial container and runs the trial on <a href="https://modal.com/products/sandboxes" target="_blank" rel="noopener">Modal sandboxes</a>.`,
            },
          ],
          diagram: {
            src: "projects/bucephalus/single-trial.svg",
            alt: "Bucephalus architecture — a host-side runner and supervisor, a backend trial container running the agent app and grading script, and a shared workspace backed by R2.",
            caption: "A single trial — ① the runner starts a supervisor, ② which launches the agent in a trial container, ③ the agent writes to the shared workspace (R2), ④ patch extracted from workspace, ⑤ execute grader with patch, ⑥ and results persist to SQLite.",
          },
        },
        decisions: [
          {
            heading: "Rust",
            body:    `Experiments need to be able to run for hours or possibly even days. Memory safety is crucial.`,
          },
          {
            heading: "Stages, Ephemerals, Externals",
            body:    `Bucephalus models top-level YAML resource declarations as three primitives: Stages, Ephemerals, and Externals. The distinction is whether the runner wires the resource into the trial, owns its lifecycle, or simply records that the trial crossed an external boundary. A Stage is a link in the chain — transport is ours. An Ephemeral runs off the chain, but the runner still owns its lifecycle: sidecars, MCP servers, memory systems, spun up for the trial and torn down with it. An External is off the chain and outside our jurisdiction entirely — network egress, credentials, third-party APIs; declaring them is what gives you hard accounting of everything that crossed the boundary. So the test is two questions: is it a link we wired? Then it's a Stage. If not, do we own its lifecycle? Ephemeral if yes, External if no. The workspace itself is none of the three — not machinery, but the subject the machinery acts on. The Transport Envelope is the uniform shape that keeps all of this declarative even as the things at the boundary diverge.`,
          },
          {
            heading: "Declarative configuration",
            body:    `I think this provides the correct surface for the idea that many experiments will need to be run. Going back to "how do I verify this large piece of content", being able to look at a single YAML file and understand what existed during that experiment and where the metrics were derived from really helps provide context for the results.`,
          },
          {
            heading: "Heavy pre-flight checks and Recoverability",
            body:    `One of the key aspects of the runner is that experiments can be paused, resumed, and recovered, because they need to run for long periods of time. I set up a sophisticated tiering of smoke tests and linting into the harness, so that by the time you launch a full run you have high confidence in at least mechanical viability.`,
          },
        ],
        demo: null,
        artifacts: [
          { label: "Source on GitHub", href: "https://github.com/nishiokj/Bucephalus" },
        ],
      },
    },
    {
      title:    "Nova",
      tag:      "Agent harness",
      slug:     "nova",
      body:     "Model-agnostic harness for orchestrating filesystem agents and subagents.",
      stack:    ["TypeScript", "Terminal UI", "Agent tracing"],
      date:     "Oct 2025",
      datetime: "2025-10",
      detail: {
        why: [
          `You could be reading this and wondering, "What does this do that Claude Code, Codex, OpenClaw, etc. doesn't?" The answer is nothing. Or nothing really of note. I started this project all the way back in fall 2025, pre-OpenClaw and when Codex was mud and sticks.`,
          `Nova started as a voice agent on a Raspberry Pi, which I moved away from after I ported it from Python to TypeScript and did not want to mess with a new VAD/beamforming package.`,
          `I made a lot of mistakes and learned a lot of lessons.`,
          {
            list: "ul",
            items: [
              {
                lead: "Plan, Execute, Reflect as built-in program scaffolding",
                text: `This was restrictive, slow, and carried way too much task state in program memory. I had an epiphany: "Let them cook." The harness should not be opinionated about 'how' the agent works. You provide the boundaries, or the 'what' it can do.`,
              },
              {
                lead: "Testing with a slow model to save money",
                text: `Shoutout to Z.ai. The GLM series is great, but they are SLOW. You will be tempted to use a subscription to a Chinese open-source lab when wasting tokens iterating early on. I would advise against it. This mistake was made worse by the API not supporting structured outputs, and the tool-calling accuracy I would call a 'mixed bag' if I were trying to be charitable. If I were trying to be negative, I would call it a 'mixed bag' because a blind man reaching into a mixed bag of my tool definitions would have pulled the right one out just as often. And he might even have remembered to fence his JSON.`,
              },
              {
                lead: "Observability",
                text: `If you don't have something for observing traces locally, build one. It will not take long. This is table stakes. Feedback loops.`,
              },
              {
                lead: "Parent-dispatched subagents over parallel agents",
                text: `With parallel agents, I often found that the juice wasn't worth the squeeze. It quickly becomes a coordination problem where each agent's context window represents a very difficult sync problem. Subagents dispatched in parallel by a parent were stronger: intent scoped via a central planner provides much better up-front coordination. Intent originating from a single brain sacrifices maximum parallelism but makes execution much more salient.`,
              },
            ],
          },
        ],
        decisions: [],
        demo: [
          {
            type: "image",
            src:  "nova-tui.png",
            alt:  "Nova TUI interface.",
            note: "Pictured above is the Nova TUI.",
          },
          {
            type: "image",
            src:  "nova-monitor.png",
            alt:  "Nova agent monitor showing an active run with execution flow, tool calls, token counts, and touched files.",
            note: "This is the trace viewer I built. Very helpful, maybe a bit heavy but I may as well put my 64GB of RAM to work.",
          },
        ],
        demoLabel: "Screenshots",
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
