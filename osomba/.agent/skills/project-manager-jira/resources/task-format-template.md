# Jira Task & Subtask Structure Template

When creating a new issue or explicitly asked to rewrite an existing one, you must strictly follow the format below depending on whether the issue is a Parent Task/Story or a Subtask. 

---

## FORMAT A: PARENT TASKS & STORIES
Use this format for high-level deliverables and user-facing features.

**User Story** As a [persona], I want to [action] so that [value/benefit].

***

**Context** A 2-3 sentence explanation of how this fits into the broader architecture. Bridge the gap between the user need and the technical reality (e.g., connecting a Flutter UI flow to a specific database model).

***

**In Scope**
- [ ] Deliverable or feature boundary 1.
- [ ] Deliverable or feature boundary 2.

***

**Out of Scope**
- [ ] Explicitly state what is NOT being built (e.g., deferred integrations).

***

**Acceptance Criteria**
- [ ] Measurable, testable condition 1.
- [ ] Measurable, testable condition 2.

***

**Risk Management**
- **Risk**: [Identify a potential technical, data, or UX failure].
  - **Mitigation**: [Actionable step to prevent the risk].

***

**Total Estimated Effort:** [X] points ([X] hours)

---

## FORMAT B: SUBTASKS
Use this format for the technical implementation steps that roll up into a Parent Task.

**Goal**
A concise, 1-2 sentence explanation of the specific technical objective for this subtask (e.g., extending a PostgreSQL schema or implementing a specific API endpoint).

***

**In Scope**
1. **[Component/Layer]:** [Specific technical action, e.g., Update the SQLAlchemy model].
2. **[Component/Layer]:** [Specific technical action, e.g., Generate Alembic migration].

***

**Acceptance Criteria**
- [ ] Technical test condition 1 (e.g., Endpoint returns 200 OK).
- [ ] Technical test condition 2 (e.g., Database reflects new schema).

***

**Risk Management**
- **Risk**: [Identify a specific implementation risk, e.g., migration failure or state management bug].
  - **Mitigation**: [How the developer should prevent it, e.g., write unit tests or prototype in a sandbox].