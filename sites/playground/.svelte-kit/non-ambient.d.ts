
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/components" | "/components/code" | "/components/floating-action" | "/components/list" | "/components/menu" | "/components/multi-select" | "/components/palette-manager" | "/components/select" | "/components/toggle" | "/components/toolbar" | "/components/tree";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/components": Record<string, never>;
			"/components/code": Record<string, never>;
			"/components/floating-action": Record<string, never>;
			"/components/list": Record<string, never>;
			"/components/menu": Record<string, never>;
			"/components/multi-select": Record<string, never>;
			"/components/palette-manager": Record<string, never>;
			"/components/select": Record<string, never>;
			"/components/toggle": Record<string, never>;
			"/components/toolbar": Record<string, never>;
			"/components/tree": Record<string, never>
		};
		Pathname(): "/" | "/components" | "/components/" | "/components/code" | "/components/code/" | "/components/floating-action" | "/components/floating-action/" | "/components/list" | "/components/list/" | "/components/menu" | "/components/menu/" | "/components/multi-select" | "/components/multi-select/" | "/components/palette-manager" | "/components/palette-manager/" | "/components/select" | "/components/select/" | "/components/toggle" | "/components/toggle/" | "/components/toolbar" | "/components/toolbar/" | "/components/tree" | "/components/tree/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}