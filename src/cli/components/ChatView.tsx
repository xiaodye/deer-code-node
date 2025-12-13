import React from 'react';
import { Box, Text } from 'ink';
import {
    BaseMessage,
    HumanMessage,
    AIMessage,
    ToolMessage,
} from '@langchain/core/messages';

interface ChatViewProps {
    messages: BaseMessage[];
    isGenerating: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
    messages,
    isGenerating,
}) => {
    return (
        <Box
            flexDirection="column"
            borderStyle="single"
            borderColor="green"
            padding={1}
            flexGrow={1}
        >
            <Text bold>Chat History</Text>
            <Box flexDirection="column" flexGrow={1} overflowY="hidden">
                {messages.map((msg, index) => {
                    if (HumanMessage.isInstance(msg)) {
                        return (
                            <Box
                                key={index}
                                flexDirection="column"
                                marginTop={1}
                            >
                                <Text color="blue" bold>
                                    User:
                                </Text>
                                <Text>{msg.content as string}</Text>
                            </Box>
                        );
                    } else if (AIMessage.isInstance(msg)) {
                        // Only show text content, skip tool calls for brevity in chat view
                        // (Tool calls usually have empty content or we show them differently)
                        const content = msg.content as string;
                        if (!content) return null;
                        return (
                            <Box
                                key={index}
                                flexDirection="column"
                                marginTop={1}
                            >
                                <Text color="green" bold>
                                    AI:
                                </Text>
                                <Text>{content}</Text>
                            </Box>
                        );
                    } else if (ToolMessage.isInstance(msg)) {
                        // Optionally hide tool outputs in chat to keep it clean,
                        // or show summary.
                        return (
                            <Box
                                key={index}
                                flexDirection="column"
                                marginTop={1}
                            >
                                <Text color="gray" dimColor>
                                    Tool Output ({msg.name})
                                </Text>
                            </Box>
                        );
                    }
                    return null;
                })}
                {isGenerating && <Text color="yellow">Thinking...</Text>}
            </Box>
        </Box>
    );
};
