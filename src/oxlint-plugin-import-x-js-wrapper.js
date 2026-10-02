import importXPlugin, { createNodeResolver } from 'eslint-plugin-import-x';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

const nodeResolver = createNodeResolver();

export default wrapPluginForOxlint(importXPlugin, {
  normalizeEcmaVersionToLatest: true,
  settingsPatch: {
    set: { 'import-x/resolver-next': [nodeResolver] },
    unset: ['import/resolver', 'import-x/resolver'],
  },
});
