import fs from 'fs-extra';
import path from 'node:path';
import { project } from '@/project';

export interface ChatModelConfig {
    model: string;
    api_base?: string;
    api_key?: string;
    temperature: number;
    max_tokens: number;
    type?: string;
    [key: string]: any;
}

export interface McpServerConfig {
    transport: 'streamable_http' | 'stdio' | string;
    url?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: any;
}

export interface ToolsConfig {
    mcp_servers?: Record<string, McpServerConfig>;
    [key: string]: any;
}

export interface Config {
    models: {
        chat_model: ChatModelConfig;
    };
    tools: ToolsConfig;
}

let config: Config | null = null;

export function loadConfig(): Config {
    if (config === null) {
        // Load MCP config
        const mcpPath = path.join(project.rootDir, 'mcp.json');
        let mcpConfig: Partial<ToolsConfig> = {};
        if (fs.existsSync(mcpPath)) {
            try {
                mcpConfig = fs.readJsonSync(mcpPath);
            } catch (e) {
                console.warn('Failed to load mcp.json', e);
            }
        }

        // Build config object from env and mcp
        config = {
            models: {
                chat_model: {
                    model: process.env.LLM_MODEL || '',
                    api_base: process.env.LLM_API_BASE,
                    api_key: process.env.LLM_API_KEY,
                    temperature: process.env.LLM_TEMPERATURE
                        ? parseFloat(process.env.LLM_TEMPERATURE)
                        : 0,
                    max_tokens: process.env.LLM_MAX_TOKENS
                        ? parseInt(process.env.LLM_MAX_TOKENS)
                        : 8192,
                    type: process.env.LLM_TYPE,
                },
            },
            tools: {
                ...mcpConfig,
            },
        };
    }
    return config;
}

export function getConfigSection<T = any>(key: string | string[]): T | null {
    const pathArr = Array.isArray(key) ? key : [key];
    if (config === null) {
        loadConfig();
    }

    let section: any = config;
    for (const k of pathArr) {
        if (section === null || section === undefined || !(k in section)) {
            return null;
        }
        section = section[k];
    }
    return section as T;
}
