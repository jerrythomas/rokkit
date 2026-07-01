# Components + Catalog Consolidation — Design

**Date:** 2026-06-30
**App:** `apps/learn` (SvelteKit, Svelte 5 runes)
**Status:** Approved (brainstorm) → ready for implementation plan

## Goal

Collapse the redundant **Components** and **Catalog** top-nav entries into a single
section whose landing **is** the component catalog, while preserving the Koan
chat-shell entry experience (compact hero + composer) and the real, persisted
conversation history. Also fix duplicate history entries when the same component is
explored repeatedly.

This is **Sub-project 1** of a two-part initiative. Sub-project 2 (AI-demo evolution —
mode-selection entry, capabilities, richer summary titles) is a separate spec.

## Current state (as built)

- **`src/lib/components/SiteNav.svelte`** — inline `links` array. Two entries point at
  the same shell: `Components → /app` (active on `/app` and `/app/*` except
  `/app/catalog`) and `Catalog → /app/catalog`.
- **`src/lib/koan/shell.svelte.ts`** — `ShellPhase = 'welcome' | 'thinking' |
  'response' | 'catalog'`; `shell` `$state` (phase, demoType, demoVariant, lastQuery,
  collapsed, composerValue). Setters: `setShellWelcome()`, `setShellCatalog()`,
  `setShellResponse(demoType, query?)`, `setShellVariant()`. Default phase `welcome`.
- **Routing** — `/app/+page.svelte` → `setShellWelcome()`; `/app/catalog/+page.svelte`
  → `setShellCatalog()`; per-component `/app/[demo]/+page.svelte` → `setShellResponse()`
  on mount. All inherit `src/routes/app/+layout.svelte`.
- **`+layout.svelte`** renders the canvas by `shell.phase`: `welcome` → welcome-hero
  ("Pass the data. The component does the rest." + `style · 47 components · Svelte 5`
  meta); `catalog` → `<CatalogGrid filter={shell.composerValue} />`; `response` → mounted
  demo. The **left rail** is also phase-dependent: `welcome` → `welcome-stream` (greeting
  + `ComposerSuggestions` + "Browse the full catalog" link → `/app/catalog`); `response`
  → `<ChatHistory>` conversation list.
- **`src/lib/koan/conversations.svelte.ts`** — REAL `localStorage` persistence (key
  `rokkit-conversations`, cap 20, current-conversation key `rokkit-current-conversation`).
  `Conversation { id, title, surface: 'app' | 'chat', createdAt, updatedAt, turns[] }`.
  Started via `startNew(surface, query)`; `bucketByRecency()` groups today/yesterday/
  earlier; `resumeConversation()` restores phase/demoType/variant and navigates.
  **Bug:** each exploration of a component starts a new conversation, so exploring "Tabs"
  three times yields three "Tabs" rows.

## Design

### 1. Navigation & routing

- **`SiteNav`**: remove the `Catalog` link. `Components → /app` is the single entry.
  Resulting nav: `Components · Guides · Chat demo · GitHub`. The `Components` `match`
  simplifies to `p === '/app' || p.startsWith('/app')` (the `!== '/app/catalog'`
  carve-out goes away).
