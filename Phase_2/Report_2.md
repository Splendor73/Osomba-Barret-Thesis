# BI-WEEKLY PROGRESS REPORT #2
## Customer Care Forum + AI Help Board - Design Phase

---

**Student:** Yashu Gautamkumar Patel (ypatel37@asu.edu)  
**Thesis Director:** Dr. Steven Osburn  
**Sponsor:** Yannick Nkayilu Salomon (Kimuntu Power Inc.)  
**Period:** Weeks 3-4 (Design Phase)  
**Date:** December 14, 2025  
**Time Spent:** 14 hours

---

## WHAT I ACCOMPLISHED

So these past two weeks were all about taking those technical plans from Report #1 and making them visual. I moved from abstract requirements to actual designs that show how the forum will look and work. Here's what I got done:

### 1. Mapped Out User Flows

First thing I did was figure out exactly how users will move through the app. I created detailed diagrams for the three main personas:

**Customers:** I mapped out their journey from searching for an answer, to seeing AI suggestions, to finally posting a question if they're stuck.

**Agents:** I defined their workflow for finding unanswered posts, writing official answers, and the "one-click" process to turn those answers into FAQs.

**Admins:** I sketched out how they'll access analytics and manage user roles.

This really helped me catch some logic gaps—like realizing customers need a "My Questions" page to track their own history.

### 2. Created Low-Fidelity Wireframes

Next, I sketched out the screens without worrying about colors or fancy design. I made 12 different wireframes just to get the layout right.
I focused on the key screens:
- The Homepage with a big, prominent search bar
- The Forum Thread view showing the "Official Answer" clearly highlighted
- The "Ask a Question" form with a rich text editor
- The AI Help Board with its conversational interface

### 3. Designed High-Fidelity Mockups

Once the layouts made sense, I moved to Figma to make it look real. I built a mini design system with Somba's branding (Blue #2563EB for primary actions).
I designed:
- A clean, mobile-friendly interface (since most users are on phones)
- Visual cues like green badges for "Official Answers" so they stand out
- A confidence score display (star ratings) for the AI suggestions so users know if they can trust the result

### 4. Defined Information Architecture

I also spent time organizing the content. I finalized the 6 main support categories (Payments, Listings, Safety, Disputes, Account, Delivery) and assigned icons to each to make them easy to scan. I also defined exactly what metadata goes into an FAQ article versus a forum post.

---

## MAIN DECISIONS I MADE

### Decision 1: Mobile-First Design

I decided to design for mobile screens first, then adapt for desktop.

**Why:**
- Most Somba users are accessing the site from their phones.
- It forces me to prioritize the most important features (screen space is limited).
- It's easier to scale up a design than to try and cram a complex desktop site onto a small screen later.

### Decision 2: Rich Text Editor for Agents

I decided agents need a proper rich text editor (bold, lists, links) for writing answers, rather than just a plain text box.

**Why:**
- Support answers often need steps (1, 2, 3...) or links to policies.
- It makes the "Official Answer" look much more professional.
- When we convert that answer to an FAQ, the formatting carries over automatically.

### Decision 3: Showing "Confidence Scores" for AI

For the AI Help Board, I decided to explicitly show a "match score" (like "95% Match" or 5 stars) next to every suggestion.

**Why:**
- It builds trust—if the AI isn't sure, we tell the user.
- It helps users decide whether to click a suggestion or just post their question.
- If all scores are low, the user knows immediately that the AI probably doesn't have the answer.

### Decision 4: Separate "AI Help Board" Page

I kept the AI Help Board as a separate page from the main search bar.

**Why:**
- The main search is for keywords. The AI Board is for conversational questions ("My money hasn't arrived yet").
- It keeps the mental models clear for the user.
- It allows me to track "AI Deflection Rate" specifically for that feature.

---

## CHALLENGES I'M THINKING ABOUT

### Challenge 1: Balancing Simplicity vs. Features

I wanted to add a lot of cool stuff (user reputation, badges, complex filters), but I realized it was getting too complicated for an MVP.

**My solution:** I ruthlessly cut features. I'm sticking to the core loop: Search -> Ask -> Answer -> Convert to FAQ. Everything else goes into a "Phase 2" bucket for next semester if I have time.

### Challenge 2: Making Users Trust the AI

I'm worried users might think the AI is just a generic chatbot that gives bad advice.

**My solution:**
- I'm calling it "AI Suggestions" not "AI Chatbot".
- Every suggestion clearly cites its source ("From FAQ: How to Pay").
- I'm always offering a "Still need help? Ask a human" button right below the results.

### Challenge 3: Accessibility

Making the site usable for everyone is harder than I thought.

**My plan:**
- I'm checking color contrast ratios for all my text.
- I'm designing focus states so you can navigate with just a keyboard.
- I'm making sure all form inputs have proper labels for screen readers.

---

## WHAT I'M DOING NEXT (WEEKS 5-6)

Now that the designs are done, I'm shifting gears to technical setup:

1. Setting up the Next.js project and GitHub repo
2. Configuring the PostgreSQL database with pgvector
3. Researching the specific RAG (Retrieval-Augmented Generation) pipeline I'll use
4. Drafting the initial "seed" FAQs so the AI has something to search

---

## PROOF OF WORK

I've completed the design package which includes:

1. **User Flow Diagrams** - Detailed charts for Customer, Agent, and Admin workflows.
   - [View Artifact](Phase_2/User_flow/01_User_Flows.md)

2. **Wireframes & Mockups** - From sketches to high-fidelity designs.
   - [View Artifacts](Phase_2/UI-UX/UI-images/)

3. **Figma Design System** - The component library and interactive prototypes.
   - [View Code](Phase_2/UI-UX/Figma_code/)

4. **Information Architecture** - The category structure and navigation map (included in this report).

---

## TIME BREAKDOWN

**Week 3:** 7 hours
- Creating user flows (2 hours)
- Low-fidelity wireframing (3 hours)
- Information architecture planning (2 hours)

**Week 4:** 7 hours
- High-fidelity mockup design in Figma (4 hours)
- Building component library (1.5 hours)
- Documentation and report writing (1.5 hours)

**Total:** 14 hours

---

## WRAPPING UP

These two weeks were super productive. I feel like I have a really clear vision of what the product will look like now. The wireframes helped me solve a lot of UX problems on paper before I wrote a single line of code.

I'm really excited to start building the actual thing in the next phase. The design is locked in, and I'm ready to get my hands dirty with the code!

---

## WORK
- [GitHub Repository](https://github.com/Splendor73/Osomba-Barret-Thesis.git)