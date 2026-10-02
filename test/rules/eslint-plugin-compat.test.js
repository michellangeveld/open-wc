import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError, findSettings } from '../utils/test-utils.js';

describe('eslint-plugin-compat', () => {
  it('should have browserslist configured', () => {
    const browsersList = findSettings('browsers');
    assert.ok(browsersList.length > 0);
  });

  it('should flag compatibility issues', async () => {
    const code = `const withReplaced = [1, 2, 3].with(1, 99);`;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'compat/compat'), 'should detect compatibility issues');
  });

  it('should flag Array.with compatibility issues (own browserslist)', async () => {
    // compat/compat should report this: Array.with() is unsupported in Safari 15.6
    // and iOS Safari 15.6-15.8.
    const code = `
      const withReplaced = [1, 2, 3].with(1, 99);
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'compat/compat'),
      'should detect Array.with compatibility issues',
    );
  });

  it('should flag Array.with compatibility issues (default browsers)', async () => {
    // compat/compat should report this: Array.with() is unsupported in Safari 15.6
    // and iOS Safari 15.6-15.8.
    const code = `
      const withReplaced = [1, 2, 3].with(1, 99);
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'compat/compat'),
      'should detect Array.with compatibility issues',
    );
  });
});
