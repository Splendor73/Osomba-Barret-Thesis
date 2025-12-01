# Somba Customer Care Forum: Requirements Document

## Project Information
**Thesis Title:** Customer Care Forum + AI Help Board for Somba Marketplace  
**Author:** Yashu Gautamkumar Patel  
**Thesis Director:** Steven Osburn  
**Sponsor:** Yannick Nkayilu Salomon (Kimuntu Power Inc.)  
**Date:** November 30, 2025  
**Version:** 1.0

---

## Executive Summary

This document defines the functional and non-functional requirements for the Somba Customer Care Forum, a support subsystem designed to help marketplace users find answers to common questions through:
1. A searchable forum where customers can post questions and receive official answers from agents
2. A curated FAQ library built from agent-verified solutions
3. An AI Help Board that suggests relevant content using constrained retrieval-augmented generation

The system aims to reduce support burden, improve time-to-resolution, and build user trust as Somba scales across multiple African countries.

---

## Problem Statement

### Current Challenges:
1. **Repetitive Questions:** Support agents repeatedly answer the same questions about payments, listings, disputes, account issues, and delivery
2. **Slow Resolution:** Users wait hours or days for agent responses to common issues
3. **No Knowledge Base:** Resolved issues aren't captured for future self-service
4. **Scaling Difficulty:** As Somba expands to more countries, agent-only support becomes unsustainable
5. **Language Barriers:** English and French speakers need consistent support experiences

### Target Outcomes:
- **70% deflection rate:** 7 out of 10 queries resolved via FAQ or forum search (no new ticket)
- **Sub-5-minute self-service:** Users find answers in under 5 minutes
- **Agent efficiency:** Convert quality answers to reusable FAQs in one click
- **Trust building:** Transparent, searchable answers show Somba cares about support

---

## User Personas

### 1. **Customer (Primary User)**
**Profile:**
- Somba marketplace buyer or seller
- Age: 18-45
- Tech-savvy (smartphone user) but may have limited internet
- Languages: English or French
- Pain points: Needs quick help with payments, listings, disputes, account issues, delivery

**Goals:**
- Find answers quickly without contacting support
- Post questions when self-service doesn't help
- Get clear, official answers from Somba agents
- Understand resolution steps in their language

---

### 2. **Agent (Support Staff)**
**Profile:**
- Somba customer support agent
- Fluent in English and/or French
- Handles 20-50 support queries daily
- Pain points: Repeatedly answering the same questions, no central knowledge base

**Goals:**
- Browse unanswered forum threads efficiently
- Provide official answers that customers trust
- Convert quality answers to FAQ articles in one click
- Reduce ticket volume through better self-service tools

---

### 3. **Admin (Support Manager)**
**Profile:**
- Oversees customer support team
- Monitors KPIs (response time, resolution rate, customer satisfaction)
- Pain points: No visibility into support trends, can't measure deflection rate

**Goals:**
- Monitor forum and FAQ usage metrics
- Identify knowledge gaps (high-volume unanswered questions)
- Manage user roles (promote customers to agents)
- Ensure content quality and moderation

---

## User Stories

### Customer Stories

**US-C1:** As a **customer**, I want to **search for answers across both FAQ and forum posts** so that **I can find solutions quickly without posting a new question**.

**Acceptance Criteria:**
- Unified search bar on homepage
- Results show both FAQ articles and forum threads
- Each result clearly labeled as "FAQ" or "Forum Post"
- Results ranked by relevance and recency
- Search works in both English and French

---

**US-C2:** As a **customer**, I want to **post a question to the forum with a required category** so that **agents can find and answer it quickly**.

**Acceptance Criteria:**
- Post form requires: title, body, category selection
- Categories: Payments, Listings, Safety, Disputes, Account, Delivery, Other
- Form validates minimum title length (10 chars) and body length (20 chars)
- User can select language (English/French) for their post
- Confirmation message shown after successful submission

---

**US-C3:** As a **customer**, I want to **view official answers on forum threads** so that **I know which solutions are verified by Somba agents**.

**Acceptance Criteria:**
- Official answers have a visual badge (e.g., "Official Answer" tag)
- Official answers appear prominently (pinned to top of thread)
- Only one official answer allowed per thread
- Show agent name and timestamp on official answers

---

**US-C4:** As a **customer**, I want to **ask a question to the AI Help Board and see suggested solutions** so that **I can get instant help without waiting for agents**.

