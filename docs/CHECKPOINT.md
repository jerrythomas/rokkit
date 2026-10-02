# Checkpoint

**Slice:** #170 correction: neighborhood centres the drawn cards by default (33d35c076).

**Done:**
- `centre: 'content'` (default) restores the 1.7.0 geometry: no column for an empty side.
- `centre: 'focus'` (opt-in, also a `Neighborhood` prop) keeps the symmetric reservation and
  reports `LayoutResult.extent`, which `contentExtent` honours.
- Docs (llms ×2, design 23) and journal corrected. 8,404 unit tests, 84 graph e2e, lint 0/0,
  CI green. #170 closed.

**Remaining:** review PR #158 (anupamme: body validation for
`apps/learn/src/routes/api/llm/openrouter/+server.ts`).

**Next command:** `gh pr view 158 --json title,body,files && gh pr diff 158`

**Open questions (user):**
- Revoke `NPM_TOKEN` when done.
- The brand-colour-as-foreground design.
- What to do with `stash@{0}`.

**Known-broken:** none. The fix is unreleased (npm `latest` = 1.8.2) and ships in the next patch.
