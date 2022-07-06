// import * as icons from './icons'

export function menu() {
	let items = [
		{
			// icon: icons.Vikalp,
			label: 'Home',
			target: '/',
			role: 'authenticated'
		},
		{
			// icon: icons.Academics,
			label: 'Chart',
			target: '/chart',
			role: 'authenticated'
		},
		{
			// icon: icons.Certificate,
			label: 'Labs',
			target: '/labs',
			role: 'authenticated'
		}
	]
	// if (!session || !admin.includes(session.email)) {
	// 	items = items.filter((item) => item.role !== 'admin')
	// }

	return items
}
