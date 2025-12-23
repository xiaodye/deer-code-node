import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { ChatDeepSeek } from '@langchain/deepseek';
import { HumanMessage } from '@langchain/core/messages';
import { createAgent, tool } from 'langchain';
import z from 'zod';

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

const getWeather = tool(
    async ({ city }) => {
        return `The weather in ${city} is always sunny!`;
    },
    {
        name: 'get_weather',
        description: 'Get weather for a given city.',
        schema: z.object({
            city: z.string(),
        }),
    },
);

try {
    const agent = createAgent({
        model,
        tools: [getWeather],
    });

    console.log('Sending message...');

    const stream = await agent.stream(
        { messages: [{ role: 'user', content: 'what is the weather in sf' }] },
        { streamMode: 'updates' },
    );

    console.log('stream:', stream);

    for await (const chunk of stream) {
        const [step, content] = Object.entries(chunk)[0];
        console.log(`step: ${step}`);
        console.log(`content: ${JSON.stringify(content, null, 2)}`);
    }
    console.log('\nStream finished.');
} catch (e) {
    console.error('Error:', e);
} finally {
    console.log('finally');
}
