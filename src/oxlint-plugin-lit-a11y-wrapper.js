import litA11yPlugin from 'eslint-plugin-lit-a11y';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

const defaultLitHtmlSources = ['lit', 'lit-html', 'lit-element', 'ing-web'];

const ensureLitHtmlSources = (context) => {
  const currentSettings = context?.settings ?? {};
  const currentSources = currentSettings.litHtmlSources;
  const mergedSources = Array.isArray(currentSources)
    ? [...new Set([...currentSources, ...defaultLitHtmlSources])]
    : currentSources ?? defaultLitHtmlSources;

  return Object.create(context, {
    settings: {
      enumerable: true,
      value: {
        ...currentSettings,
        litHtmlSources: mergedSources,
      },
    },
  });
};

export default wrapPluginForOxlint(litA11yPlugin, {
  transformContext: ensureLitHtmlSources,
});
