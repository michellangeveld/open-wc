import importXPlugin from 'eslint-plugin-import-x';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

/**
 * Keep this wrapper for `eslint-plugin-import-x` (registered as `import-x-js`):
 * oxlint routes non-native import rules (for example `no-unresolved`) here, and
 * this adapter preserves ESLint-shaped parser-services fields on rule context so
 * import-x rules run reliably under oxlint.
 */
export default wrapPluginForOxlint(importXPlugin);
