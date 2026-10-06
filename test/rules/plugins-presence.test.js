import { describe, it } from 'node:test';
import assert from 'node:assert';
import oxlintConfig from '../../index.js';

const expectedOxlintPluginNamespaces = [
  '@typescript-eslint',
  'chai-friendly',
  'compat',
  'escompat',
  'import',
  'import-x-js',
  'ing-security',
  'lit',
  'lit-a11y',
  'no-only-tests',
  'ow',
];

function getOxlintPluginNamespaces(config) {
  const namespaces = new Set();

  for (const plugin of config.jsPlugins ?? []) {
    if (typeof plugin === 'string') {
      namespaces.add(plugin.replace('eslint-plugin-', ''));
    } else if (plugin?.name) {
      namespaces.add(plugin.name);
    }
  }

  if (config.rules) {
    Object.keys(config.rules)
      .filter((ruleId) => ruleId.includes('/'))
      .forEach((ruleId) => namespaces.add(ruleId.split('/')[0]));
  }

  return namespaces;
}

describe('plugin presence', () => {
  it('should have the exact plugin names for current linter', () => {
    const namespaces = getOxlintPluginNamespaces(oxlintConfig);
    assert.deepStrictEqual([...namespaces].sort(), [...expectedOxlintPluginNamespaces].sort());
  });

  it('should map native import rules to the native import namespace', () => {
    assert.ok(oxlintConfig.rules['import/extensions'], 'expected native import/extensions rule');
    assert.ok(
      !oxlintConfig.rules['import-x-js/extensions'],
      'native import rules should not be mapped to import-x-js',
    );
  });
});
