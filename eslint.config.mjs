import { sharedConfig } from 'eslint-config-shared'

export default [
  { ignores: ['**/error/*.js'] },
  ...sharedConfig
  // {
  //   files: ['**/*.js'],
  //   ignores: ['dist', '**/.svelte-kit']
  // }
]
