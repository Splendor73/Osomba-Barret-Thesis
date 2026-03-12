OSOMBA MARKETPLACE: UNIFIED SUPPORT FORUM AND FAQ WITH AI-ASSISTED ANSWERS

Yashu Gautamkumar Patel
ypatel37@asu.edu

Thesis Director: Steven Osburn
sdosburn@asu.edu

Second Committee Member: Yannick Nkayilu Salomon
yannkayilu@kimuntupower.com

Barrett, The Honors College
Ira A. Fulton Schools of Engineering
Arizona State University
Spring 2026

---

Acknowledgments

I would like to thank Dr. Steven Osburn for directing this thesis. His willingness to help me at each step is truly appreciated, and with his honest and straightforward feedback, he helped me push through the technical aspect as well as the written part of the thesis. Along with that, I am grateful to Yannick Nkayilu Salomon, CEO of Kimuntu Power, for sponsoring the project and for always being available during the whole process. A lot of the design decisions in this project came directly from conversations with him about what real Osomba users will struggle with and how we can solve that. He shared his vision of Osomba, which gave me the foundation to build this thesis project on. Thanks to my family for putting up with late nights and weekend coding sessions. I also would like to thank all the people who helped me directly or indirectly throughout this journey.
 
---

Table of Contents

1. Abstract
2. Introduction
3. Objective and Goals
4. Methodology
5. Technical Details
   5.1 Backend Development
   5.2 Customer Flow
   5.3 Agent Flow
   5.4 Admin Flow
   5.5 Deployment
6. Challenges
7. Ethical and Social Impact
8. Conclusion
9. Appendix

---

Abstract

I built a Customer Care Forum, FAQ system, and AI Help Board for the Osomba Marketplace, which is a buyer-seller platform that operates across several African countries. For the backend I used FastAPI with PostgreSQL, and I also added the pgvector extension to handle semantic search. AWS Bedrock was used to generate vector embeddings using the Titan Embed Text v2 model, while Amazon Nova Micro was used to handle English to French translation. The authentication part of this application runs through AWS Cognito, while the email notifications go through AWS SES. On the frontend I used React with TypeScript and styled the interface with Tailwind CSS. One of the important features of this application is that users will be able to search across FAQ articles and forum threads at the same time, as well as get AI-ranked suggestions with confidence scores. If there are no matches they will be able to post a new question to the forum. The difference between a basic forum and this application is the following: firstly, agents will be able to convert good answers into FAQ articles with one click, secondly, the AI will show confidence stars so that users know how relevant each result is, and thirdly, admins will also get a dashboard that tracks measurements such as deflection rate and average response time.

---

Introduction

This project is part of the CSE 485/486 engineering capstone at ASU, and the sponsor for this project is Kimuntu Power Inc., which is the company behind the Osomba Marketplace. Osomba connects buyers and sellers across several African countries while supporting payments through MPESA and AirtelMoney, and it also needs to work in both English and French.

My capstone team handled the core marketplace features, which includes user registration, product listings, payments, and order tracking. However, my thesis went in a different direction. During our early sponsor meetings Yannick kept bringing up the same issue, which was that as more users join the platform there needs to be a way to help them when they have questions about features such as payments failing, listings not showing up, or delivery problems. It is not possible to just hire more support staff for every new country the platform expands into, which is why I built three features to solve this. Firstly, a Customer Care Forum where users will be able to post questions and get official answers from Osomba support agents. Secondly, a FAQ system where the best answers will get saved for reuse. And thirdly, an AI Help Board that will try to match user questions to existing content before they need to create a new post. The idea behind this is simple: over time the knowledge base will grow on its own and fewer questions will need a human to answer them.

---

Objective and Goals

The main goal was simple. Give Osomba users one place to go when they need help. This meant that no emailing support, nor any need to scroll through scattered documents. Rather, only one search bar that pulls results from both FAQ articles and forum threads. The results will be labeled clearly so that the user can identify the curated FAQ from the past forum discussion.

Additionally, I also wanted to make it simpler for the support team. Agents will be able to mark replies as official answers, lock threads once they are resolved, and turn good answers into FAQ articles with one click. There will be no need to rewrite anything from scratch. Admins will be provided a dashboard that shows if the support system is actually working by tracking measurements such as how many AI queries got resolved without a human, and how long it takes on average to answer a question. The whole project will work on mobile devices and have the ability to switch between languages (English and French) so that Osomba will be effective in Francophone countries.

