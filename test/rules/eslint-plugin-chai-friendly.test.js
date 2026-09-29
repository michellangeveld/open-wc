import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-plugin-chai-friendly', () => {
  it('should allow chai assertion patterns', async () => {
    const code = `
      import { expect } from 'chai';

      const value = 42;
      expect(value).to.equal(42);
      expect(value).to.be.a('number');
    `;
    const results = await lintCode(code, 'test/app.test.js');

    assert.ok(
      !hasRuleError(results, 'chai-friendly/', { startsWith: true }),
      'should allow standard chai assertions',
    );
  });

  it('should flag problematic no-unused-expressions patterns in chai', async () => {
    const code = `
      import { expect } from 'chai';

      const value = 42;
      expect(value).to.equal(42);
      value > 10;
    `;
    const results = await lintCode(code, 'test/app.test.js');

    assert.ok(
      hasRuleError(results, 'chai-friendly/no-unused-expressions'),
      'should flag unused expressions outside of chai assertions',
    );
  });
});
