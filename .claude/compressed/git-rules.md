# Git Commit Rules for AINative Projects

## CRITICAL RULES - ZERO TOLERANCE

### 1. NO ANTHROPIC/CLAUDE ATTRIBUTION

**FORBIDDEN TEXT:**
- "Claude"
- "Anthropic"
- "claude.com"
- "Generated with Claude"
- "Co-Authored-By: Claude"
- AI attribution references

**ZERO TOLERANCE RULE**
- Remove forbidden text IMMEDIATELY
- Stop commit if ANY reference exists

### 2. COMMIT MESSAGE FORMAT

✅ **CORRECT FORMAT:**
```
Short descriptive title

- Bullet point describing changes
- Another bullet point
- Final bullet point
```

❌ **INCORRECT FORMAT:**
```
Changes...

🤖 Generated with Claude Code
Co-Authored-By: Claude
```

### 3. PULL REQUEST DESCRIPTIONS

✅ **CORRECT FORMAT:**
```markdown
## Summary
- Clear description of changes
- What was fixed/added
- Rationale for changes

## Test Plan
- Testing methodology
- Expected results
```

### 4. ENFORCEMENT SCOPE

**Applies to:**
- Commit messages
- PR descriptions
- Issue comments
- GitHub discussions

**Violations Result In:**
- Public attribution prevention
- Professional repository maintenance

### 5. AUTOMATED ENFORCEMENT

**Pre-commit hook:** `.git/hooks/commit-msg`
```bash
#!/bin/bash
COMMIT_MSG_FILE=$1
if grep -qiE "(claude|anthropic|🤖|generated with|co-authored-by: claude)" "$COMMIT_MSG_FILE"; then
    echo "❌ ERROR: Forbidden attribution detected!"
    exit 1
fi
```

### FINAL CHECKLIST

**Before Committing, Verify:**
1. No "Claude" references
2. No "Anthropic" mentions
3. No AI tool attribution
4. Professional, clean message

**ZERO TOLERANCE - NO EXCEPTIONS**