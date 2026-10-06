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

  it('should flag class-methods-use-this for methods not using this', async () => {
    const code = `
      class MyClass {
        getValue() {
          return 42;
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'class-methods-use-this'), 'should flag class methods that don\'t use this');
  });

  it('should allow Web Component lifecycle methods without using this', async () => {
    const code = `
      class MyComponent extends HTMLElement {
        connectedCallback() {
          console.error('connected');
        }
        
        disconnectedCallback() {
          console.error('disconnected');
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow Web Component lifecycle methods');
  });

  it('should allow LitElement lifecycle methods without using this', async () => {
    const code = `
      class MyElement {
        performUpdate() {
          console.error('performing update');
        }
        
        shouldUpdate() {
          return true;
        }
        
        firstUpdated() {
          console.error('first updated');
        }
        
        update() {
          console.error('updating');
        }
        
        updated() {
          console.error('updated');
        }
        
        createRenderRoot() {
          return this;
        }
        
        render() {
          return 'rendered';
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow LitElement lifecycle methods');
  });

  it('should allow class methods that use this', async () => {
    const code = `
      class MyClass {
        constructor() {
          this.value = 42;
        }
        
        getValue() {
          return this.value;
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow methods that use this');
  });

  it('should allow performUpdate exception method without using this', async () => {
    const code = `
      class MyElement {
        performUpdate() {
          console.error('performing update');
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow performUpdate without using this');
  });

  it('should allow shouldUpdate exception method without using this', async () => {
    const code = `
      class MyElement {
        shouldUpdate() {
          return true;
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow shouldUpdate without using this');
  });

  it('should allow firstUpdated exception method without using this', async () => {
    const code = `
      class MyElement {
        firstUpdated() {
          console.error('first updated');
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow firstUpdated without using this');
  });

  it('should allow update exception method without using this', async () => {
    const code = `
      class MyElement {
        update() {
          console.error('updating');
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow update without using this');
  });

  it('should allow updated exception method without using this', async () => {
    const code = `
      class MyElement {
        updated() {
          console.error('updated');
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow updated without using this');
  });

  it('should allow createRenderRoot exception method without using this', async () => {
    const code = `
      class MyElement {
        createRenderRoot() {
          return this;
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow createRenderRoot without using this');
  });

  it('should allow render exception method without using this', async () => {
    const code = `
      class MyElement {
        render() {
          return 'rendered';
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow render without using this');
  });

  it('should flag non-exception methods not using this', async () => {
    const code = `
      class MyClass {
        getValue() {
          return 42;
        }
        
        helper() {
          return 'help';
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(hasRuleError(results, 'class-methods-use-this'), 'should flag regular methods that don\'t use this');
  });

  it('should allow multiple exception methods in same class', async () => {
    const code = `
      class MyElement {
        render() {
          return 'html';
        }
        
        update() {
          console.error('updating');
        }
        
        updated() {
          console.error('updated');
        }
      }
    `;
    const results = await lintCode(code, 'src/app.js');

    assert.ok(!hasRuleError(results, 'class-methods-use-this'), 'should allow multiple exception methods in same class');
  });
});
