import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import { project } from "../../project";

export class BashTerminal {
  private _cwd: string;

  constructor(cwd?: string) {
    this._cwd = cwd || process.cwd();
  }

  async execute(command: string): Promise<string> {
    try {
      // Handle cd command manually
      if (command.trim().startsWith("cd ")) {
        const targetDir = command.trim().substring(3).trim();
        const resolvedDir = path.resolve(this._cwd, targetDir);

        if ((await fs.pathExists(resolvedDir)) && (await fs.stat(resolvedDir)).isDirectory()) {
          this._cwd = resolvedDir;
          return "";
        } else {
          return `cd: no such file or directory: ${targetDir}`;
        }
      }

      // Execute other commands
      const { stdout, stderr } = await execa(command, {
        cwd: this._cwd,
        shell: true,
        reject: false,
        env: {
          ...process.env,
          // Force color output if needed, or disable it
          TERM: "dumb",
        },
      });

      const output = stdout + (stderr ? "\n" + stderr : "");
      // Strip ANSI codes if needed, though simple execa usually returns clean text unless forced
      // const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");
      return output.trim();
    } catch (error: any) {
      return `Error executing command: ${error.message}`;
    }
  }

  close() {
    // No persistent process to close
  }
}

export let keepAliveTerminal: BashTerminal | null = null;

export function getTerminal(resetCwd: boolean = false): BashTerminal {
  if (keepAliveTerminal === null) {
    keepAliveTerminal = new BashTerminal(project.rootDir);
  } else if (resetCwd) {
    keepAliveTerminal = new BashTerminal(project.rootDir);
  }
  return keepAliveTerminal;
}
