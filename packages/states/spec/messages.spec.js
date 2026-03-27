import { describe, it, expect, afterEach } from 'vitest'
import { messages } from '../src/messages.svelte.js'

describe('MessagesStore', () => {
	afterEach(() => messages.reset())

	describe('defaults (en)', () => {
		it('has flat string keys', () => {
			expect(messages.emptyList).toBe('No items found')
			expect(messages.emptyTree).toBe('No data available')
			expect(messages.loading).toBe('Loading...')
			expect(messages.noResults).toBe('No results found')
			expect(messages.select).toBe('Select an option')
			expect(messages.search).toBe('Search...')
		})

		it('has nested component defaults', () => {
			expect(messages.list).toEqual({ label: 'List' })
			expect(messages.tree).toEqual({
				label: 'Tree',
				expand: 'Expand',
				collapse: 'Collapse',
				loading: 'Loading',
				loadMore: 'Load More'
			})
			expect(messages.toolbar).toEqual({ label: 'Toolbar' })
			expect(messages.menu).toEqual({ label: 'Menu' })
			expect(messages.toggle).toEqual({ label: 'Selection' })
			expect(messages.rating).toEqual({ label: 'Rating' })
			expect(messages.stepper).toEqual({ label: 'Progress' })
			expect(messages.breadcrumbs).toEqual({ label: 'Breadcrumb' })
			expect(messages.carousel).toEqual({
				label: 'Carousel',
				prev: 'Previous slide',
				next: 'Next slide',
				slides: 'Slide navigation'
			})
			expect(messages.tabs).toEqual({
				add: 'Add tab',
				remove: 'Remove tab',
				placeholder: 'Select a tab to view its content.'
			})
			expect(messages.table).toEqual({
				empty: 'No data',
				sortAscending: 'Sort ascending',
				sortDescending: 'Sort descending'
			})
			expect(messages.code).toEqual({ copy: 'Copy code', copied: 'Copied!' })
			expect(messages.range).toEqual({
				lower: 'Lower bound',
				upper: 'Upper bound',
				value: 'Value'
			})
			expect(messages.search_).toEqual({ clear: 'Clear search' })
			expect(messages.filter).toEqual({ remove: 'Remove filter' })
			expect(messages.floatingNav).toEqual({
				label: 'Page navigation',
				pin: 'Pin navigation',
				unpin: 'Unpin navigation'
			})
			expect(messages.mode).toEqual({ system: 'System', light: 'Light', dark: 'Dark' })
		})

		it('locale is "en" by default', () => {
			expect(messages.locale).toBe('en')
		})
	})

	describe('register() + setLocale()', () => {
		it('activates a registered locale', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			expect(messages.locale).toBe('de')
			expect(messages.select).toBe('Option wählen…')
		})

		it('falls back to English for unregistered keys', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			expect(messages.emptyList).toBe('No items found')
			expect(messages.tree.expand).toBe('Expand')
		})

		it('deep-merges nested objects — unspecified keys survive', () => {
			messages.register('fr', { tree: { expand: 'Ouvrir' } })
			messages.setLocale('fr')
			expect(messages.tree.expand).toBe('Ouvrir')
			expect(messages.tree.collapse).toBe('Collapse')
			expect(messages.tree.label).toBe('Tree')
		})

		it('switching back to "en" restores defaults', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			messages.setLocale('en')
			expect(messages.select).toBe('Select an option')
		})

		it('multiple locales can be registered independently', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.register('fr', { select: 'Choisir une option…' })
			messages.setLocale('de')
			expect(messages.select).toBe('Option wählen…')
			messages.setLocale('fr')
			expect(messages.select).toBe('Choisir une option…')
		})
	})

	describe('set() — convenience / backward compat', () => {
		it('deep-merges nested objects', () => {
			messages.set({ tree: { expand: 'Ouvrir' } })
			expect(messages.tree.expand).toBe('Ouvrir')
			expect(messages.tree.collapse).toBe('Collapse')
			expect(messages.tree.label).toBe('Tree')
		})

		it('overrides flat string keys', () => {
			messages.set({ loading: 'Chargement...' })
			expect(messages.loading).toBe('Chargement...')
			expect(messages.emptyList).toBe('No items found')
		})

		it('handles mixed flat + nested overrides', () => {
			messages.set({ loading: 'Wait...', carousel: { prev: 'Précédent' } })
			expect(messages.loading).toBe('Wait...')
			expect(messages.carousel.prev).toBe('Précédent')
			expect(messages.carousel.next).toBe('Next slide')
		})
	})

	describe('reset()', () => {
		it('restores all defaults and clears locale', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			messages.reset()
			expect(messages.locale).toBe('en')
			expect(messages.select).toBe('Select an option')
			expect(messages.tree.expand).toBe('Expand')
		})
	})
})
