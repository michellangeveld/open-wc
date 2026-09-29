# `eslint-config-ow`

A ESLint and Oxlint config for OneWeb projects. The config includes rules that we think are useful when developing OneWeb and related applications and libraries.

## ESLint Configuration

### Note on flat config

Since version 15.0.0 `eslint-config-ow` has supported a ESLint "Flat Config". This is a new type of config for ESLint which is supported in ESLint 8
and will become the default config format in ESLint 9. We reccomend migrating to the new config format by creating a `eslint.config.js` file and
adding the config there. A example config might look something like this:

```js
import ow from 'eslint-config-ow';
import prettier from 'eslint-plugin-prettier';

export default [
  ...ow,
  {
    ignores: ['**/dist/*'],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
```

Read more about the flat config and how to migrate here:

- https://eslint.org/docs/latest/use/configure/configuration-files-new
- https://eslint.org/docs/latest/use/configure/migration-guide

## Oxlint Configuration

As of version 22.0.0+, `eslint-config-ow` also provides an Oxlint configuration aligned with the ESLint rules where Oxlint has feature parity.

To use the Oxlint configuration, create an `oxlint.json` file in your project root:

```json
{
  "extends": ["eslint-config-ow/oxlint.config.js"]
}
```

Or if you prefer to use JavaScript configuration (`oxlint.config.js`):

```js
import oxConfig from 'eslint-config-ow/oxlint.config.js';

export default {
  extends: [oxConfig],
  rules: {
    // your custom rules
  },
};
```

The Oxlint configuration is the closest equivalent to the ESLint configuration; ESLint-only plugin rules are intentionally omitted.
