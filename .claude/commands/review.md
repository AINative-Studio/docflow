# Code Review Checklist

Review the code changes with the following checklist tailored for DocFlow HR.

## Functionality
- [ ] Code accomplishes the intended purpose
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] User feedback is clear (loading states, error messages)

## Code Quality
- [ ] Code is readable and self-documenting
- [ ] No unnecessary complexity
- [ ] DRY principle followed (no duplicate code)
- [ ] Functions/methods are focused (single responsibility)
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Pydantic schemas are complete and validated

## Frontend Specific
- [ ] shadcn/ui components used consistently
- [ ] Tailwind classes follow project conventions
- [ ] Components are accessible (ARIA labels, keyboard nav)
- [ ] Mobile-responsive design verified
- [ ] Loading and error states handled
- [ ] Form validation with proper error messages

## Backend Specific
- [ ] Pydantic schemas validate all inputs
- [ ] API responses follow consistent format
- [ ] Async/await used correctly
- [ ] Database operations are efficient
- [ ] Error responses include appropriate status codes

## Testing
- [ ] Tests exist for new functionality
- [ ] Tests cover edge cases
- [ ] Tests are readable and maintainable
- [ ] Mocks used appropriately for external services

## Security (Critical for HR/Compliance)
- [ ] No hardcoded secrets or credentials
- [ ] Input validation prevents injection attacks
- [ ] File uploads validated (type, size, content)
- [ ] SQL/NoSQL injection prevented
- [ ] XSS vulnerabilities addressed
- [ ] Proper authentication checks on all protected routes
- [ ] Authorization verified (users access only their data)
- [ ] Audit trail created for sensitive operations
- [ ] PII handled according to compliance requirements

## Compliance & Audit
- [ ] Document operations create audit log entries
- [ ] Legal hold status checked before modifications
- [ ] Retention policies respected
- [ ] Employee data access logged

## Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] No memory leaks (useEffect cleanup, etc.)
- [ ] Large lists are paginated or virtualized
- [ ] Images and files are optimized

## Documentation
- [ ] Complex logic is commented
- [ ] Public APIs are documented
- [ ] README updated if needed
- [ ] API endpoint documentation updated

## Style
- [ ] Consistent with project conventions
- [ ] Proper naming conventions followed
- [ ] No linting errors
- [ ] Imports organized (external before internal)

## Pre-Merge Checks
```bash
# Frontend
cd frontend && npm run typecheck && npm run lint && npm run build

# Backend
cd backend && source venv/bin/activate && pytest && mypy app/
```
