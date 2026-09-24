import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import prettierConfig from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'eslint.config.js', 'storybook-static/**'] },

  // Base JS recommended rules
  js.configs.recommended,

  // Node scripts/configs need Node globals
  {
    files: ['.eslintrc.cjs', 'scripts/**/*.js', '*.config.js', '*.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript-ESLint recommended rules (flat config array)
  ...tsPlugin.configs['flat/recommended'],

  // React Hooks rules (define explicitly to stay independent of config shape changes)
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Project-specific rules for TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'jsx-a11y/no-autofocus': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // The library and the example app pass icons as components, never names.
  //
  // Since 4.0 a string icon name only resolves if the *consumer* registered
  // it, so a name inside a library component renders an empty `<i>` in every
  // app that did not - and it warns in each of them. The 4.0 conversion was a
  // regex over direct literals and missed a ternary
  // (`preIcon={copied ? 'Check' : 'Clipboard'}` in ThemeEditor), which shipped
  // broken. The selectors match a single-word string *anywhere* inside an icon
  // prop, so a conditional cannot slip through again. Multi-word strings are
  // icon-font classes and stay allowed.
  {
    files: ['src/components/**/*.component.tsx', 'dev/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name=/^(icon|preIcon|posIcon|disclaimerIcon)$/] Literal[value=/^[A-Za-z][A-Za-z0-9-]*$/]',
          message:
            'Pass the icon component (import it from lucide-react), not its name - a name only renders if the consuming app registered it.',
        },
        {
          selector:
            'Property[key.name=/^(icon|preIcon|posIcon)$/] > Literal[value=/^[A-Za-z][A-Za-z0-9-]*$/]',
          message:
            'Pass the icon component (import it from lucide-react), not its name - a name only renders if the consuming app registered it.',
        },
      ],
    },
  },

  // Storybook files
  ...storybook.configs['flat/recommended'],

  // Override noisy storybook rules that create churn without improving safety
  {
    files: ['**/*.stories.tsx'],
    rules: {
      'storybook/no-redundant-story-name': 'off',
    },
  },

  // Disable ESLint formatting rules that conflict with Prettier (must stay last)
  prettierConfig,
];
