import { groups } from './model'
import { generateMenu } from './menu'

export const menu = generateMenu(groups)
export const options = [
	{ icon: 'i-spice:menu', content: 'menu' },
	{ icon: 'i-spice:themes', content: 'themes' },
	{ icon: 'i-spice:properties', content: 'properties' }
]
