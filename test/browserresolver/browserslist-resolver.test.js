import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveBrowsersList } from '../../browserslist-resolver.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import browserslistConfigIng from 'browserslist-config-ing';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');
const defaultBrowsers = browserslist(browserslistConfigIng);

describe('resolveBrowsersList', () => {
  const fixtures = {
    'with-custom-browserslist': {
      expectedBrowsers: (fixtureDir) =>
        browserslist(['last 2 chrome versions', 'last 2 firefox versions'], {
          path: fixtureDir,
        }),
    },
    'with-browserslistrc': {
      expectedBrowsers: (fixtureDir) =>
        browserslist(['last 1 chrome versions'], { path: fixtureDir }),
    },
    'with-extends': { expectedBrowsers: () => defaultBrowsers },
    fallback: { expectedBrowsers: () => defaultBrowsers },
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

        const expectedBrowsers = config.expectedBrowsers(fixtureDir);
        assert.deepStrictEqual(result, expectedBrowsers);

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
