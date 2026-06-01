// Stub for `$app/environment` in vitest — root config doesn't load the
// sveltekit() plugin that supplies this virtual module. Aliased via
// vitest.config.ts so any `import { browser } from '$app/environment'`
// resolves here in tests.
export const browser = false
export const dev = true
export const building = false
export const version = 'test'
