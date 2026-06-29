import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'

const meta: DemoMeta = {
	id: 'chat',
	title: 'Chat',
	description:
		'Presentation-only chat components — ChatMessage, ChatComposer, ChatHistory, ChatTimeline, and the composed ChatShell. Dumb on purpose: render the data you hand them, emit callbacks, no LLM coupling.',
	keywords: [
		'chat', 'chat-shell', 'chatshell', 'conversation', 'message', 'messages',
		'composer', 'history', 'timeline', 'assistant', 'llm', 'ai', 'thread',
		'bubble', 'prompt', 'chatbot', 'transcript', 'stream'
	],
	category: 'content',
	icon: 'i-mdi:chat-outline',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_chat',
		description:
			'Mount the Chat demo — the standalone primitives plus a composed ChatShell driven by static data, including a message-snippet seam that switches on data.kind.',
		parameters: {}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'messages', type: 'ChatMessage[]', desc: 'Conversation turns rendered in the timeline, oldest first.' },
			{ name: 'conversations', type: 'ConversationSummary[]', desc: 'Optional history list; presence toggles the sidebar.' },
			{ name: 'activeConversationId', type: 'string | null', desc: 'Marks the active row in the history sidebar.' },
			{ name: 'value', type: 'string', default: "''", desc: 'Composer text.', bindable: true },
			{ name: 'busy', type: 'boolean', default: 'false', desc: 'Locks the composer while a response is in flight.' },
			{ name: 'onsubmit', type: '(text: string) => void', desc: 'Fires when the user sends (Enter, no Shift).' },
			{ name: 'onselectConversation', type: '(id: string) => void', desc: 'History row clicked.' },
			{ name: 'onnew', type: '() => void', desc: 'New-conversation button clicked.' },
			{ name: 'message', type: 'Snippet<[ChatMessage]>', desc: 'Per-message render override — switch on msg.data?.kind for rich content.' }
		],
		events: [],
		attrs: [
			{ selector: '[data-chat-shell]', desc: 'Root of the composed shell; [data-has-history] present when conversations are passed.' },
			{ selector: '[data-chat-message][data-role]', desc: 'One bubble; data-role is user / assistant / system, data-status optional.' },
			{ selector: '[data-chat-timeline]', desc: 'Scrolling message list; auto-scrolls to newest.' },
			{ selector: '[data-chat-composer]', desc: 'Input region; [data-busy] present while busy.' }
		]
	},
	snippets: [
		{
			id: 'shell',
			title: 'Composed ChatShell',
			lang: 'svelte',
			code: `<script>
  import { ChatShell } from '@rokkit/ui'
  import type { ChatMessage } from '@rokkit/ui'

  let messages = $state<ChatMessage[]>([])
  let value = $state('')

  function handleSubmit(text) {
    messages.push({ id: crypto.randomUUID(), role: 'user', text })
    // …call your backend, push the assistant reply back
  }
<\/script>

<ChatShell bind:value {messages} onsubmit={handleSubmit} />`
		},
		{
			id: 'message-seam',
			title: 'The message snippet seam (switch on data.kind)',
			lang: 'svelte',
			code: `<ChatShell {messages} bind:value onsubmit={handleSubmit}>
  {#snippet message(msg)}
    {#if msg.data?.kind === 'chart'}
      <!-- your app mounts @rokkit/chart here -->
      <div class="chart-card">📊 chart renders here</div>
    {:else}
      <ChatMessage message={msg} />
    {/if}
  {/snippet}
</ChatShell>`
		},
		{
			id: 'primitives',
			title: 'Standalone primitives',
			lang: 'svelte',
			code: `<script>
  import { ChatMessage, ChatComposer, ChatHistory } from '@rokkit/ui'
  let value = $state('')
<\/script>

<ChatMessage message={{ id: '1', role: 'user', text: 'How do I theme this?' }} />
<ChatMessage message={{ id: '2', role: 'assistant', text: 'Style cascades from data-style.' }} />

<ChatComposer bind:value onsubmit={(t) => console.log(t)} />

<ChatHistory
  conversations={[{ id: 'a', title: 'Theming questions' }]}
  activeId="a"
/>`
		}
	],
	docs
}

export default meta
