import { defineConfig } from 'tsup';
import fs from 'fs-extra';
import path from 'path';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['esm'],
    outDir: 'dist',
    clean: true,
    dts: true,
    onSuccess: async () => {
        // Copy templates to dist/templates
        const srcTemplates = path.join('src', 'prompts', 'templates');
        const distTemplates = path.join('dist', 'templates');
        if (await fs.pathExists(srcTemplates)) {
            await fs.copy(srcTemplates, distTemplates);
            console.log('Copied templates to dist/templates');
        }
    },
});
