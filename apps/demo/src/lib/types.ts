// ─── Observatory ────────────────────────────────────────────────────────────

export interface FtrData {
	score: number
	trend: number[]
	delta: number
	period: string
}

export interface Koan {
	kanji: string
	title: string
	explanation: string
	impact: string
	evidence: string
}

export interface Insight {
	id: string
	kanji: string
	title: string
	body: string
	tone: 'warn' | 'good' | 'mute'
}

export interface Session {
	id: string
	project: string
	title: string
	ftr: boolean
	corrections: number
	duration: string
	time: string
	outcome: 'shipped' | 'corrected' | 'abandoned'
	language: string
	stack: string[]
}

export interface ObservatoryData {
	greeting: { date: string; name: string }
	ftr: FtrData
	koan: Koan
	insights: Insight[]
	sessions: Session[]
	adoptedTeachings: string[]
}

// ─── Sessions ───────────────────────────────────────────────────────────────

export interface RetroSection {
	title: string
	kanji: string
	tone: 'good' | 'warn' | 'mute'
	items: string[]
}

export interface SessionsData {
	retro: RetroSection[]
	sessions: Session[]
	filters: {
		projects: string[]
		languages: string[]
		outcomes: string[]
	}
}

// ─── Setup Wizard ───────────────────────────────────────────────────────────

export interface WizardStep {
	id: string
	kanji: string
	label: string
	description: string
	status: 'completed' | 'current' | 'pending'
}

export interface Project {
	id: string
	name: string
	repos: string[]
	role: string
	confirmed: boolean
}

export interface SetupData {
	steps: WizardStep[]
	folders: string[]
	projects: Project[]
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavItem {
	id: string
	kanji: string
	label: string
	href: string
	badge?: string
}

export interface NavGroup {
	label: string
	items: NavItem[]
	collapsed?: boolean
}
