import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-plugin-ow', () => {
  it('should allow valid code without customElements.define', async () => {
    const code = `
      class MyElement extends HTMLElement {
        connectedCallback() {
          console.error('connected');
        }
      }
    `;
    const results = await lintCode(code, 'src/my-element.js');

    assert.ok(
      !hasRuleError(results, 'ow/no-custom-elements-define'),
      'should allow code without customElements.define',
    );
  });

  it('should flag customElements.define usage', async () => {
    const code = `
      class MyElement extends HTMLElement {}
      customElements.define('my-element', MyElement);
    `;
    const results = await lintCode(code, 'src/my-element.js');

    assert.ok(
      hasRuleError(results, 'ow/no-custom-elements-define'),
      'should flag customElements.define usage',
    );
  });

  it('should flag getter functions that can be simplified', async () => {
    const code = `
      class MyElement extends HTMLElement {
        static get styles() {
          return { color: 'red' };
        }
      }
    `;
    const results = await lintCode(code, 'src/my-element.js');

    assert.ok(
      hasRuleError(results, 'ow/simplify-getters'),
      'should flag getter functions that can be simplified to static fields',
    );
  });

  it('should allow static class fields instead of getters', async () => {
    const code = `
      class MyElement extends HTMLElement {
        static styles = { color: 'red' };
      }
    `;
    const results = await lintCode(code, 'src/my-element.js');

    assert.ok(!hasRuleError(results, 'ow/simplify-getters'), 'should allow static class fields');
  });

  it('should flag invalid when import with lit-1', async () => {
    const code = `
      import { html } from 'ing-web/lit-1.js';
      import { when } from 'ing-web/lit-2.js';
    `;
    const results = await lintCode(code, 'src/my-element.js');

    assert.ok(
      hasRuleError(results, 'ow/invalid-when-import'),
      'should flag invalid when import when using lit-1',
    );
  });
});
