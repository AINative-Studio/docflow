# TDD Workflow

Start a TDD (Test-Driven Development) workflow for the feature: $ARGUMENTS

## Workflow Steps

1. **Understand the requirement**: Analyze what needs to be built
2. **Write failing test(s)**: Create test cases that define expected behavior
3. **Run tests**: Confirm tests fail (Red phase)
4. **Implement minimal code**: Write just enough code to pass tests
5. **Run tests**: Confirm tests pass (Green phase)
6. **Refactor**: Clean up code while keeping tests green
7. **Commit**: Create atomic commits for each cycle

## Frontend Testing (Jest/React Testing Library)

```bash
cd frontend && npm test
```

### Test File Location
- Component tests: `__tests__/` directory adjacent to component
- Hook tests: `hooks/__tests__/`
- Utility tests: `lib/__tests__/`

### Example Test (React Component)
```typescript
// components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

## Backend Testing (pytest)

```bash
cd backend && source venv/bin/activate && pytest
```

### Test File Location
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- API tests: `tests/api/`

### Example Test (FastAPI Endpoint)
```python
# tests/api/test_health.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Example Test (Pydantic Schema)
```python
# tests/unit/test_schemas.py
import pytest
from app.schemas.document import DocumentCreate

def test_document_create_valid():
    doc = DocumentCreate(
        employee_id="emp-123",
        document_type="W-4",
        file_name="w4-form.pdf"
    )
    assert doc.employee_id == "emp-123"

def test_document_create_invalid():
    with pytest.raises(ValidationError):
        DocumentCreate(employee_id="", document_type="W-4")
```

## Guidelines

- Start with the simplest test case
- One test at a time
- Keep implementations minimal
- Refactor only when tests are green
- Use descriptive test names that explain behavior
- Aim for 80%+ code coverage on new code
- Mock external services (ZeroDB, Supabase, Twilio)

## Security Testing Reminders

For DocFlow HR, always include tests for:
- [ ] Input validation (malicious file names, XSS attempts)
- [ ] Authorization (user can only access their own documents)
- [ ] Audit trail creation (actions are logged)
- [ ] Retention policy enforcement
- [ ] Legal hold constraints
