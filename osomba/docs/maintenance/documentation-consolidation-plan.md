# Documentation Consolidation & Organization Plan

## 1. Current State Assessment
The `docs/` directory currently contains several redundant or overlapping files, especially concerning backend architecture and project setup. This leads to confusion regarding the "Source of Truth."

### Key Observations:
- **Backend Redundancy**: There are 7+ files describing backend architecture, MVC, and DI. `backend_refactoring_master_plan.md` was intended to merge these, but the originals still exist.
- **Setup Overlap**: `developer_setup_guide.md` and `development_workflow.md` share similar instructions for local environment setup.
- **Scattered Utilities**: Guides like `scrubbing_secrets.md` and `testing_cleanup_guide.md` are at the root level, making the root cluttered.

---

## 2. Proposed Directory Structure

I propose organizing the documentation into functional categories:

```text
docs/
├── architecture/           # System-wide and component architecture
│   ├── backend.md          # Consolidated backend master plan
│   ├── mobile.md           # Mobile app architecture
│   ├── infrastructure.md   # AWS and Network details
│   └── feature-traces.md   # How features flow through the stack
├── guides/                 # How-to guides for developers
│   ├── setup.md            # Local environment setup
│   ├── workflow.md         # Deployment, branching, and release process
│   ├── testing.md          # Running and writing tests
│   └── database.md         # Alembic migrations and RDS management
├── maintenance/            # Operational reports and cleanup tools
│   ├── lint-remediation.md # Current linting status
│   ├── scrubbing-secrets.md
│   └── testing-cleanup.md
└── figma/                  # Design assets
```

---

## 3. Consolidation Mapping

### A. The Backend "Source of Truth"
**Action**: Consolidate all backend architectural docs into `docs/architecture/backend.md`.
- **Source Files**:
    - `backend_refactoring_master_plan.md` (Base)
    - `backend_documentation.md`
    - `backend_architecture_pipeline.md`
    - `backend_mvc_architecture.md`
    - `backend_mvc_refinement_plan.md`
    - `backend_dependency_injection_guide.md`
    - `backend_di_refinement_plan.md`
- **Result**: One comprehensive guide covering the 4-layer model, MVC, DI, and the service layer.

### B. Developer Onboarding
**Action**: Merge setup and workflow basics into `docs/guides/setup.md`.
- **Source Files**:
    - `developer_setup_guide.md`
    - `development_workflow.md` (Local dev parts)
- **Result**: A single "Day 1" guide for new developers.

### C. General Testing
**Action**: Rename `TESTING.md` to `docs/guides/testing.md`.

### D. Infrastructure & Feature Mapping
**Action**: Move `aws_infrastructure.md` and `feature_architecture.md` to `docs/architecture/`.

---

## 4. Execution Steps

1.  **Create Folders**: Create `architecture/`, `guides/`, and move `maintenance/` content.
2.  **Synthesize Backend Doc**: Merge the 7 backend files into one authoritative `backend.md`.
3.  **Synthesize Setup Doc**: Merge the setup guides into one authoritative `setup.md`.
4.  **Update Links**: Update `README.md` and `Project_info.md` to point to the new locations.
5.  **Archive/Delete**: Remove the redundant source files once verification is complete.

---

## 5. Review Requested
Please review this structure. If approved, I will begin the migration and synthesis of these documents.
