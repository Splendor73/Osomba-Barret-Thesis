---
description: Analyzes a Jira Story and generates technical subtasks for parallel agent execution.
---

## Steps
1. Read the specified Jira Story key using `getJiraIssue`.
2. Apply the `project-manager-jira` skill logic to determine the technical breakdown.
3. Create subtasks for Frontend (Flutter) and Backend (FastAPI) using **Format B** in the description.
4. Output a **Task List** artifact summarizing the subtasks.