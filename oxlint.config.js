import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintConfigOpenWc from '@open-wc/eslint-config';
import eslintConfig from './index.js';

// Oxlint reserves "import-x" for its native plugin, so JS plugin rules must use an alias.
const IMPORT_X_RULE_PREFIX = 'import-x/';
const IMPORT_X_JS_RULE_PREFIX = 'import-x-js/';

const aliasImportXRules = (rules) =>
  Object.fromEntries(
    Object.entries(rules).map(([id, cfg]) => [
      id.startsWith(IMPORT_X_RULE_PREFIX)
        ? id.replace(IMPORT_X_RULE_PREFIX, IMPORT_X_JS_RULE_PREFIX)
        : id,
      cfg,
    ]),
  );

const extractAndMergeConfigObjects = (configs, pick) =>
  configs.reduce((result, cfg) => ({ ...result, ...(pick(cfg) ?? {}) }), {});

// Extract file-specific overrides (last N configs from index.js)
// Needed because oxlint must apply different rules to different file patterns
// (e.g., test files or specific file types may have different rule severity)
const extractOverrides = (configs, count) =>
  configs
    .slice(-count)
    .filter((cfg) => cfg.files && cfg.rules)
    .map((cfg) => ({ files: cfg.files, rules: cfg.rules }));

// Plugin blacklist: plugins incompatible with oxlint
// Needed because these plugins require ESLint-specific features, language parsers,
// or runtime services that oxlint doesn't support
const rulePluginBlacklist = new Set([
  'html',
  'wc-export',
  '@babel',
  '@stylistic',
  'babel',
  'flowtype',
  'standard',
  'typescript',
  'react',
  'unicorn',
  'vue',
]);

// Rules intentionally excluded from ESLint->oxlint transfer.
// These IDs can be present in upstream ESLint presets, but oxlint does not
// register them under the "eslint" namespace; including them breaks
// configuration parsing (`oxlint --print-config` fails with "Rule not found").
// Verified against `oxlint --rules`.
const unsupportedRuleIds = new Set([
  'arrow-parens',
  'no-restricted-syntax',
  'no-underscore-dangle',
  'no-unused-expressions',
]);

const extractRules = (configs) => {
  const rules = {};

  for (const cfg of configs) {
    if (cfg.files || !cfg.rules || cfg.name === 'config-prettier') continue;

    for (const [ruleId, ruleConfig] of Object.entries(cfg.rules)) {
      if (unsupportedRuleIds.has(ruleId)) continue;

      if (ruleId.includes('/')) {
        const [pluginName] = ruleId.split('/');
        if (rulePluginBlacklist.has(pluginName)) continue;
      }

      rules[ruleId] = ruleConfig;
    }
  }

  return rules;
};

const toErrorSeverity = (ruleConfig) => {
  if (Array.isArray(ruleConfig)) {
    return ['error', ...ruleConfig.slice(1)];
  }
  if (ruleConfig === 0 || ruleConfig === 'off') {
    return 'off';
  }
  return 'error';
};

const enforceErrorByPluginPrefix = (rules, prefixes) => {
  const result = { ...rules };

  for (const [ruleId, ruleConfig] of Object.entries(result)) {
    if (prefixes.some((prefix) => ruleId.startsWith(`${prefix}/`))) {
      result[ruleId] = toErrorSeverity(ruleConfig);
    }
  }

  return result;
};

const globals = extractAndMergeConfigObjects(
  eslintConfigOpenWc,
  (cfg) => cfg.languageOptions?.globals,
);
const settings = extractAndMergeConfigObjects(eslintConfig, (cfg) => cfg.settings);
const overrides = extractOverrides(eslintConfig, 2);
const strictPluginPrefixes = [
  'chai-friendly',
  'compat',
  'escompat',
  'ing-security',
  'no-only-tests',
  'ow',
  'import-x-js',
];

const strictRules = enforceErrorByPluginPrefix(
  aliasImportXRules({
    ...extractRules(eslintConfig),
    ...eslintPluginImportX.configs['flat/recommended'].rules,
  }),
  strictPluginPrefixes,
);

const wrappedJsPlugins = [
  { name: 'lit', specifier: './src/oxlint-plugin-lit-wrapper.js' },
  { name: 'ing-security', specifier: './src/oxlint-plugin-ing-security-wrapper.js' },
  { name: 'lit-a11y', specifier: './src/oxlint-plugin-lit-a11y-wrapper.js' },
  { name: 'import-x-js', specifier: './src/oxlint-plugin-import-x-js-wrapper.js' },
];

const directJsPlugins = [
  'eslint-plugin-chai-friendly',
  'eslint-plugin-compat',
  'eslint-plugin-escompat',
  'eslint-plugin-no-only-tests',
  'eslint-plugin-ow',
];

export default {
  jsPlugins: [...directJsPlugins, ...wrappedJsPlugins],
  categories: { style: 'allow' },
  env: { browser: true, es2024: true, node: true },
  globals: { ...globals, expect: 'readonly' },
  settings,
  rules: {
    ...strictRules,
  },
  overrides,
};
