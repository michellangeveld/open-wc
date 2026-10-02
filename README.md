# `oxlint-config-ing`

A Oxlint config for ING frontend projects. The config includes rules that we think are useful when developing ING frontend projects and related applications and libraries.

You can use this project as follows:
```js
import oxlintConfig from 'oxlint-config-ing';

export default {
  ...oxlintConfig,
  ignorePatterns: ['**/.husky/**'],
  overrides: [
    {
      files: ['stories/**/*'],
      rules: {
        'ow/no-custom-elements-define': 'off',
      },
    },
  ],
};
```
