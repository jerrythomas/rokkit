# Rokkit Internal Documentation

> Internal documentation for requirements, design decisions, and implementation planning

## Scope

This folder contains **internal** documentation for the Rokkit development team:
- Requirements specifications
- Design decisions and architecture
- Implementation planning and tracking

**Public documentation** (user-facing guides, API reference, llms.txt) is served from the [learn site](../sites/learn/).

## Structure

```
docs/
├── requirements/           # What components must do
│   ├── component-requirements.md
│   ├── accessibility-requirements.md
│   ├── theme-requirements.md
│   ├── forms-requirements.md
│   └── documentation-requirements.md
│
├── design/                 # How components are built
│   ├── project-status.md
│   ├── component-status.md
│   ├── component-inventory.md
│   ├── architecture.md
│   ├── theme-system-design.md
│   └── forms-design.md
│
├── plan/                   # Implementation roadmap
│   ├── implementation-roadmap.md
│   └── component-priorities.md
│
├── decisions/              # Architecture Decision Records
│   └── [NNN]-[title].md
│
└── tracking.md             # Progress tracking
```

## Quick Links

### Design Documentation
- [Component Status Matrix](./design/component-status.md) - 9-dimension tracking
- [Component Inventory](./design/component-inventory.md) - Full component listing
- [Theme System Design](./design/theme-system-design.md) - Theming architecture
- [Forms System Design](./design/forms-design.md) - Forms architecture

### Progress Tracking
- [Tracking](./tracking.md) - Current documentation progress

### Public Documentation
- **Learn Site**: `sites/learn/` - User-facing documentation
- **llms.txt**: `sites/learn/src/routes/llms.txt/` - LLM reference
- **Component Docs**: `sites/learn/src/routes/docs/components/`

## Status Indicators

| Icon | Meaning |
|------|---------|
| ✅ | Complete |
| 🟡 | Partial / In Progress |
| ❌ | Missing / Not Started |
| 🚫 | Not Applicable |

## Related Resources

- [CLAUDE.md](../CLAUDE.md) - Claude Code instructions
- [.rules/](../.rules/) - Development guidelines
- [Project Overview](./requirements/000-project-overview.md) - Vision, cross-cutting requirements, success criteria
