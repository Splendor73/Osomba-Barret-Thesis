# Standard Jira Comment Examples

When adding comments to Jira, match the structure and depth of the following examples based on the context of the update.

---

## Example 1: Technical Subtask Completion
*Use this when closing out a technical implementation step.*

### Subtask Completed: Expand PostgreSQL Profile Schema & Implement Onboarding API

I have finalized the database expansion and API implementation required to support the user onboarding flow.

**Key Achievements:**
- **Schema Expansion:** Added `city`, `country`, and `bio` fields to the SQLAlchemy `User` model. These fields are essential for transitioning from a skeleton JIT-provisioned record to a complete user profile.
- **Alembic Migration:** Created and successfully applied migration `f8e786bf5812` to the RDS instance.
- **Onboarding Endpoint:** Implemented `POST /api/v1/auth/onboard`. This endpoint handles the atomic update of user profiles and toggles the `is_onboarded` flag to `True`.
- **E2E Verification:**
  - Verified **Just-In-Time (JIT) Provisioning:** Confirmed that logging into the mobile app creates a skeleton record in RDS (Verified with user ID 18).
  - Verified **Onboarding Logic:** Backend unit tests confirm that the onboarding endpoint correctly updates all new fields and enforces security (users can only onboard themselves).
- **Security:** The onboarding process is fully secured by Cognito JWT verification via the `get_current_user` dependency.

**Status:** Done. **RDS Verification Check:** Passed (User successfully provisioned).

---

## Example 2: Task Roadmap & Architectural Update
*Use this when updating a parent task with a shift in strategy, sequence, or architecture.*

### Updated Development Roadmap: Sane Integration & JIT Provisioning

Following an architectural review, we are pivoting to a more maintainable **"Hybrid JIT"** approach. This eliminates the complexity of cross-cloud database synchronization and consolidates our data strategy.

**Key Architectural Shift:**
- **Remove Post-Confirmation Lambda:** We are decommissioning the Lambda trigger to avoid VPC/networking overhead.
- **Just-In-Time (JIT) Provisioning:** The FastAPI backend will now automatically create a "skeleton" user record in PostgreSQL upon the first verified request.
- **Consolidation to PostgreSQL:** We are moving away from Amplify Data (DynamoDB) for UserProfiles. All marketplace profile data will reside in our relational database.

**Updated Roadmap:**
1. **Foundation (KPS-125):** Align PostgreSQL models with `cognito_sub` and `is_onboarded` flags.
2. **JIT Logic:** Implement provisioning logic in the FastAPI `get_current_user` dependency.
3. **RSA Security:** Implementation of offline JWT verification using cached JWKS in the backend.
4. **Onboarding Guard:** Build the Flutter UI to redirect users with `is_onboarded == false` to the profile completion wizard.
5. **Decommissioning:** Cleanup obsolete Amplify triggers and schemas.

Refer to the updated [BACKEND_INTEGRATION_GUIDE.md](https://github.com/hestonhamilton/osomba/blob/feature/heston-hamilton-auth/auth_sandbox/docs/BACKEND_INTEGRATION_GUIDE.md) for technical detail on this implementation.