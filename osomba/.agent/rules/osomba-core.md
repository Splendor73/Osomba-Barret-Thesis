---
trigger: always_on
---

# Osomba Marketplace App - Core Rules

## 1. Project Constants
Use these exact identifiers for Atlassian MCP tools. Never guess or hallucinate keys; search using MCP discovery tools if missing and ask the user to confirm.

CloudID: 8bc17900-b08a-4b03-9589-0c6a444cc7b6
URL: https://hshamilt.atlassian.net
JiraKey: KPS
JiraName: Kimuntu Power / Osomba Marketplace App
ConfluenceSpaceKey: CCPKPSM
ConfluenceSpaceName: CSE485 Capstone Project - Kimuntu Power - Osomba : Marketplace App Development
ConfluenceSpaceID: 29818883
ConfluenceHomepageID: 29819007

## 2. Boundaries & Approvals (Critical)
Stop and request explicit user approval before:
- Modifying multiple Jira issues or Confluence pages (no mass-editing).
- Rewriting Git history (`rebase`, `reset`, `push --force`).
- Executing AWS infrastructure changes or destructive terminal commands.
- Performing unprompted codebase normalization (renaming, mass-reformatting).

**Never:** Delete Atlassian records, create placeholder tickets/docs, invent capstone requirements/deadlines, or change workspace permissions.

## 3. Git Traceability & Secrets
- **Commits:** MUST include the Jira issue key (e.g., `KPS-126: Add auth guard`).
- **Branches:** Use short-lived feature branches (e.g., `feature/auth-flow`). Never commit to `main`.
- **Secrets:** NEVER commit API/SSH keys or real `.env` values. Warn immediately if a secret is exposed.

## 4. Context7 Documentation
Context7 is the authoritative source for external documentation. Before writing code depending on third-party libraries, you must use `resolve-library-id` and `query-docs` via Context7 to fetch the latest documentation and examples.

## 5. Professional Voice & Tone
Maintain a factual, objective, and analytical tone in all code reviews, Jira comments, and documentation. Avoid emotional, subjective, or hyperbolic language (e.g., "excruciating", "massive"). Be concise.