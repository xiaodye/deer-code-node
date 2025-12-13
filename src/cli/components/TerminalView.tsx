import React from 'react';
import { Box, Text } from 'ink';

interface TerminalViewProps {
    output: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ output }) => {
    return (
        <Box
            flexDirection="column"
            borderStyle="single"
            borderColor="cyan"
            padding={1}
            flexGrow={1}
        >
            <Text bold>Terminal Output</Text>
            <Box flexDirection="column" marginTop={1}>
                <Text>{output || 'No output.'}</Text>
            </Box>
        </Box>
    );
};
