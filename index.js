import path from 'node:path';
import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintConfigOpenWc from '@open-wc/eslint-config';
import { includeIgnoreFile } from '@eslint/compat';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import chaiFriendlyPlugin from 'eslint-plugin-chai-friendly';
import * as compatPlugin from 'eslint-plugin-compat';
import escompatPlugin from 'eslint-plugin-escompat';
import ingSecurityConfig from 'eslint-plugin-ing-security';
import eslintPluginOw from 'eslint-plugin-ow';
import { fileURLToPath } from 'node:url';
import { resolveBrowsersList } from './browserslist-resolver.js';

// Oxlint reserves both "import" and "import-x" for its native Rust plugin, so the
// JS fallback plugin must be registered under an alias as the current 'namespace' is already taken.
const IMPORT_RULE_ID = /^import(?:-x)?\/(.+)$/;

// Rules that oxlint implements natively in its "import" plugin. Anything outside
// this list (for example `no-unresolved`) only exists in eslint-plugin-import-x and
// must be routed to the wrapped JS plugin, otherwise oxlint fails to parse the config.
const nativeImportRules = new Set([
  'consistent-type-specifier-style',
  'default',
  'export',
  'exports-last',
  'extensions',
  'first',
  'group-exports',
  'max-dependencies',
  'named',
  'namespace',
  'newline-after-import',
  'no-absolute-path',
  'no-amd',
  'no-anonymous-default-export',
  'no-commonjs',
  'no-cycle',
  'no-default-export',
  'no-duplicates',
  'no-dynamic-require',
  'no-empty-named-blocks',
  'no-mutable-exports',
  'no-named-as-default',
  'no-named-as-default-member',
  'no-named-default',
  'no-named-export',
  'no-namespace',
  'no-nodejs-modules',
  'no-relative-parent-imports',
  'no-self-import',
  'no-unassigned-import',
  'no-webpack-loader-syntax',
  'prefer-default-export',
  'unambiguous',
]);

const normalizeImportRuleId = (ruleId) => {
  const match = IMPORT_RULE_ID.exec(ruleId);
  if (!match) return ruleId;

  const [, ruleName] = match;
  return nativeImportRules.has(ruleName) ? `import/${ruleName}` : `import-x-js/${ruleName}`;
};

// Skip these core ESLint rules when generating oxlint rules.
// They may exist in upstream presets, but oxlint does not expose them under
// the "eslint/*" namespace. Keeping them causes "Rule not found" failures.
const unsupportedRuleIds = new Set([
  'arrow-parens',
  'no-restricted-syntax',
  'no-underscore-dangle',
  'no-unused-expressions',
]);

// Plugins whose rules must always report as errors, never as warnings.
const strictPluginPrefixes = [
  'chai-friendly',
  'compat',
  'escompat',
  'import',
  'import-x-js',
  'ing-security',
  'no-only-tests',
  'ow',
];

const isStrictPluginRule = (ruleId) =>
  strictPluginPrefixes.some((prefix) => ruleId.startsWith(`${prefix}/`));

const toErrorSeverity = (ruleConfig) => {
  if (Array.isArray(ruleConfig)) {
    return ['error', ...ruleConfig.slice(1)];
  }
  if (ruleConfig === 0 || ruleConfig === 'off') {
    return 'off';
  }
  return 'error';
};

// Collect the unscoped rules of every config entry into a single oxlint-ready map.
// File-scoped entries are skipped here; they become `overrides` instead.
const extractRules = (configs) => {
  const rules = {};

  for (const cfg of configs) {
    if (cfg.files || !cfg.rules || cfg.name === 'config-prettier') continue;

    for (const [ruleId, ruleConfig] of Object.entries(cfg.rules)) {
      if (unsupportedRuleIds.has(ruleId)) continue;

      const oxlintRuleId = normalizeImportRuleId(ruleId);
      rules[oxlintRuleId] = isStrictPluginRule(oxlintRuleId)
        ? toErrorSeverity(ruleConfig)
        : ruleConfig;
    }
  }

  return rules;
};

const mergeConfigValues = (configs, pick) =>
  Object.assign({}, ...configs.map((cfg) => pick(cfg) ?? {}));

