# BI-WEEKLY PROGRESS REPORT #3
## Customer Care Forum + AI Help Board - Setup & Research Phase

---

**Student:** Yashu Gautamkumar Patel (ypatel37@asu.edu)  
**Thesis Director:** Dr. Steven Osburn  
**Sponsor:** Yannick Nkayilu Salomon (Kimuntu Power Inc.)  
**Period:** Weeks 5-6 (Technical Research Phase)
**Date:** December 3, 2025
**Time Spent:** 12 hours

---

## WHAT I ACCOMPLISHED

So these past two weeks were all about deep technical research and planning. I moved from design into understanding the actual technologies I'll use—researching how the AI will work, comparing cloud platforms, and documenting my technical decisions. Here's what I got done:

### 1. Researched AI Strategy (RAG Pipeline)

The biggest thing I tackled was figuring out exactly how the AI Help Board will work. I needed to understand RAG (Retrieval-Augmented Generation) and pick the right approach.

**What's RAG?**  
Instead of having the AI make up answers, RAG systems retrieve real documents first, then use those to suggest answers. It's like giving the AI a textbook to reference instead of asking it to guess.

**The Pipeline I Designed:**
1. User asks a question
2. System converts it to an embedding (numbers that represent meaning)
3. Searches the database for similar FAQs and forum threads
4. Ranks results by similarity score
5. Shows top 3-5 suggestions with titles and snippets
6. If nothing scores above 60%, suggests "Post to Forum" instead

**Embedding Models I Compared:**

I spent a lot of time comparing options:

**OpenAI text-embedding-ada-002:**  
- Pros: Really high quality, handles English and French, super easy API
- Cons: Costs money (but only ~$20-30 for the pilot)
- Decision: My primary choice

**Sentence-BERT (open-source):**  
- Pros: Completely free, no API needed
- Cons: Slightly lower quality, more setup
- Decision: Keeping as backup if costs get high

I went with OpenAI as primary because it gives the best results, but I have Sentence-BERT ready if I need to switch.

### 2. Designed Content Constraints

This is super important—I need to make sure the AI only suggests approved content. No hallucinations.

**What counts as approved?**
- ✅ Published FAQ articles (written by agents)
- ✅ Forum threads with "Official Answers"
- ❌ Random web pages
- ❌ Open forum posts without official answers

The vector database will only store embeddings for approved content, so the system literally can't suggest anything else.

**Citation System:**  
Every suggestion shows its source:
- "From FAQ: How do I pay with MPESA?"
- "From Forum Post: [title] (answered by [agent])"

**Confidence Threshold:**  
If the best match is below 60% similarity, don't show it—just suggest posting to the forum.

### 3. Researched Cloud Platform Options (AWS)

I spent a lot of time understanding which cloud platform would work best for this project. After comparing options, AWS emerged as the best fit.

**Why AWS:**
- Integrated AI services (AWS Bedrock for embeddings and LLMs)
- Managed authentication (AWS Cognito)
- Scalable database options (AWS RDS with PostgreSQL + pgvector)
- Simple hosting for Next.js (AWS Amplify)
- Everything stays within one ecosystem (easier security and cost management)

**Services I'm Planning to Use:**
- **AWS Bedrock**: For AI embeddings (Titan) and text generation (Claude)
- **AWS Cognito**: For user authentication and role management
- **AWS RDS (PostgreSQL)**: For the database with pgvector extension
- **AWS Amplify**: For hosting the Next.js app and CI/CD

**Alternatives I Considered:**
- **OpenAI API**: Great but more expensive and data leaves AWS
- **Google Cloud**: Good AI but less familiar with their services
- **Self-hosted**: Too much maintenance overhead

I documented all of these decisions in the Tech Stack document so I have a clear plan for next semester.

### 4. Drafted FAQ Seed Content

I worked with Yannick to identify the Top-20 most common questions. These will be the initial content for testing.

**The Top-20 FAQs:**

**Payments (5):** How to pay with MPESA, what if payment fails, refund timing, credit card usage, double charges

**Listings (4):** How to create/edit/delete listings, why listing doesn't show in search

**Safety (3):** Report scams, buyer protections, verify sellers

**Disputes (3):** Open disputes, process after filing, cancel disputes

**Account (3):** Reset password, change email, delete account

**Delivery (2):** Delivery timing, missing items

I've drafted answers for about half of these. Yannick is helping with the rest.

---

## MAIN DECISIONS I MADE

### Decision 1: PostgreSQL + pgvector Instead of Separate Vector DB

I chose to use PostgreSQL with pgvector instead of a dedicated vector database like Pinecone.

**Why:**
- Keeps everything in one database (simpler)
- pgvector is fast enough for pilot scale
- AWS RDS supports pgvector (v15+)
- No need to sync data between two databases

### Decision 2: AWS Cognito Instead of Custom JWT Auth

I decided to use AWS Cognito for authentication instead of building my own JWT system.

**Why:**
- Fully managed (no need to write password hashing, token refresh logic)
- Built-in security features (MFA, compromised credential checks)
- Scales automatically
- Integrates seamlessly with AWS Amplify SDK
- Can split apart later if needed

### Decision 3: Similarity Threshold at 60%

I set the confidence threshold at 60% for showing AI suggestions.

**Why:**
- In testing, anything above 60% felt relevant
- Below 60%, suggestions were too random
- I can adjust based on pilot data

### Decision 4: AWS Bedrock Instead of OpenAI

I'm using AWS Bedrock (Titan Embeddings) instead of OpenAI's API.

