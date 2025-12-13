import fs from 'fs-extra';
import path from 'path';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { minimatch } from 'minimatch';
import { DEFAULT_IGNORE_PATTERNS } from './ignore';

export const lsTool = tool(
  async ({ path: dirPath, match, ignore }) => {
    const _path = path.resolve(dirPath);
    
    if (!path.isAbsolute(_path)) {
      return `Error: the path ${dirPath} is not an absolute path. Please provide an absolute path.`;
    }

    if (!(await fs.pathExists(_path))) {
      return `Error: the path ${dirPath} does not exist. Please provide a valid path.`;
    }

    const stats = await fs.stat(_path);
    if (!stats.isDirectory()) {
      return `Error: the path ${dirPath} is not a directory. Please provide a valid directory path.`;
    }

    try {
      let items = await fs.readdir(_path, { withFileTypes: true });
      
      // Sort: directories first, then files, both alphabetically
      items.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      // Filter by match
      if (match && match.length > 0) {
        items = items.filter(item => match.some(pattern => minimatch(item.name, pattern)));
      }

      // Filter by ignore
      const ignorePatterns = (ignore || []).concat(DEFAULT_IGNORE_PATTERNS);
      items = items.filter(item => !ignorePatterns.some(pattern => minimatch(item.name, pattern)));

      if (items.length === 0) {
        return `No items found in ${dirPath}.`;
      }

      const resultLines = items.map(item => item.isDirectory() ? `${item.name}/` : item.name);

      return `Here's the result in ${dirPath}: \n\`\`\`\n${resultLines.join('\n')}\n\`\`\``;
    } catch (error: any) {
      return `Error: permission denied to access the path ${dirPath}. ${error.message}`;
    }
  },
  {
    name: "ls",
    description: "Lists files and directories in a given path. Optionally provide an array of glob patterns to match and ignore.",
    schema: z.object({
      path: z.string().describe("The absolute path to list files and directories from. Relative paths are **not** allowed."),
      match: z.array(z.string()).optional().describe("An optional array of glob patterns to match."),
      ignore: z.array(z.string()).optional().describe("An optional array of glob patterns to ignore."),
    }),
  }
);
