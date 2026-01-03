# Create Pull Request

Create a pull request for the current branch.

## Pre-PR Checklist

Before creating the PR, verify:

1. **Frontend checks pass**
   ```bash
   cd frontend && npm run typecheck && npm run lint
   ```

2. **Backend tests pass**
   ```bash
   cd backend && source venv/bin/activate && pytest
   ```

3. **Build succeeds**
   ```bash
   cd frontend && npm run build
   ```

4. **Current branch is pushed to remote**

## PR Template

```markdown
## Summary
Brief description of changes

## Related Issue
Closes #{{ISSUE_NUMBER}}

## Changes Made
- Change 1
- Change 2

## Type of Change
- [ ] New feature (non-breaking change adding functionality)
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

### Test Instructions
Steps to manually test these changes:
1. Step 1
2. Step 2

## Security Considerations
- [ ] No sensitive data exposed
- [ ] Input validation added where needed
- [ ] Auth/RBAC properly enforced

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or documented)
- [ ] Pydantic schemas match API contracts (backend)
- [ ] shadcn/ui components used consistently (frontend)
```

## Usage

Run `/pr` to create a PR following this template.
