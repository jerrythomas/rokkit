import eslintPluginSvelte from 'eslint-plugin-svelte'
export default [
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    ignores: [
      '**/spec/error/*.js',
      '**/fixtures/error/*.js',
      '**/fixtures/**/invalid.js',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.svelte-kit/',
      '**/build/**',
      '**/.vercel/**',
      'packages/archive',
      'packages/icons/lib',
      '**/app.d.ts'
    ]
  },
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        // Correctly define globals as individual entries
        TouchEvent: 'readonly',
        CustomEvent: 'readonly',
        Touch: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        Event: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __APP_VERSION__: 'readonly'
        // Add any other specific globals you need
      },
      // You can use parserOptions to specify environments
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    // Setting environments in flat config
    linterOptions: {
      reportUnusedDisableDirectives: true
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
      'no-unused-vars': 'error',
      'no-undef': 'error',
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
    files: ['**/*.js', '**/*.ts']
  },
  {
    files: ['**/*.spec.js', '**/*.spec.svelte.js', '**/spec/mocks/**'],
    rules: {
      'max-lines-per-function': 'off'
    }
  }
]
