# Koan Demo — AI/Chat-First Visual Redesign

**Date:** 2026-05-20
**Status:** Backlog — mockup phase

## Summary

Give the demo app a distinct AI/chat-first visual treatment. The Koan shell (chat panel + canvas, conversational query → demo card matching, theme wizard) is already in place. This item is about giving that shell a *visual* identity that reads as AI-native — moving away from the original "business analytics dashboard" framing of the demo spec.

## What's Already Built

- **Koan shell** (`demo/src/lib/koan/components/Shell.svelte`) — Welcome screen → ChatPanel + Canvas after first interaction. Cmd+K to focus the input.
- **Conversational matching** — `match.svelte.ts` + `catalog.ts` route natural-language queries to demos (currently: `tabs`, `theme-wizard`, `toasts`).
- **Canvas slide transitions** between demos.
- **Welcome page** — wordmark-led, floating toolbar (mode toggle + GitHub), demo arrow annotation.
- **Theme wizard** — 3-step preset picker → tune → save+download.
- **Conversation timeline** in sidebar — replaced static project nav.

## What's Missing (for an AI/chat-first identity)

- **A coherent visual language** that signals "this is an AI/chat product" — typography hierarchy, density, message bubble vs canvas card distinctions, focus motion, empty states.
- **Suggestion / autocomplete affordance** as you type — currently a flat list, no AI-conversation polish.
- **Response card grammar** — every demo response should feel like an artifact a chat assistant would surface, not a generic preview.
- **Voice + tone in copy** — placeholder text, error states, empty states should read like a thoughtful AI assistant.
- **Sidebar / conversation list treatment** — currently functional but visually plain; should feel like a real chat history.
- **Loading / thinking states** — the model "thinking" between query and result is currently instant; even a brief considered animation would sell the AI framing.

## Decisions Needed Before Implementation

1. **Density choice** — chat-first apps lean cozy (Claude, ChatGPT) or compact (Linear AI). Pick a default.
2. **Card vs message paradigm** — are demo responses inline message cards in the chat stream, or do they slide into a separate canvas? (Current = canvas; might be better as inline cards.)
3. **Single column vs split** — full-width chat with embedded artifacts, or persistent chat-left + canvas-right (Claude artifacts pattern)?
4. **Sidebar role** — conversation history (Claude/ChatGPT) or feature nav (current)?
5. **Empty-state copy direction** — playful (koan riddles), instructive (Try: "show me a chart"), or minimal (just the input).

## Mockup Goals

Hand off to Claude Design (see `docs/backlog/2026-05-20-koan-demo-ai-chat-first-redesign-prompt.md` for the brief) and produce 3–5 mockup variants exploring:

- Welcome / empty state
- Conversation in progress (input + suggestions + at least one response)
- A demo response card (tabs, theme-wizard, or toasts)
- Sidebar variations
- Dark mode treatment

## Out of Scope

- Business-analytics sections (dashboard / data explorer / analytics / operations / notifications) from the original demo spec — superseded by the Koan direction.
- `apps/` directory restructure — happens after the demo direction is settled.