**Acceptance Criteria:**
- AI Help Board accepts text queries
- Returns top 3-5 suggestions from FAQ and officially answered forum threads
- Each suggestion shows: title, snippet (first 200 chars), source type (FAQ/Forum), category
- If no good match (similarity score < 0.6), suggest "Post to Forum" with pre-filled form
- Query and results logged for analytics

---

### Agent Stories

**US-A1:** As an **agent**, I want to **browse unanswered forum threads filtered by category** so that **I can prioritize and respond efficiently**.

**Acceptance Criteria:**
- Agent dashboard shows list of open (unanswered) threads
- Filter by category
- Sort by creation date (oldest first) or view count (most urgent)
- Each thread preview shows: title, author, category, timestamp, view count

---

**US-A2:** As an **agent**, I want to **provide an official answer to a forum thread** so that **customers see a verified solution**.

**Acceptance Criteria:**
- "Provide Official Answer" button on thread detail page (agent-only)
- Rich text editor for answer formatting
- Preview before submitting
- After submission, thread status changes from "open" to "answered"
- Customer who posted gets notification (email/in-app)

---

**US-A3:** As an **agent**, I want to **convert a forum answer into an FAQ article with one click** so that **I can build the knowledge base efficiently**.

**Acceptance Criteria:**
- "Bookmark as FAQ" button appears on threads with official answers
- Clicking button creates draft FAQ with:
  - Title: forum post title
  - Body: official answer text
  - Category: inherited from forum post
  - Language: inherited from forum post
- Agent can edit draft before publishing
- FAQ embedding generated automatically when published

---

**US-A4:** As an **agent**, I want to **lock or close resolved threads** so that **customers know the issue is resolved and agents don't re-answer**.

**Acceptance Criteria:**
- "Lock Thread" and "Close Thread" buttons on thread detail page (agent-only)
- Locked threads: no new replies allowed, still visible in search
- Closed threads: archived, hidden from default search
- Status badge displayed on thread (Open/Answered/Locked/Closed)

---

### Admin Stories

**US-AD1:** As an **admin**, I want to **view analytics on forum and AI Help Board usage** so that **I can measure support effectiveness**.

**Acceptance Criteria:**
- Dashboard shows:
  - Total forum posts (open vs. answered)
  - Average agent response time
  - Total FAQ views
  - AI deflection rate (queries resolved without forum post)
  - Top 10 most-asked questions
  - Category distribution
- Date range filter (last 7 days, 30 days, custom range)

---

**US-AD2:** As an **admin**, I want to **promote customers to agent role** so that **I can scale my support team**.

**Acceptance Criteria:**
- User management page lists all users
- Search/filter by email or name
- "Change Role" button opens dropdown (Customer/Agent/Admin)
- Role change takes effect immediately
- Audit log records role changes (who changed, when)

---

**US-AD3:** As an **admin**, I want to **manage categories (add, edit, archive)** so that **the forum stays organized as the marketplace grows**.

**Acceptance Criteria:**
- Category management page
- Add new category: name (EN/FR), slug, icon, display order
- Edit existing categories
- Archive (soft delete) unused categories
- Re-order categories by drag-and-drop

---

## Functional Requirements

### 1. Authentication & Authorization

**FR-1.1:** System shall support user registration with email and password  
**FR-1.2:** System shall enforce password strength requirements (min 8 chars, 1 uppercase, 1 number, 1 special char)  
**FR-1.3:** System shall implement JWT-based authentication with 24-hour access tokens  
**FR-1.4:** System shall support three user roles: Customer, Agent, Admin  
**FR-1.5:** System shall enforce role-based access control on all protected endpoints  
**FR-1.6:** System shall allow users to reset password via email link

---

### 2. Forum Post Management

**FR-2.1:** System shall allow authenticated users to create forum posts with title, body, and category  
**FR-2.2:** System shall validate forum posts (title: 10-200 chars, body: 20-5000 chars)  
**FR-2.3:** System shall automatically set post status to "open" on creation  
**FR-2.4:** System shall allow agents to provide official answers to open threads  
**FR-2.5:** System shall update thread status to "answered" when official answer is added  
**FR-2.6:** System shall allow agents to lock or close threads  
**FR-2.7:** System shall prevent multiple official answers per thread (database constraint)  
**FR-2.8:** System shall track view count for each forum post

