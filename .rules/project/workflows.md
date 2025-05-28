# Project Workflow

## MUST DO Before Any Feature

**Feature Breakdown Required:**

- Provide complete feature description and technical breakdown
- List all files to be created/modified
- Identify dependencies and integration points
- Define testing requirements
- Get human approval before proceeding

**Branch Creation:**

- Use Git Flow: `git flow feature start <feature-name>`
- Use kebab-case naming: `user-authentication`, `api-integration`
- Ask human to create branch if needed

## MUST DO During Development

**Commit Process:**

- Use conventional commits: `type(scope): description`
- Wait for commit confirmation before executing
- Run tests, linter, formatter before each commit
- Make one logical change per commit

**Conventional Commit Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `style` - Formatting
- `chore` - Build/tools

**Examples:**

```
feat(auth): add user login functionality
fix: resolve null pointer in user service
test(auth): add login validation tests
```

**Commit Confirmation Format:**
"Ready to commit: [your commit message]"

- Wait for explicit human approval
- Address feedback before committing
- Provide commit hash after successful commit

## MUST DO After Each Commit

- Verify tests still pass
- Confirm changes work as expected
- Wait for confirmation before next development phase

## Feature Completion

- Run all tests and ensure they pass
- Complete quality checklist
- Use: `git flow feature finish <feature-name>`
- Wait for merge confirmation before starting next feature

## Git Flow Branches

- `main` - Production code
- `develop` - Integration branch
- `feature/*` - Your feature branches
- `release/*` - Release preparation
- `hotfix/*` - Critical fixes

## Feature Breakdown Template

**When starting any feature, provide:**

**Overview:**

- Feature name and purpose
- User story or requirement
- Success criteria

**Technical Details:**

- Files to create/modify
- Functions and components affected
- Database changes
- API endpoints

**Dependencies:**

- External libraries needed
- Integration points
- Potential blockers

**Testing Plan:**

- Unit tests required
- Integration tests needed
- Manual testing scenarios

**Example Breakdown:**

```
Feature: User Profile Management

Overview:
- Allow users to edit profile information
- Add avatar upload capability
- Validate all profile data

Technical:
- Create: src/components/UserProfile.jsx
- Modify: src/services/userService.js
- Add: /api/profile endpoints
- Test: tests/userProfile.test.js

Functions:
- getUserProfile()
- updateUserProfile()
- uploadAvatar()
- validateProfileData()

Dependencies:
- multer (file upload)
- joi (validation)

Testing:
- Unit tests for validation
- API endpoint tests
- File upload testing

Estimated: 4-6 commits
```

## Development Checklist

**Before Feature:**

- [ ] Feature breakdown approved
- [ ] Branch created with git flow
- [ ] Environment ready

**During Feature:**

- [ ] Incremental commits
- [ ] Conventional commit format
- [ ] Tests run before each commit
- [ ] Wait for commit confirmation

**After Feature:**

- [ ] All tests passing
- [ ] Feature branch finished
- [ ] Merge confirmed

## Key Reminders

- Always wait for human confirmation before committing
- Provide detailed breakdowns before starting work
- Use conventional commit format consistently
- Test everything before committing
- One logical change per commit
