import z from 'zod';
import { createAgent, tool } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const model = new ChatOpenAI({
    modelName: process.env.LLM_MODEL,
    apiKey: process.env.LLM_API_KEY,
    configuration: {
        baseURL: process.env.LLM_API_BASE,
    },
    temperature: 0,
    // streaming: true,
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

const agent = createAgent({
    model: model,
    tools: [getWeather],
});

console.log('Sending message...');

for await (const chunk of await agent.stream(
    { messages: [{ role: 'user', content: 'what is the weather in sf' }] },
    { streamMode: 'updates' },
)) {
    const [step, content] = Object.entries(chunk)[0];
    console.log(`step: ${step}`);
    console.log(`content: ${JSON.stringify(content, null, 2)}`);
}
/**
 * step: model
 * content: {
 *   "messages": [
 *     {
 *       "kwargs": {
 *         // ...
 *         "tool_calls": [
 *           {
 *             "name": "get_weather",
 *             "args": {
 *               "city": "San Francisco"
 *             },
 *             "type": "tool_call",
 *             "id": "call_0qLS2Jp3MCmaKJ5MAYtr4jJd"
 *           }
 *         ],
 *         // ...
 *       }
 *     }
 *   ]
 * }
 * step: tools
 * content: {
 *   "messages": [
 *     {
 *       "kwargs": {
 *         "content": "The weather in San Francisco is always sunny!",
 *         "name": "get_weather",
 *         // ...
 *       }
 *     }
 *   ]
 * }
 * step: model
 * content: {
 *   "messages": [
 *     {
 *       "kwargs": {
 *         "content": "The latest update says: The weather in San Francisco is always sunny!\n\nIf you'd like real-time details (current temperature, humidity, wind, and today's forecast), I can pull the latest data for you. Want me to fetch that?",
 *         // ...
 *       }
 *     }
 *   ]
 * }
 */