---

Methodology

Before writing any code, I looked at how existing support platforms operated. I tried Zendesk Community and Freshdesk, where I paid attention to how they organize questions into categories, how their search functions, and how moderators mark answers as official. Stack Overflow was also studied since it handles the Q&A format effectively. The main takeaway from this research was that I did not want to build a chatbot, because chatbots generate answers on the fly and they sometimes produce inaccurate responses, which is a problem when dealing with real money and real transactions. Rather, I decided to build a forum with an AI layer on top where the AI will only suggest existing approved content and will not make anything up.

The work was broken into six phases across two semesters. In the fall semester I completed three phases. Firstly, Phase 1 was the planning phase, where I defined the requirements, designed the database schema, and mapped out all the API endpoints. Secondly, Phase 2 was the design phase, where the UI mockups were created in Figma and the user flows were mapped out for customers, agents, and admins. Thirdly, Phase 3 was the research phase, where I studied how RAG pipelines work, compared embedding models, and picked the AWS services that would be used. In the spring semester I completed the remaining three phases. Phase 4 was the execution plan, where I mapped every prospectus deliverable to a concrete implementation step. Phase 5 was the building phase, and that is when I wrote the backend, built the frontend, connected all the AWS services, and got everything working end to end. Phase 6 was the final wrap-up, where I documented the full project story, prepared for the thesis defense, and put together the demo.

---

Technical Details

For this project, I used Python with FastAPI for the backend along with PostgreSQL and pgvector for the database. For the frontend, I decided to use React, TypeScript, and Tailwind CSS for styling.

The reason I picked FastAPI is because it handles the request validation and generates API documentation on its own, which helped a lot for the debugging portion of this project. PostgreSQL and AWS were also used because they already existed in the capstone team's environment and any credentials necessary were already set up. AWS Cognito takes care of login and roles, while AWS Bedrock runs the Titan Embed Text v2 model for embeddings as well as Amazon Nova Micro for English to French translation. Additionally, AWS SES sends emails when an agent answers a question and the database sits on Amazon RDS. The benefit of having it all on one provider allowed for the setup to be kept simple, such as only needing one account and one set of keys instead of jumping between different dashboards. pgvector allowed me to put vector embeddings right in the same database, so that I did not need to set up something like Elasticsearch or Pinecone on the side. For the frontend, I went with React and TypeScript because I had used them before and felt comfortable with them. Tailwind CSS allows the interface to scale properly on different screen sizes without writing a large amount of custom CSS.

Backend Development

The backend of this project has four layers. There are the endpoints that take in HTTP requests and then the services handle the logic. After that, CRUD (Create, Read, Update, Delete) allows for the modules to read and write to the database while models define how the tables look.

Figure 1 shows the database schema. I have a ForumCategory table for the six support categories like Payments, Listings, Safety, and so on. ForumTopic holds each thread and it has the title, the body, and a column for a 384-dimensional vector embedding. ForumPost holds the replies where each reply has a flag called is_accepted_answer that agents can turn on. FAQ holds the curated articles and they also have their own embedding column. Then AiQueryLog saves every question someone asks the AI so I can use those logs for analytics later.

Figure 2 shows the forum endpoints. The topics list gives the user paginated results and they can pass a language parameter. If lang=fr is sent, the backend will call Nova Micro so that it can translate the titles before sending them back. When the user opens a single topic, it will translate both the title and the body. If the user decides to create a topic, it will get tied to their account and anyone can reply to a thread.

Figure 3 shows the official answer flow which only agents and admins can use. An agent picks a reply or writes a new one and marks it as the answer. After that the system sends an email through SES to tell the person who asked that their thread got answered.

Figure 4 shows the FAQ endpoints which are basic create, read, update, and delete. However, when a new FAQ is created, the system sends the question and answer text to Amazon Bedrock, which generates a 384-dimensional vector embedding and stores it in the pgvector extension of the PostgreSQL database. This allows the new FAQ entry to appear in semantic search results immediately without any manual indexing.

Figure 5 shows the convert-to-FAQ endpoint which follows a similar process but starts from an existing forum post instead of a blank form. An agent or admin selects a helpful forum reply and the system converts it into a FAQ entry, generating its embedding in the same way.

