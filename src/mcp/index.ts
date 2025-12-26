import fs from 'fs-extra';
import path from 'node:path';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { debugLog } from '@/utils/debug';

const MCP_CONFIG_PATH = path.resolve(process.cwd(), 'mcp.json');

export async function loadMcpTools(): Promise<DynamicStructuredTool[]> {
    if (!(await fs.pathExists(MCP_CONFIG_PATH))) {
        debugLog(`MCP config file not found at ${MCP_CONFIG_PATH}`);
        return [];
    }

    try {
        const mcpConfig = await fs.readJson(MCP_CONFIG_PATH);
        const servers = mcpConfig.mcpServers || {};

        // Transform config to match MultiServerMCPClient expectations if necessary
        // Mapping "streamable_http" to "sse" as per likely compatibility
        const clientConfig: Record<string, any> = {};

        for (const [name, config] of Object.entries(servers)) {
            const serverConfig = config as any;
            if (serverConfig.transport === 'streamable_http') {
                clientConfig[name] = {
                    ...serverConfig,
                    transport: 'sse', // Map streamable_http to sse
                };
            } else {
                clientConfig[name] = serverConfig;
            }
        }

        if (Object.keys(clientConfig).length === 0) {
            return [];
        }

        const client = new MultiServerMCPClient(clientConfig);
        // await client.initializeConnections();

        return await client.getTools();
    } catch (error) {
        debugLog('Failed to load MCP tools:', error);
        return [];
    }
}