const projectDir = process.cwd();
const gitignorePath = path.join(projectDir, '.gitignore');
const resolvedBrowsers = resolveBrowsersList(projectDir);

/**
 * These plugins do not run directly in oxlint, so we load them through wrappers.
 */
const wrappedJsPlugins = ['lit', 'ing-security', 'lit-a11y', 'import-x-js'].map((name) => ({
  name,
  specifier: fileURLToPath(new URL(`./src/oxlint-plugin-${name}-wrapper.js`, import.meta.url)),
}));

/**
 * These plugins work in oxlint without wrappers.
 */
const directJsPlugins = [
  'eslint-plugin-chai-friendly',
  'eslint-plugin-compat',
  'eslint-plugin-escompat',
  'eslint-plugin-no-only-tests',
  'eslint-plugin-ow',
];

// ESLint flat configs this preset is built from. Later entries win on conflicts.
const sourceConfigs = [
  includeIgnoreFile(gitignorePath),
  ...eslintConfigOpenWc,
  eslintConfigPrettier,
  eslintPluginOw.configs.recommended,
  ingSecurityConfig.configs.recommended,
  compatPlugin.config['flat/recommended'],
  escompatPlugin.configs['flat/recommended'],
  chaiFriendlyPlugin.configs['recommendedFlat'],
  {
    rules: {
      // Rules are kept alphabetically.
      // ESLint 9 no longer enables these by default; we keep them enabled to
      // preserve prior behavior after dropping eslint-config-airbnb.
      'class-methods-use-this': [
        'error',
        {
          exceptMethods: [
            // Web Component lifecycle methods
            'connectedCallback',
            'disconnectedCallback',

            // LitElement
            'performUpdate',
            'shouldUpdate',
            'firstUpdated',
            'update',
            'updated',
            'createRenderRoot',
            'render',
          ],
        },
      ],

      'no-await-in-loop': ['error'],
      'no-continue': ['error'],
      'no-param-reassign': ['error'],
      'no-restricted-syntax': 'off',
      'no-undef': ['error'],
      'no-unused-vars': ['error'],

      // Allow console.error only (block console.log/console.warn, etc.).
      'no-console': ['error', { allow: ['error'] }],
    },

    settings: {
      // eslint-plugin-lit-a11y: where lit-html imports come from
      litHtmlSources: ['ing-web', 'ing-web/lit-2.js', 'ing-web/core.js'],
      /**
       * eslint-plugin-escompat: tell eslint-plugin-compat to lint ES APIs too.
       * See https://github.com/amilajack/eslint-plugin-compat#linting-es-apis-experimental
       */
      lintAllEsApis: true,
      /**
       * eslint-plugin-compat: use the project's runtime browserslist.
       * Sources include package.json, .browserslistrc, and extended configs.
       */
      browsers: resolvedBrowsers,
    },
  },

  // Last so its rules win over the presets above.
  eslintPluginImportX.configs['flat/recommended'],
];

export default {
  // Setting `plugins` overwrites oxlint's base set, so the defaults
  // (eslint, unicorn, typescript, oxc) are repeated alongside `import`.
  plugins: ['eslint', 'unicorn', 'typescript', 'oxc', 'import'],
  jsPlugins: [...directJsPlugins, ...wrappedJsPlugins],
  categories: { style: 'allow' },
  env: { browser: true, es2024: true, node: true },
  globals: {
    ...mergeConfigValues(eslintConfigOpenWc, (cfg) => cfg.languageOptions?.globals),
    expect: 'readonly',
  },
  settings: mergeConfigValues(sourceConfigs, (cfg) => cfg.settings),
  rules: extractRules(sourceConfigs),

  // File-scoped rule relaxations owned by this config.
  // Oxlint applies these only to matching file patterns.
  overrides: [
    {
      files: ['**/*.test.js'],
      rules: {
        'ing-security/no-innerhtml': 'off',
      },
    },
    {
      files: ['**/*.test.js', '**/*.stories.js'],
      rules: {
        'ow/no-bare-ing-web-import': 'off',
      },
    },
  ],
};
