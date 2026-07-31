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

  // TypeScript-ESLint recommended rules (flat config array)
  ...tsPlugin.configs['flat/recommended'],

  // React Hooks rules (flat config object)
  reactHooks.configs.flat,

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
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Storybook files
  ...storybook.configs['flat/recommended'],
];
