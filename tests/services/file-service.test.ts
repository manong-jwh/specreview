import { describe, it, expect, beforeEach } from 'vitest';
import { FileService } from '../../services/file-service.js';

interface MemFsStore {
  [key: string]: string | null;
}

interface MemFs {
  existsSync: (p: string) => boolean;
  mkdirSync: (p: string) => void;
  writeFileSync: (p: string, content: string) => void;
  readFileSync: (p: string) => string;
  rmSync: (p: string) => void;
  _store: MemFsStore;
}

function createMemFs(initial: Record<string, string> = {}): MemFs {
  const store: MemFsStore = { ...initial };
  return {
    existsSync: (p) => p in store,
    mkdirSync: (p: string) => {
      store[p] = null;
    },
    writeFileSync: (p, content) => {
      store[p] = content;
    },
    readFileSync: (p) => store[p] as string,
    rmSync: (p) => {
      delete store[p];
    },
    _store: store,
  };
}

describe('FileService', () => {
  let memFs: MemFs;
  let svc: FileService;

  beforeEach(() => {
    memFs = createMemFs({ '/base/specreview/config.yaml': 'roles:' });
    svc = new FileService('/base', memFs);
  });

  describe('exists', () => {
    it('returns true for existing files', () => {
      expect(svc.exists('specreview/config.yaml')).toBe(true);
    });

    it('returns false for missing files', () => {
      expect(svc.exists('nonexistent.md')).toBe(false);
    });
  });

  describe('read', () => {
    it('reads file content', () => {
      expect(svc.read('specreview/config.yaml')).toBe('roles:');
    });

    it('throws for missing files', () => {
      expect(() => svc.read('missing.md')).toThrow('File not found');
    });
  });

  describe('write', () => {
    it('writes file and creates parent directories', () => {
      svc.write('new-dir/hello.txt', 'world');
      expect(memFs._store['/base/new-dir']).toBeDefined();
      expect(memFs._store['/base/new-dir/hello.txt']).toBe('world');
    });
  });

  describe('writeAbsolute', () => {
    it('writes to an absolute path', () => {
      svc.writeAbsolute('/tmp/test-file.txt', 'content');
      expect(memFs._store['/tmp']).toBeDefined();
      expect(memFs._store['/tmp/test-file.txt']).toBe('content');
    });
  });

  describe('snapshot / restore', () => {
    it('captures and restores file state', () => {
      const snapshot = svc.takeSnapshot(['specreview/config.yaml']);

      svc.write('specreview/config.yaml', 'modified');
      expect(memFs._store['/base/specreview/config.yaml']).toBe('modified');

      svc.restoreSnapshot(snapshot);
      expect(memFs._store['/base/specreview/config.yaml']).toBe('roles:');
    });
  });
});
