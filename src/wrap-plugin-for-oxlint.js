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

const patchContextForOxlint = (context, options = {}) => {
  const {
    transformContext,
    normalizeEcmaVersionToLatest = false,
    settingsPatch,
  } = options;
  const { settings, languageOptions } = context ?? {};
  const descriptor = {};

  if (settingsPatch?.set || settingsPatch?.unset?.length) {
    const patchedSettings = {
      ...settings,
      ...(settingsPatch?.set ?? {}),
    };
    for (const key of settingsPatch?.unset ?? []) {
      delete patchedSettings[key];
    }
    descriptor.settings = { enumerable: true, value: patchedSettings };
  }

  if (normalizeEcmaVersionToLatest && languageOptions !== undefined) {
    descriptor.languageOptions = {
      enumerable: true,
      value: {
        ...languageOptions,
        ecmaVersion: 'latest',
        parserOptions: {
          ...languageOptions.parserOptions,
          ecmaVersion: 'latest',
        },
      },
    };
  }

  const patchedContext =
    Object.keys(descriptor).length > 0 ? Object.create(context, descriptor) : context;

  return transformContext ? transformContext(patchedContext) : patchedContext;
};

const wrapRuleForOxlint = (rule, options) => {
  if (!rule || typeof rule.create !== 'function') return rule;

  return {
    ...rule,
    create(context) {
      const parserReadyContext = ensureParserServicesContext(context);
      const pluginReadyContext = patchContextForOxlint(parserReadyContext, options);
      return rule.create(pluginReadyContext);
    },
  };
};

export const wrapPluginForOxlint = (plugin, options = {}) => {
  if (!plugin?.rules) return plugin;

  return {
    ...plugin,
    rules: Object.fromEntries(
      Object.entries(plugin.rules).map(([ruleId, rule]) => [
        ruleId,
        wrapRuleForOxlint(rule, options),
      ]),
    ),
  };
};
