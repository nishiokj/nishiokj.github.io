from substrate import Environment

prompt = "Create notes.txt with a short hello, then read it back."
env = Environment.create(host="local", workspace="new")
default_tools = env.tool_schemas()
agent = your_llm_client()  # Replace with your LLM client initialization.


def main():
    response = agent.generate(prompt, tools=default_tools)

    for tool_call in response.tool_calls():
        tool_result = env.execute(tool_call)
        agent.messages.append(tool_result)

    env.close()
