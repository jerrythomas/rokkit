// routes/docs/components/my-component/llms.txt/+server.ts
import { text } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const content = `# MyComponent
Description of the component...

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | array | [] | Data items to display |
...
`

export const GET: RequestHandler = async () => {
  return text(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
