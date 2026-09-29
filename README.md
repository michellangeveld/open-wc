# `oxlint-config-ing`

A Oxlint config for ING frontend projects. The config includes rules that we think are useful when developing ING frontend projects and related applications and libraries.

To use the Oxlint configuration, create an `oxlint.json` file in your project root:

```json
{
  "extends": ["oxlint-config-ing/oxlint.config.js"]
}
```

Or if you prefer to use JavaScript configuration (`oxlint.config.js`):

```js
import oxConfig from 'oxlint-config-ing/oxlint.config.js';

export default {
  extends: [oxConfig],
  rules: {
    // your custom rules
  },
};
```
