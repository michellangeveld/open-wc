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

## Benefits of oxlint

- Much faster than ESLint, especially on large codebases.
- Written in Rust instead of JavaScript.
- Can lint thousands of files in a fraction of the time ESLint needs.
- Lower memory usage.

## Performance test results

| Project               | ESLint avg (s) | Oxlint avg (s) | Time reduction | % speed increase |
| --------------------- | -------------: | -------------: | -------------: | ---------------: |
| ing-feat-example      |          1.812 |          1.420 |         21.63% |           27.61% |
| ing-app-daily-banking |          6.360 |          2.840 |         55.35% |          123.94% |
