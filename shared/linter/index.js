module.exports = {
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest',
		allowImportExportEverywhere: false
	},
	env: {
		browser: true,
		es6: true,
		node: true
	},
	ignorePatterns: ['dist'],
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
	overrides: [
		{
			files: ['*.spec.js'],
			rules: {
				'max-lines-per-function': 'off'
			}
		}
	]
}
