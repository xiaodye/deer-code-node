import { createMiddleware } from 'langchain';
import { TodoItem } from '@/tools/todo/types';

export const TODO_LIST_SYSTEM_PROMPT = `
## \`todo_write\`

You have access to the \`todo_write\` tool to help you manage and plan complex objectives.
Use this tool for complex objectives to ensure that you are tracking each necessary step and giving the user visibility into your progress.
This tool is very helpful for planning complex objectives, and for breaking down these larger complex objectives into smaller steps.

It is critical that you mark todos as completed as soon as you are done with a step. Do not batch up multiple steps before marking them as completed.
For simple objectives that only require a few steps, it is better to just complete the objective directly and NOT use this tool.
Writing todos takes time and tokens, use it when it is helpful for managing complex many-step problems! But not for simple few-step requests.

## Important To-Do List Usage Notes to Remember
- The \`todo_write\` tool should never be called multiple times in parallel.
- Don't be afraid to revise the To-Do list as you go. New information may reveal new tasks that need to be done, or old tasks that are irrelevant.
`;

export function todoListMiddleware(options: { systemPrompt?: string } = {}) {
    return createMiddleware({
        name: 'todoListMiddleware',
        // We don't add the tool here because it's already in the agent's tool list in coding-agent.ts
        // If we added it here, it might be duplicated.
        wrapModelCall: (request, handler) => {
            let systemPrompt = request.systemPrompt;

            // Append the instructions
            // Use user provided prompt or default
            systemPrompt += `\n\n${options.systemPrompt ?? TODO_LIST_SYSTEM_PROMPT}`;

            // Inject current todos if they exist in the state
            // The state is available in request.state
            // We cast to any because we know the structure but TS might not infer it fully here without generics
            const todos = (request.state as any).todos as TodoItem[] | undefined;
            if (todos && todos.length > 0) {
                const todoListString = todos
                    .map(
                        (t) =>
                            `- [${t.status === 'completed' ? 'x' : ' '}] ${t.title} (${t.status})`,
                    )
                    .join('\n');

                systemPrompt += `\n\nCurrent To-Do List:\n${todoListString}`;
            }

            return handler({
                ...request,
                systemPrompt,
            });
        },
    });
}
