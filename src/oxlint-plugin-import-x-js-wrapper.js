import importXPlugin, { createNodeResolver } from 'eslint-plugin-import-x';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

export default wrapPluginForOxlint(importXPlugin);
