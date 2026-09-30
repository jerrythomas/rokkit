# CHECKPOINT

**Released v1.8.0** (`695abf8c`, tag `v1.8.0`): architecture-analysis primitives, PlotState and
FormBuilder decompositions, forms validating every field, `#/` field paths. 15 packages on npm,
shipped artifact verified from npm, `main` fast-forwarded, CI green everywhere.

**Next slice: `actions/src/navigator.js` decomposition** — the next hotspot (cx 70, 418 lines),
the keyboard navigator behind every list-like component. Same approach as PlotState/FormBuilder:
characterise first, job classes composed behind the unchanged public API, differential at the
end, re-measure.

**Next command:** read `packages/actions/src/navigator.js` and its specs; write the plan doc.

**Open questions:**

- `@rokkit/forms` ships `*.spec.js` + fixtures in `dist/lib` — packaging hygiene, not yet fixed.
- Object-level JSON Schema `required: [...]` is not honoured — only field-level `required: true`.

**Known broken:** nothing. `sensei:checkpoint` unavailable — the sensei MCP server is disconnected.
