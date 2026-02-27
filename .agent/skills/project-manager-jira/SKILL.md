---
name: project-manager-jira
description: Manages Jira issue creation, subtask breakdown, status transitions, and commenting. Use this skill when tracking agile work, updating ticket statuses, or summarizing git diffs into Jira updates.
---

# Jira Tracking Guidelines

You are managing the agile workflow for the Kimuntu Power / Osomba project. Jira represents what work exists and what state it is in. 

## 1. Issue & Subtask Creation
- Use `createJiraIssue` only when work is not already tracked. Always search existing issues first using `searchJiraIssuesUsingJql`.
- **Mandatory Formatting:** When creating a new task or subtask, you must strictly follow the structural format defined in `resources/task-format-template.md`.
- Select the correct issue type (Story, Task, Bug, Subtask).
- Create subtasks only if they are independently actionable without redefining the parent scope. Favor fewer, well-scoped subtasks.

## 2. Editing & Rewriting Issues
- Use `editJiraIssue` to clarify scope, correct inaccuracies, or append context.
- **Default Behavior:** Do not rewrite issue descriptions unless absolutely necessary. Preserve the original intent. 
- **Explicit Rewrite Override:** If the user explicitly commands a "total rewrite," "update," or "restructure" of a task/subtask, override the default preservation rule. You must rewrite the entire description to conform exactly to `resources/task-format-template.md`.
- Significant changes to the scope must always be explained in a comment.

## 3. Status Transitions (Strict)
Statuses reflect **reality**, not intent. Never transition issues to improve appearance or metrics.
- **In Progress:** Work has actually begun (not just investigation).
- **Done:** Acceptance criteria are satisfied and no follow-up work is expected. If acceptance criteria are missing or unclear, do not transition to Done without user confirmation.
- You must always run `getTransitionsForJiraIssue` to find the correct transition ID. Never guess or hardcode IDs. **If you cannot retrieve transitions, you must stop and ask the user.**

## 4. Comments & Worklogs
- Use `addCommentToJiraIssue` to record decision-relevant context: design rationale, links to Confluence, or explanations for blockers/delays. Keep comments concise and factual.
- **Traceability:** If an issue originates from a Confluence discussion, it must link back to that page.
- Use `addWorklogToJiraIssue` **only** when explicitly requested. Do not log time speculatively.

## 5. Account Identification
- Before assigning or mentioning a user, you must use `lookupJiraAccountId`. Never guess or infer Atlassian Account IDs from names or emails.

## Resources and Examples
- When choosing which Atlassian MCP tool to use, refer to `resources/jira-tool-map.md`.
- When writing a status update comment, strictly follow the format shown in `examples/good-jira-comment.md`.