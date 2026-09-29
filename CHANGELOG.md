# eslint-config-ow

## 22.0.0 (2026-07-23)

- Add Oxlint configuration support (`oxlint.config.js` and `oxlint.json`)
- Added exports for both eslint and oxlint
- Run unit tests for both

## 21.0.1 (2026-07-14)

- Fixed bug: browerslist-resolver.js is not published

## 21.0.0 (2026-07-14)

- Use `browserslist` from `package.json` or `eslint-config-ow` when not available
- Version bump of `eslint-plugin-chai-friendly` from `1.2.0` to `1.2.1`
- Version bump of `eslint` from `10.4.1` to `10.7.0`

## 20.2.0 (2026-03-31)

- Add support for eslint@10

## 20.1.0 (2026-04-16)

- Take .gitignore configuration into account as ignored files for linting
- Version bump of `eslint-plugin-ow` from `4.3.0` to `4.3.1`
- Version bump of `eslint` from `9.28.0`to`9.39.4`

## 20.0.0 (2026-04-14)

- Made eslint 9 default
- Activated some rules from eslint that were used in the past when `eslint-config-airbnb` was still used
- Version bump of `eslint-config-prettier` from `10.15.0` to `10.18.0`
- Version bump of `eslint-plugin-compat` from `6.2.1` to `7.0.1`

## 19.0.3 (2026-04-13)

- Add tests
- Version bump of `caniuse-lite` from `1.0.30001721` to `1.0.30001787`
- Version bump of `eslint-plugin-compat` from `6.0.1` to `6.2.1`
- Version bump of `eslint-plugin-chai-friendly` from `1.0.1` to `1.2.0`
- Format files with prettier

## 19.0.2 (2025-12-08)

- Replaced global templates repo with new repo

## 19.0.1 (2025-10-29)

- Updated `browserslist-config-ing`

## 19.0.0 (2025-06-05)

- Update dependencies, update dependencies to flatconfig variants so we no longer need the compat layer, dramatically reduce transitive dependencies

## 18.0.2 (2025-06-05)

- Updated `browserslist-config-ing`

## 18.0.1 (2024-10-22)

- Fix configuration for `eslint-plugin-compat`

## 18.0.0 (2024-10-22)

- Version bump of `eslint/eslintrc` from `3.0.1` to `3.1.0`
- Version bump of `eslint-plugin-compat` from `4.2.0` to `6.0.1`
- Version bump of `eslint-plugin-ow` from `4.0.2` to `4.0.4`
- Removed `eslint-plugin-unicorn` since it was not used

## 17.1.3 (2024-10-22)

- enforce ecmaVersion: 2024 for `eslint-plugin-escompat`
- Version bump of `eslint-plugin-ing-security"` from `1.0.0` to `1.0.1`

## 17.1.2 (2024-10-22)

- Version bump of `eslint-plugin-escompat` from `3.9.0` to `3.11.3`
- Version bump of `eslint-plugin-chai-friendly` from `0.7.2` to `1.0.1`

## 17.1.1 (2024-10-15)

- Revert previous change

## 17.1.0 (2024-10-15)

- Version bump `eslint-plugin-chai-friendly`, `eslint-plugin-compat`, `eslint-plugin-escompat`
- Removed `eslint-plugin-unicorn` since it was not active and not giving useful errors

## 17.0.1 (2024-08-20)

- Fix `eslint-plugin-escompat` to version `3.9.0`. `3.10.0` and higher use `ecmaVersion` 2025, which is only available in eslint 9.x. Migration to eslint 9.x is not possible as `eslint-plugin-import` is not compatible yet.

## 17.0.0 (2024-07-25)

- Update to latest `eslint-plugin-ow`. This will enable the `ow/no-custom-element-define` rule.

## 16.0.2 (2024-04-23)

- Add ing-web 4 `html` import to `litHtmlSources`

## 16.0.1 (2024-04-11)

- update `eslint-plugin-ow` which includes a fix for Windows

## 16.0.0 (2024-02-16)

Version 16 introduces some significant changes and improvements to eslint-config-ow. We've updated our dependencies to ensure we're using the latest versions, which has resulted in some breaking changes that may impact your project. Specifically, we've updated `browserslist-config-ing`, which changes the browser support matrix. This means that some older browsers may no longer be supported, and you may need to update your configuration accordingly.

- update dependencies

## 15.0.2 (2024-01-16)

- Update to latest `eslint-plugin-ow`

## 15.0.1 (2024-01-10)

- Extend the recommended config for `eslint-plugin-chai-friendly`.

## 15.0.0 (2024-01-02)

