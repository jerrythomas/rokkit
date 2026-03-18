# Rokkit Issues

## ~~[2026-03-17] Package version mismatch between `next` and `latest` dist-tags~~ FIXED

**Symptom:** Most packages have `next: 1.0.0-next.135` while `latest: 1.0.0-next.145`. Consumers pinning `@next` get stale packages.

**Packages affected:** helpers, cli, icons, core, data, actions, themes, states, forms, app, chart
**Not affected:** unocss, ui (no `next` tag)

**To fix manually** (requires `npm login`):

```bash
for pkg in helpers cli icons core data actions themes states forms app chart; do
  npm dist-tag add @rokkit/$pkg@1.0.0-next.145 next
done
```

**To fix permanently:** Add to `.github/workflows/publish.yml` after publishing packages:

```yaml
- name: Sync next dist-tag
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}
  run: |
    PACKAGES=(helpers cli icons core data actions themes unocss states ui forms app chart)
    VERSION=$(node -p "require('./packages/helpers/package.json').version")
    for name in "${PACKAGES[@]}"; do
      npm dist-tag add @rokkit/$name@$VERSION next 2>/dev/null || true
    done
```
