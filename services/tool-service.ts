// ---------------------------------------------------------------------------
// ToolService — AI tool discovery and selection
// ---------------------------------------------------------------------------

import type { ToolDef } from '../constants.js';

interface FileSystem {
  exists(relPath: string): boolean;
}

interface ResolveResult {
  selected: ToolDef[];
  detected: string[];
  isExplicit: boolean;
}

/**
 * Manages AI tool definitions and handles selection/detection.
 */
export class ToolService {
  private toolDefs: readonly ToolDef[];
  private fs: FileSystem;

  constructor(toolDefs: readonly ToolDef[], fileService: FileSystem) {
    this.toolDefs = toolDefs;
    this.fs = fileService;
  }

  getAll(): ToolDef[] {
    return [...this.toolDefs];
  }

  /**
   * Detect which tools are present in the project by checking for their
   * config directories (e.g. .claude/, .cursor/).
   */
  detect(prefix = ''): string[] {
    return this.toolDefs
      .filter((t) => this.fs.exists(prefix ? `${prefix}/${t.dir}` : t.dir))
      .map((t) => t.id);
  }

  filterByIds(ids: string[]): ToolDef[] {
    return this.toolDefs.filter((t) => ids.includes(t.id));
  }

  findById(id: string): ToolDef | undefined {
    return this.toolDefs.find((t) => t.id === id);
  }

  /**
   * Resolve tool selection from CLI options or fallback to detection.
   */
  resolveSelection({ tools, prefix = '' }: { tools?: string[]; prefix?: string } = {}): ResolveResult {
    const detected = this.detect(prefix);

    if (tools && tools.length > 0) {
      const selected = this.filterByIds(tools);
      return { selected, detected, isExplicit: true };
    }

    return {
      selected: this.filterByIds(detected),
      detected,
      isExplicit: false,
    };
  }
}
