# AGENTS

Canonical policy source:
- `/hdd/sites/stuartpringle/whisperspace-rules-api/AGENTS.md`

Shared helper scripts (single source of truth):
- `/hdd/sites/stuartpringle/whisperspace-rules-api/codex-shared/`

Mandatory controls for this repo (do not skip):
1. Read canonical policy + security context:
   - `/hdd/sites/stuartpringle/whisperspace-rules-api/AGENTS.md`
   - `/hdd/sites/stuartpringle/whisperspace-rules-api/PROJECT-OVERVIEW.md`
   - `/hdd/sites/stuartpringle/whisperspace-rules-api/PROJECT-SECURITY.md`
2. Run guardrail audit before commit:
   - Preferred: `npm run codex:audit:batch` (if available in this repo).
   - Fallback: `git diff --staged | codex exec "Audit this diff for security/workflow/docs drift. Return critical/high findings first."`
3. Run documentation audit before commit:
   - Preferred: `npm run codex:audit:docs` (if available in this repo).
   - Fallback: `/hdd/sites/stuartpringle/whisperspace-rules-api/codex-shared/codex-docs-audit.sh`
4. Resolve critical/high audit findings before commit.
5. Keep this repo README integration-focused and update `/hdd/sites/stuartpringle/whisperspace-rules-api/PROJECT-OVERVIEW.md` whenever contracts/auth/release workflow/shared behavior changes.

Repo-specific additions:
- Keep this section minimal and only add true local exceptions.
