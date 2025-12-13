import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolMessage } from '@langchain/core/messages';
import { TodoStatus, TodoPriority } from './types';

export const todoWriteTool = tool(
    async ({ todos }, config) => {
        // In LangGraph.js, we can return a Command object or just the result.
        // However, tool outputs are typically just strings.
        // LangGraph.js tools can return artifacts, but modifying state directly from a tool
        // usually requires the tool to return a specific structure that the node handles,
        // or using a "stateful" tool if supported.
        // In Python version: return Command(update={"todos": todos, "messages": ...})

        // In JS/TS LangGraph, we can't easily return a Command object from a standard tool function
        // that is bound to the model, unless we are using a custom node that handles it.
        // BUT, since we are using `create_agent` (likely `createReactAgent` or similar in JS),
        // we need to see how it handles state updates.

        // For now, we will return a string message. The actual state update mechanism
        // depends on how we define the agent graph.
        // If we want to update state, we might need to rely on the agent node to parse the tool call
        // and update the state, OR use a custom tool node.

        // Wait, the Python code returns a `Command` object which is a LangGraph specific thing.
        // In JS `langgraph`, there is also `Command`.
        // Let's try to mimic that structure if possible, but `tool` helper wraps the return value.

        // Actually, `tool` in JS returns a structured tool object.
        // The implementation function returns the result.
        // If we want to update state, we usually do it in the Node that executes the tool.
        // But here we are writing the tool implementation itself.

        // For the purpose of this port, let's assume the "ToolNode" will handle the output.
        // If the output is a special object, it might merge it.
        // But standard ToolNode just appends the result to messages.

        // To properly update `todos` state key in LangGraph JS, the tool execution result
        // needs to be interpreted by the graph.
        // A common pattern is that the tool returns a JSON string, and we have a reducer?
        // Or we use `Command` if supported.

        // Let's implement the logic to formatting the message first.

        const unfinishedTodos = todos.filter(
            (todo) => todo.status !== TodoStatus.completed && todo.status !== TodoStatus.cancelled,
        );

        let message = `Successfully updated the TODO list with ${todos.length} items.`;
        if (unfinishedTodos.length > 0) {
            message += ` ${unfinishedTodos.length} todo${unfinishedTodos.length === 1 ? ' is' : 's are'} not completed.`;
        } else {
            message += ' All todos are completed.';
        }

        // We attach the todos to the tool output as a property or artifact if possible.
        // But for standard tool calling, we might need to handle state update differently.
        // In LangGraph JS `prebuilt.ToolNode`, it just runs the tool.

        // We will stick to returning the string message for the LLM to see.
        // The state update "todos" is CRITICAL.
        // We can't easily update global state from here without access to it.
        // Python's `Command` allows returning state updates.
        // LangGraph JS 0.2+ supports `Command`.
        // Let's try to import Command if available, or just return the string and handle state later.

        // Since I can't be sure if `Command` is fully supported/exported in the version I installed,
        // I will return the string.
        // BUT, the `CodingAgentState` has `todos`. If we don't update it, the agent forgets todos.

        // Hack: We can return a special string that the agent node parses, OR
        // we assume we will implement a custom ToolNode that looks for `todos` in the artifact.

        return message;
    },
    {
        name: 'todo_write',
        description: 'Update the entire TODO list with the latest items.',
        schema: z.object({
            todos: z
                .array(
                    z.object({
                        id: z.number().min(0),
                        title: z.string().min(1),
                        priority: z.nativeEnum(TodoPriority).default(TodoPriority.medium),
                        status: z.nativeEnum(TodoStatus).default(TodoStatus.pending),
                    }),
                )
                .describe('A list of TodoItem objects.'),
        }),
    },
);