Figure 6 is the AI suggestion endpoint and you can consider this the "brain" of the AI Help Board. It takes the user's question and generates an embedding, then performs a cosine distance search against both the FAQ and ForumTopic tables. If no scores are high enough it falls back to a basic keyword search. It is important to note that every query gets saved in the log table so that it can be used for analytics.

Figure 7 shows the analytics endpoints which pull data from the logs and forum tables. These endpoints calculate metrics like deflection rate, which measures how often the AI resolves a question without agent involvement, and average response time.

Figure 8 shows how the authorization aspect of this project works. I used Cognito with what is called Just-In-Time provisioning, so that the first time a user logs in the system will create their user record on its own and nobody has to set it up manually.

Customer Flow

A customer will be able to log in and see the Forum Home Page (Figure 9). This is a list of threads where each thread has a category badge, a status tag. These tags can vary from saying Open, Answered, Locked, the number of replies it has, and the person who posted it. There is also a search bar at the top that searches FAQ articles and forum threads together so the user only needs one place to search.

If the customer wants to try the AI part of this project, they will first go to the AI Help Page (Figure 10). The search box will be empty when they get there, but underneath there are clickable example questions such as "How do I pay with MPESA?" and "My order never arrived." Those were placed there so that it gives the user some inspiration for the type of questions they can ask. After it is clicked, it will run the search right away. When results come back they show up as cards (Figure 11). Each card will have a title, a short preview, what category it is in, whether it came from a FAQ or a thread, and the confidence score. The score shows as stars (out of five) along with a percentage. If the match is under 60%, the card will look faded and there is a small warning on it so the user knows it might not be what they need.

If their question is still unanswered, the customer can click "Post to Forum" at the bottom, which saves a record in the backend so the admin can see how often the AI did not have an answer. It will then take the customer to the Post Question Page where the question they typed is already in the title field (Figure 12). They only need to pick a category and add more details. There is also a tips sidebar that says things like "include your order number." After they submit they get sent to their new thread.

When a customer opens a thread they see the Thread Detail Page with the question at the top and replies below it in order (Figure 13). If a reply came from an agent or admin, there will be a badge next to their name. If the reply is an official answer, it will have a green highlight so it is easy to find. Customers can also look at individual FAQ articles on the FAQ Detail Page which shows the whole answer along with a sidebar of related FAQs for further reading (Figure 14). At the bottom there are thumbs up and thumbs down buttons so the team knows which FAQs work and which ones need fixing.

Agent Flow

Agents will be able to see everything customers see, but they will also get extra tools. They will have access to the Agent Dashboard which shows only open and unanswered threads so that agents can prioritize which questions need attention first (Figure 15). Yannick asked for this specifically because he did not want agents wasting time scrolling past threads that are already resolved.

The main work for an agent happens on the Thread Detail Page where they will see the question and replies like a customer does, but with additional controls at the bottom (Figure 16). They will be able to reply and mark it as the official answer, and when they do that the backend will send an email notification to the customer. Agents can also lock a thread after answering it or unlock it if the customer has a follow-up.

The email notification will tell the customer that their question got answered and will include a direct link to the thread (Figure 17). This ensures that customers are informed promptly without needing to check back on the forum manually.

There is also a language toggle in the header. When an agent switches to French, all the content on the page will get translated using Nova Micro (Figure 18). That way a French-speaking agent can read threads posted in English and respond to them. This is important because Osomba operates in countries that speak both English and French.

Admin Flow

Admins will get everything agents have, along with additional management pages. The Analytics Dashboard is usually the first thing they will check because Yannick wanted to know at a glance if the support system is working (Figure 19). There are six metric cards on the page for total posts, how many got answered, active FAQs, AI queries, deflection rate, and average response time. Deflection rate is a key metric because it shows the percentage of users who got help from the AI without ever needing to post a question.

Below the metric cards there are charts that show posts over time and which categories get the most questions so the admin knows where more FAQs are needed (Figure 20). This gives the admin a clear picture of how the support system is performing over time.

The User Management Page will let the admin search users by email and change someone's role from customer to agent or admin (Figure 21). When they change a role, the backend will update both the database and Cognito at the same time so it takes effect right away without needing to log out and back in.

The Category Management Page is for creating and editing the support categories like Payments, Listings, Safety, Disputes, Account, and Delivery (Figure 22). These categories are used throughout the forum and FAQ system to organize content.

