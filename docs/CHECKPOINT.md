# Checkpoint

**Slice:** the OpenRouter proxy forwards only what the demo sends (15897ee70). PR #158 is
closed and superseded.

**Done:**
- `upstreamRequest()` keeps only curated free models, 1–8 string messages, temperature 0–2 and
  json_object. Everything else is dropped or answered 400 before OpenRouter is called.
- 8,425 unit tests pass, lint 0/0, CI green. Checked live: a paid model or a `tool` role
  gets 400.
- #170 is corrected and closed (33d35c076).

**Remaining / found:**
- 6 of the 7 curated `:free` models in `apps/learn/src/lib/chat-demo/models.ts` have rotated
  out of OpenRouter. Only `google/gemma-4-26b-a4b-it:free` remains, so the default model gets
  404 and the live demo is broken.
- The endpoint echoes OpenRouter's error text to the browser, and that text includes the
  account's `user_id`.

**Next command:** `curl -s https://openrouter.ai/api/v1/models` → refresh `OPENROUTER_MODELS`.

**Open questions (user):**
- Which free models to curate.
- Revoke `NPM_TOKEN` when done.
- The brand-colour-as-foreground design.
- What to do with `stash@{0}`.

**Known-broken:** the OpenRouter chat demo, until the model list is refreshed. The #170 fix is
unreleased (npm `latest` = 1.8.2).