**Why:**
- Data stays within AWS (better security and privacy)
- Lower cost (< $1 for entire pilot vs. $20-30 with OpenAI)
- Lower latency (no external API calls)
- Integrated with AWS IAM (no API keys to manage)
- Estimated pilot cost: < $5 total

---

## CHALLENGES I'M THINKING ABOUT

### Challenge 1: Cold Start Problem

When the pilot launches, there will only be 20 FAQs. That's not a lot for the AI to search.

**My solution:**  
Make sure those 20 FAQs cover common questions really well, then immediately convert good forum answers to FAQs. Track queries that don't find matches so I can create FAQs for those topics.

### Challenge 2: Learning AWS Services

I've never used AWS Bedrock or Cognito before, so there's a learning curve.

**My plan:**
- Follow AWS official tutorials and documentation
- Start with simple "hello world" examples before building the real features
- Budget extra time in January for learning and troubleshooting
- Reach out to Dr. Osburn if I get stuck

### Challenge 3: Keeping the Scope Manageable

It's tempting to add lots of features now that I'm researching, but I need to stay focused on the core MVP.

**My plan:**
Stick to the original scope: Search, AI Suggestions, Forum Posts, FAQ Management. Everything else (notifications, analytics dashboards, user reputation) goes into a "Phase 2" list for after the thesis if there's time.

---

## WHAT I'M DOING NEXT (JANUARY - SEMESTER 2)

Now that the research is done, I'm ready to start the actual implementation in January:

**Phase 4 Goals (Weeks 7-8) - Initial Setup:**
1. Set up AWS account and configure services (Cognito, RDS, Amplify)
2. Initialize Next.js project with TypeScript and Tailwind
3. Set up PostgreSQL database with pgvector extension
4. Create the database schema (8 tables from Report #1)
5. Implement basic authentication flow with AWS Cognito

**Phase 5 Goals (Weeks 9-10) - Core Features:**
1. Build forum CRUD operations (create, read, update posts)
2. Build FAQ management for agents
3. Implement search functionality
4. Integrate AWS Bedrock for AI embeddings
5. Test the RAG pipeline with Top-20 FAQs

---

## PROOF OF WORK

I've completed comprehensive research documentation which includes:

### 1. AI Strategy Document
**What:** RAG pipeline design, embedding model comparison (AWS Bedrock vs OpenAI), constraint logic to prevent hallucinations, and performance optimization strategy.

**Location:** `Phase_3/artifacts/01_AI_Strategy.md`

**GitHub:** [View on GitHub](https://github.com/Splendor73/Osomba-Barret-Thesis/blob/main/Phase_3/artifacts/01_AI_Strategy.md)

---

### 2. Tech Stack Document
**What:** Complete technology decisions for the entire stack:
- Frontend: Next.js + React + TypeScript + Tailwind
- Backend: Next.js API Routes (serverless)
- Database: AWS RDS (PostgreSQL + pgvector)
- Auth: AWS Cognito
- AI: AWS Bedrock (Titan + Claude)
- Hosting: AWS Amplify

**Location:** `Phase_3/artifacts/04_Tech_Stack.md`

**GitHub:** [View on GitHub](https://github.com/Splendor73/Osomba-Barret-Thesis/blob/main/Phase_3/artifacts/04_Tech_Stack.md)

---

### 3. Authentication Flow Document
**What:** Visual breakdown of AWS Cognito authentication flow with token management, including sequence diagrams and implementation checklist.

**Location:** `Phase_3/artifacts/02_Auth_Flow.md`

**GitHub:** [View on GitHub](https://github.com/Splendor73/Osomba-Barret-Thesis/blob/main/Phase_3/artifacts/02_Auth_Flow.md)

---

### 4. FAQ Seed Content
**What:** Top-20 questions drafted across 6 categories (Payments, Listings, Safety, Disputes, Account, Delivery) with draft answers.

**Location:** `Phase_3/artifacts/03_FAQ_Seeds.md`

**GitHub:** [View on GitHub](https://github.com/Splendor73/Osomba-Barret-Thesis/blob/main/Phase_3/artifacts/03_FAQ_Seeds.md)

---

### 5. This Progress Report
**Location:** `Phase_3/Report_3.md`

**GitHub:** [View on GitHub](https://github.com/Splendor73/Osomba-Barret-Thesis/blob/main/Phase_3/Report_3.md)

---

## TIME BREAKDOWN

**Week 5:** 6 hours
- AI research (RAG concepts, embeddings comparison) (3 hours)
- AWS services research (Bedrock, Cognito, RDS, Amplify) (2 hours)
- Writing AI Strategy Document (1 hour)

**Week 6:** 6 hours
- Tech stack research and comparison (2 hours)
- Documenting technology decisions (2 hours)
- FAQ content planning with Yannick (1 hour)
- Report writing (1 hour)

**Total:** 12 hours

---

## WRAPPING UP

These two weeks were super productive. I feel like I finally moved from abstract design to concrete technical decisions. The AI research was tough—there are so many ways to do RAG, and comparing cloud platforms took longer than expected—but now I'm confident in my approach.

The research is complete, all technology choices are documented with rationale, and I have a clear implementation roadmap for January. I'm really excited to start the actual coding and seeing this thing come to life!

The biggest win was choosing AWS as the unified platform—it simplifies everything by keeping auth, database, AI, and hosting all in one ecosystem. This should make development and deployment much smoother next semester.

---

## WORK
- [GitHub Repository](https://github.com/Splendor73/Osomba-Barret-Thesis.git)

---

**Yashu Patel**
December 3, 2025
