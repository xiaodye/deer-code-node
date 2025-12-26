import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';
import { TodoStatus, TodoPriority } from './types';

export const todoWriteTool = tool(
    async ({ todos }, config) => {
        const unfinishedTodos = todos.filter(
            (todo) => todo.status !== TodoStatus.completed && todo.status !== TodoStatus.cancelled,
        );

        let message = `Successfully updated the TODO list with ${todos.length} items.`;
        if (unfinishedTodos.length > 0) {
            message += ` ${unfinishedTodos.length} todo${unfinishedTodos.length === 1 ? ' is' : 's are'} not completed.`;
        } else {
            message += ' All todos are completed.';
        }

        return new Command({
            update: {
                todos,
                messages: [
                    new ToolMessage({
                        content: message,
                        tool_call_id: config.toolCall?.id || '',
                        name: 'todo_write',
                    }),
                ],
            },
        });
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
                        priority: z.enum(TodoPriority).default(TodoPriority.medium),
                        status: z.enum(TodoStatus).default(TodoStatus.pending),
                    }),
                )
                .describe('A list of TodoItem objects.'),
        }),
    },
);
