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

// Oxlint reserves "import-x" for its native plugin.
// Alias JS plugin rules to "import-x-js/*" to avoid name collisions.
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

// Extract file-based overrides from the last N config entries.
// Oxlint applies these rules only to matching file patterns (for example, tests).
const extractOverrides = (configs, count) =>
  configs
    .slice(-count)
    .filter((cfg) => cfg.files && cfg.rules)
    .map((cfg) => ({ files: cfg.files, rules: cfg.rules }));

// Plugins listed here are skipped because they rely on ESLint-only behavior that
// oxlint cannot execute (custom parser hooks, runtime services, and similar APIs).
const rulePluginBlacklist = new Set([]);

// Skip these core ESLint rules when generating oxlint rules.
// They may exist in upstream presets, but oxlint does not expose them under
// the "eslint/*" namespace. Keeping them causes "Rule not found" failures.
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

const projectDir = process.cwd();
const gitignorePath = path.join(projectDir, '.gitignore');
const resolvedBrowsers = resolveBrowsersList(projectDir);
const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  ...eslintConfigOpenWc,
  eslintConfigPrettier,
  eslintPluginOw.configs.recommended,
  ingSecurityConfig.configs.recommended,
  compatPlugin.config['flat/recommended'],
  {
    ...escompatPlugin.configs['flat/recommended'],
    languageOptions: {
      ecmaVersion: 2024,
    },
  },
  chaiFriendlyPlugin.configs['recommendedFlat'],
  // Make `eslint-plugin-import-x` work with flat config.
  // See: https://github.com/import-js/eslint-plugin-import/issues/2556#issuecomment-1419518561
  {
    languageOptions: {
      parserOptions: {
        // ESLint does not always pass ecmaVersion into parser context.
        // Force modern module parsing to avoid false parse errors.
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
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

            'routerConfig',
            '_mapStateToProps',
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

    languageOptions: {
      globals: {
        expect: false,
      },
    },

    settings: {
      // eslint-plugin-lit-a11y: where lit-html imports come from
      litHtmlSources: ['ing-web', 'ing-web/lit-2.js', 'ing-web/core.js'],
      // eslint-plugin-import: enable import resolution checks
      'import/resolver': {
        // Resolve packages from node_modules.
        node: true,
      },
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
];

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

const resolvePackageFileSpecifier = (relativePath) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

/**
 * These plugins do not run directly in oxlint, so we load them through wrappers.
 */
const wrappedJsPlugins = [
  {
    name: 'lit',
    specifier: resolvePackageFileSpecifier('./src/oxlint-plugin-lit-wrapper.js'),
  },
  {
    name: 'ing-security',
    specifier: resolvePackageFileSpecifier('./src/oxlint-plugin-ing-security-wrapper.js'),
  },
  {
    name: 'lit-a11y',
    specifier: resolvePackageFileSpecifier('./src/oxlint-plugin-lit-a11y-wrapper.js'),
  },
  {
    name: 'import-x-js',
    specifier: resolvePackageFileSpecifier('./src/oxlint-plugin-import-x-js-wrapper.js'),
  },
];

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
