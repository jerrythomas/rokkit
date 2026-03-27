import { describe, it, expect, afterEach } from 'vitest'
import { messages } from '../src/messages.svelte.js'

describe('MessagesStore', () => {
	afterEach(() => messages.reset())

	describe('defaults (en)', () => {
		it('has flat string keys', () => {
			expect(messages.current.emptyList).toBe('No items found')
			expect(messages.current.emptyTree).toBe('No data available')
			expect(messages.current.loading).toBe('Loading...')
			expect(messages.current.noResults).toBe('No results found')
			expect(messages.current.select).toBe('Select an option')
			expect(messages.current.search).toBe('Search...')
		})

		it('has nested component defaults', () => {
			expect(messages.current.list).toEqual({ label: 'List' })
			expect(messages.current.tree).toEqual({
				label: 'Tree',
				expand: 'Expand',
				collapse: 'Collapse',
				loading: 'Loading',
				loadMore: 'Load More'
			})
			expect(messages.current.toolbar).toEqual({ label: 'Toolbar' })
			expect(messages.current.menu).toEqual({ label: 'Menu' })
			expect(messages.current.toggle).toEqual({ label: 'Selection' })
			expect(messages.current.rating).toEqual({ label: 'Rating' })
			expect(messages.current.stepper).toEqual({ label: 'Progress' })
			expect(messages.current.breadcrumbs).toEqual({ label: 'Breadcrumb' })
			expect(messages.current.carousel).toEqual({
				label: 'Carousel',
				prev: 'Previous slide',
				next: 'Next slide',
				slides: 'Slide navigation'
			})
			expect(messages.current.tabs).toEqual({
				add: 'Add tab',
				remove: 'Remove tab',
				placeholder: 'Select a tab to view its content.'
			})
			expect(messages.current.table).toEqual({
				empty: 'No data',
				sortAscending: 'Sort ascending',
				sortDescending: 'Sort descending'
			})
			expect(messages.current.code).toEqual({ copy: 'Copy code', copied: 'Copied!' })
			expect(messages.current.range).toEqual({
				lower: 'Lower bound',
				upper: 'Upper bound',
				value: 'Value'
			})
			expect(messages.current.search_).toEqual({ clear: 'Clear search' })
			expect(messages.current.filter).toEqual({ remove: 'Remove filter' })
			expect(messages.current.floatingNav).toEqual({
				label: 'Page navigation',
				pin: 'Pin navigation',
				unpin: 'Unpin navigation'
			})
			expect(messages.current.mode).toEqual({ system: 'System', light: 'Light', dark: 'Dark' })
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
			expect(messages.current.select).toBe('Option wählen…')
		})

		it('falls back to English for unregistered keys', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			expect(messages.current.emptyList).toBe('No items found')
			expect(messages.current.tree.expand).toBe('Expand')
		})

		it('deep-merges nested objects — unspecified keys survive', () => {
			messages.register('fr', { tree: { expand: 'Ouvrir' } })
			messages.setLocale('fr')
			expect(messages.current.tree.expand).toBe('Ouvrir')
			expect(messages.current.tree.collapse).toBe('Collapse')
			expect(messages.current.tree.label).toBe('Tree')
		})

		it('switching back to "en" restores defaults', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			messages.setLocale('en')
			expect(messages.current.select).toBe('Select an option')
		})

		it('multiple locales can be registered independently', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.register('fr', { select: 'Choisir une option…' })
			messages.setLocale('de')
			expect(messages.current.select).toBe('Option wählen…')
			messages.setLocale('fr')
			expect(messages.current.select).toBe('Choisir une option…')
		})
	})

	describe('set() — convenience / backward compat', () => {
		it('deep-merges nested objects', () => {
			messages.set({ tree: { expand: 'Ouvrir' } })
			expect(messages.current.tree.expand).toBe('Ouvrir')
			expect(messages.current.tree.collapse).toBe('Collapse')
			expect(messages.current.tree.label).toBe('Tree')
		})

		it('overrides flat string keys', () => {
			messages.set({ loading: 'Chargement...' })
			expect(messages.current.loading).toBe('Chargement...')
			expect(messages.current.emptyList).toBe('No items found')
		})

		it('handles mixed flat + nested overrides', () => {
			messages.set({ loading: 'Wait...', carousel: { prev: 'Précédent' } })
			expect(messages.current.loading).toBe('Wait...')
			expect(messages.current.carousel.prev).toBe('Précédent')
			expect(messages.current.carousel.next).toBe('Next slide')
		})
	})

	describe('reset()', () => {
		it('restores all defaults and clears locale', () => {
			messages.register('de', { select: 'Option wählen…' })
			messages.setLocale('de')
			messages.reset()
			expect(messages.locale).toBe('en')
			expect(messages.current.select).toBe('Select an option')
			expect(messages.current.tree.expand).toBe('Expand')
		})
	})
})
