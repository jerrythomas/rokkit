# JavaScript Guidelines

## Module System

- Use ESM modules only (`import`/`export`)

## Async Programming

- Use `async`/`await` instead of Promise chains

## Testing

- Use Vitest with `describe`, `it`, `expect`

## Functional Programming

- Prefer Ramda for data transformations
- Use `pipe`, `map`, `filter`, `reduce` patterns

## Module Organization

- Develop modular functions with single responsibilities
- Import shared types from `types.js`
- Export functions using camelCase naming
- Use standard library APIs when available
- Write small, single-purpose functions
- Keep function complexity low
- Use camelCase for function names
- Use JSDoc comments with types
- Create shared `types.js` for common types across modules

## Anti-Patterns

- Avoid CommonJS (`require`/`module.exports`)
- Avoid imperative loops when functional alternatives exist
- Avoid large, multi-purpose functions