---

### 3. FAQ Article Management

**FR-3.1:** System shall allow agents to create FAQ articles manually  
**FR-3.2:** System shall allow agents to convert forum answers to FAQ articles with one click  
**FR-3.3:** System shall create converted FAQs in "draft" status for agent review  
**FR-3.4:** System shall support FAQ article statuses: draft, published, archived  
**FR-3.5:** System shall allow agents to edit FAQ articles  
**FR-3.6:** System shall track view count and helpful count for FAQ articles  
**FR-3.7:** System shall link converted FAQs to source forum posts (foreign key)

---

### 4. Search Functionality

**FR-4.1:** System shall provide unified search across forum posts and FAQ articles  
**FR-4.2:** System shall use full-text search (PostgreSQL tsvector) for keyword matching  
**FR-4.3:** System shall rank results by relevance (ts_rank) and recency  
**FR-4.4:** System shall label each result as "FAQ" or "Forum Post"  
**FR-4.5:** System shall filter forum results to only show threads with official answers or locked/closed status  
**FR-4.6:** System shall filter FAQ results to only show published articles  
**FR-4.7:** System shall support search in both English and French

---

### 5. AI Help Board

**FR-5.1:** System shall accept text queries from users (authenticated or anonymous)  
**FR-5.2:** System shall generate embeddings for queries using OpenAI text-embedding-ada-002 or Sentence-BERT  
**FR-5.3:** System shall perform vector similarity search against FAQ articles and officially answered forum threads  
**FR-5.4:** System shall rank results by semantic similarity score (cosine similarity)  
**FR-5.5:** System shall return top 3-5 suggestions with title, snippet, category, source type  
**FR-5.6:** System shall only suggest from approved content (published FAQs, officially answered forums)  
**FR-5.7:** System shall NOT generate open-ended LLM responses or pull from external sources  
**FR-5.8:** System shall log all queries with: query text, results shown, similarity scores, timestamp  
**FR-5.9:** System shall track escalation (when user posts to forum after AI suggestions)  
**FR-5.10:** System shall provide "Post to Forum" option if similarity score < 0.6 for all results

---

### 6. Notifications

**FR-6.1:** System shall send email notification to customer when agent provides official answer to their thread  
**FR-6.2:** System shall send email notification to agents when new forum post is created  
**FR-6.3:** System shall allow users to opt out of email notifications in settings

---

### 7. Multilingual Support

**FR-7.1:** System shall support English and French UI languages  
**FR-7.2:** System shall allow users to set language preference in profile  
**FR-7.3:** System shall allow users to toggle language via UI switcher  
**FR-7.4:** System shall store forum posts and FAQ articles with language tag  
**FR-7.5:** System shall filter search results by user's selected language (default: user preference)

---

### 8. Analytics & Reporting

**FR-8.1:** System shall track and display:
- Total forum posts (by status)
- Average agent response time
- Total FAQ views
- AI query count
- Deflection rate (queries NOT escalated to forum)
- Top 10 most-asked questions (from AI logs)
- Category distribution

**FR-8.2:** System shall allow admins to export analytics data as CSV

---

## Non-Functional Requirements

### 1. Performance

**NFR-1.1:** Search queries shall return results in < 500ms for 95% of requests  
**NFR-1.2:** AI Help Board suggestions shall return in < 2 seconds for 95% of requests  
**NFR-1.3:** System shall support 100 concurrent users without degradation  
**NFR-1.4:** Page load time shall be < 3 seconds on 3G mobile connection

---

### 2. Scalability

**NFR-2.1:** System shall handle 10,000 forum posts without performance degradation  
**NFR-2.2:** System shall support horizontal scaling (stateless API servers)  
**NFR-2.3:** Database shall support read replicas for search queries

---

### 3. Security

**NFR-3.1:** All API endpoints shall use HTTPS in production  
**NFR-3.2:** Passwords shall be hashed using bcrypt (cost factor 10)  
**NFR-3.3:** JWT tokens shall expire after 24 hours  
**NFR-3.4:** System shall sanitize all user inputs to prevent XSS attacks  
**NFR-3.5:** System shall implement rate limiting (100 requests/minute per user)  
**NFR-3.6:** System shall log all admin actions for audit trail

---

### 4. Reliability

**NFR-4.1:** System shall have 99% uptime during pilot period  
**NFR-4.2:** Database shall be backed up daily  
**NFR-4.3:** System shall handle API errors gracefully with user-friendly messages

