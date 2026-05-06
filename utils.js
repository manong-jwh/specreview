// ---------------------------------------------------------------------------
// specreview — shared utilities
// ---------------------------------------------------------------------------

/**
 * Validate that a resolved project path stays within the current working
 * directory. Prevents directory-argument path-traversal attacks.
 *
 * @param {string} resolvedPath – the path after path.resolve(cwd, userInput).
 * @param {string} cwd          – process.cwd().
 * @throws {Error} if path is outside cwd.
 */
export function validateProjectPath(resolvedPath, cwd) {
  if (!resolvedPath.startsWith(cwd)) {
    throw new Error(
      `Path "${resolvedPath}" is outside the current working directory. ` +
      'Please use a directory under your project root.',
    );
  }
}
