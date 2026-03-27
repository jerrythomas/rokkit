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
      complexity: ['warn', 7],
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
      '**/*.e2e.ts',
      '**/spec/**'
    ],
    rules: {
      'max-lines-per-function': 'off',
      complexity: 'off',
      'max-depth': 'off',
      'max-params': 'off',
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
    // Chart data-processing functions have inherent complexity (D3 rendering algorithms),
    // many required parameters (scales, data, channels, colors, patterns), and long bodies
    // due to the nature of SVG path construction. These rules are relaxed here.
    files: [
      'packages/chart/src/geoms/lib/**',
      'packages/chart/src/lib/brewing/marks/**',
      'packages/chart/src/lib/brewing/bars.svelte.js'
    ],
    rules: {
      'max-params': 'off',
      'max-lines-per-function': 'off',
      complexity: 'off'
    }
  },
  {
    // PlotState, brewer, Plot.svelte, Chart.svelte, geom components, crossfilter, and
    // lib/plot helpers have inherent complexity as chart state managers/renderers.
    files: [
      'packages/chart/src/PlotState.svelte.js',
      'packages/chart/src/lib/brewing/brewer.svelte.js',
      'packages/chart/src/lib/brewing/CartesianBrewer.svelte.js',
      'packages/chart/src/Plot.svelte',
      'packages/chart/src/Chart.svelte',
      'packages/chart/src/AnimatedPlot.svelte',
      'packages/chart/src/crossfilter/createCrossFilter.svelte.js',
      'packages/chart/src/geoms/Arc.svelte',
      'packages/chart/src/geoms/Area.svelte',
      'packages/chart/src/geoms/Bar.svelte',
      'packages/chart/src/geoms/Box.svelte',
      'packages/chart/src/geoms/Line.svelte',
      'packages/chart/src/geoms/Point.svelte',
      'packages/chart/src/geoms/Violin.svelte',
      'packages/chart/src/lib/brewing/scales.js',
      'packages/chart/src/lib/brewing/stats.js',
      'packages/chart/src/lib/chart.js',
      'packages/chart/src/lib/grid.js',
      'packages/chart/src/lib/plot/**',
      'packages/chart/src/patterns/**'
    ],
    rules: {
      complexity: 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-depth': 'off'
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
  },
  {
    files: [
      '**/site/src/routes/components/**',
      '**/site/src/routes/playground/**',
      '**/site/src/routes/(play)/playground/**',
      '**/examples/**',
      '**/stories/**',
      '**/fragments/**'
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
]
