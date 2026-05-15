// demo/src/lib/koan/types.ts
import type { Component } from 'svelte'

export type DemoCategory = 'theme' | 'navigation' | 'feedback' | 'forms' | 'data'

export type DemoMeta = {
	id: string
	title: string
	description: string
	keywords: string[]
	category: DemoCategory
	icon: string
	load: () => Promise<{ default: Component }>
	preview?: () => Promise<{ default: Component }>
}

export type TimelineEntry = {
	demoId: string
	mountedAt: string
	query: string
}

export type UserMessage = {
	kind: 'user'
	id: string
	query: string
	timestamp: string
}

export type ResponseMessage = {
	kind: 'response'
	id: string
	query: string
	matches: string[] // demo ids
	copy: string // "I have a Theme Builder you can try." or "Here are a few options."
	timestamp: string
}

export type ConversationMessage = UserMessage | ResponseMessage

export type WizardMode = 'light' | 'dark' | 'auto'
export type WizardDensity = 'compact' | 'comfortable' | 'cozy'
export type WizardRoundedness = 'sharp' | 'soft' | 'rounded' | 'pill'
export type WizardStyle = 'zen-sumi' | 'rokkit' | 'minimal' | 'material' | 'frosted'

export type WizardState = {
	preset: string
	style: WizardStyle
	mode: WizardMode
	density: WizardDensity
	roundedness: WizardRoundedness
	name: string
}

export type SavedTheme = WizardState & {
	id: string
	createdAt: string
	updatedAt: string
}
