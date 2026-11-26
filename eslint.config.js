import cssModules from '@bhollis/eslint-plugin-css-modules';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import eslintReact from '@eslint-react/eslint-plugin';
import importPlugin from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build', 'node_modules', '**/__generated__/**', 'vite*.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      eslintReact.configs['recommended-type-checked'],
      prettierConfig,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'import-x': importPlugin,
      prettier: prettierPlugin,
      'react-hooks': reactHooks,
      'css-modules': cssModules,
    },
    rules: {
      'css-modules/no-undef-class': 'warn',
      'css-modules/no-unused-class': 'error',
      'object-curly-spacing': ['warn', 'always'],
      'no-trailing-spaces': ['warn'],
      'no-console': ['error'],
      quotes: ['warn', 'single'],
      'jsx-quotes': ['warn', 'prefer-double'],
      curly: ['error'],
      'max-len': ['warn', { code: 150, ignoreUrls: true, ignoreComments: true }],
      'brace-style': ['warn', '1tbs'],
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-use-context': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none',
          caughtErrors: 'all',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index', 'unknown'],
          pathGroups: [{ pattern: './*.scss', group: 'builtin', position: 'before' }],
          alphabetize: { order: 'asc', caseInsensitive: true },
          warnOnUnassignedImports: true,
        },
      ],
      'import-x/newline-after-import': ['warn'],
      'import-x/no-default-export': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-duplicates': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  }
);
