import litA11yPlugin from 'eslint-plugin-lit-a11y';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

export default wrapPluginForOxlint(litA11yPlugin);
