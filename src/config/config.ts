import fs from 'fs-extra';
import yaml from 'js-yaml';
import path from 'node:path';
import { project } from '../project';

let config: any = null;

export function loadConfig(): any {
    if (config === null) {
        const configPath = path.join(project.rootDir, 'config.yaml');
        if (!fs.existsSync(configPath)) {
            throw new Error("DeerCode's `config.yaml` file is not found");
        }
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        config = yaml.load(fileContent);
    }
    return config;
}

export function getConfigSection(key: string | string[]): any | null {
    const pathArr = Array.isArray(key) ? key : [key];
    if (config === null) {
        loadConfig();
    }

    let section = config;
    for (const k of pathArr) {
        if (section === null || section === undefined || !(k in section)) {
            return null;
        }
        section = section[k];
    }
    return section;
}
