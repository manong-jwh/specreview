// ---------------------------------------------------------------------------
// Backward-compatibility re-exports
// ---------------------------------------------------------------------------

export { TOOLS, CONFIG_FILES, CONFIG_YAML, ROLES } from '../constants.js';

export { validateProjectPath } from '../utils.js';

export { FileService } from '../services/file-service.js';
export { TemplateService } from '../services/template-service.js';
export { ToolService } from '../services/tool-service.js';
export { validateConfigYaml } from '../services/config-validator.js';
