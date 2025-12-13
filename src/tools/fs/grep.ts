import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { execa } from 'execa';
import { rgPath } from '@vscode/ripgrep';
import { DEFAULT_IGNORE_PATTERNS } from './ignore';

export const grepTool = tool(
    async ({
        pattern,
        path: searchPath = '.',
        glob,
        output_mode = 'files_with_matches',
        B,
        A,
        C,
        n,
        i,
        type,
        head_limit = 100,
        multiline = false,
    }) => {
        const cmd = [rgPath];

        // Add pattern
        cmd.push(pattern);

        // Add path
        cmd.push(searchPath);

        // Output mode
        if (output_mode === 'files_with_matches') {
            cmd.push('-l');
        } else if (output_mode === 'count') {
            cmd.push('-c');
        }

        // Context
        if (output_mode === 'content') {
            if (C !== undefined) cmd.push('-C', String(C));
            else {
                if (B !== undefined) cmd.push('-B', String(B));
                if (A !== undefined) cmd.push('-A', String(A));
            }
            if (n) cmd.push('-n');
        }

        if (i) cmd.push('-i');
        if (type) cmd.push('--type', type);
        if (glob) cmd.push('--glob', glob);
        if (multiline) cmd.push('--multiline');

        // Default ignores
        for (const ignore of DEFAULT_IGNORE_PATTERNS) {
            cmd.push('--glob', `!${ignore}`);
        }

        try {
            const { stdout } = await execa(cmd[0], cmd.slice(1), {
                stripFinalNewline: true,
            });

            let lines = stdout.split('\n');
            if (head_limit && lines.length > head_limit) {
                lines = lines.slice(0, head_limit);
                lines.push(`... and more matches (limit ${head_limit})`);
            }

            return lines.join('\n');
        } catch (error: any) {
            if (error.exitCode === 1) {
                return 'No matches found.';
            }
            return `Error executing grep: ${error.message}`;
        }
    },
    {
        name: 'grep',
        description:
            'A powerful search tool built on ripgrep for searching file contents with regex patterns.',
        schema: z.object({
            pattern: z
                .string()
                .describe('The regular expression pattern to search for in file contents.'),
            path: z
                .string()
                .optional()
                .describe(
                    'File or directory to search in. Defaults to current working directory if not specified.',
                ),
            glob: z
                .string()
                .optional()
                .describe("Glob pattern to filter files (e.g. '*.js', '*.{ts,tsx}')"),
            output_mode: z
                .enum(['content', 'files_with_matches', 'count'])
                .optional()
                .default('files_with_matches')
                .describe('Output mode'),
            B: z.number().optional().describe('Number of lines to show before each match.'),
            A: z.number().optional().describe('Number of lines to show after each match.'),
            C: z
                .number()
                .optional()
                .describe('Number of lines to show before and after each match.'),
            n: z.boolean().optional().describe('Show line numbers in output.'),
            i: z.boolean().optional().describe('Enable case insensitive search.'),
            type: z.string().optional().describe("File type to search (e.g. 'js', 'py', 'rust')."),
            head_limit: z.number().optional().describe('Limit output to first N lines/entries.'),
            multiline: z.boolean().optional().describe('Enable multiline mode.'),
        }),
    },
);
