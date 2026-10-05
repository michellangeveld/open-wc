import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-config-openwc', () => {
  it('should allow valid LitElement code', async () => {
    const code = `
      import { LitElement, html } from 'lit';

      class MyElement extends LitElement {
        render() {
          return html\`<div>Hello</div>\`;
        }
      }
    `;
    const results = await lintCode(code, 'src/my-element.js');

    assert.ok(
      !hasRuleError(results, 'lit', { includes: true }),
      'should allow valid LitElement code',
    );
  });

  it('should flag unresolved imports', async () => {
    const code = `
      import { expect } from 'chai';
      console.log(expect);
    `;

    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'import-x-js/no-unresolved'), 'should flag unresolved imports');
  });

  it('should flag imports missing file extension', async () => {
    const code = `
      import something from './module';
      console.error(something);
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'import/extensions'),
      'should flag imports missing file extension',
    );
  });

  it('should flag .only in tests', async () => {
    const code = `
      describe.only('test suite', () => {
        it('should work', () => {});
      });
    `;
    const results = await lintCode(code, 'test/app.test.js');

    assert.ok(
      hasRuleError(results, 'no-only-tests/no-only-tests'),
      'should flag .only in tests to prevent accidental commits',
    );
  });
});
