import eslintPluginSvelte from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        extraFileExtensions: ['.svelte']
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        svelteFeatures: {
          experimentalGenerics: true,
          runes: true
        }
      }
    },
    rules: {
      'prefer-const': 'off'
    }
  },
  {
    ignores: [
      '**/.worktrees/**',
      '**/.claude/**',
      '**/.claire/**',
      'packages/icons/scripts/**',
      '**/spec/error/*.js',
      '**/fixtures/error/*.js',
      '**/fixtures/**/invalid.js',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.svelte-kit/',
      '**/build/**',
      '**/.vercel/**',
      'packages/icons/lib',
      'packages/chart/src/Plot/**',
      '**/app.d.ts',
      '**/_generated/**',
      '**/paraglide/**',
      'site/src/routes/(learn)/customization/icons/fragments/**',
      'site/src/routes/(learn)/elements/list/fragments/01-data-object.js',
      'site/src/routes/(learn)/**/snippets/**'
    ]
  },
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
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
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      complexity: ['warn', 5],
      'max-depth': ['warn', 3],
      'max-params': ['warn', 4],
      'no-console': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: 'error',
      'no-eq-null': 'error',
      'no-implicit-coercion': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['warn', { functions: false }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
      'max-lines-per-function': [
        'warn',
        {
          max: 30,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      'no-return-await': 'error',
      'require-await': 'warn'
    },
    files: ['**/*.js', '**/*.ts', '**/*.svelte']
  },
  {
    files: [
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/*.spec.svelte.js',
      '**/*.spec.svelte.ts',
      '**/*.test.ts',
      '**/*.test.js',
      '**/spec/**'
    ],
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'require-await': 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
    rules: {
      'prefer-const': 'off',
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/require-each-key': 'warn',
      'svelte/no-unused-svelte-ignore': 'warn',
      'svelte/prefer-svelte-reactivity': 'warn',
      'svelte/no-dom-manipulating': 'warn'
    }
  },
  {
    files: [
      '**/site/src/routes/components/**',
      '**/site/src/routes/playground/**',
      '**/examples/**',
      '**/stories/**',
      '**/fragments/**'
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },
  {
    files: ['**/site/src/**'],
    rules: {
      'svelte/no-at-html-tags': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
]
