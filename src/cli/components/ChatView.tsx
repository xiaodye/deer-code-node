import { Box, Text } from 'ink';
import { BaseMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import Spinner from 'ink-spinner';

interface ChatViewProps {
    messages: BaseMessage[];
    isGenerating: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, isGenerating }) => {
    return (
        <Box
            flexDirection="column"
            borderStyle="single"
            borderColor="green"
            padding={1}
            flexGrow={1}
        >
            <Text bold>Chat History</Text>
            <Box flexDirection="column" flexGrow={1}>
                {messages.map((msg, index) => {
                    if (HumanMessage.isInstance(msg)) {
                        return (
                            <Box key={index} flexDirection="column" marginTop={1}>
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
                            <Box key={index} flexDirection="column" marginTop={1}>
                                <Text color="green" bold>
                                    AI:
                                </Text>
                                <Text>{content}</Text>
                            </Box>
                        );
                    } else if (ToolMessage.isInstance(msg)) {
                        const content = msg.content as string;
                        return (
                            <>
                                <Box></Box>
                                <Box key={index} flexDirection="column" marginTop={1}>
                                    <Text color="gray" dimColor>
                                        Tool Output ({msg.name}):
                                    </Text>
                                    <Box borderStyle="classic" borderColor="yellow">
                                        <Text color="gray">{content}</Text>
                                    </Box>
                                </Box>
                            </>
                        );
                    }
                    return null;
                })}
                {/* Debug */}
                {/* <Text>{JSON.stringify(messages)}</Text> */}
                {isGenerating && (
                    <Box flexDirection="column" marginTop={1}>
                        <Text>
                            <Spinner type="dots" /> Thinking...
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
