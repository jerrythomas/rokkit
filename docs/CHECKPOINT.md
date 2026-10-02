# Checkpoint

**Slice:** chat intents. DONE (`docs/design/26-chat-intents.md`).

**Done:**
- Intent core, simulated mode, selection and live controls.
- System One on `/api/chat/interpret`.
- The OpenRouter and Web-LLM modes as classifiers.
- The old prompt path is removed.
- Gates: 8,511 unit tests, 181 e2e, lint 0/0. Eval: local 18/22, System One hybrid 20/22,
  OpenRouter hybrid 21/22.

**Remaining:** none in this slice. The changes are on `develop` and unreleased: the learn site
gets them on its next deploy, and npm `latest` is 1.8.2.

**Next command:** re-measure after a model or prompt change, with the dev server running with
`OLLAMA_URL`:
`CHAT_EVAL_URL=http://localhost:5199 CHAT_EVAL_OUT=/tmp/eval.txt bunx vitest run --project learn apps/learn/spec/chat-demo/interpreter-eval.spec.ts`

**Open questions (user):**
- Koan `/app` could use the local interpreter too.
- Revoke `NPM_TOKEN` when done.
- The brand-colour-as-foreground design.
- What to do with `stash@{0}`.

**Known-broken:** none. Generated line charts with duplicate x per series draw a sawtooth; the
chart does not aggregate.