Version 15 of the One Web ESLint config converts the config to a "flat" config. This type of config will be the default format of configurations in the next major version of ESLint. You will need to convert your projects ESLint config to a flat config as well to use this version of `eslint-config-ow`.

See https://eslint.org/docs/latest/use/configure/configuration-files-new

- update depenendecies
- Convert config to a flat format

## 14.0.0 (2023-10-12)

- Remove bower functionality from config.

## 13.0.0 (2023-08-29)

- Update dependencies
- Enable `unicorn/custom-error-definition` rule

## 12.0.1 (2023-07-20)

- Update dependencies.

## 12.0.0 (2023-06-30)

- Update `eslint-plugin-lit-a11y` to v4 which includes a bunch more a11y rules based on Deque linter

## 11.0.2 (2023-06-19)

- Fix `eslint-plugin-lit-a11y` `litHtmlSources` configuration for ing-web v3

## 11.0.1 (2023-05-01)

- Remove `parserOptions` section.

## 11.0.0 (2023-04-28)

- Lint for browser compatibility issues.

## 10.1.1 (2023-03-03)

- Move to squad Web Foundation (P20594)

## 10.1.0 (2023-01-22)

- Update to `@open-wc/eslint-config` 9.2.2
  - Support import assertion syntax
  - The parser options are now set in the open-wc config, so we don't have to have them here anymore

## 10.0.1 (2023-01-12)

- Remove legacy `LionLitElement` lifecycle hooks

## 10.0.0 (2023-01-11)

- Update `eslint-plugin-ow` to 2.0.0
  - adds `simplify-getters` rule, this rule includes a fixer that automatically changes all your `static get properties () {}` to `static properties = {}`. Static class fields that are supported: `styles`, `scopedElements`, `localizeNamespaces`, `properties`
  - adds `a11y-test` rule, to avoid incorrect usage of automated accessibility testing
- update `@open-wc/eslint-config` to 9.2.0
  - adds `lit/no-native-attributes` which prevents global native attributes (like `title`, `role`, `id`, etc) to be used as lit properties because they may have unintended side effects (like causing an incorrect a11y tree)

## 9.0.0 (2023-01-02)

- Update @open-wc/eslint-config to v9
- Added eslint-plugin-import-exports-imports-resolver to correctly resolve imports for eslint-plugin-import
  - Supports package exports
  - Supports package imports

## 8.0.1 (2022-09-19)

- Fix Web Marketplace registration

## 8.0.0 (2022-08-11)

- Added eslint-plugin-ow, disallowing bare ing-web imports, e.g.: `import { html } from 'ing-web';`, the import specifier should be `'ing-web/core'`

## 7.0.0 (2022-08-02)

- Update @open-wc/eslint-config to v8

## 6.0.1 (2022-04-14)

- Enable ing-security plugin

## 6.0.0 (2022-04-13)

- Removed babel parser
- Removed default resolver for ing-web-v1 alias
- Updated ecmaVersion parser option to latest to allow static class properties
- Added npmignore for pipeline templates
- Updated touchpoint onboarding file

## 5.2.1 (2022-04-12)

- Fix `ing-security` plugin

## 5.2.0 (2022-04-12)

- Added `ing-security` linter

## 5.1.4 (2022-03-29)

- Fixed bug in resolver

## 5.1.3 (2022-02-28)

- Added custom resolver to correctly respect export maps for eslint-plugin-import

## 5.1.2 (2021-12-08)

- Removed unused dependency

## 5.1.1 (2021-10-29)

- Release to end-up -in the central feed

## 5.1.0 (2021-06-25)

- Use babel parser

## 5.0.0 (2021-03-17)

- Update `eslint-config-ing` to ^5.0.0
- Update `eslint-config-prettier` to ^8.1.0
- Update `eslint-plugin-chai-friendly` to ^0.6.0
- Fix duplicate declaration of the settings property

## 4.1.0 (2021-06-03)

- Release in ADO

## 4.0.1 (2020-23-11)

- Add settings to allow `ing-web` as valid lit-html source for `eslint-plugin-lit-a11y`

## 4.0.0 (2020-23-11)

- Update `@open-wc/eslint-config` to ^4.0.0 which includes `eslint-plugin-lit-a11y`

## 3.0.0 (2020-08-17)

- Update `@open-wc/eslint-config` to ^3.0.0
- Add `eslint-config-ing` as dependency to satisfy pipeline
- Add default `ignorePatterns`

## 2.1.0 (2020-03-06)

- Update `@open-wc/eslint-config` to ^2.0.0

## 1.1.0 (2019-04-10)

- Add `createRenderRoot` function

## 1.0.0 (2019-03-29)

- First release
