import litPlugin from 'eslint-plugin-lit';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

/**
 * Keep `eslint-plugin-lit` wrapped for oxlint:
 * oxlint's rule context does not expose all ESLint fields expected by lit-based
 * rules (notably parser-services related context), and removing this adapter
 * makes those rules fail when loaded through this config.
 */
export default wrapPluginForOxlint(litPlugin);
