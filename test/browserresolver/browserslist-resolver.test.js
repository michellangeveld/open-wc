import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveBrowsersList } from '../../browserslist-resolver.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

describe('resolveBrowsersList', () => {
  const fixtures = {
    'with-custom-browserslist': { expectedBrowsers: 4 },
    'with-browserslistrc': { expectedBrowsers: 1 },
    'with-extends': { expectedBrowsers: 78 },
    fallback: { expectedBrowsers: 78 },
  };

  for (const [dirName, config] of Object.entries(fixtures)) {
    it(`should resolve browsers ${dirName}`, () => {
      const fixtureDir = path.join(fixturesDir, dirName);
      const originalCwd = process.cwd();

      try {
        process.chdir(fixtureDir);
        const result = resolveBrowsersList(process.cwd());

        assert.ok(Array.isArray(result), 'should return array');
        assert.ok(result.length > 0, 'should have at least one browser');

        assert.strictEqual(
          result.length,
          config.expectedBrowsers,
          `expected exactly ${config.expectedBrowsers} browser(s), got ${result.length}`,
        );

        assert.ok(
          result.every((entry) => typeof entry === 'string'),
          'all entries should be strings',
        );
      } finally {
        // Restore the previous working directory after each fixture run.
        process.chdir(originalCwd);
      }
    });
  }
});
