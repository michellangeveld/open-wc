import { describe, it } from 'node:test';
import assert from 'node:assert';
import oxlintConfig from '../../index.js';
import { hasRuleError, lintCode } from '../utils/test-utils.js';

describe('eslint-plugin-lit', () => {
  it('should register eslint-plugin-lit directly', () => {
    assert.ok(
      (oxlintConfig.jsPlugins ?? []).includes('eslint-plugin-lit'),
      'expected eslint-plugin-lit to be registered directly',
    );
  });

  it('should include lit rules in the exported config', () => {
    const litRules = Object.keys(oxlintConfig.rules ?? {}).filter((ruleId) =>
      ruleId.startsWith('lit/'),
    );

    assert.ok(litRules.length > 0, 'expected at least one lit/* rule in config.rules');
  });

  it('should flag bindings used in place of tag names', async () => {
    const code = `
      import { html } from 'lit';

      const tag = 'div';
      const template = html\`<\${tag}>content</\${tag}>\`;
      console.error(template);
    `;
    const results = await lintCode(code, 'src/lit-binding-positions.js');

    assert.ok(
      hasRuleError(results, 'lit/binding-positions'),
      'should report lit/binding-positions for a binding in tag name position',
    );
  });

  it('should allow bindings in valid positions', async () => {
    const code = `
      import { html } from 'lit';

      const label = 'content';
      const template = html\`<div title="\${label}">\${label}</div>\`;
      console.error(template);
    `;
    const results = await lintCode(code, 'src/lit-valid-binding.js');

    assert.ok(
      !hasRuleError(results, 'lit/binding-positions'),
      'should not report lit/binding-positions for valid bindings',
    );
  });
});
