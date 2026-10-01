import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Oxlint exposes `context.languageOptions.parser.parse`, but calling it throws
// "not implemented yet". Rules such as import-x/namespace or import-x/default need
// to parse *other* files, so we provide an espree-backed parser instead.
let espree;
try {
  espree = require('espree');
} catch {
  espree = null;
}

const isUsableParser = (parser) => {
  if (!parser) return false;
  const candidate = parser.parseForESLint ?? parser.parse;
  if (typeof candidate !== 'function') return false;
  try {
    candidate.call(parser, '', { ecmaVersion: 'latest', sourceType: 'module' });
    return true;
  } catch {
    return false;
  }
};

const normalizeParserOptions = (parserOptions = {}) => ({
  ...parserOptions,
  ecmaVersion:
    parserOptions.ecmaVersion === undefined || parserOptions.ecmaVersion === null
      ? 'latest'
      : parserOptions.ecmaVersion,
  sourceType: parserOptions.sourceType ?? 'module',
  ecmaFeatures: { ...parserOptions.ecmaFeatures },
  comment: true,
  tokens: true,
  loc: true,
  range: true,
});

const espreeParser = espree && {
  meta: { name: 'espree-oxlint-shim' },
  VisitorKeys: espree.VisitorKeys,
  parse(code, parserOptions) {
    const options = normalizeParserOptions(parserOptions);
    try {
      return espree.parse(code, options);
    } catch (error) {
      // Modern syntax espree cannot handle (e.g. decorators) should not fail the
      // whole lint run; an empty program simply means "no exports detected".
      if (options.sourceType === 'module') {
        return espree.parse('', options);
      }
      throw error;
    }
  },
};

/**
 * Returns a `languageOptions` object that always exposes a working parser,
 * falling back to oxlint's own parser when it is actually implemented.
 */
export const ensureParserLanguageOptions = (languageOptions) => {
  if (!espreeParser) return languageOptions;
  if (isUsableParser(languageOptions?.parser)) return languageOptions;

  return Object.create(languageOptions ?? Object.prototype, {
    parser: { enumerable: true, value: espreeParser },
  });
};
