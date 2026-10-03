# Checkpoint

**Slice:** chat intents. DONE (`docs/design/26-chat-intents.md`).

**Done:**
- Intent core, simulated mode, selection and live controls.
- System One on `/api/chat/interpret`.
- The OpenRouter and Web-LLM modes as classifiers.
- The old prompt path is removed.
- Gates: 8,511 unit tests, 181 e2e, lint 0/0. Eval: local 18/22, System One hybrid 20/22,
  OpenRouter hybrid 21/22.

**Remaining:** none. Released as v1.9.0 (npm `latest`); the learn site is redeployed from main.

**Next command:** re-measure after a model or prompt change, with the dev server running with
`OLLAMA_URL`:
`CHAT_EVAL_URL=http://localhost:5199 CHAT_EVAL_OUT=/tmp/eval.txt bunx vitest run --project learn apps/learn/spec/chat-demo/interpreter-eval.spec.ts`

**Open questions (user):**
- The live site has no `OPENROUTER_API_KEY`, so OpenRouter mode falls back to the local reader.
  Set it with `wrangler secret put OPENROUTER_API_KEY` if that mode should reach a model.
- Revoke `NPM_TOKEN` when done.
- The brand-colour-as-foreground design.
- What to do with `stash@{0}`.

**Known-broken:** none. The Koan `/app` shell is on the interpreter too.
