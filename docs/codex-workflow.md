# Codex Workflow and MCP Setup

## Recommended MCP Servers for This Project
- GitHub MCP
  - Use for PR checks, workflow status, and issue tracking.
- Supabase MCP
  - Use for schema inspection, SQL runs, policy checks, and RPC debugging.
- Vercel MCP
  - Use for deployment status, environment variable checks, and logs.

## Suggested Setup Order
1. Connect GitHub MCP.
2. Connect Supabase MCP using your project token.
3. Connect Vercel MCP for deploy visibility.

## How to Work with Codex Effectively
- Ask for one vertical slice at a time.
  - Example: "Implement `/api/v1/health` + tests only."
- Always request verification output.
  - Example: "Run lint, typecheck, and tests and summarize failures."
- Keep prompts decision-complete.
  - Include constraints, acceptance criteria, and what not to change.
- Prefer review mode before merge.
  - Example: "Do a bug/risk-focused review of this diff."

## Prompt Patterns
- Architecture:
  - "Propose 2 options with tradeoffs, then recommend one."
- Implementation:
  - "Implement exactly this plan; do not change unrelated files."
- Learning:
  - "Explain this file by file with why, not only what."
- Hardening:
  - "List the top 5 production risks and concrete mitigations."
