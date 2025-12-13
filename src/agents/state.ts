import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';
import { TodoItem } from '@/tools/todo/types';

export const CodingAgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    todos: Annotation<TodoItem[]>({
        reducer: (x, y) => y, // Replace strategy for now, or merge if needed
        default: () => [],
    }),
});
