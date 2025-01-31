// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
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

interface AppInfo {
	name: string
	version: string
	about: string
}
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			app: AppInfo
			sections: Sections[]
			menu?: ComponentMenu[]
			examples?: Sample[]
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
