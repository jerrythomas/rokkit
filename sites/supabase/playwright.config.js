import { devices } from '@playwright/test'

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	testMatch: /e2e\/.*\.spec\.js/,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	use: {
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run build && npm run preview',
		port: 3000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] }
		// },
		// {
		// 	name: 'webkit',
		// 	use: { ...devices['Desktop Safari'] }
		// }
	]
}

export default config