Then there is the "Convert to FAQ" button which will only be visible to admins and only on replies that are marked as official answers (Figure 23). When an agent gives a good answer to a common question, the admin can click this button and the system will create a FAQ article out of it while also generating the vector embedding. After that it will show up in search and on the AI Help Board right away. This feature has the most value long term because the knowledge base builds itself from real conversations and nobody has to write FAQ articles from scratch.

Deployment

Everything on the AWS side is live and connected. The database sits on Amazon RDS with the pgvector extension enabled, authentication goes through AWS Cognito, embeddings and translation run through AWS Bedrock, and email notifications are sent through AWS SES. The FastAPI backend communicates with all of these services and is ready to be deployed on Elastic Beanstalk when the main marketplace is ready.

The frontend is built with Vite and is currently running locally for development and testing. However, the build process produces a static bundle so it can be hosted on S3 with CloudFront or Amplify Hosting when the team decides to launch. All the code is stored on GitHub.

---

Challenges

The main issue I had in the project was related to the semantic search. I started with a sentence-transformer model running on my machine, but the model file was too big and the first request after a cold start was too slow to use. I was able to get it to work on my laptop, however it was not going to work in production, which is why I switched to AWS Bedrock Titan Embed Text v2. This provided me with embeddings through an API call so that there is no model to host. However this led to a different issue where the model would sometimes give back vectors that were not exactly 384 dimensions, and it would end up crashing pgvector. To resolve this problem I added code to truncate or zero-pad the vector so that it will always be 384. It may sound like a simple fix, but it took me a while to figure out where the problem was occurring.

The second challenge was related to translation. My initial approach was to store everything in both English and French, however, users post new threads all the time so it is not possible to pre-translate everything. This is why I switched to on-demand translation with Amazon Nova Micro instead, which will only translate content when it is requested. On the home page only the titles will get translated so that the page loads quickly, while the full body will only get translated when someone actually opens a thread. This approach saves on API calls and keeps the pages responsive. There will be a small delay the first time a translated thread is opened while Bedrock processes it, but after that it will load normally.

The third challenge was related to how the AI results are displayed to the user. My first version was a plain list with no way to tell if a match was good or bad, and during testing I noticed that users would just click the first result even when it was barely relevant and then assume the AI was not working properly. To fix this I added a five-star rating as well as a percentage label to each result, while also dimming results below 60% and adding a warning icon on low-confidence matches. This changed everything because users started reading the scores before clicking. On top of that the escalation flow also needed improvement, because initially the "Post to Forum" button would send the user to a blank form and I noticed that users would re-type their entire question from scratch. To resolve this I added a prefill feature so that the title will carry over automatically.

---

Ethical and Social Impact

Osomba operates in countries with very different levels of internet access, where some users will have newer mobile devices while others will be on older Android devices with unreliable connections. I kept that in mind when building the frontend, which is why everything is responsive and will work on small screens as well as larger ones. Pages are kept lightweight and translation will only load when the user requests it so that bandwidth is not wasted.

A lot of Osomba users in Central and West Africa speak French, so if they are not able to read a support page in their own language that becomes a real barrier. This is why the bilingual support was an important part of this project. On top of that the self-service model will help because in many of these regions calling customer service is either expensive or does not work at all, which means that having a forum and FAQ system where users can find answers on their own makes a significant difference.

I was also careful about what the AI does in this project. A lot of AI tools make up answers on the fly, but I did not want that because when dealing with real transactions and real money the information has to be accurate. The AI Help Board will only pull from existing FAQs and answered threads so that it does not generate anything new, and if there is no good match it will tell the user to post on the forum instead. However, there is a risk that comes with this approach, because if an FAQ has bad information the AI will still show it with a high confidence score. This is why I added the voting buttons so that users can flag bad content and agents can then fix it. At the end of the day keeping the information accurate is on the support team rather than the system itself.

There is also an environmental side to consider. Every search will make an embedding call to Bedrock and every French page view will send a translation request to Nova Micro, which on its own is not a concern, however, with thousands of users a day it will add up. The on-demand translation approach helps with this because the system will only translate content that someone actually opens rather than pre-translating everything. If I had more time I would add a cache so that the same content does not get translated again and again, and I think that is probably the best improvement the next developer could make.

---

Conclusion

I built a Customer Care Forum, FAQ system, and AI Help Board for the Osomba Marketplace, which together provide a complete support solution for users across multiple countries. When a marketplace grows across different regions there needs to be a way to help users without having to hire more support staff, and this is the problem my project was designed to solve. The forum and FAQ will allow users to find answers on their own while the AI will try to match their question to existing content before they need to ask a human.

