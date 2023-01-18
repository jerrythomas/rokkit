// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
interface ComponentData {
	icon: string
	category: string
	name: string
	type?: string
	url: string
	component: string
}

declare namespace App {
	// interface Error {}
	// interface Locals {}
	interface PageData {
		menu: ComponentData[]
		current?: ComponentData
	}
	// interface Platform {}
}
