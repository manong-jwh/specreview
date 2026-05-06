// ---------------------------------------------------------------------------
// ToolService — AI tool discovery and selection
// ---------------------------------------------------------------------------

/**
 * Manages AI tool definitions and handles selection/detection.
 *
 * @example
 *   const svc = new ToolService(TOOLS, fileService);
 *   const detected = svc.detect();
 *   const selected = svc.resolveSelection({ tools: ['claude','cursor'] });
 */
export class ToolService {
  /**
   * @param {Array<{id:string, name:string, dir:string}>} toolDefs
   * @param {object} fileService – must have an `exists(relPath)` method.
   */
  constructor(toolDefs, fileService) {
    this.toolDefs = toolDefs;
    this.fs = fileService;
  }

  // ── Public API ───────────────────────────────────────────────────────

  /** @returns {Array<{id:string, name:string, dir:string}>} */
  getAll() {
    return [...this.toolDefs];
  }

  /**
   * Detect which tools are present in the project by checking for their
   * config directories (e.g. .claude/, .cursor/).
   *
   * @param {string} [prefix=''] – optional subdirectory prefix.
   * @returns {string[]} – detected tool IDs.
   */
  detect(prefix = '') {
    return this.toolDefs
      .filter(t => this.fs.exists(prefix ? `${prefix}/${t.dir}` : t.dir))
      .map(t => t.id);
  }

  /**
   * Filter tool definitions by a set of IDs.
   * @param {string[]} ids
   * @returns {Array<{id:string, name:string, dir:string}>}
   */
  filterByIds(ids) {
    return this.toolDefs.filter(t => ids.includes(t.id));
  }

  /**
   * Look up the definition for a single tool ID.
   * @param {string} id
   * @returns {{id:string, name:string, dir:string}|undefined}
   */
  findById(id) {
    return this.toolDefs.find(t => t.id === id);
  }

  /**
   * Resolve tool selection from CLI options or fallback to detection.
   *
   * @param {object}  opts
   * @param {string[]} [opts.tools]   – explicit tool IDs from --tools flag.
   * @param {string}  [opts.prefix=''] – optional subdirectory prefix.
   * @returns {{ selected, detected, isExplicit }}
   */
  resolveSelection({ tools, prefix = '' } = {}) {
    const detected = this.detect(prefix);

    if (tools && tools.length > 0) {
      const selected = this.filterByIds(tools);
      return { selected, detected, isExplicit: true };
    }

    // Return detected tools as pre-selected (UI can use isExplicit=false
    // to decide whether to enter interactive mode).
    return {
      selected: this.filterByIds(detected),
      detected,
      isExplicit: false,
    };
  }
}
