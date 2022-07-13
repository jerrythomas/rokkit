import * as icons from './icons'

export function menu() {
	let items = [
		{
			icon: icons.ChartBar,
			label: 'Home',
			target: '/',
			role: 'authenticated'
		},
		{
			icon: icons.ChartBar,
			label: 'Chart',
			target: '/chart',
			role: 'authenticated'
		},
		{
			icon: icons.Beaker,
			label: 'Labs',
			target: '/labs',
			role: 'authenticated'
		},
		{
			icon: icons.Sparkles,
			label: 'Icons',
			target: '/icons',
			role: 'authenticated'
		}
	]
	// if (!session || !admin.includes(session.email)) {
	// 	items = items.filter((item) => item.role !== 'admin')
	// }

	return items
}
