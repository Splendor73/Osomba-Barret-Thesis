# BI-WEEKLY PROGRESS REPORT #1
## Customer Care Forum + AI Help Board - Getting Started

---

**Student:** Yashu Gautamkumar Patel (ypatel37@asu.edu)  
**Thesis Director:** Dr. Steven Osburn  
**Sponsor:** Yannick Nkayilu Salomon (Kimuntu Power Inc.)  
**Period:** Weeks 1-2 (Planning Phase)  
**Date:** November 30, 2025  
**Time Spent:** 12 hours

---

## WHAT I ACCOMPLISHED

Hey! So these past two weeks have been all about planning and getting my head around what I'm actually building. I spent most of my time figuring out the technical architecture, designing the database, and writing down all the requirements. Here's what I got done:

### 1. Figured Out What Users Actually Need

First thing I did was sit down and think about who's going to use this forum and what they need. I came up with three main types of users:

**Customers** - These are regular Somba marketplace users who have questions like "Why isn't my MPESA payment showing up?" or "How do I create a listing?" They just want quick answers without having to wait for support agents.

**Agents** - These are the support staff who answer questions. Right now they're answering the same questions over and over, which is super inefficient. They need a way to answer once and turn that answer into something reusable.

**Admins** - Support managers who need to see how everything's working, like how many questions are getting answered and which topics come up the most.

I also wrote down the main categories we'll organize everything into: Payments, Listings, Safety, Disputes, Account, and Delivery. These came from looking at what Somba users typically ask about.

**The Big Goals:**
- Help 70% of users find answers on their own (without creating a new post)
- Let users find what they need in under 5 minutes
- Make it easy for agents to turn good answers into FAQ articles with just one click

### 2. Designed the Overall System

Next, I sketched out how the whole system will work. It's basically a standard web app with three parts:

**Frontend (what users see):**
I'm planning to build this with Next.js, which is a React framework. I picked this because it's good for SEO (so Google can find our forum posts), and honestly it's what I'm most comfortable with. The frontend will have different views:
- A search bar where anyone can search both FAQs and forum posts
- A page where customers can post new questions
- A dashboard for agents to see unanswered questions
- An admin panel for analytics and user management

**Backend (the API server):**
This will be Node.js with Express. It'll handle all the business logic like:
- User login and authentication (using JWT tokens)
- Creating and managing forum posts
- The AI suggestion system
- Sending email notifications when agents answer questions

**Database:**
I'm using PostgreSQL because it can do both regular database stuff AND the vector search I need for the AI suggestions (using something called pgvector). This keeps everything in one place instead of having to manage multiple databases.

I also took the time to map out the **data flows** for key actions—like exactly what happens step-by-step when a user posts a question—to make sure I wasn't missing any logic between the frontend and backend.

### 3. Designed the Database

This took a while to figure out, but I ended up with 8 main tables:

**users** - Stores user accounts with their email, password (hashed for security), and role (customer/agent/admin)

**categories** - The 6 support categories I mentioned earlier, with names in both English and French

**forum_posts** - All the questions customers post, including the title, body, which category it's in, and its status (open, answered, locked, or closed)

**official_answers** - When an agent answers a question, it goes here. Each forum post can only have one official answer (I made sure of this with database constraints)

**faq_articles** - The knowledge base articles that agents can create either manually or by converting good forum answers

**content_embeddings** - This is for the AI part - it stores vector representations of FAQs and forum answers so we can do semantic search (finding similar content even if the words are different)

**ai_query_logs** - Tracks every query someone makes to the AI Help Board, so we can measure how well it's working

**user_sessions** - Manages login sessions with refresh tokens

The cool part is everything's connected properly with foreign keys, and I set up some automatic triggers. Like when an agent posts an official answer, the forum thread automatically changes from "open" to "answered."

### 4. Wrote Out All the API Endpoints

I documented 19 different API endpoints that the frontend will call. Here are some examples:

