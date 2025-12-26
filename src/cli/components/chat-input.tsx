import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface ChatInputProps {
    onSubmit: (value: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (value: string) => {
        if (!value.trim()) return;

        onSubmit(value);
        setInput('');
    };

    return (
        <Box borderStyle="round" borderColor="#8894DE" marginTop={0}>
            <Text color="green">{'> '}</Text>
            <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
        </Box>
    );
};
