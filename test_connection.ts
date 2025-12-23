import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

dotenv.config();

console.log('Testing connection to:', process.env.LLM_API_BASE);
console.log('Model:', process.env.LLM_MODEL);

const model = new ChatOpenAI({
    modelName: process.env.LLM_MODEL,
    apiKey: process.env.LLM_API_KEY,
    configuration: {
        baseURL: process.env.LLM_API_BASE,
    },
    temperature: 0,
    streaming: true,
});

try {
    console.log('Sending message...');
    const stream = await model.stream([new HumanMessage('Hello, are you there?')]);

    console.log('Stream started. Receiving chunks:');
    for await (const chunk of stream) {
        process.stdout.write(chunk.content as string);
    }
    console.log('\nStream finished.');
} catch (e) {
    console.error('Error:', e);
}
