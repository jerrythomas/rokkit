/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 3000
	}
}

export default config
