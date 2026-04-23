import prettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import typescriptEslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', '**/out/**'],
  },
  {
    files: ['**/*.ts', '**/*.mjs'],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      unicorn: unicorn,
    },

    languageOptions: {
      parser: typescriptEslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      ...unicorn.configs.recommended.rules,

      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',

      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      curly: 'off',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
      semi: 'warn',
    },
  },
  prettier,
];
