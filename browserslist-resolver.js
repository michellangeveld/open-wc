import browserslistConfigIng from 'browserslist-config-ing';
import browserslist from 'browserslist';

/**
 * Resolve browserslist configuration
 * Attempts to load project-specific browserslist config, falls back to browserslist-config-ing
 * @param {string} projectDir - Project directory to search for browserslist config
 * @returns {Array<string>} Resolved browsers list
 */
export function resolveBrowsersList(projectDir) {
  const defaultBrowsers = () => browserslist(browserslistConfigIng);

  try {
    const config = browserslist.findConfig(projectDir);
    return config?.defaults
      ? browserslist(config.defaults, { path: projectDir })
      : defaultBrowsers();
  } catch {
    return defaultBrowsers();
  }
}