**For authentication:**
- POST /auth/register - Sign up
- POST /auth/login - Log in
- POST /auth/logout - Log out

**For the forum:**
- GET /forum/posts - List all posts (with filters for category, status, etc.)
- POST /forum/posts - Create a new question
- POST /forum/posts/{id}/official-answer - Let agents post official answers

**For FAQs:**
- GET /faq/articles - List FAQ articles
- POST /faq/convert-from-forum/{id} - Turn a forum answer into an FAQ (this is the one-click conversion thing)

**For AI suggestions:**
- POST /ai/suggest - User asks a question, get back relevant FAQ/forum suggestions
- POST /ai/escalate - If AI doesn't help, create a forum post

**For admins:**
- GET /admin/analytics - View stats like deflection rate, response times, etc.

Each endpoint has full documentation of what data it expects and what it returns. I also defined rate limits (100 requests/minute) and input validation rules to prevent abuse.

### 5. Documented All the Requirements

I wrote down everything the system needs to do in a requirements document. This includes:

**User Stories** - 15 different scenarios like "As a customer, I want to search for answers so I can solve my problem quickly" or "As an agent, I want to convert a forum answer to an FAQ with one click."

**Functional Requirements** - The specific things the system must do, like "System shall allow authenticated users to create forum posts" and "System shall only show AI suggestions from approved content (no hallucinations)."

**Non-Functional Requirements** - Performance and quality stuff, like "Search results must load in under 500ms" and "AI suggestions must return in under 2 seconds."

I also included a **Risk Assessment** section where I looked at things that could go wrong (like OpenAI costs getting too high) and wrote down my backup plans.

I also wrote down what's explicitly OUT of scope for this thesis (like video tutorials, live chat, or deploying to all Somba users - this is just a pilot).

---

## MAIN DECISIONS I MADE

### Decision 1: Using One Database Instead of Two

I had to decide whether to use separate databases for regular data (forum posts, users) and AI embeddings, or keep everything in one PostgreSQL database using the pgvector extension.

**I went with one database** because:
- It's simpler to manage - just one database connection instead of two
- I can update a FAQ and its embedding in a single transaction
- Supabase (the hosting I'm planning to use) includes pgvector in their free tier
- It's fast enough for the pilot scale (we're not talking about millions of posts here)

The trade-off is that a dedicated vector database like Pinecone would be faster for huge scale, but we won't need that for this thesis.

### Decision 2: OpenAI for Embeddings (with a Backup Plan)

For the AI suggestions, I need to convert text into "embeddings" (basically numbers that represent meaning). I decided to use OpenAI's embedding API as my primary choice, with Sentence-BERT (open-source) as a backup.

**Why OpenAI:**
- Really good quality, especially for handling both English and French
- It's a managed API so I don't have to host anything
- Cost is reasonable - probably $10-30 for the whole pilot

**Why I have a backup:**
- If costs get too high, I can switch to Sentence-BERT which is free
- If OpenAI has downtime, I'm not completely stuck
- I'm setting up cost alerts so I don't get surprised by the bill

### Decision 3: Next.js for the Frontend

I picked Next.js (React framework) over other options like Vue.js.

**Why:**
- The forum posts will be publicly searchable on Google (SEO matters)
- There's a huge community and tons of tutorials
- TypeScript support is built-in, which helps catch bugs
- My thesis director knows React, so code reviews will be easier
- Vercel (who makes Next.js) has free hosting for projects like this

### Decision 4: JWT Authentication

For login, I'm using JWT (JSON Web Tokens) instead of traditional sessions.

**Why:**
- It's stateless - the API servers don't need to check a session database on every request
- It makes horizontal scaling easier later
- It's a pretty standard approach that's well-documented
- Access tokens expire after 24 hours, refresh tokens after 30 days

The main downside is I can't instantly revoke someone's access token (have to wait for it to expire), but for this use case that's fine.

---

## CHALLENGES I'M THINKING ABOUT

### Challenge 1: Handling English and French

