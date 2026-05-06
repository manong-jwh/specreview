import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { validateProjectPath } from '../utils.js';

describe('validateProjectPath', () => {
  it('passes for a path inside cwd', () => {
    expect(() => validateProjectPath('/home/user/project/subdir', '/home/user')).not.toThrow();
  });

  it('passes for a path equal to cwd', () => {
    expect(() => validateProjectPath('/home/user/project', '/home/user/project')).not.toThrow();
  });

  it('throws for a path outside cwd', () => {
    expect(() => validateProjectPath('/etc/passwd', '/home/user')).toThrow(
      'outside the current working directory',
    );
  });

  it('throws for a path that traverses outside cwd (after resolution)', () => {
    const cwd = '/home/user/project';
    const traversal = resolve(cwd, '../../etc');
    expect(() => validateProjectPath(traversal, cwd)).toThrow();
  });
});
