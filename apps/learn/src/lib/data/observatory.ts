import type { ObservatoryData } from '$lib/types'
import { m } from '$lib/paraglide/messages.js'
import { getLocale } from '$lib/paraglide/runtime.js'

const LOCALE_MAP: Record<string, string> = { en: 'en-US', es: 'es-ES', ar: 'ar-SA' }

// eslint-disable-next-line max-lines-per-function
export function loadObservatoryData(): ObservatoryData {
	const locale = getLocale()
	const dateLocale = LOCALE_MAP[locale] ?? 'en-US'
	const today = new Date()
	const dateStr = today.toLocaleDateString(dateLocale, {
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
			title: m.obs_koan_title(),
			explanation: m.obs_koan_body(),
			impact: m.obs_koan_impact(),
			evidence: m.obs_koan_evidence()
		},
		insights: [
			{
				id: 'i1',
				kanji: '型',
				title: m.obs_insight_1_title(),
				body: m.obs_insight_1_body(),
				tone: 'warn'
			},
			{
				id: 'i2',
				kanji: '直',
				title: m.obs_insight_2_title(),
				body: m.obs_insight_2_body(),
				tone: 'good'
			},
			{
				id: 'i3',
				kanji: '流',
				title: m.obs_insight_3_title(),
				body: m.obs_insight_3_body(),
				tone: 'mute'
			}
		],
		sessions: [
			{
				id: 's1', project: 'lumen-studio', title: m.obs_session_1(),
				ftr: true, corrections: 0, duration: '18m', time: '2h ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['React', 'Zustand']
			},
			{
				id: 's2', project: 'lumen-cloud', title: m.obs_session_2(),
				ftr: false, corrections: 3, duration: '34m', time: '4h ago',
				outcome: 'corrected', language: 'TypeScript', stack: ['Express', 'Redis']
			},
			{
				id: 's3', project: 'brand-kit', title: m.obs_session_3(),
				ftr: true, corrections: 0, duration: '12m', time: '5h ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['Node', 'SVG']
			},
			{
				id: 's4', project: 'lumen-studio', title: m.obs_session_4(),
				ftr: false, corrections: 1, duration: '22m', time: '1d ago',
				outcome: 'corrected', language: 'TypeScript', stack: ['React', 'Canvas']
			},
			{
				id: 's5', project: 'lumen-cloud', title: m.obs_session_5(),
				ftr: true, corrections: 0, duration: '15m', time: '1d ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['Express', 'Redis']
			},
			{
				id: 's6', project: 'brand-kit', title: m.obs_session_6(),
				ftr: false, corrections: 2, duration: '28m', time: '2d ago',
				outcome: 'corrected', language: 'CSS', stack: ['PostCSS']
			}
		],
		adoptedTeachings: [
			m.obs_teaching_1(),
			m.obs_teaching_2(),
			m.obs_teaching_3()
		]
	}
}
