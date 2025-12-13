import { createAgent } from 'langchain';
import { StructuredTool } from '@langchain/core/tools';
import { initChatModel } from '@/models/chat_model';
import { project } from '@/project';
import { applyPromptTemplate } from '@/prompts/template';
import { bashTool, grepTool, lsTool, textEditorTool, todoWriteTool, treeTool } from '@/tools';
import { CodingAgentState } from './state';

export function createCodingAgent(pluginTools: StructuredTool[] = []) {
    const model = initChatModel();
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
        stateSchema: CodingAgentState,
    });
}
