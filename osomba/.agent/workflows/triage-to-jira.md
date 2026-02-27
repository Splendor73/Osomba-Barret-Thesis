---
description: Converts unstructured notes/chat into professional Jira issues using Format A/B.
---

## Steps
1. Read the provided text, file, or chat history to extract requirements.
2. Use `searchJiraIssuesUsingJql` to ensure no duplicates exist for these tasks.
3. Apply the `project-manager-jira` skill.
4. Generate an **Implementation Plan** artifact showing the proposed Jira descriptions formatted according to `task-format-template.md`.
5. **Stop and Wait:** Require user approval before calling `createJiraIssue`.