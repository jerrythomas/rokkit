import { groups } from './model'
import { generateMenu } from './menu'

export const menu = generateMenu(groups)
export const options = [
	{ icon: 'i-rokkit:menu', content: 'menu' },
	{ icon: 'i-rokkit:themes', content: 'themes' },
	{ icon: 'i-rokkit:properties', content: 'properties' }
]
