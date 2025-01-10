export default [
  {
    ignores: [
      '**/spec/error/*.js',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.svelte-kit/',
      '**/build/**',
      'packages/archive',
      'packages/icons/lib'
    ]
  },
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        browser: true,
        es6: true,
        node: true
      }
    },
    rules: {
      complexity: ['warn', 5],
      'max-depth': ['error', 3],
      'max-params': ['warn', 4],
      'no-console': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: 'error',
      'no-eq-null': 'error',
      'no-implicit-coercion': 'error',
      'no-use-before-define': 'error',
      'max-lines-per-function': [
        'warn',
        {
          max: 30,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      'no-return-await': 'error',
      'require-await': 'error'
    },
    files: ['**/*.js']
  },
  {
    files: ['**/*.spec.js', '**/*.spec.svelte.js', '**/spec/mocks/**'],
    rules: {
      'max-lines-per-function': 'off'
    }
  }
]
