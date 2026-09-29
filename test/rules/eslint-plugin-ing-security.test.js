import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-plugin-ing-security', () => {
  it('should flag innerHTML usage in javascript', async () => {
    const code = `
      const node = document.body;
      node.innerHTML = 'dangerzone';
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'ing-security/no-innerhtml'),
      'should report ing-security/no-innerhtml for direct assignment',
    );
  });

  it('should flag no-innerhtml for Lit .innerHTML binding', async () => {
    const code = `
      import { html } from 'lit';

      const template = html\`<foo .innerHTML=\${'<script>alert("unsafe")</script>'}></foo>\`;
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'ing-security/no-innerhtml'),
      'should report ing-security/no-innerhtml for Lit binding',
    );
  });

  it('should flag no-innerhtml for another direct DOM innerHTML assignment', async () => {
    const code = `
      const element = document.getElementById('app');
      element.innerHTML = '<div>test content</div>';
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'ing-security/no-innerhtml'),
      'should report ing-security/no-innerhtml for direct assignment',
    );
  });

  it('should flag no-unsafe-cross-origin-link for unsafe cross-origin links that miss noreferrer', async () => {
    const code = `
      import { html } from 'ing-web';
      const template = html\`<div><a href='#' target='_blank' rel='noopener'>Link is missing noreferrer</a></div>\`;
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      hasRuleError(results, 'ing-security/no-unsafe-cross-origin-link'),
      'should report ing-security/no-unsafe-cross-origin-link when noreferrer is missing',
    );
  });

  it('should allow innerHTML usage in javascript test files', async () => {
    const code = `
      const element = document.getElementById('app');
      element.innerHTML = '<div>test content</div>';
    `;
    const results = await lintCode(code, 'src/app.test.js');

    assert.ok(
      !hasRuleError(results, 'ing-security/no-innerhtml'),
      'should allow innerHTML in test files',
    );
  });

  it('should allow innerHTML as lit component test files', async () => {
    const code = `
      const element = document.getElementById('app');
      element.innerHTML = '<div>test content</div>';
    `;
    const results = await lintCode(code, 'src/app.test.js');

    assert.ok(
      !hasRuleError(results, 'ing-security/no-innerhtml'),
      'should allow innerHTML in test files',
    );
  });

  it('should allow textContent', async () => {
    const code = `
      const element = document.getElementById('app');
      element.textContent = 'safe content';
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(
      !hasRuleError(results, 'ing-security/', { startsWith: true }),
      'should allow textContent as safe alternative',
    );
  });
});
