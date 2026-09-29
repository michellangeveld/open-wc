import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-plugin-lit-a11y', () => {
  it('should allow accessible lit-html templates', async () => {
    const code = `
      import { html } from 'lit';

      const template = html\`
        <img src="photo.jpg" alt="A descriptive alt text" />
        <button>Click me</button>
      \`;
    `;
    const results = await lintCode(code, 'src/my-component.js');

    assert.ok(
      !hasRuleError(results, 'lit-a11y/', { startsWith: true }),
      'should allow accessible lit-html templates',
    );
  });

  it('should flag positive tabindex values', async () => {
    const code = `
      import { html } from 'ing-web';

      const template = html\`
        <div tabindex="5">Focusable div</div>
      \`;
    `;
    const results = await lintCode(code, 'src/my-component.js');

    assert.ok(
      hasRuleError(results, 'lit-a11y/tabindex-no-positive'),
      'should flag positive tabindex values',
    );
  });

  it('should flag click events without key events', async () => {
    const code = `
      import { html } from 'ing-web';

      const template = html\`
        <div @click=\${handleClick}>Clickable div</div>
      \`;
    `;
    const results = await lintCode(code, 'src/my-component.js');

    assert.ok(
      hasRuleError(results, 'lit-a11y/click-events-have-key-events'),
      'should flag click events without corresponding key events',
    );
  });
});
