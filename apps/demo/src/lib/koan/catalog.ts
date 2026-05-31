import MiniSearch from 'minisearch'
import type { DemoMeta } from './types'

import themeWizard from './demos/theme-wizard/meta'
import tabs from './demos/tabs/meta'
import toasts from './demos/toasts/meta'
import table from './demos/table/meta'
import tree from './demos/tree/meta'
import multiSelect from './demos/multi-select/meta'
import list from './demos/list/meta'
import form from './demos/form/meta'
import select from './demos/select/meta'
import chart from './demos/chart/meta'
import combo from './demos/combo/meta'
import datePicker from './demos/date-picker/meta'
import stepper from './demos/stepper/meta'
import button from './demos/button/meta'
import badge from './demos/badge/meta'
import pill from './demos/pill/meta'
import avatar from './demos/avatar/meta'
import divider from './demos/divider/meta'
import message from './demos/message/meta'
import swatch from './demos/swatch/meta'
import range from './demos/range/meta'
import rating from './demos/rating/meta'
import switchDemo from './demos/switch/meta'
import toggle from './demos/toggle/meta'
import breadcrumbs from './demos/breadcrumbs/meta'
import menu from './demos/menu/meta'
import toolbar from './demos/toolbar/meta'
import floatingAction from './demos/floating-action/meta'
import floatingNavigation from './demos/floating-navigation/meta'

export const catalog: DemoMeta[] = [
	themeWizard, tabs, toasts, table, tree, multiSelect, list, form, select,
	chart, combo, datePicker, stepper, button,
	badge, pill, avatar, divider, message, swatch,
	range, rating, switchDemo, toggle,
	breadcrumbs, menu, toolbar, floatingAction, floatingNavigation
]

export const miniIndex = new MiniSearch<DemoMeta>({
	fields: ['title', 'keywords', 'description'],
	storeFields: ['id', 'title', 'description', 'category', 'icon'],
	searchOptions: {
		boost: { title: 3, keywords: 2, description: 1 },
		fuzzy: 0.2,
		prefix: true
	},
	extractField: (doc, field) => {
		if (field === 'keywords') return doc.keywords.join(' ')
		return (doc as unknown as Record<string, string>)[field] ?? ''
	}
})

miniIndex.addAll(catalog)

export function findById(id: string): DemoMeta | undefined {
	return catalog.find((d) => d.id === id)
}

/**
 * Stable route for a catalog demo. Most demo ids match their URL
 * segment, but a few diverge (multi-select → multiselect, theme-wizard
 * → theming, date-picker → date). Single source of truth for both the
 * catalog grid and the shell layout's pickDemoKind flow.
 */
export const DEMO_ROUTE: Record<string, string> = {
	tabs: '/app/tabs',
	'theme-wizard': '/app/theming',
	table: '/app/table',
	tree: '/app/tree',
	'multi-select': '/app/multiselect',
	list: '/app/list',
	toasts: '/app/toasts',
	form: '/app/form',
	select: '/app/select',
	chart: '/app/chart',
	combo: '/app/combo',
	'date-picker': '/app/date',
	stepper: '/app/stepper',
	button: '/app/button',
	badge: '/app/badge',
	pill: '/app/pill',
	avatar: '/app/avatar',
	divider: '/app/divider',
	message: '/app/message',
	swatch: '/app/swatch',
	range: '/app/range',
	rating: '/app/rating',
	switch: '/app/switch',
	toggle: '/app/toggle',
	breadcrumbs: '/app/breadcrumbs',
	menu: '/app/menu',
	toolbar: '/app/toolbar',
	'floating-action': '/app/floating-action',
	'floating-navigation': '/app/floating-navigation'
}

export function routeFor(id: string): string | null {
	return DEMO_ROUTE[id] ?? null
}
