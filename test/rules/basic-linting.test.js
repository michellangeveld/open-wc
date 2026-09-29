import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('basic linting rules are properly configured', () => {
  it('should flag console.log usage', async () => {
    const code = `
      console.log('debug message')
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-console'), 'should flag console.log as an error');
  });

  it('should allow console.error usage', async () => {
    const code = `
      console.error('error message')
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'no-console'), 'should allow console.error');
  });

  it('should flag no-await-in-loop', async () => {
    const code = `
      async function processItems(items) {
        for (const item of items) {
          await fetch(item);
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-await-in-loop'), 'should flag await in loop');
  });

  it('should flag no-continue', async () => {
    const code = `
      for (let i = 0; i < 10; i++) {
        if (i === 5) continue;
        console.error(i);
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-continue'), 'should flag continue statement');
  });

  it('should flag no-param-reassign', async () => {
    const code = `
      function setValue(obj) {
        obj = { value: 1 };
        return obj;
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-param-reassign'), 'should flag param reassignment');
  });

  it('should flag no-unused-vars', async () => {
    const code = `
      const unusedVariable = 42;
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-unused-vars'), 'should flag unused variables');
  });

  it('should flag no-undef', async () => {
    const code = `
      const result = undefinedVariable + 1;
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'no-undef'), 'should flag undefined variables');
  });

  it('should allow for...of loops (no-restricted-syntax is off)', async () => {
    const code = `
      const items = [1, 2, 3];
      for (const item of items) {
        console.error(item);
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'no-restricted-syntax'), 'should allow for...of loops');
  });
});
