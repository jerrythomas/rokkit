import type { SessionsData } from '$lib/types'
import { m } from '$lib/paraglide/messages.js'

// eslint-disable-next-line max-lines-per-function
export function loadSessionsData(): SessionsData {
	return {
		retro: [
			{
				title: m.retro_going_well(),
				kanji: '善',
				tone: 'good',
				items: [
					m.sess_retro_well_1(),
					m.sess_retro_well_2(),
					m.sess_retro_well_3()
				]
			},
			{
				title: m.retro_not_going_well(),
				kanji: '課',
				tone: 'warn',
				items: [
					m.sess_retro_bad_1(),
					m.sess_retro_bad_2(),
					m.sess_retro_bad_3()
				]
			},
			{
				title: m.retro_insights(),
				kanji: '察',
				tone: 'mute',
				items: [
					m.sess_retro_insight_1(),
					m.sess_retro_insight_2(),
					m.sess_retro_insight_3()
				]
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
			},
			{
				id: 's7', project: 'lumen-studio', title: m.sess_session_7(),
				ftr: true, corrections: 0, duration: '20m', time: '2d ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['React']
			},
			{
				id: 's8', project: 'lumen-cloud', title: m.sess_session_8(),
				ftr: false, corrections: 4, duration: '42m', time: '3d ago',
				outcome: 'abandoned', language: 'TypeScript', stack: ['Express', 'BullMQ']
			},
			{
				id: 's9', project: 'brand-kit', title: m.sess_session_9(),
				ftr: true, corrections: 0, duration: '16m', time: '3d ago',
				outcome: 'shipped', language: 'TypeScript', stack: ['Svelte']
			},
			{
				id: 's10', project: 'lumen-studio', title: m.sess_session_10(),
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
