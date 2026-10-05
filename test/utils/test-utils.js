import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import oxlintConfig from '../../index.js';

const execFileAsync = promisify(execFile);
const projectRoot = new URL('../..', import.meta.url).pathname;
const oxlintConfigPath = join(projectRoot, 'index.js');
const linter = 'oxlint';

/**
 * Extract the first JSON payload from mixed command output (stdout/stderr).
 * @param {string} text - Text to parse
 * @returns {any|null}
 */
function _extractJsonFromText(text) {
  if (!text) return null;
  const arrayStart = text.indexOf('[');
  const objectStart = text.indexOf('{');
  const start =
    arrayStart === -1
      ? objectStart
      : objectStart === -1
        ? arrayStart
        : Math.min(arrayStart, objectStart);
  if (start === -1) return null;
  try {
    return JSON.parse(text.slice(start));
  } catch {
    return null;
  }
}

/**
 * Convert oxlint's diagnostic code into ESLint-style rule IDs.
 * @param {string} code - Either "plugin(rule)" or plain "rule"
 * @returns {string|null}
 */
function _parseRuleId(code) {
  if (typeof code !== 'string') return null;
  const start = code.indexOf('(');
  const end = code.lastIndexOf(')');
  if (start === -1 || end === -1 || end <= start + 1) {
    return code;
  }
  const plugin = code.slice(0, start);
  const rule = code.slice(start + 1, end);
  return !plugin || !rule ? code : plugin === 'eslint' ? rule : `${plugin}/${rule}`;
}

/**
 * Convert oxlint diagnostics into ESLint-like results grouped by file.
 * @param {any} parsed - Parsed oxlint output object
 * @returns {Array}
 */
function _normalizeOxlintDiagnostics(parsed) {
  const diagnostics = parsed?.diagnostics;
  if (!Array.isArray(diagnostics)) {
    return [];
  }

  const byFile = new Map();
  for (const diag of diagnostics) {
    const lintedPath = diag.filename ?? '<input>';
    const list = byFile.get(lintedPath) ?? [];
    const label = Array.isArray(diag.labels) ? diag.labels[0] : undefined;
    const span = label?.span;

    list.push({
      ruleId: _parseRuleId(diag.code),
      message: diag.message,
      severity: diag.severity === 'error' ? 2 : 1,
      line: span?.line,
      column: span?.column,
    });
    byFile.set(lintedPath, list);
  }

  return [...byFile.entries()].map(([resolvedFilePath, messages]) => ({
    filePath: resolvedFilePath,
    messages,
    errorCount: messages.filter((message) => message.severity === 2).length,
    warningCount: messages.filter((message) => message.severity === 1).length,
  }));
}

async function createTempFile(filePath, code, extraFiles = {}) {
  const id = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const runDir = join(tmpdir(), `${linter}-${id}`);
  const tmpFilePath = join(runDir, filePath);

  const filesToWrite = [[tmpFilePath, code]];
  for (const [relativePath, content] of Object.entries(extraFiles)) {
    filesToWrite.push([join(runDir, relativePath), content]);
  }

  await Promise.all(
    filesToWrite.map(async ([fullPath, content]) => {
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, 'utf8');
    }),
  );

  return { id, runDir, tmpFilePath };
}

/**
 * Lint source code and return normalized diagnostics.
 * @param {string} code - Code to lint
 * @param {string} filePath - File path for context
 * @param {Object<string, string>} extraFiles - Additional files to create in the same temp workspace
 * @returns {Promise<Array>}
 */
export async function lintCode(code, filePath, extraFiles = {}) {
  const { id, runDir, tmpFilePath } = await createTempFile(filePath, code, extraFiles);

  let stdout = '';
  let stderr = '';
  let linkPath;

  try {
    const lintTargetPath = tmpFilePath;

    const lintArgs = [
      '--yes',
      'oxlint',
      '--config',
      oxlintConfigPath,
      '--format',
      'json',
      lintTargetPath,
    ];

    ({ stdout, stderr } = await execFileAsync('npx', lintArgs, { cwd: projectRoot }));
  } catch (error) {
    stdout = error.stdout ?? '';
    stderr = error.stderr ?? '';
  } finally {
    const cleanup = [rm(runDir, { force: true, recursive: true })];
    if (linkPath) {
      cleanup.push(rm(linkPath, { force: true }));
    }
    await Promise.all(cleanup);
  }

  const parsed = _extractJsonFromText(stdout) ?? _extractJsonFromText(stderr) ?? [];
  return _normalizeOxlintDiagnostics(parsed);
}

/**
 * Check whether lint results contain a given rule ID.
 * @param {Array} results - Linting results
 * @param {string} ruleId - Rule ID to match (exact, includes, or startsWith)
 * @param {Object} options - Match options
 * @param {boolean} options.includes - Use includes matching
 * @param {boolean} options.startsWith - Use startsWith matching
 * @returns {boolean}
 */
export function hasRuleError(results, ruleId, options = {}) {
  const { includes = false, startsWith = false } = options;

  return results.some((result) =>
    result.messages.some((msg) => {
      if (includes) {
        return msg.ruleId?.includes(ruleId);
      }
      if (startsWith) {
        return msg.ruleId?.startsWith(ruleId);
      }
      return msg.ruleId === ruleId;
    }),
  );
}

/**
 * Read a setting from the loaded oxlint config.
 * @param {string} key - Setting key
 * @returns {any|null}
 */
export function findSettings(key) {
  return oxlintConfig.settings?.[key] ?? null;
}

export function hasPlugin(name) {
  if ((oxlintConfig.plugins ?? []).includes(name)) {
    return true;
  }
  if ((oxlintConfig.jsPlugins ?? []).includes(`eslint-plugin-${name}`)) {
    return true;
  }
  return Object.keys(oxlintConfig.rules ?? {}).some((ruleId) => ruleId.startsWith(`${name}/`));
}
