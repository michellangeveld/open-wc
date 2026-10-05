import ingSecurityPlugin from 'eslint-plugin-ing-security';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

export default wrapPluginForOxlint(ingSecurityPlugin);
