# Somba Marketplace: Unified Support Forum and FAQ with AI-Assisted Answers

**Student:** Yashu Gautamkumar Patel (ypatel37@asu.edu)
**Thesis Director:** Steven Osburn (sdosburn@asu.edu)
**Second Committee Member:** Yannick Nkayilu Salomon (yannkayilu@kimuntupower.com)

## TOPIC OVERVIEW
This honors thesis project will be combined with the engineering capstone course (CSE 485/486) at the Ira A. Fulton Schools of Engineering. Our sponsor is **Kimuntu Power Inc. (Somba Marketplace)**, led by Yannick Nkayilu Salomon. Somba is a multi-country buyer–seller marketplace with English and French support that helps people list, discover, and transact safely. As the platform grows, one of the biggest challenges is providing users with fast, reliable help on topics like payments, listings, disputes, account access, delivery, and safety.

The capstone team is working on the core marketplace app. At the same time, my **Barrett thesis focuses on building a Customer Care Forum** where customers can ask questions, get official answers from Somba agents, and search through past answers and short how-to guides (FAQ). The goal of the forum and FAQ is to cut down on repeated questions, make support more transparent, and speed up resolution times for common issues across key categories like Payments, Listings, Safety, Disputes, Account, and Delivery.

To support the forum and FAQ, I'm also developing an **AI Help Board** that suggests answers drawn only from approved, existing content, specifically FAQ articles and previously answered forum threads. The assistant shows clear titles and snippets and doesn't pull from external sources. When it can't find a reliable match, it directs users to post a new question on the forum. This approach prioritizes accuracy, proper citations, and safe escalation rather than generating open-ended responses.

While this project aligns closely with Somba's mission and the capstone's goals, the thesis is an independent, student-owned subsystem with its own deliverables, evaluation plan, and written component. The expected outcome is a practical improvement to Somba's support experience helping users find answers quickly on their own, allowing agents to turn quality answers into reusable FAQ entries, and laying groundwork for multilingual support (starting with English, with French scaffolded in) as the marketplace continues to scale.

## PROJECT DELIVERABLES

### 1) Customer Care Forum + FAQ (MVP)
*   **a. Unified search bar** that pulls results from both FAQ articles and forum threads, with clear labels showing which is which.
*   **b. Post question flow** where users can create a new thread and must select a category (Payments, Listings, Safety, Disputes, Account, Delivery, or Other).
*   **c. Official Answer feature** for agents, including the ability to lock or close a thread once it's resolved.
*   **d. Agent bookmark => FAQ function** that lets agents convert an official answer into a formatted FAQ article with one click.
*   **e. Roles & Access:** Three user types (Customer, Agent, Admin) with appropriate permissions enforced for each.
*   **f. Languages:** Built in English for now, with French scaffolding in place (string catalogs and language switch ready for future implementation).

### 2) AI Help Board
*   **a.** Users can ask a question and receive ranked suggestions showing the most relevant FAQ articles and forum threads (with titles and short previews).
*   **b.** If suggestions aren’t helpful, users can post directly to the forum from the AI board (prefilled title/body + category picker).
*   **c.** Basic logging and telemetry to track what users ask, which sources get shown, and when users escalate to the forum, this data will help with evaluation later.

## PROJECT DESCRIPTION

### Summary
This thesis builds a **Customer Care Forum** for the Somba marketplace where users can ask questions, receive official answers from agents, and search through past answers and FAQ articles to help themselves. An **AI Help Board** suggests answers using only approved FAQ content and previously answered forum threads. If there's no good match, users can create a forum post that's already partially filled out. The main goals are to cut down on duplicate questions, improve time-to-resolution, and build user trust, starting with English and French scaffolding set up for later.

### Technologies (subject to change)
At this prospectus stage, I'm keeping implementation details intentionally flexible since they'll likely evolve as I actually build the project. The system will follow standard web-app patterns, include role-based access controls (customer/agent/admin), and use a constrained answer-suggestion service that only pulls from approved internal content. I'll document the final technical choices in the design doc once I've worked through them.

## MEETINGS
*   **Thesis Director:** Weekly/bi‑weekly check‑ins for scope, evaluation, and writing progress.
*   **Second Committee Member / Sponsor:** Bi‑weekly product reviews focusing on usefulness, categories, answer policy/tone, and KPI tracking.
*   **Additional meetings** as needed during pilot and evaluation.

## GROUP MEMBERS (CAPSTONE REFERENCE)
This capstone project team includes: **Yashu Gautamkumar Patel, Justin Aussie, Heston Hamilton, Kylan Kirschbaum, Yuda Wang**. The thesis is an individual effort delivering the Customer Care Forum subsystem; the capstone app may link to it but does not depend on it.

## TIMELINE

| Date | Tasks/Deliverables |
| :--- | :--- |
| **September 26th, 2025** | Sponsor meeting; scope confirmed |
| **September 30th, 2025** | Prospectus submitted |
| **September 23rd, 2025** | Sprint 0 complete |
| **October 7th, 2025** | Sprint 1 complete |
| **October 14th, 2025** | Sprint 2 complete |
| **November 4th, 2025** | Sprint 3 complete |
| **November 11th, 2025** | Sprint 4 complete |
| **December 2nd, 2025** | Sprint 5 complete |
| **December 9th, 2025** | Fall freeze; seed Top-20 FAQs |
| **December 12th, 2025** | Fall progress review (sponsor + director) |
| **January 13th, 2026** | Pilot start (limited users); KPI dashboard live |
| **January 27th, 2026** | Mid-pilot check-in |
| **February 3rd, 2026** | Pilot wrap; begin thesis writing |
| **March 6th, 2026** | Defense & Thesis Approval Form due |
| **April 3rd, 2026** | Recommended defense completed |
| **April 17th, 2026** | Director approval due |
| **April 17th, 2026** | Final thesis submission due |

*(The timeline provided above may be subject to adjustments as necessary.)*