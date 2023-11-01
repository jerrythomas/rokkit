module.exports = {
	extends: ['eslint:recommended', 'prettier', 'plugin:svelte/prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2021,
		allowImportExportEverywhere: false
	},
	env: {
		browser: true,
		es2021: true,
		node: true
	}
}
