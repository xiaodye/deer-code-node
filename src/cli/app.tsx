import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { createCodingAgent } from '@/agents/coding-agent';
import { ChatView } from './components/chat-view';
import { ChatInput } from './components/chat-input';
import { TodoListView } from './components/todo-list-view';
import { TerminalView } from './components/terminal-view';
import { TodoItem } from '@/tools/todo/types';
import { debugLog } from '@/utils/debug';

export const App = () => {
    const [messages, setMessages] = useState<BaseMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [terminalOutput, setTerminalOutput] = useState('');

    // Tab state: 0 = Chat, 1 = Terminal, 2 = Todo
    const [activeTab, setActiveTab] = useState(0);

    const [agent] = useState(() => createCodingAgent());

    useInput((input, key) => {
        if (key.return && !isGenerating && input.trim().length === 0) {
            // Just focus change maybe?
        }

        // Tab to switch tabs
        if (key.tab) {
            setActiveTab((prev) => (prev + 1) % 3);
        }
    });

    const handleSubmit = async (value: string) => {
        if (!value.trim()) return;

        const userMsg = new HumanMessage(value);
        setMessages((prev) => [...prev, userMsg]);
        setIsGenerating(true);

        try {
            const stream = await agent.stream(
                { messages: [...messages, userMsg] },
                { recursionLimit: 50, streamMode: 'updates' },
            );

            for await (const chunk of stream) {
                for (const nodeUpdate of Object.values(chunk)) {
                    const newMsgs = nodeUpdate.messages;

                    if (Array.isArray(newMsgs)) {
                        setMessages((prev) => [...prev, ...newMsgs]);

                        for (const msg of newMsgs) {
                            if (ToolMessage.isInstance(msg)) {
                                const toolMsg = msg;
                                if (
                                    toolMsg.name === 'bash' &&
                                    typeof toolMsg.content === 'string'
                                ) {
                                    setTerminalOutput(toolMsg.content);
                                }
                            }

                            if (AIMessage.isInstance(msg) && msg.tool_calls) {
                                for (const tc of msg.tool_calls) {
                                    if (tc.name === 'todo_write') {
                                        setTodos(tc.args.todos);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            setMessages((prev) => [...prev, new HumanMessage(`Error: ${error}`)]);
        } finally {
            setIsGenerating(false);
            setMessages((prev) => {
                debugLog('msgs', prev);
                return prev;
            });
        }
    };

    return (
        <Box flexDirection="column" minHeight={30}>
            <Box flexDirection="row" borderStyle="single" borderColor="gray" marginBottom={0}>
                <Text inverse={activeTab === 0}> Chat </Text>
                <Text> | </Text>
                <Text inverse={activeTab === 1}> Terminal </Text>
                <Text> | </Text>
                <Text inverse={activeTab === 2}> Todo </Text>
            </Box>

            {activeTab === 0 && (
                <Box flexDirection="column" flexGrow={1}>
                    <ChatView messages={messages} isGenerating={isGenerating} />
                    <ChatInput onSubmit={handleSubmit} />
                </Box>
            )}

            {activeTab === 1 && (
                <Box flexDirection="column" flexGrow={1}>
                    <TerminalView output={terminalOutput} />
                </Box>
            )}

            {activeTab === 2 && (
                <Box flexDirection="column" flexGrow={1}>
                    <TodoListView todos={todos} />
                </Box>
            )}

            <Box marginTop={1}>
                <Text dimColor>Press Tab to switch views (Chat / Terminal / Todo)</Text>
            </Box>
        </Box>
    );
};
