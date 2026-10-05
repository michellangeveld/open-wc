import ingSecurityPlugin from 'eslint-plugin-ing-security';
import { wrapPluginForOxlint } from './wrap-plugin-for-oxlint.js';

const defaultLitHtmlSources = ['lit', 'lit-html', 'lit-element', 'ing-web'];

const ensureLitHtmlSources = (context) => {
  const currentSettings = context?.settings ?? {};
  const currentSources = currentSettings.litHtmlSources;
  const mergedSources = Array.isArray(currentSources)
    ? [...new Set([...currentSources, ...defaultLitHtmlSources])]
    : (currentSources ?? defaultLitHtmlSources);

  return Object.create(context, {
    settings: {
      enumerable: true,
      value: {
        ...currentSettings,
        litHtmlSources: mergedSources,
      },
    },
  });
};

const getMemberPropertyName = (member) => {
  if (!member || typeof member !== 'object') return null;
  if (member.type === 'StaticMemberExpression') {
    return member.property?.name ?? null;
  }
  if (member.type === 'ComputedMemberExpression') {
    const propertyValue = member.expression?.value ?? member.property?.value;
    return typeof propertyValue === 'string' ? propertyValue : null;
  }
  if ('computed' in member && member.computed) {
    const propertyValue = member.property?.value;
    return typeof propertyValue === 'string' ? propertyValue : null;
  }
  return member.property?.name ?? null;
};

const withNoInnerHtmlAssignmentFallback = (plugin) => {
  const noInnerHtmlRule = plugin?.rules?.['no-innerhtml'];
  if (!noInnerHtmlRule?.create) return plugin;

  return {
    ...plugin,
    rules: {
      ...plugin.rules,
      'no-innerhtml': {
        ...noInnerHtmlRule,
        create(context) {
          const baseListeners = noInnerHtmlRule.create(context);

          return {
            ...baseListeners,
            AssignmentExpression(node) {
              baseListeners?.AssignmentExpression?.(node);

              const left = node?.left;
              if (
                !left ||
                ![
                  'MemberExpression',
                  'StaticMemberExpression',
                  'ComputedMemberExpression',
                ].includes(left.type)
              ) {
                return;
              }
              if (getMemberPropertyName(left) !== 'innerHTML') return;

              context.report({
                node: left.property ?? left,
                message: 'Do not use innerHTML',
              });
            },
          };
        },
      },
    },
  };
};

const wrappedPlugin = wrapPluginForOxlint(ingSecurityPlugin, {
  transformContext: ensureLitHtmlSources,
});

export default withNoInnerHtmlAssignmentFallback(wrappedPlugin);
