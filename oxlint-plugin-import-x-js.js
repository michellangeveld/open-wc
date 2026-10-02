import { createNodeResolver } from 'eslint-plugin-import-x';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const presetDir = dirname(
  fileURLToPath(import.meta.resolve('oxlint-config-ing')),
);
const presetPluginUrl = pathToFileURL(
  resolve(presetDir, 'src/oxlint-plugin-import-x-js-wrapper.js'),
);

const { default: importXPlugin } = await import(presetPluginUrl.href);

const nodeResolver = createNodeResolver();

// Oxlint reports a newer `ecmaVersion` (e.g. 2026) than the espree build used by
// the preset's parser shim supports, which makes parsing imported modules fail
// with "Invalid ecmaVersion". `latest` maps to the newest version espree knows.
//
// Settings are serialized before they reach JS plugins, so the preset's legacy
// `import/resolver: { node: true }` cannot be turned into a real resolver there;
// the resolver object is injected here instead.
const patchContext = context => {
  const { languageOptions, settings } = context ?? {};

  const patchedSettings = {
    ...settings,
    'import-x/resolver-next': [nodeResolver],
  };
  delete patchedSettings['import/resolver'];
  delete patchedSettings['import-x/resolver'];

  const patchedLanguageOptions =
    languageOptions === undefined
      ? languageOptions
      : {
          ...languageOptions,
          ecmaVersion: 'latest',
          parserOptions: {
            ...languageOptions.parserOptions,
            ecmaVersion: 'latest',
          },
        };

  return Object.create(context, {
    settings: { enumerable: true, value: patchedSettings },
    languageOptions: { enumerable: true, value: patchedLanguageOptions },
  });
};

const patchRule = rule => {
  if (!rule || typeof rule.create !== 'function') return rule;

  return {
    ...rule,
    create(context) {
      return rule.create(patchContext(context));
    },
  };
};

export default {
  ...importXPlugin,
  rules: Object.fromEntries(
    Object.entries(importXPlugin.rules ?? {}).map(([ruleId, rule]) => [
      ruleId,
      patchRule(rule),
    ]),
  ),
};
