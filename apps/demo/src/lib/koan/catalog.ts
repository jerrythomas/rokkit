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

export const catalog: DemoMeta[] = [themeWizard, tabs, toasts, table, tree, multiSelect, list, form, select, chart, combo, datePicker, stepper]

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
	stepper: '/app/stepper'
}

export function routeFor(id: string): string | null {
	return DEMO_ROUTE[id] ?? null
}
