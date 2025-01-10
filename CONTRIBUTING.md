# Contributing

Arizto is a monorepo using `bun` or [pnpm workspaces](https://pnpm.io/workspaces) for easier organization.

## Packages

- [@arizto/patterns](packages/patterns) - Pattern matchers and extractors
- [@arizto/scanner](packages/scanner) - Scanner for searching for media content on folders
- [@arizto/metadata](packages/metadata) - Enhance metadata using api services like TMDb, ComicVine, etc.

## Clone or Fork the Project

```sh
git clone https://github.com/jerrythomas/arizto.git
```

## Install Dependencies

If you run this at the root of your project it's going to install the dependecies for every package.

```sh
bun i
```

## Run Tests

```sh
bun test:watch
```
