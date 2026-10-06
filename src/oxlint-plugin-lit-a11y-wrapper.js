import litA11yPlugin from 'eslint-plugin-lit-a11y';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

/**
 * eslint-plugin-lit-a11y reads `context.sourceCode.parserServices`, which oxlint
 * does not provide; the wrapper adds it in. No context tweaks are needed beyond
 * that: oxlint forwards `settings` from the config, so `settings.litHtmlSources`
 * (set in index.js) reaches the rules as-is.
 */
export default wrapPluginForOxlint(litA11yPlugin);
