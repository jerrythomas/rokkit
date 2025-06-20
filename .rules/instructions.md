Follow these practices for effective collaboration and quality code.

## Before Any Coding Task

- Check `.rules/` directory for project guidelines (if it exists)
- Review available folders and files within `.rules/`
- Only reference folders that are present in the project
- Connect to MCP endpoints only if `.rules/mcp/` exists
- Confirm understanding before proceeding

## Development Process

**Ask clarifying questions** before making changes

- Understand full scope and edge cases
- Identify potential complications

**Ensure code safety**

- Confirm code is committed before modifications
- Check version control status

**Analyze and plan**

- Provide analysis of proposed changes
- Present your approach
- Get confirmation before development
- Start small for complex features
- Design properly and test thoroughly

**Develop incrementally**

- Edit one file/function at a time
- Maintain separation of concerns
- Write tests first when possible
- Run tests and ensure they pass

## Quality Gates

Before proceeding to next phase:

**Testing**

- All tests pass
- Adequate test coverage
- Edge cases covered

**Code Quality**

- Run formatter
- Run linter and fix issues
- Follow project conventions

**Version Control**

- Commit with descriptive messages
- Branch up to date
- No merge conflicts

## Communication

Always confirm:

- Requirements understanding
- Proposed approach
- Test scenarios
- Quality checklist completion

Provide progress updates and explain technical decisions.

## Best Practices

- Break complex features into small pieces
- Implement core functionality first
- Make one logical change at a time
- Commit frequently with clear messages
- Test everything before committing

## Progress Tracking

**CRITICAL**: As you make changes to components or architecture, you MUST update `.rules/project/progress.md` to reflect:

- Component status changes (🔄 In Progress, ✅ Complete, etc.)
- Implementation decisions made
- Technical challenges encountered
- Quality gate completions
- Any deviations from planned approach

This keeps the project tracking accurate and helps maintain context for future development sessions.

## Project Rules Structure

```
.rules/
├── references/
│   ├── languages.md     # Language/framework docs and llms.txt links
│   └── external.md      # External API references
├── architecture/
│   ├── principles.md    # Design principles and patterns
│   ├── constraints.md   # Architectural limitations
│   └── decisions.md     # Architecture decision records
├── project/
│   ├── structure.md     # Folder structure guidelines
│   ├── conventions.md   # Naming and coding standards
│   └── workflow.md      # Development processes
└── mcp/
    ├── config.json      # MCP server configuration
    └── endpoints.md     # Available MCP endpoints
```

Check all these files before starting work. Note that not all folders may be present in every project - only reference what exists.
