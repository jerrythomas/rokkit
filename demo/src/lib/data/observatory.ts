import type { ObservatoryData } from '$lib/types'

export function loadObservatoryData(): ObservatoryData {
	const today = new Date()
	const dateStr = today.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	})

	return {
		greeting: {
			date: dateStr,
			name: 'Jerry'
		},
		ftr: {
			score: 72,
			trend: [58, 61, 64, 60, 67, 65, 70, 68, 72, 69, 74, 71, 73, 72],
			delta: 4.2,
			period: '14 days'
		},
		koan: {
			kanji: '聴',
			title: 'The assistant guesses your auth.',
			explanation:
				'In 3 of the last 5 sessions on lumen-cloud, the assistant hallucinated authentication middleware that doesn\'t exist. It reaches for Bearer tokens when your stack uses session cookies.',
			impact: 'Teaching this pattern could save ~12 corrections per week.',
			evidence: 'Sessions #1042, #1038, #1035'
		},
		insights: [
			{
				id: 'i1',
				kanji: '型',
				title: 'Pattern recurring: retry-without-backoff',
				body: 'Seen in 4 repos this week. The assistant writes retry loops without exponential backoff. A teaching could prevent this across all projects.',
				tone: 'warn'
			},
			{
				id: 'i2',
				kanji: '直',
				title: 'Teaching adopted: import ordering',
				body: 'The import-ordering rule you taught 3 weeks ago has been applied in 89% of sessions. Zero corrections since adoption.',
				tone: 'good'
			},
			{
				id: 'i3',
				kanji: '流',
				title: 'Drift detected: test file placement',
				body: 'Two projects disagree on test placement (__tests__/ vs colocated). Consider a cross-project teaching.',
				tone: 'mute'
			}
		],
		sessions: [
			{
				id: 's1',
				project: 'lumen-studio',
				title: 'Add export dialog with format picker',
				ftr: true,
				corrections: 0,
				duration: '18m',
				time: '2h ago',
				outcome: 'shipped',
				language: 'TypeScript',
				stack: ['React', 'Zustand']
			},
			{
				id: 's2',
				project: 'lumen-cloud',
				title: 'Fix auth middleware token refresh',
				ftr: false,
				corrections: 3,
				duration: '34m',
				time: '4h ago',
				outcome: 'corrected',
				language: 'TypeScript',
				stack: ['Express', 'Redis']
			},
			{
				id: 's3',
				project: 'brand-kit',
				title: 'Generate SVG sprite from icon set',
				ftr: true,
				corrections: 0,
				duration: '12m',
				time: '5h ago',
				outcome: 'shipped',
				language: 'TypeScript',
				stack: ['Node', 'SVG']
			},
			{
				id: 's4',
				project: 'lumen-studio',
				title: 'Refactor canvas zoom to use wheel events',
				ftr: false,
				corrections: 1,
				duration: '22m',
				time: '1d ago',
				outcome: 'corrected',
				language: 'TypeScript',
				stack: ['React', 'Canvas']
			},
			{
				id: 's5',
				project: 'lumen-cloud',
				title: 'Add rate limiting to public API endpoints',
				ftr: true,
				corrections: 0,
				duration: '15m',
				time: '1d ago',
				outcome: 'shipped',
				language: 'TypeScript',
				stack: ['Express', 'Redis']
			},
			{
				id: 's6',
				project: 'brand-kit',
				title: 'Migrate color tokens to OKLCH',
				ftr: false,
				corrections: 2,
				duration: '28m',
				time: '2d ago',
				outcome: 'corrected',
				language: 'CSS',
				stack: ['PostCSS']
			}
		],
		adoptedTeachings: [
			'Import ordering: external → internal → relative → types',
			'Always use parameterized queries, never string interpolation',
			'Prefer named exports over default exports'
		]
	}
}
