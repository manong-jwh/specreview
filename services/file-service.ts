// ---------------------------------------------------------------------------
// FileService — abstracts filesystem operations for testability
// ---------------------------------------------------------------------------
// By default uses Node.js `fs`. In tests, inject a mock or in-memory fs.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { dirname, join, resolve } from 'path';

interface FsMock {
  existsSync: typeof existsSync;
  mkdirSync: typeof mkdirSync;
  writeFileSync: typeof writeFileSync;
  readFileSync: typeof readFileSync;
  rmSync?: typeof rmSync;
}

interface SnapshotEntry {
  path: string;
  existed: boolean;
  content: string | null;
}

/**
 * Lightweight filesystem abstraction.
 */
export class FileService {
  readonly basePath: string;
  private _fs: FsMock;

  constructor(basePath: string, fs: FsMock | null = null) {
    this.basePath = resolve(basePath);
    this._fs = fs ?? { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync };
  }

  exists(relPath: string): boolean {
    return this._fs.existsSync(join(this.basePath, relPath));
  }

  read(relPath: string, encoding: BufferEncoding = 'utf-8'): string {
    const full = join(this.basePath, relPath);
    if (!this._fs.existsSync(full)) {
      throw new Error(`File not found: ${relPath}`);
    }
    return this._fs.readFileSync(full, encoding);
  }

  write(relPath: string, content: string): void {
    const full = join(this.basePath, relPath);
    this._fs.mkdirSync(dirname(full), { recursive: true });
    this._fs.writeFileSync(full, content, 'utf-8');
  }

  writeAbsolute(absolutePath: string, content: string): void {
    this._fs.mkdirSync(dirname(absolutePath), { recursive: true });
    this._fs.writeFileSync(absolutePath, content, 'utf-8');
  }

  ensureDir(relPath: string): void {
    const full = join(this.basePath, relPath);
    if (!this._fs.existsSync(full)) {
      this._fs.mkdirSync(full, { recursive: true });
    }
  }

  takeSnapshot(relPaths: string[]): SnapshotEntry[] {
    return relPaths.map((p) => {
      const full = join(this.basePath, p);
      const existed = this._fs.existsSync(full);
      return {
        path: p,
        existed,
        content: existed ? this._fs.readFileSync(full, 'utf-8') : null,
      };
    });
  }

  restoreSnapshot(snapshot: SnapshotEntry[]): void {
    for (const entry of snapshot) {
      const full = join(this.basePath, entry.path);
      if (entry.existed) {
        this._fs.writeFileSync(full, entry.content!, 'utf-8');
      } else {
        try {
          (this._fs.rmSync ?? rmSync)(full, { force: true });
        } catch {
          /* ignore */
        }
      }
    }
  }
}
