import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-plugin-escompat', () => {
  it('should allow basic ES6 code', async () => {
    const code = `
      const x = 42;
      const arr = [1, 2, 3];
      const doubled = arr.map(n => n * 2);
      console.error(doubled);
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      !hasRuleError(results, 'escompat/', { startsWith: true }),
      'should allow basic ES6 code',
    );
  });

  it('should flag RegExp v flag (ES2024+)', async () => {
    const code = `
      const regex = /[\\p{Script=Greek}&&\\p{Letter}]/v;
      console.error(regex);
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'escompat/no-regexp-v-flag'),
      'should flag RegExp v flag (ES2024)',
    );
  });
});
