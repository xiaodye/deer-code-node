import fs from 'fs-extra';
import path from 'node:path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function applyPromptTemplate(templateName: string, kwargs: Record<string, any>): string {
    // Assuming src/prompts/templates is the location relative to this file in dist
    // Since we are using NodeNext, we can use import.meta.dirname if target is new enough,
    // or simple __dirname if compiled to CJS (which is implied by the error).
    // But tsconfig says NodeNext.
    // The error says "import.meta" not allowed in CommonJS output.
    // So tsconfig is transpiling to CJS.

    // We'll use a safer way to locate templates.
    // We assume the structure is preserved in dist or we are running with tsx.

    // In CJS, __dirname is available.
    const templateDir = path.join(__dirname, 'templates');
    let templatePath = path.join(templateDir, `${templateName}.md`);

    if (!fs.existsSync(templatePath)) {
        // Fallback for tsup bundled structure where templates might be copied to root dist/templates
        // but this file is bundled into dist/index.js (root of dist).
        // Wait, tsup bundles everything into dist/index.js.
        // So __dirname will be dist/.
        // And we copied templates to dist/templates.
        // So path.join(__dirname, 'templates') should be dist/templates.
        // Let's debug what __dirname is.
        // console.log('Template debug:', __dirname, templatePath);
    }
    
    if (!fs.existsSync(templatePath)) {
         throw new Error(`Template not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    return template(kwargs);
}