- **`/app/catalog`**: becomes a **redirect to `/app`** (the catalog is now the landing).
  Use a SvelteKit `redirect(308, '/app')` in `+page.ts` (or a load redirect) rather than
  deleting the folder, so existing links/bookmarks don't 404. Repoint the in-app link
  ("Browse the full catalog", and the rail's "Browse components") to `/app`.
- **Shell phases collapse**: merge `welcome` + `catalog` into a single **`landing`**
  phase. New `ShellPhase = 'landing' | 'thinking' | 'response'`. Replace
  `setShellWelcome()`/`setShellCatalog()` with **`setShellLanding()`** (phase `landing`,
  nullify demoType/variant). `/app/+page.svelte` calls `setShellLanding()`. Default
  phase becomes `landing`.

### 2. Landing layout (`/app`, phase `landing`)

- Canvas renders a **compact hero header** followed by the existing **`CatalogGrid`**:
  - Header strip: condensed one-liner ("Pass the data. The component does the rest.") +
    the `{vibe.style} · 47 components · Svelte 5 runes` meta line. The large
    `RokkitWordmark height={64}` hero is reduced to a small mark or dropped so the grid
    is above the fold.
  - `<CatalogGrid filter={shell.composerValue} />` unchanged — live MiniSearch filter
    from the composer; tiles grouped by category; tile click → `goto('/app/{demo}')` →
    `response`.

### 3. The rail (hybrid)

- The left rail becomes **consistent across `landing` and `response`** rather than
  swapping content by phase:
  - Top: **New conversation** (`startNewConversation` → `/app`) and **Browse components**
    (link → `/app`, i.e. the catalog landing).
  - Middle: the real persisted **conversation history** (`<ChatHistory>` with
    `bucketByRecency()`), with `resumeConversation()` on click.
  - Bottom: the composer (pinned), unchanged.
- `ComposerSuggestions` remains as the composer's empty/typing helper (matches the
  catalog as you type), available in `landing` and `response`.
- The old `welcome-stream` rail variant is removed; its discovery role is served by the
  landing catalog grid + the always-present history.

### 4. Conversation-history dedup (upsert by title)

- In `conversations.svelte.ts`, recording an **`app`-surface** exploration **upserts by
  title** instead of always appending:
  - On start/record for surface `app`: if an existing conversation has the **same
    `title` and `surface === 'app'`**, **update it** — refresh `updatedAt`, **replace its
    `turns` with the current exploration's turns** (so repeated visits don't grow the
    conversation unbounded), move it to the top of recency, and set it current. Otherwise
    create new (existing behavior, still capped at 20).
  - Net effect: exploring "Tabs" repeatedly keeps **one** "Tabs" entry that floats to the
    most-recent position.
- Title source for `app` explorations is the component/demo title (e.g. "Tabs"), which is
  already sensible. **Chat-surface (`chat`) conversations are unaffected** here; their
  title quality + any dedup is Sub-project 2.

### 5. Module boundaries

| File | Change |
|---|---|
| `src/lib/components/SiteNav.svelte` | Remove Catalog link; simplify Components `match`. |
| `src/lib/koan/shell.svelte.ts` | `ShellPhase` → `landing\|thinking\|response`; `setShellLanding()` replaces welcome/catalog setters; default `landing`. |
| `src/routes/app/+page.svelte` | `setShellLanding()` on mount. |
| `src/routes/app/catalog/+page.ts` (new) | `redirect(308, '/app')`; remove the old `+page.svelte`. |
| `src/routes/app/+layout.svelte` | `landing` canvas = compact hero header + `CatalogGrid`; rail = persistent New/Browse + `ChatHistory` + composer; drop welcome-hero/welcome-stream branches. |
| `src/lib/koan/conversations.svelte.ts` | Upsert-by-(surface,title) for `app` surface. |

## Testing

- **Unit** (`conversations.svelte.ts`): upsert-by-title — exploring the same `app` title
  twice yields one conversation, `updatedAt` refreshed, moved to top; different titles
  still create separate entries; `chat` surface still always appends; 20-cap preserved.
- **E2E (light)**: nav shows no `Catalog` item; `/app` renders the catalog grid;
  `/app/catalog` redirects to `/app`; clicking a tile mounts the demo; "Browse
  components" from a demo returns to the grid.
- **Gate**: `bun run check` + `theme-contrast.e2e.ts` (the landing is a layout change;
  no new theme tokens, so the contrast baseline should hold).

## Out of scope (→ Sub-project 2: AI-demo evolution)

- Renaming "Chat demo"; the mode-selection entry screen (Simulated / OpenRouter /
  Web LLM cards with explanations); per-mode example prompts + capabilities summary;
  AI-generated **summary titles**; chat-surface history dedup.