The whole system needs to support both English and French. That's more complicated than it sounds because:
- The UI needs to be translated
- Users can post in either language
- Search needs to work across languages
- AI suggestions need to handle both

**My plan:**
- For this semester, I'm building everything in English but setting up the architecture to support French
- The database has a "language" field on every post and FAQ
- I'm using i18n (internationalization) libraries so translating later is straightforward
- OpenAI embeddings work with both languages in the same model

For the pilot, English is the priority. French support will be "ready to go" but not fully translated.

### Challenge 2: Making Sure AI Doesn't Hallucinate

This is super important - I can't have the AI making up wrong answers about payments or refunds.

**My solution:**
Instead of letting the AI generate new text, it only searches through approved content:
- Published FAQ articles (written by agents)
- Forum threads that have official answers (verified by agents)
- Nothing from random web searches or open forum posts

When someone asks a question, the AI shows them the top 3-5 matching articles/threads with their actual titles and snippets. Users can click through to read the full content. If nothing matches well (similarity score below 0.6), it just says "We couldn't find a good answer, please post your question to the forum."

This way there's no risk of hallucination - it's more like smart search than AI generation.

### Challenge 3: Performance at Scale

I'm a bit worried about the database getting slow if there are thousands of posts.

**What I'm doing:**
- Adding indexes on all the commonly searched fields
- Using caching (Redis) for popular FAQ articles
- Limiting results to 20 per page (no loading huge lists)
- Planning to do performance testing with fake data before the pilot
- Vector search uses approximate nearest neighbor which is way faster than exact search

For the pilot with 50-100 users, this should be totally fine. If it scales way bigger after my thesis, it might need more optimization.

---

## WHAT I'M DOING NEXT (WEEKS 3-4)

Now that all the planning is done, I'm moving into design:

1. **User Flows** - Map out exactly how customers, agents, and admins move through the system
2. **Wireframes** - Sketch low-fidelity mockups of the main screens
3. **Figma Mockups** - Create high-fidelity designs with Somba's branding
4. **Component Library** - Design reusable UI components (buttons, cards, forms, etc.)
5. **Get Feedback** - Show everything to Dr. Osburn and Yannick to make sure I'm on the right track

I'm also going to start researching RAG (Retrieval-Augmented Generation) more deeply to make sure I understand all the options for the AI part.

---

## PROOF OF WORK

I've completed four detailed documents that cover everything:

1. **System Architecture Document (16 pages)** - Full breakdown of the frontend, backend, and database with diagrams and explanations
2. **Database Schema Document (18 pages)** - Every table, field, relationship, and index with examples
3. **API Endpoint Specification (22 pages)** - All 19 endpoints with request/response examples
4. **Requirements Document (20 pages)** - User stories, functional requirements, success criteria

All of these are attached and ready for review.

---

## TIME BREAKDOWN

**Week 1:** 6 hours
- Figuring out requirements and user personas (2 hours)
- Researching technology options and designing architecture (3 hours)
- Meeting prep (1 hour)

**Week 2:** 6 hours
- Designing database schema (2.5 hours)
- Writing API documentation (2.5 hours)
- Putting this report together (1 hour)

**Total:** 12 hours

---

## WHAT I NEED FROM YOU

I'd love feedback on:

1. Does the architecture make sense? Any red flags with my technology choices?
2. Is the database design good? Am I missing any important fields?
3. Are the API endpoints covering everything we need?
4. Do the success metrics (70% deflection rate, 20+ FAQs, <6hr response time) seem realistic?
5. Is the scope reasonable for two semesters?

Happy to chat about any of this in more detail!

---

## WRAPPING UP

These two weeks were all about getting the foundation solid. I now have a clear plan for what I'm building, how it'll work technically, and what success looks like. Everything is documented and ready to move into the design phase.

Next up is making this all visual - wireframes, mockups, and prototypes. Looking forward to showing you what the actual interface will look like!

---

**Yashu Patel**  
November 30, 2025

**Next report:** December 14, 2025 (covering design work)