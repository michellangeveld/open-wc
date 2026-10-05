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

  it('should respect package exports for package subpath imports', async () => {
    const fixtureFiles = {
      'node_modules/pkg-with-exports/package.json': JSON.stringify(
        {
          name: 'pkg-with-exports',
          type: 'module',
          exports: {
            './public.js': './public.js',
          },
        },
        null,
        2,
      ),
      'node_modules/pkg-with-exports/public.js': 'export default 1;\n',
      'node_modules/pkg-with-exports/internal.js': 'export default 2;\n',
    };

    const exportedSubpathResults = await lintCode(
      `
        import value from 'pkg-with-exports/public.js';
        console.error(value);
      `,
      'src/import-x-exports-valid.js',
      fixtureFiles,
    );

    assert.ok(
      !hasRuleError(exportedSubpathResults, 'import-x/no-unresolved'),
      'should allow exported package subpaths',
    );

    const nonExportedSubpathResults = await lintCode(
      `
        import value from 'pkg-with-exports/internal.js';
        console.error(value);
      `,
      'src/import-x-exports-invalid.js',
      fixtureFiles,
    );

    assert.ok(
      hasRuleError(nonExportedSubpathResults, 'import-x/no-unresolved'),
      'should flag package subpaths blocked by package exports',
    );
  });
});
