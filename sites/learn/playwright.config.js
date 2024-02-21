/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(spec)\.[jt]s/,
	use: {
		// All requests we send go to this API endpoint.
		baseURL: 'http://localhost:4173',
		extraHTTPHeaders: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}
	}
}

export default config
