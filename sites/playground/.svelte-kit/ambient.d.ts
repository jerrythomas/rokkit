
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NVM_INC: string;
	export const SPACESHIP_VERSION: string;
	export const TERM_PROGRAM: string;
	export const LC_MONETARY: string;
	export const NODE: string;
	export const NVM_CD_FLAGS: string;
	export const TERM: string;
	export const SHELL: string;
	export const SAVEHIST: string;
	export const HISTSIZE: string;
	export const TMPDIR: string;
	export const HOMEBREW_REPOSITORY: string;
	export const TERM_PROGRAM_VERSION: string;
	export const WINDOWID: string;
	export const LC_NUMERIC: string;
	export const npm_config_local_prefix: string;
	export const PNPM_HOME: string;
	export const LC_ALL: string;
	export const GIT_EDITOR: string;
	export const USER: string;
	export const NVM_DIR: string;
	export const COMMAND_MODE: string;
	export const SSH_AUTH_SOCK: string;
	export const Q_SET_PARENT_CHECK: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_execpath: string;
	export const SPACESHIP_CONFIG: string;
	export const ZED_ENVIRONMENT: string;
	export const PATH: string;
	export const LC_MESSAGES: string;
	export const npm_package_json: string;
	export const _: string;
	export const __CFBundleIdentifier: string;
	export const SHELL_PID: string;
	export const LC_COLLATE: string;
	export const npm_command: string;
	export const TTY: string;
	export const PWD: string;
	export const npm_lifecycle_event: string;
	export const EDITOR: string;
	export const npm_package_name: string;
	export const LANG: string;
	export const XPC_FLAGS: string;
	export const npm_package_version: string;
	export const XPC_SERVICE_NAME: string;
	export const SPACESHIP_ROOT: string;
	export const SHLVL: string;
	export const HOME: string;
	export const QLTY_INSTALL: string;
	export const GOROOT: string;
	export const HOMEBREW_PREFIX: string;
	export const LOGNAME: string;
	export const npm_lifecycle_script: string;
	export const ALACRITTY_WINDOW_ID: string;
	export const LC_CTYPE: string;
	export const ZED_TERM: string;
	export const NVM_BIN: string;
	export const GOPATH: string;
	export const npm_config_user_agent: string;
	export const INFOPATH: string;
	export const HOMEBREW_CELLAR: string;
	export const Q_TERM: string;
	export const QTERM_SESSION_ID: string;
	export const OSLogRateLimit: string;
	export const LC_TIME: string;
	export const HISTFILE: string;
	export const npm_node_execpath: string;
	export const COLORTERM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		NVM_INC: string;
		SPACESHIP_VERSION: string;
		TERM_PROGRAM: string;
		LC_MONETARY: string;
		NODE: string;
		NVM_CD_FLAGS: string;
		TERM: string;
		SHELL: string;
		SAVEHIST: string;
		HISTSIZE: string;
		TMPDIR: string;
		HOMEBREW_REPOSITORY: string;
		TERM_PROGRAM_VERSION: string;
		WINDOWID: string;
		LC_NUMERIC: string;
		npm_config_local_prefix: string;
		PNPM_HOME: string;
		LC_ALL: string;
		GIT_EDITOR: string;
		USER: string;
		NVM_DIR: string;
		COMMAND_MODE: string;
		SSH_AUTH_SOCK: string;
		Q_SET_PARENT_CHECK: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_execpath: string;
		SPACESHIP_CONFIG: string;
		ZED_ENVIRONMENT: string;
		PATH: string;
		LC_MESSAGES: string;
		npm_package_json: string;
		_: string;
		__CFBundleIdentifier: string;
		SHELL_PID: string;
		LC_COLLATE: string;
		npm_command: string;
		TTY: string;
		PWD: string;
		npm_lifecycle_event: string;
		EDITOR: string;
		npm_package_name: string;
		LANG: string;
		XPC_FLAGS: string;
		npm_package_version: string;
		XPC_SERVICE_NAME: string;
		SPACESHIP_ROOT: string;
		SHLVL: string;
		HOME: string;
		QLTY_INSTALL: string;
		GOROOT: string;
		HOMEBREW_PREFIX: string;
		LOGNAME: string;
		npm_lifecycle_script: string;
		ALACRITTY_WINDOW_ID: string;
		LC_CTYPE: string;
		ZED_TERM: string;
		NVM_BIN: string;
		GOPATH: string;
		npm_config_user_agent: string;
		INFOPATH: string;
		HOMEBREW_CELLAR: string;
		Q_TERM: string;
		QTERM_SESSION_ID: string;
		OSLogRateLimit: string;
		LC_TIME: string;
		HISTFILE: string;
		npm_node_execpath: string;
		COLORTERM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
