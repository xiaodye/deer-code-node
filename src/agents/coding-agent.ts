import { createAgent } from 'langchain';
import { StructuredTool } from '@langchain/core/tools';
import { initChatModel } from '@/models/chat-model';
import { ChatOpenAI } from '@langchain/openai';
import { project } from '@/project';
import { applyPromptTemplate } from '@/prompts/template';
import { bashTool, grepTool, lsTool, textEditorTool, todoWriteTool, treeTool } from '@/tools';
import { CodingAgentState } from './state';

export function createCodingAgent(pluginTools: StructuredTool[] = []) {
    // const model = initChatModel();
    const model = new ChatOpenAI({
        modelName: process.env.LLM_MODEL,
        apiKey: process.env.LLM_API_KEY,
        configuration: {
            baseURL: process.env.LLM_API_BASE,
        },
        temperature: 0,
        maxTokens: Number(process.env.LLM_MAX_TOKENS),
        // streaming: true,
    });

    const tools = [
        bashTool,
        grepTool,
        lsTool,
        textEditorTool,
        todoWriteTool,
        treeTool,
        ...pluginTools,
    ];

    const systemPrompt = applyPromptTemplate('coding_agent', {
        PROJECT_ROOT: project.rootDir,
    });

    return createAgent({
        model,
        tools,
        systemPrompt,
        // stateSchema: CodingAgentState,
    });
}