The parts I like most about this project are the convert-to-FAQ feature and the deflection rate metric, because they show the long-term value of the system. Convert-to-FAQ means that the knowledge base will grow from real conversations so that nobody has to write articles from scratch, while deflection rate gives the admin a clear measurement to see if the AI is saving the team time or not. On top of that the confidence stars were a small addition, but they changed how much users trusted the results during testing.

I learned more from the difficult parts of this project than the straightforward ones. I had never used vector databases or Bedrock before, and figuring out pgvector cosine distance took trial and error. Between the embedding model swap, the translation problem, and the confidence score design, all of it pushed me to think about problems differently.

If I had more time I would add a few more features. Firstly, a translation cache so that the same content does not get re-translated over and over. Secondly, voice search for users who prefer talking over typing. And thirdly, category subscriptions so that users will know when new threads show up in topics they follow. I would also want to run a real pilot with Osomba users in different countries so that the system can be tested with actual support scenarios. Even now the system runs on real AWS services and it is ready to be integrated into the main marketplace when the capstone team is done.

---

Appendix

Code Screenshots

Figure 1: Database Models (support.py) — ForumCategory, ForumTopic, ForumPost, FAQ, and AiQueryLog table definitions with pgvector embedding columns.

Figure 2: Forum Topics API (forum.py lines 1–60) — topic listing with pagination and on-demand translation, topic creation, reply retrieval, and reply creation endpoints.

Figure 3: Official Answer and Thread Lock (forum.py lines 61–117) — agent-restricted endpoints for marking accepted answers, locking/unlocking threads, and sending email notifications via AWS SES.

Figure 4: FAQ CRUD Endpoints (faq.py) — create, read, update, delete operations with automatic embedding generation and helpful/not-helpful voting.

Figure 5: Convert to FAQ (forum.py lines 119–133) — admin-restricted endpoint converting official forum answers into FAQ articles with auto-generated vector embeddings.

Figure 6: AI Suggestion Endpoint (ai.py) — semantic search pipeline using Bedrock Titan Embeddings, pgvector cosine distance queries, keyword fallback, and query logging to AiQueryLog.

Figure 7: Admin Analytics Endpoints (admin.py) — aggregation queries for total posts, answered threads, FAQ count, AI queries, deflection rate, average response time, posts over time, category distribution, and top queries.

Figure 8: Authentication and JIT Provisioning (auth_service.py) — Cognito token validation, user lookup by SUB, email re-linking for orphaned accounts, and automatic user creation.

Customer Flow Screenshots

Figure 9: Forum Home Page — paginated topic list with category badges, status indicators (Open, Answered, Locked), reply counts, and unified search bar.

Figure 10: AI Help Page (before search) — natural language query text area with example question chips displayed before the first search.

Figure 11: AI Help Page (after search) — ranked suggestion cards with confidence stars, percentage match labels, source badges (FAQ / Forum Post), and escalation button.

Figure 12: Post Question Page — category dropdown, title input with character count, body text area, sidebar tips panel, and submit button.

Figure 13: Thread Detail Page (customer view) — original question, chronological replies with author names and role badges, official answer highlighted.

Figure 14: FAQ Detail Page — full question and answer display, helpful/not-helpful voting buttons with counts, and related FAQ sidebar.

Agent Flow Screenshots

Figure 15: Agent Dashboard — filtered view of open and unanswered threads for agent prioritization.

Figure 16: Thread Detail Page (agent view) — reply input, "Mark as Official Answer" button, lock/unlock thread controls.

Figure 17: Email Notification — HTML email sent to the customer when an agent posts an official answer, with thread link.

Figure 18: Language Toggle (French translation) — page content translated to French using Nova Micro after the agent switches the language toggle in the header.

Admin Flow Screenshots

Figure 19: Analytics Dashboard (metrics cards) — total posts, answered threads, active FAQs, AI queries, deflection rate, and average response time.

Figure 20: Analytics Dashboard (charts) — posts over time line chart and category distribution breakdown.

Figure 21: User Management Page — user search by email, role column, and role change dropdown (customer/agent/admin).

Figure 22: Category Management Page — list of support categories with create, edit, and deactivate controls.

Figure 23: Convert to FAQ (admin thread view) — "Convert to FAQ" button visible on accepted answers, converting a forum answer into a permanent FAQ article.
