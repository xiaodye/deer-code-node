import fs from 'fs-extra';
import process from 'process';

export class Project {
    private _rootDir: string;

    constructor(path: string) {
        this._rootDir = path;
    }

    get rootDir(): string {
        return this._rootDir;
    }

    set rootDir(path: string) {
        if (!fs.existsSync(path)) {
            throw new Error(`Project root directory ${path} does not exist`);
        }
        if (!fs.statSync(path).isDirectory()) {
            throw new Error(
                `Project root directory ${path} is not a directory`,
            );
        }
        this._rootDir = path;
    }
}

export const project = new Project(process.cwd());
