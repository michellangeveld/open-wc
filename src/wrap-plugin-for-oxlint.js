import { ensureParserLanguageOptions } from './oxlint-parser-shim.js';

const ensureParserServicesContext = (context) => {
  const parserServices = {
    ...(context?.sourceCode?.parserServices ?? context?.parserServices ?? {}),
  };

  const descriptor = {
    parserServices: {
      enumerable: true,
      value: parserServices,
    },
    languageOptions: {
      enumerable: true,
      value: ensureParserLanguageOptions(context?.languageOptions),
    },
  };

  if (context?.sourceCode) {
    descriptor.sourceCode = {
      enumerable: true,
      value: Object.create(context.sourceCode, {
        parserServices: {
          enumerable: true,
          value: parserServices,
        },
      }),
    };
  }

  return Object.create(context, descriptor);
};

const wrapRuleForOxlint = (rule) => {
  if (!rule || typeof rule.create !== 'function') return rule;

  return {
    ...rule,
    create(context) {
      return rule.create(ensureParserServicesContext(context));
    },
  };
};

export const wrapPluginForOxlint = (plugin) => {
  if (!plugin?.rules) return plugin;

  return {
    ...plugin,
    rules: Object.fromEntries(
      Object.entries(plugin.rules).map(([ruleId, rule]) => [ruleId, wrapRuleForOxlint(rule)]),
    ),
  };
};
