import fs from 'fs-extra';
import path from 'node:path';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { minimatch } from 'minimatch';
import { DEFAULT_IGNORE_PATTERNS } from './ignore';

function shouldIgnore(
    entryPath: string,
    name: string,
    ignorePatterns: string[],
): boolean {
    for (const pattern of ignorePatterns) {
        const cleanPattern = pattern.replace(/\/\*\*?$/, '');
        if (minimatch(name, cleanPattern) || minimatch(entryPath, pattern)) {
            return true;
        }
    }
    return false;
}

async function generateTree(
    directory: string,
    prefix: string = '',
    maxDepth: number | null = null,
    currentDepth: number = 0,
    ignorePatterns: string[] = [],
): Promise<string[]> {
    const lines: string[] = [];

    if (maxDepth !== null && currentDepth >= maxDepth) {
        return lines;
    }

    try {
        let entries = await fs.readdir(directory, { withFileTypes: true });

        // Sort: directories first, then files
        entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

        // Filter ignored
        entries = entries.filter(
            (e) =>
                !shouldIgnore(
                    path.join(directory, e.name),
                    e.name,
                    ignorePatterns,
                ),
        );

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const isLast = i === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const extension = isLast ? '    ' : '│   ';

            if (entry.isDirectory()) {
                lines.push(`${prefix}${connector}${entry.name}/`);
                if (maxDepth === null || currentDepth + 1 < maxDepth) {
                    const subLines = await generateTree(
                        path.join(directory, entry.name),
                        prefix + extension,
                        maxDepth,
                        currentDepth + 1,
                        ignorePatterns,
                    );
                    lines.push(...subLines);
                }
            } else {
                lines.push(`${prefix}${connector}${entry.name}`);
            }
        }
    } catch (error) {
        lines.push(`${prefix}[Permission Denied]`);
    }

    return lines;
}

export const treeTool = tool(
    async ({ path: dirPath = '.', max_depth = 3 }) => {
        const _path = path.resolve(dirPath);

        if (!(await fs.pathExists(_path))) {
            return `Error: the path ${dirPath} does not exist.`;
        }

        if (!(await fs.stat(_path)).isDirectory()) {
            return `Error: the path ${dirPath} is not a directory.`;
        }

        const lines = await generateTree(
            _path,
            '',
            max_depth,
            0,
            DEFAULT_IGNORE_PATTERNS,
        );

        return `Directory structure of ${dirPath}:\n\`\`\`\n${lines.join('\n')}\n\`\`\``;
    },
    {
        name: 'tree',
        description:
            "Display directory structure in a tree format, similar to the 'tree' command.",
        schema: z.object({
            path: z
                .string()
                .optional()
                .describe(
                    'Directory path to display. Defaults to current working directory if not specified.',
                ),
            max_depth: z
                .number()
                .optional()
                .default(3)
                .describe(
                    'Maximum depth to traverse. The max_depth should be less than or equal to 3. Defaults to 3.',
                ),
        }),
    },
);
