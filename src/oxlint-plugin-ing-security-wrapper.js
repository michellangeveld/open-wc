import ingSecurityPlugin from 'eslint-plugin-ing-security';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

/**
 * Keep this wrapper: `eslint-plugin-ing-security` assumes ESLint parser-services
 * are available on `context.sourceCode.parserServices` (or `context.parserServices`).
 *
 * Its Lit helper `HasLitHtmlImportRuleExtension` immediately does:
 * `getParserServices(context).litHtmlSpecifiers.includes(...)`.
 * If oxlint does not provide parserServices in that ESLint shape, this either:
 * 1. throws at runtime (`includes` on undefined), or
 * 2. bypasses Lit-aware behavior in rules like `ing-security/no-innerhtml` and
 *    `ing-security/no-unsafe-cross-origin-link`.
 *
 * `wrapPluginForOxlint` shims parserServices onto the rule context so these
 * checks stay active and stable under oxlint.
 */
export default wrapPluginForOxlint(ingSecurityPlugin);
