module.exports = {
	extends: ['eslint:recommended', 'prettier', 'plugin:svelte/prettier'],
	// plugins: [],
	// overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
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
