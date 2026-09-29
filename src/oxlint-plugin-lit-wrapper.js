import litPlugin from 'eslint-plugin-lit';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

export default wrapPluginForOxlint(litPlugin);
