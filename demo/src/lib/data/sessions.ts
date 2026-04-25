import type { SessionsData } from '$lib/types'

export function loadSessionsData(): SessionsData {
	return {
		retro: [
			{
				title: 'Going well',
				kanji: '善',
				tone: 'good',
				items: [
					'FTR streak: lumen-studio at 80% this week (up from 65%)',
					'brand-kit sessions average 14 minutes — shortest across all projects',
					'Import ordering teaching: zero corrections in 3 weeks'
				]
			},
			{
				title: 'Not going well',
				kanji: '課',
				tone: 'warn',
				items: [
					'lumen-cloud auth: 3 corrections per session average',
					'Abandoned sessions up 15% — mostly long refactors',
					'Test file placement inconsistent across 2 projects'
				]
			},
			{
				title: 'Insights',
				kanji: '察',
				tone: 'mute',
				items: [
					'Rust + auth is your hardest combination (lowest FTR)',
					'Morning sessions (before 11am) are 2x more likely first-try-right',
					'Sessions over 30 minutes have 60% correction rate'
				]
			}
		],
		sessions: [
			{
				id: 's1', project: 'lumen-studio', title: 'Add export dialog with format picker',
				ftr: true, corrections: 0, duration: '18m', time: '2h ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['React', 'Zustand']
			},
			{
				id: 's2', project: 'lumen-cloud', title: 'Fix auth middleware token refresh',
				ftr: false, corrections: 3, duration: '34m', time: '4h ago',
				outcome: 'corrected', language: 'TypeScript', stack: ['Express', 'Redis']
			},
			{
				id: 's3', project: 'brand-kit', title: 'Generate SVG sprite from icon set',
				ftr: true, corrections: 0, duration: '12m', time: '5h ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['Node', 'SVG']
			},
			{
				id: 's4', project: 'lumen-studio', title: 'Refactor canvas zoom to use wheel events',
				ftr: false, corrections: 1, duration: '22m', time: '1d ago',
				outcome: 'corrected', language: 'TypeScript', stack: ['React', 'Canvas']
			},
			{
				id: 's5', project: 'lumen-cloud', title: 'Add rate limiting to public API endpoints',
				ftr: true, corrections: 0, duration: '15m', time: '1d ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['Express', 'Redis']
			},
			{
				id: 's6', project: 'brand-kit', title: 'Migrate color tokens to OKLCH',
				ftr: false, corrections: 2, duration: '28m', time: '2d ago',
				outcome: 'corrected', language: 'CSS', stack: ['PostCSS']
			},
			{
				id: 's7', project: 'lumen-studio', title: 'Add keyboard shortcuts to tool palette',
				ftr: true, corrections: 0, duration: '20m', time: '2d ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['React']
			},
			{
				id: 's8', project: 'lumen-cloud', title: 'Implement webhook retry with backoff',
				ftr: false, corrections: 4, duration: '42m', time: '3d ago',
				outcome: 'abandoned', language: 'TypeScript', stack: ['Express', 'BullMQ']
			},
			{
				id: 's9', project: 'brand-kit', title: 'Build color contrast checker component',
				ftr: true, corrections: 0, duration: '16m', time: '3d ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['Svelte']
			},
			{
				id: 's10', project: 'lumen-studio', title: 'Fix layer reorder drag-and-drop',
				ftr: false, corrections: 2, duration: '38m', time: '4d ago',
				outcome: 'corrected', language: 'TypeScript', stack: ['React', 'DnD']
			}
		],
		filters: {
			projects: ['lumen-studio', 'lumen-cloud', 'brand-kit'],
			languages: ['TypeScript', 'CSS', 'Rust'],
			outcomes: ['shipped', 'corrected', 'abandoned']
		}
	}
}
