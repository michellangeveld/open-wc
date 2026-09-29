import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-config-prettier', () => {
  it('should not flag formatting issues (prettier handles those)', async () => {
    const code = `const x=42;const y='test'`;
    const results = await lintCode(code, 'src/app.js');

    const formattingRules = ['indent', 'semi', 'quotes', 'comma-spacing', 'space-infix-ops'];
    const hasFormattingError = results.some((result) =>
      result.messages.some((msg) => formattingRules.includes(msg.ruleId)),
    );

    assert.ok(!hasFormattingError, 'should not flag formatting issues - prettier handles those');
  });

  it('should still catch non-formatting linting violations', async () => {
    const code = `
      const x = 42;
      console.log(x);
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-console'), 'should still catch console.log violations');
  });
});
