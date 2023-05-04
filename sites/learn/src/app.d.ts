// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import { type Sample } from '$lib/types'

interface ComponentData {
	icon: string
	category: string
	name: string
	type?: string
	url: string
	component: string
}
interface ComponentMenu {
	name: string
	id: string
	data: ComponentData[]
}

interface Sections {
	slug: string
	title: string
}
declare namespace App {
	// interface Error {}
	// interface Locals {}
	interface PageData {
		sections: Sections[]
		menu?: ComponentMenu[]
		examples?: Sample[]
	}
	// interface Platform {}
}
