---
description: Summarizes actual branch changes and transitions the Jira ticket to Done.
---

## Steps
1. Identify the Jira key from the current branch name (e.g., `git branch --show-current`).
2. Run `git diff main...HEAD` in the terminal to capture the actual code changes.
3. Apply the `project-manager-jira` skill to synthesize these changes.
4. Call `addCommentToJiraIssue` using the "Technical Subtask Completion" format from your examples.
5. Call `getTransitionsForJiraIssue` and transition the issue to "Done".