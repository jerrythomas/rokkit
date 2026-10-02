// Stub for `$env/dynamic/private` in vitest — the root config doesn't load the
// sveltekit() plugin that supplies this virtual module. Aliased via
// vitest.config.ts; a spec that needs a value `vi.mock`s it.
export const env: Record<string, string | undefined> = {}
