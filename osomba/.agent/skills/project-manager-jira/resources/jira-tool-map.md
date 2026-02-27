# Quick Intent → Tool Map for Jira

## 1. Discovery & Reading
- Read a specific ticket's current description and state → `getJiraIssue`
- Avoid duplication or find existing tickets → `searchJiraIssuesUsingJql`
- Find a teammate's Atlassian Account ID for assignments or mentions → `lookupJiraAccountId`
- Check if a Confluence page is already linked to a ticket → `getJiraIssueRemoteIssueLinks`

## 2. Creation & Modification
- Track new work (Stories/Tasks) → `createJiraIssue`
- Break down existing work (Subtasks) → `createJiraIssue` (Set issue type to "Subtask" and map the Parent Issue ID)
- Clarify scope or execute an explicitly requested "total rewrite" → `editJiraIssue`
- Check required fields/schema before creating a complex issue → `getJiraProjectIssueTypesMetadata`

## 3. State Management & Tracking
- **Prerequisite for ANY status change:** Find valid transition IDs for the specific ticket → `getTransitionsForJiraIssue`
- Reflect work has started → `transitionJiraIssue` (using the ID fetched above)
- Reflect work is complete → `transitionJiraIssue` (using the ID fetched above)
- Record design decisions, git diff summaries, or rationale → `addCommentToJiraIssue`
- Log time/effort (only when explicitly requested) → `addWorklogToJiraIssue`