import { describe, it } from 'node:test';
import assert from 'node:assert';
import { lintCode, hasRuleError } from '../utils/test-utils.js';

describe('eslint-plugin-import-x', () => {
  it('should flag unresolved imports', async () => {
    const code = `
      import missingModule from 'definitely-missing-package-for-import-x-test';
      console.error(missingModule);
    `;

    const results = await lintCode(code, 'src/import-x-unresolved.js');

    assert.ok(
      hasRuleError(results, 'import-x/no-unresolved'),
      'should flag imports that cannot be resolved',
    );
  });

  it('should allow imports from Node builtins', async () => {
    const code = `
      import * as path from 'node:path';
      console.error(path.sep);
    `;

    const results = await lintCode(code, 'src/import-x-resolved.js');

    assert.ok(
      !hasRuleError(results, 'import-x/no-unresolved'),
      'should not flag imports that can be resolved',
    );
  });
});
