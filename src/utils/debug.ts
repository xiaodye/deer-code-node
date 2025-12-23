import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug.log');

export const debugLog = (...args: any[]) => {
    const msg = args
        .map((a) => {
            if (a instanceof Error) {
                return a.stack || a.message;
            }
            if (typeof a === 'object') {
                try {
                    return JSON.stringify(a, null, 2);
                } catch (e) {
                    return '[Circular/Object]';
                }
            }
            return String(a);
        })
        .join(' ');

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
};