---

### 5. Usability

**NFR-5.1:** UI shall be mobile-responsive (works on screens 320px+)  
**NFR-5.2:** Forms shall provide inline validation with clear error messages  
**NFR-5.3:** System shall follow WCAG 2.1 Level AA accessibility guidelines  
**NFR-5.4:** UI copy shall be clear and jargon-free (8th-grade reading level)

---

### 6. Maintainability

**NFR-6.1:** Codebase shall be hosted on GitHub with CI/CD pipeline  
**NFR-6.2:** All API endpoints shall be documented with OpenAPI/Swagger  
**NFR-6.3:** Database schema changes shall use versioned migrations  
**NFR-6.4:** Code shall include unit tests (min 70% coverage for business logic)

---

## Constraints

**C-1:** Development timeline: 2 semesters (Fall 2025 and Spring 2026)  
**C-2:** Budget: Limited to free-tier or low-cost cloud services (Vercel, Supabase, Railway)  
**C-3:** Technology stack: Must integrate with existing Somba infrastructure (if applicable)  
**C-4:** Pilot scope: Limited to 50-100 beta users in January 2026  
**C-5:** Language support: English (full), French (scaffolded for future)

---

## Assumptions

**A-1:** Somba will provide access to test user accounts for pilot  
**A-2:** Agents will be available to seed initial FAQ content (Top-20 articles)  
**A-3:** Users have smartphone access (no desktop-only features)  
**A-4:** OpenAI API or equivalent will remain accessible for embeddings  
**A-5:** Sponsor will provide timely feedback during bi-weekly reviews

---

## Dependencies

**D-1:** OpenAI API (or Sentence-BERT for embeddings)  
**D-2:** Email service (e.g., SendGrid for notifications)  
**D-3:** Cloud hosting (Vercel, Railway, AWS)  
**D-4:** Database hosting (Supabase, AWS RDS)  
**D-5:** CI/CD pipeline (GitHub Actions)

---

## Success Criteria

The system will be considered successful if it meets the following criteria by April 2026:

**Quantitative Metrics:**
1. **Deflection Rate:** ≥ 70% of AI Help Board queries do NOT escalate to forum
2. **Response Time:** Average agent response time < 6 hours for forum posts
3. **FAQ Coverage:** ≥ 20 published FAQ articles covering top support topics
4. **User Adoption:** ≥ 60% of pilot users use search or AI Help Board before posting
5. **System Uptime:** ≥ 99% during pilot period

**Qualitative Metrics:**
1. **User Satisfaction:** ≥ 4.0/5.0 average rating in pilot user survey
2. **Agent Feedback:** Agents report reduced repetitive work in interviews
3. **Code Quality:** Passes code review by thesis director and sponsor
4. **Documentation:** Complete technical documentation and user guide

---

## Out of Scope (For This Thesis)

The following features are explicitly OUT OF SCOPE for this thesis project:

**OS-1:** Direct integration with Somba mobile app (forum will be standalone web app)  
**OS-2:** Video tutorials or multimedia FAQ content  
**OS-3:** Community voting/gamification (upvotes, badges, reputation)  
**OS-4:** Live chat with agents  
**OS-5:** Advanced AI features (sentiment analysis, auto-categorization)  
**OS-6:** Mobile app development (web-only for now)  
**OS-7:** Full production deployment to all Somba users (pilot only)

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OpenAI API cost exceeds budget | High | Medium | Use Sentence-BERT (open-source) as backup |
| Low user adoption in pilot | Medium | Medium | Conduct user interviews, improve onboarding |
| Agent training delays | Medium | Low | Create clear documentation and video walkthrough |
| Database performance issues | High | Low | Implement caching, optimize indexes, use read replicas |
| Scope creep from sponsor | Medium | Medium | Maintain strict MVP definition, defer features to post-thesis |

---

## Approval & Sign-Off

**Thesis Director Approval:**  
Name: _______________________  
Signature: _______________________  
Date: _______________________

**Sponsor Approval:**  
Name: _______________________  
Signature: _______________________  
Date: _______________________

**Student Acknowledgment:**  
Name: Yashu Gautamkumar Patel  
Signature: _______________________  
Date: November 30, 2025

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 30, 2025 | Yashu Patel | Initial requirements document |

---

**End of Requirements Document**
