export enum TodoStatus {
    pending = 'pending',
    in_progress = 'in_progress',
    completed = 'completed',
    cancelled = 'cancelled',
}

export enum TodoPriority {
    low = 'low',
    medium = 'medium',
    high = 'high',
}

export interface TodoItem {
    id: number;
    title: string;
    priority: TodoPriority;
    status: TodoStatus;
}
