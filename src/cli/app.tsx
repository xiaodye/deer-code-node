import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import {
    AIMessage,
    BaseMessage,
    HumanMessage,
    ToolMessage,
} from '@langchain/core/messages';
import { createCodingAgent } from '../agents/coding_agent';
import { ChatView } from './components/ChatView';
import { TodoListView } from './components/TodoListView';
import { TerminalView } from './components/TerminalView';
import { TodoItem } from '../tools/todo/types';

export const App = () => {
    const [messages, setMessages] = useState<BaseMessage[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [terminalOutput, setTerminalOutput] = useState('');

    // Tab state: 0 = Terminal, 1 = Todo
    const [activeTab, setActiveTab] = useState(0);

    const [agent] = useState(() => createCodingAgent());

    useInput((input, key) => {
        if (key.return && !isGenerating && input.trim().length === 0) {
            // Just focus change maybe?
        }

        // Ctrl+Tab to switch tabs (simplified: 'Tab' key)
        if (key.tab) {
            setActiveTab((prev) => (prev === 0 ? 1 : 0));
        }
    });

    const handleSubmit = async (value: string) => {
        if (!value.trim()) return;

        const userMsg = new HumanMessage(value);
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsGenerating(true);

        try {
            const stream = await agent.stream(
                { messages: [...messages, userMsg], todos: todos },
                { recursionLimit: 50 },
            );

            for await (const event of stream) {
                // Handle message updates
                if (event.messages) {
                    const newMsgs = event.messages;
                    if (Array.isArray(newMsgs)) {
                        setMessages((prev) => {
                            // Simple de-duplication by id if available, or just append
                            // Since we don't have stable IDs, we rely on React state updates.
                            // Ideally we should merge with existing.
                            // For now, let's append new messages that are NOT in prev.
                            // But stream might return just the delta messages.
                            return [...prev, ...newMsgs];
                        });

                        for (const msg of newMsgs) {
                            if (ToolMessage.isInstance(msg)) {
                                const toolMsg = msg as any;
                                if (toolMsg.name === 'bash') {
                                    setTerminalOutput(toolMsg.content);
                                }
                            }
                        }
                    }
                }

                // Handle agent events to extract tool inputs (e.g. todo_write)
                // We look for 'agent' node output which contains the AIMessage with tool_calls
                if (event.agent && event.agent.messages) {
                    const agentMsgs = event.agent.messages;
                    for (const msg of agentMsgs) {
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
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                new HumanMessage(`Error: ${error}`),
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Box flexDirection="row" height={30}>
            <Box width="40%" flexDirection="column" paddingRight={1}>
                <ChatView messages={messages} isGenerating={isGenerating} />
                <Box borderStyle="single" borderColor="gray" marginTop={1}>
                    <Text color="green">{'> '}</Text>
                    <TextInput
                        value={input}
                        onChange={setInput}
                        onSubmit={handleSubmit}
                        // placeholder="Type your instruction..."
                    />
                </Box>
            </Box>

            <Box width="60%" flexDirection="column">
                {activeTab === 0 ? (
                    <TerminalView output={terminalOutput} />
                ) : (
                    <TodoListView todos={todos} />
                )}
                <Box marginTop={1}>
                    <Text dimColor>
                        Press Tab to switch views (Terminal / Todo)
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};
