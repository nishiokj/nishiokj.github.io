import { Environment } from "@substrate/sdk";

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
}
