import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getTerminal } from './bash';

export const bashTool = tool(
    async ({ command, reset_cwd }) => {
        const terminal = getTerminal(reset_cwd);
        const output = await terminal.execute(command);
        return `\`\`\`\n${output}\n\`\`\``;
    },
    {
        name: 'bash',
        description: `Execute a standard bash command in a keep-alive shell, and return the output if successful or error message if failed.

Use this tool to perform:
- Create directories
- Install dependencies
- Start development server
- Run tests and linting
- Git operations

Never use this tool to perform any harmful or dangerous operations.

- Use \`ls\`, \`grep\` and \`tree\` tools for file system operations instead of this tool.
- Use \`text_editor\` tool with \`create\` command to create new files.`,
        schema: z.object({
            command: z.string().describe('The command to execute.'),
            reset_cwd: z
                .boolean()
                .optional()
                .describe(
                    'Whether to reset the current working directory to the project root directory.',
                ),
        }),
    },
);
