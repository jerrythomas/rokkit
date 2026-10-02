# Checkpoint

**Slice:** OpenRouter demo hardening is complete: proxy allowlist (15897ee70), refreshed free
models with a stale-model fallback, and no account details in error messages. All on
`develop`, CI green.

**Done:**
- The proxy forwards only curated free models, 1–8 string messages, temperature and json_object.
- Five free JSON-mode models. The default is Nemotron 3 Super (answered live); both Gemma 4
  models were returning 429. `curatedOpenRouterModel()` maps a stale `?model=` to the default.
- Upstream errors pass on OpenRouter's one-line message only, never `user_id` or metadata.
- 8,436 unit tests pass, lint 0/0. #170 closed, PR #158 closed (superseded).

**Remaining:** none in this slice. The #170 fix and these changes are unreleased (npm `latest`
= 1.8.2). The learn site picks up the demo fixes on its next deploy.

**Next command:** `bun run bump patch --yes` when a release is wanted.

**Open questions (user):**
- Revoke `NPM_TOKEN` when done.
- The brand-colour-as-foreground design.
- What to do with `stash@{0}`.

**Known-broken:** none. The free models rotate, so if the demo 404s again, refresh
`apps/learn/src/lib/chat-demo/models.ts` from `https://openrouter.ai/api/v1/models`.
