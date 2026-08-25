import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';

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

  // Storybook files
  ...storybook.configs['flat/recommended'],

  // Override noisy storybook rules that create churn without improving safety
  {
    files: ['**/*.stories.tsx'],
    rules: {
      'storybook/no-redundant-story-name': 'off',
    },
  },
];
