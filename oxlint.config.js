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

// These plugins are incompatible with oxlint because these require ESLint-specific features,
// language parsers, or runtime services that oxlint doesn't support
const rulePluginBlacklist = new Set([]);

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
  // Get `eslint-plugin-import to work`. See https://github.com/import-js/eslint-plugin-import/issues/2556#issuecomment-1419518561
  {
    languageOptions: {
      parserOptions: {
        // Eslint doesn't supply ecmaVersion in `parser.js` `context.parserOptions`
        // This is required to avoid ecmaVersion < 2015 error or 'import' / 'export' error
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      // List of rules sorted in alphabetical order.
      // These rules are disabled by normally by ESLint 9, but we activated them to fill the gap
      // for not using `eslint-config-airbnb` anymore due to lack of community support.
      'class-methods-use-this': [
        'error',
        {
          exceptMethods: [
            // web component life cycle
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

      // allow console.error, but not console.log and console.warn
      'no-console': ['error', { allow: ['error'] }],
    },

    languageOptions: {
      globals: {
        expect: false,
      },
    },

    settings: {
      /** eslint-plugin-lit-a11y - This plugin needs to know where lit-html is imported from */
      litHtmlSources: ['ing-web', 'ing-web/lit-2.js', 'ing-web/core.js'],
      /** eslint-plugin-import - Allows eslint to lint for various import violations */
      'import/resolver': {
        /** Adds support for node_modules imports */
        node: true,
      },
      /**
       * eslint-plugin-escompat - Instruct `eslint-plugin-compat` to lint ES APIs.
       * See https://github.com/amilajack/eslint-plugin-compat#linting-es-apis-experimental
       */
      lintAllEsApis: true,
      /**
       * eslint-plugin-compat - Resolve browserslist at runtime from the project's config.
       * This reads from package.json browserslist, .browserslistrc, or inherited config.
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
 * These plugins did not work directly in oxlint but can be made working by the use of a wrapper function
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
 * This plugins work in oxlint without any change
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
