import { defineConfig } from 'unocss'
import { Theme } from '@rokkit/themes'

const theme = new Theme({ mapping: { info: 'sky' } })

export default defineConfig({
	theme: { colors: theme.getColorRules() }
})
