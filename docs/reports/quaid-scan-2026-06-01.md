# quaid-scanner Report: /Users/karstenwade/Projects/AINative-Studio/src/docflow

**Score:** 🔴 2.5/10 — CRITICAL risk
**Maturity:** sandbox | **Depth:** standard | **Duration:** 0.3s
**Scanned:** 2026-06-01T21:29:03.194Z

## Pillar Scores

| Pillar | Score | Weight | Findings |
|--------|-------|--------|----------|
| Security | 3.5 | 25% | 0C 4W 1I |
| Governance | 0.0 | 20% | 1C 1W 11I |
| Community | 2.5 | 15% | 0C 2W 9I |
| AI Readiness | 2.5 | 15% | 0C 5W 0I |
| Inclusive Language | 3.5 | 15% | 0C 4W 1I |
| Technical Rigor | 3.0 | 10% | 1C 2W 2I |

## Critical Findings

### vendor-neutrality-critical-concentration
**Pillar:** Governance | **Category:** vendor-neutrality

Project is dominated by gmail.com (100% of commits)

_(source: computed heuristic)_

**Suggestion:** Diversify contributors across multiple organizations to reduce single-vendor risk

**Reference:** https://chaoss.community/metric-project-sponsorship/

### test-coverage-1
**Pillar:** Technical Rigor | **Category:** test-coverage

No test files detected in the repository

_(source: local file check)_

**Suggestion:** Add a test suite to improve code reliability and enable coverage tracking

**Reference:** https://chaoss.community/metric-test-coverage/

## Warnings

- **[TIMEOUT-binary-artifacts]** Scanner "binary-artifacts" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-dep-pinning-docker]** Scanner "dep-pinning-docker" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-openssf-local-checks]** Scanner "openssf-local-checks" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-openssf-scorecard]** Scanner "openssf-scorecard" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-license-header-scanner]** Scanner "license-header-scanner" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[psych-safety-1]** No Code of Conduct found *(Add a CODE_OF_CONDUCT.md — see https://www.contributor-covenant.org/)*
- **[support-channels-1]** No SUPPORT.md or .github/SUPPORT.md found *(Add a SUPPORT.md documenting how users can get help)*
- **[agentic-rules-2]** CLAUDE.md lacks recognized structural sections *(Add sections like "Critical Rules", "Project Structure", "Common Tasks" to improve agent guidance.)*
- **[TIMEOUT-ai-repo-detection]** Scanner "ai-repo-detection" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-dataset-provenance]** Scanner "dataset-provenance" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-model-card-detection]** Scanner "model-card-detection" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-model-card-scoring]** Scanner "model-card-scoring" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-diminishing-language-scanner]** Scanner "diminishing-language-scanner" timed out after undefinedms *(Increase scannerTimeout in configuration or check network connectivity)*
- **[TIMEOUT-inclusive-code-scanner]** Scanner "inclusive-code-scanner" failed: Cannot read properties of undefined (reading 'termListUrl') *(Check scanner implementation for errors)*
- **[TIMEOUT-inclusive-doc-scanner]** Scanner "inclusive-doc-scanner" failed: Cannot read properties of undefined (reading 'termListUrl') *(Check scanner implementation for errors)*
- **[TIMEOUT-inclusive-naming-scanner]** Scanner "inclusive-naming-scanner" failed: Cannot read properties of undefined (reading 'termListUrl') *(Check scanner implementation for errors)*
- **[interaction-templates-1]** No issue templates configured *(Add .github/ISSUE_TEMPLATE/ with bug report and feature request templates)*
- **[linter-config-1]** No linter configuration found *(Add a linter (ESLint, Prettier, Ruff, golangci-lint, etc.) and configure it to run in CI)*

## Info

- **[branch-protection-1]** GitHub token not provided. Cannot check branch protection settings.
- **[asset-protection-1]** No trademark policy found (optional)
- **[asset-protection-2]** No export control documentation found (optional)
- **[asset-protection-3]** No CLA or DCO requirement detected
- **[asset-protection-4]** Contributor friction level: Low
- **[bus-factor-1]** Bus factor: 1, Elephant factor: 88% (2 contributors, 8 commits in last 12 months)
- **[dep-license-scanning-1]** No dependency manifest files found
- **[governance-classification-1]** No governance model detected — governance files exist but no recognizable model pattern found
- **[governance-detection-1]** No governance documentation found
- **[license-compatibility-1]** Project license is Apache-2.0 — no installed dependencies to check compatibility
- **[vendor-neutrality-domain-count]** Found 1 unique email domain(s) across 8 commits
- **[vendor-neutrality-no-succession]** No succession planning documentation found
- **[burnout-detection-1]** Burnout detection requires a GitHub token
- **[contributor-data-1]** 2 unique contributors with 8 commits in the last 12 months
- **[contributor-data-2]** Contributor emails span 1 domain
- **[contributor-funnel-1]** Contributor funnel: 0 core, 1 regular, 1 casual (2 total)
- **[funding-1]** No funding infrastructure detected
- **[issue-closure-1]** Issue closure analysis requires a GitHub token
- **[response-classification-1]** Response classification requires a GitHub token
- **[response-time-1]** Response time analysis requires a GitHub token
- **[stale-bot-1]** No stale bot configured
- **[AK-ACRONYM-HRIS-README.md:2]** Undefined acronym "HRIS" may confuse newcomers
- **[release-cadence-1]** No releases or version tags found
- **[semver-validation-1]** No git tags found — cannot validate SemVer

## Recommendations

- **[HIGH impact / medium effort]** Diversify contributors across multiple organizations to reduce single-vendor risk
  - https://chaoss.community/metric-project-sponsorship/
- **[HIGH impact / medium effort]** Add a test suite to improve code reliability and enable coverage tracking
  - https://chaoss.community/metric-test-coverage/
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Add a CODE_OF_CONDUCT.md — see https://www.contributor-covenant.org/
- **[MEDIUM impact / low effort]** Add a SUPPORT.md documenting how users can get help
- **[MEDIUM impact / low effort]** Add sections like "Critical Rules", "Project Structure", "Common Tasks" to improve agent guidance.
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Increase scannerTimeout in configuration or check network connectivity
- **[MEDIUM impact / low effort]** Check scanner implementation for errors
- **[MEDIUM impact / low effort]** Add .github/ISSUE_TEMPLATE/ with bug report and feature request templates
- **[MEDIUM impact / low effort]** Add a linter (ESLint, Prettier, Ruff, golangci-lint, etc.) and configure it to run in CI

## Score Rationale

Overall score is a weighted sum of six pillar scores (each scored 0–10).

| Pillar | Weight | Raw Score | Contribution |
|--------|--------|-----------|-------------|
| Security | 25% | 3.5 | 0.88 |
| Governance | 20% | 0.0 | 0.00 |
| Community | 15% | 2.5 | 0.38 |
| AI Readiness | 15% | 2.5 | 0.38 |
| Inclusive Language | 15% | 3.5 | 0.53 |
| Technical Rigor | 10% | 3.0 | 0.30 |
| **Overall** | **100%** | | **2.50** |

---
*quaid-scanner v0.1.2 | 2026-06-01T21:29:03.194Z*
*Commit: b306954c3ddaeeb59bf51a9456430112945fab7e*