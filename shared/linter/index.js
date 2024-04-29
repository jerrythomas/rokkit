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
		complexity: ['error', 5],
		'max-depth': ['error', 3],
		'max-params': ['error', 4],
		'no-return-await': 'error',
		eqeqeq: 'error',
		'no-eq-null': 'error',
		'no-implicit-coercion': 'error',
		'max-lines-per-function': [
			'error',
			{
				max: 30,
				skipBlankLines: true,
				skipComments: true
			}
		]
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
