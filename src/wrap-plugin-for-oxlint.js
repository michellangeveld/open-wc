// Keep this wrapper until oxlint exposes ESLint-compatible parser services on both
// `context.parserServices` and `context.sourceCode.parserServices`.
// Wrapped plugins (lit, lit-a11y, ing-security, import-x-js) read those fields;
// without this shim they either crash or skip intended diagnostics.
const ensureParserServicesContext = (context) => {
  const parserServices = {
    ...(context?.sourceCode?.parserServices ?? context?.parserServices ?? {}),
  };
  const asProperty = (value) => ({ enumerable: true, value });

  const descriptor = {
    parserServices: asProperty(parserServices),
    languageOptions: asProperty(context?.languageOptions),
  };

  if (context?.sourceCode) {
    descriptor.sourceCode = asProperty(
      Object.create(context.sourceCode, { parserServices: asProperty(parserServices) }),
    );
  }

  return Object.create(context, descriptor);
};

const wrapRuleForOxlint = (rule, transformContext) => {
  if (typeof rule?.create !== 'function') return rule;

  return {
    ...rule,
    create(context) {
      const patchedContext = ensureParserServicesContext(context);
      return rule.create(transformContext ? transformContext(patchedContext) : patchedContext);
    },
  };
};

/**
 * Adapt an ESLint plugin so its rules can run inside oxlint.
 * @param {object} plugin - The ESLint plugin to wrap.
 * @param {object} [options]
 * @param {(context: object) => object} [options.transformContext] - Further tweak the rule context.
 * @returns {object} The plugin with wrapped rules.
 */
export const wrapPluginForOxlint = (plugin, { transformContext } = {}) => {
  if (!plugin?.rules) return plugin;

  return {
    ...plugin,
    rules: Object.fromEntries(
      Object.entries(plugin.rules).map(([ruleId, rule]) => [
        ruleId,
        wrapRuleForOxlint(rule, transformContext),
      ]),
    ),
  };
};
