# Quick Start Template

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx degit jerrythomas/rokkit/sites/quick-start my-app
cd my-app

pnpm i
```


## Developing

Once you've created a project and installed dependencies with `pnpm install` (or `npm install` or `bun`), start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
