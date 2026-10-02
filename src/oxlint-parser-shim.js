import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Oxlint exposes `context.languageOptions.parser.parse`, but currently throws
// "not implemented yet". Some rules (for example import-x/namespace and
// import-x/default) must parse additional files, so we provide an Espree fallback.
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
      // If Espree cannot parse newer syntax (for example decorators), do not fail
      // the full lint run. For module parsing, an empty AST is enough to continue.
      if (options.sourceType === 'module') {
        return espree.parse('', options);
      }
      throw error;
    }
  },
};

/**
 * Ensure `languageOptions.parser` is callable.
 * Use oxlint's parser when available; otherwise inject the Espree fallback.
 */
export const ensureParserLanguageOptions = (languageOptions) => {
  if (!espreeParser) return languageOptions;
  if (isUsableParser(languageOptions?.parser)) return languageOptions;

  return Object.create(languageOptions ?? Object.prototype, {
    parser: { enumerable: true, value: espreeParser },
  });
};
