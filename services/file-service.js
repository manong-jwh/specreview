// ---------------------------------------------------------------------------
// FileService — abstracts filesystem operations for testability
// ---------------------------------------------------------------------------
// By default uses Node.js `fs`. In tests, inject a mock or in-memory fs.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Lightweight filesystem abstraction.
 *
 * @example
 *   const fs = new FileService('/my/project');
 *   fs.write('specreview/config.yaml', content);
 *   const data = fs.read('specreview/config.yaml');
 */
export class FileService {
  /**
   * @param {string}  basePath   – root directory all relative paths resolve against.
   * @param {object}  [fs]       – optional fs mock (must expose existsSync, mkdirSync, writeFileSync, readFileSync).
   */
  constructor(basePath, fs = null) {
    this.basePath = resolve(basePath);
    this._fs = fs ?? { existsSync, mkdirSync, writeFileSync, readFileSync };
  }

  // ── Public API ───────────────────────────────────────────────────────

  /** @param {string} relPath @returns {boolean} */
  exists(relPath) {
    return this._fs.existsSync(join(this.basePath, relPath));
  }

  /**
   * Read a file relative to basePath.
   * @param {string}  relPath
   * @param {string}  [encoding='utf-8']
   * @returns {string}
   */
  read(relPath, encoding = 'utf-8') {
    const full = join(this.basePath, relPath);
    if (!this._fs.existsSync(full)) {
      throw new Error(`File not found: ${relPath}`);
    }
    return this._fs.readFileSync(full, encoding);
  }

  /**
   * Write a file relative to basePath (creates parent dirs).
   * @param {string} relPath
   * @param {string} content
   */
  write(relPath, content) {
    const full = join(this.basePath, relPath);
    this._fs.mkdirSync(dirname(full), { recursive: true });
    this._fs.writeFileSync(full, content, 'utf-8');
  }

  /**
   * Write to an absolute path (creates parent dirs).
   * Use when the target doesn't fall under basePath.
   * @param {string} absolutePath
   * @param {string} content
   */
  writeAbsolute(absolutePath, content) {
    this._fs.mkdirSync(dirname(absolutePath), { recursive: true });
    this._fs.writeFileSync(absolutePath, content, 'utf-8');
  }

  /**
   * Ensure a relative directory exists.
   * @param {string} relPath
   */
  ensureDir(relPath) {
    const full = join(this.basePath, relPath);
    if (!this._fs.existsSync(full)) {
      this._fs.mkdirSync(full, { recursive: true });
    }
  }

  /**
   * Take a snapshot of listed paths (for rollback).
   * @param {string[]} relPaths
   * @returns {Array<{path:string, existed:boolean, content:string|null}>}
   */
  takeSnapshot(relPaths) {
    return relPaths.map(p => {
      const full = join(this.basePath, p);
      const existed = this._fs.existsSync(full);
      return {
        path: p,
        existed,
        content: existed ? this._fs.readFileSync(full, 'utf-8') : null,
      };
    });
  }

  /**
   * Restore a snapshot (rollback after failed write).
   * @param {Array<{path:string, existed:boolean, content:string|null}>} snapshot
   */
  restoreSnapshot(snapshot) {
    for (const entry of snapshot) {
      const full = join(this.basePath, entry.path);
      if (entry.existed) {
        this._fs.writeFileSync(full, entry.content, 'utf-8');
      } else {
        // best-effort removal; fs.rmSync can be used if available
        try { this._fs.rmSync(full, { force: true }); } catch { /* ignore */ }
      }
    }
  }
}
