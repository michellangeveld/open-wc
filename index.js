import path from 'node:path';
import eslintConfigOpenWc from '@open-wc/eslint-config';
import { includeIgnoreFile } from '@eslint/compat';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import chaiFriendlyPlugin from 'eslint-plugin-chai-friendly';
import * as compatPlugin from 'eslint-plugin-compat';
import escompatPlugin from 'eslint-plugin-escompat';
import ingSecurityConfig from 'eslint-plugin-ing-security';
import eslintPluginOw from 'eslint-plugin-ow';
import { resolveBrowsersList } from './browserslist-resolver.js';

const projectDir = process.cwd();
const gitignorePath = path.join(projectDir, '.gitignore');
const resolvedBrowsers = resolveBrowsersList(projectDir);

export default [
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
