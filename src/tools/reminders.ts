import { TodoStatus, TodoItem } from './todo/types';

export function generateReminders(state: { todos?: TodoItem[] }): string {
    const todos = state.todos;
    const unfinishedTodos: TodoItem[] = [];

    if (todos) {
        for (const todo of todos) {
            if (
                todo.status !== TodoStatus.completed &&
                todo.status !== TodoStatus.cancelled
            ) {
                unfinishedTodos.push(todo);
            }
        }
    }

    const reminders: string[] = [];
    if (unfinishedTodos.length > 0) {
        reminders.push(
            `- ${unfinishedTodos.length} todo${
                unfinishedTodos.length === 1 ? ' is' : 's are'
            } not completed. Before you present the final result to the user, **make sure** all the todos are completed.`,
        );
        reminders.push(
            '- Immediately update the TODO list using the `todo_write` tool.',
        );
    }

    return reminders.length > 0
        ? '\n\nIMPORTANT:\n' + reminders.join('\n')
        : '';
}
