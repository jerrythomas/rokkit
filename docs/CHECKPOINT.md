# Checkpoint

**Slice:** chat intents (`docs/plans/2026-10-02-chat-intents.md`).

**Done:**
- Slice 1, intent core (`4fb8a53df`).
- Slice 2, simulated mode on the local interpreter; regex router removed (`f30b85b5a`).
- Selection feeds the chat (`4e16acb7d`).
- Gates: 8,513 unit tests, 180 e2e, lint 0/0.

**Remaining, in the agreed order:**
1. Inline prop controls: the demo's prop schema as controls under it.
2. Slice 3: `POST /api/chat/interpret` with the System One backend (Ollama, enabled by
   `OLLAMA_URL`; `nimble` is installed locally).
3. Slice 4: the LLM-classifier backend (OpenRouter free models and WebLLM), then delete
   `/api/llm/openrouter`, `prompt.ts` and `parse.ts` if nothing else uses them.
4. Slice 5: docs and close-out.

**Next command:** `bunx vitest run --project learn apps/learn/spec/chat-demo`

**Open questions (user):**
- Revoke `NPM_TOKEN` when done.
- The brand-colour-as-foreground design.
- What to do with `stash@{0}`.

**Known-broken:** none. The OpenRouter and WebLLM modes still use the old prompt path until
slice 4.
