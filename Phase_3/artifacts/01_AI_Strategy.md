# AI Strategy Document
## Somba Customer Care Forum - AI Help Board

**Author:** Yashu Gautamkumar Patel
**Date:** December 3, 2025
**Phase:** 3 - AI Research & Strategy
**Status:** Research & Planning Document (Implementation Pending)

---

## Overview

This document outlines the **planned AI strategy** for the Help Board feature, which will provide intelligent suggestions to users based on approved FAQ articles and officially answered forum threads. The strategy is designed to leverage **AWS Bedrock** for a secure, scalable, and fully managed generative AI solution.

**Note:** This is a research and planning document created during Phase 3 (Weeks 5-6). Actual implementation will begin in January 2026 (Phase 4).

---

## RAG (Retrieval-Augmented Generation) Pipeline

### What is RAG?

RAG is an approach that retrieves relevant documents first, then uses those documents to generate or suggest answers. This prevents hallucinations by grounding responses in actual content.

### Our 5-Step Pipeline

```
User Query → Embedding Generation → Vector Search → Ranking → Display Results
```

#### Step 1: User Query
- User types a question: "Why isn't my MPESA payment showing up?"
- Minimum length: 10 characters
- Language detection: English or French

#### Step 2: Generate Embedding
- Convert query text into a vector (1536-dimensional)
- Use **AWS Bedrock (Amazon Titan Embeddings v2)**
- Model ID: `amazon.titan-embed-text-v2:0`

#### Step 3: Vector Search
- Search **AWS RDS PostgreSQL** with `pgvector` extension
- Only search approved content:
  - ✅ FAQ articles (status = 'published')
  - ✅ Forum threads with official answers
  - ❌ Unanswered forum posts
  - ❌ External sources

#### Step 4: Ranking
- Calculate cosine similarity between query and content
- Apply hybrid ranking:
  - 70% weight: Semantic similarity score
  - 30% weight: Recency (newer content ranked higher)
- Filter: Only show results with similarity > 0.60

#### Step 5: Display Results
- Show top 3-5 suggestions
- Each result displays:
  - Title
  - Snippet (first 150 characters)
  - Source type (FAQ or Forum)
  - Confidence score (as stars: ★★★★★)
  - Category badge
- If no results > 0.60: Show "Post to Forum" suggestion

---

## Embedding Model Comparison

| Model | Pros | Cons | Cost | Decision |
|-------|------|------|------|----------|
| **Amazon Titan Embeddings v2** | Native AWS integration, high quality, secure | AWS account required | < $1 for pilot | ✅ Primary |
| **OpenAI ada-002** | Popular, easy API | External dependency, data leaves AWS | $5-10 for pilot | ❌ Not using |
| **Sentence-BERT** | Free, self-hosted | Maintenance overhead | $0 | ✅ Backup |

### Why AWS Bedrock (Primary)?
- **Security:** Data never leaves the AWS network.
- **Integration:** Uses IAM roles instead of API keys.
- **Cost:** Significantly cheaper than OpenAI for embeddings.
- **Performance:** Low latency within AWS region.

---

## Content Constraint Mechanism

### Approved Content Only

**What Gets Indexed:**
- FAQ articles with `status = 'published'`
- Forum threads with `has_official_answer = true`

**What Doesn't Get Indexed:**
- Draft FAQs
- Open forum posts (no official answer)
- External web content
- User comments without agent verification

### Implementation

**Database Query:**
```sql
SELECT id, title, body, source_type, category
FROM (
  SELECT id, title, body, 'faq' as source_type, category_id
  FROM faq_articles
  WHERE status = 'published'
  
  UNION ALL
  
  SELECT fp.id, fp.title, oa.answer_text as body, 'forum' as source_type, fp.category_id
  FROM forum_posts fp
  JOIN official_answers oa ON fp.id = oa.forum_post_id
) AS approved_content
```

This ensures we ONLY search through verified, agent-approved content.

---

## Citation System

Every AI suggestion must show its source clearly:

**FAQ Citation:**
```
From FAQ: "How do I pay with MPESA?"
Category: Payments | Last updated: 2 days ago
```

**Forum Citation:**
```
From Forum Post: "My MPESA payment is not showing up"
Answered by: John Agent (Somba Support Team) | 5 hours ago
```

**Why Citations Matter:**
- Builds user trust
- Allows users to verify information
- No "black box" AI answers
- Users can click through to read full content

---

## Confidence Scoring

### Similarity Threshold: 60%

**High Confidence (80-100%):** ★★★★★ or ★★★★☆
- Strong semantic match
- Very likely to be helpful
- Show prominently

**Medium Confidence (60-79%):** ★★★☆☆
- Reasonable match
- May be helpful
- Show but with lower visual priority

**Low Confidence (<60%):** Not shown
- Poor semantic match
- Likely not helpful
- Don't show; suggest posting to forum instead

---

## Fallback Strategy

### When AI Can't Help

If no results score above 60%:

**Display:**
```
We couldn't find a great match for your question.

[Post Your Question to the Forum]
(Your question will be pre-filled)
```

**Why This Matters:**
- Honest with users (builds trust)
- Graceful escalation to human support
- Reduces frustration from irrelevant suggestions

---

## Cost Management

### AWS Bedrock Costs

**Pricing:**
- Titan Embeddings v2: $0.00002 per 1,000 input tokens

**Estimated Usage:**
- Average query: ~50 tokens
- Pilot queries: ~10,000 queries
- Total tokens: 500,000
- **Estimated cost:** $0.01 (Negligible)

**FAQ Embeddings:**
- 20 FAQs × ~200 tokens = 4,000 tokens
- One-time cost: < $0.001
- **Total pilot cost:** < $1

### Cost Controls

1. **Caching:**
   - Cache all FAQ embeddings (generate once, reuse)
   - Cache query embeddings for 5 minutes (if user retries)

2. **Alerts:**
   - Set up AWS Budget alert at $10
   - Set up critical alert at $50

---

## Performance Optimization

### pgvector Index Configuration

**Index Type:** IVFFlat (Inverted File with Flat quantization)

**Parameters:**
- `lists`: Number of clusters
- Formula: `lists = sqrt(total_rows)`
- For 500 embeddings: `lists = 22`

**Query Speed:**
- Target: <100ms for vector search
- Acceptable: <500ms

### Hybrid Search Strategy

**Combine:**
1. **Vector similarity** (semantic matching)
2. **Recency boost** (newer content preferred)
3. **Category filter** (if user specifies)

**Weighting:**
- 70% semantic similarity
- 20% recency (posts from last 30 days get boost)
- 10% category match (if applicable)

---

## Evaluation Metrics

### KPIs to Track

1. **Deflection Rate**
   - Target: 70% of queries resolved without posting
   - Formula: (Queries NOT escalated) / (Total queries)

2. **Average Similarity Score**
   - Target: >0.75 for shown suggestions
   - Indicates quality of matches

3. **Click-Through Rate**
   - Target: >60% of users click a suggestion
   - Shows suggestions are relevant

4. **Escalation Rate**
   - Target: <30% of queries escalate to forum
   - Inverse of deflection rate

### Logging

Every query logs:
```sql
INSERT INTO ai_query_logs (
  user_id,
  query_text,
  results_returned,
  top_result_score,
  escalated_to_forum,
  created_at
)
```

---

## Multilingual Support

### Current: English Primary

**Phase 1 (Pilot):**
- All FAQs in English
- Query language: English
- Embeddings: English content

### Future: French Support

**Phase 2 (Post-Pilot):**
- Translate Top-20 FAQs to French
- Amazon Titan Embeddings v2 supports 100+ languages
- No need for separate embedding models
- Query in French → Search French content + English content
- Display language-appropriate results

---

## Security Considerations

### IAM Role Management

**No API Keys:**
- Use AWS IAM Roles for Service Accounts (IRSA) or Lambda Execution Roles.
- Grant `bedrock:InvokeModel` permission only to the backend service.
- No long-lived credentials to rotate.

### Rate Limiting

**Prevent Abuse:**
- 10 queries per minute per user
- 1,000 queries per day per user
- Temporary ban if exceeded

### Data Privacy

**User Queries:**
- Data processed by Bedrock is **not** used to train base models.
- Data remains in the AWS Region where the API call is made.
- Log for analytics (anonymized).
- Retain for 90 days.
- Comply with GDPR (allow deletion requests).

---

## Implementation Roadmap

### Phase 3: Research & Planning (Week 5-6) ✅ **COMPLETED**
- ✅ Research RAG approaches and understand core concepts
- ✅ Compare embedding model options (Titan v2, OpenAI, Sentence-BERT)
- ✅ Design constraint mechanism to prevent hallucinations
- ✅ Document AWS Bedrock strategy

### Phase 4: AWS Setup & Initial Implementation (Week 7-8) **PLANNED FOR JANUARY**
- Set up AWS account and Bedrock access
- Integrate AWS SDK for Bedrock in Next.js
- Generate embeddings for Top-20 FAQs
- Implement vector search in RDS with pgvector
- Build suggestion display UI

### Phase 5: Core Features & Refinement (Week 9-10) **PLANNED FOR JANUARY**
- Add hybrid ranking (similarity + recency)
- Implement confidence scoring display
- Add citation system to UI
- Test with sample queries

### Phase 6: Pilot Testing & Launch (Week 11-12) **PLANNED FOR FEBRUARY**
- Deploy to AWS Amplify production
- Monitor KPIs (deflection rate, click-through rate)
- Collect user feedback
- Iterate on threshold and ranking based on real data

---

## Risk Mitigation

### Risk 1: Poor Match Quality

**Mitigation:**
- Start with conservative 60% threshold
- Monitor click-through rate
- Adjust based on pilot data

### Risk 2: Cost Overrun

**Mitigation:**
- Cache aggressively
- Set AWS Budget alerts
- Bedrock is pay-per-token, no fixed instance costs

### Risk 3: Cold Start (Limited Content)

**Mitigation:**
- Curate high-quality Top-20 FAQs
- Quickly convert good forum answers to FAQs
- Track unmatched queries to identify gaps

---

## Success Criteria

### Pilot Success Defined As:

✅ **70%+ deflection rate** (queries resolved without posting)  
✅ **Average similarity score >0.75** for shown suggestions  
✅ **60%+ click-through rate** (users find suggestions helpful)  
✅ **Cost <$50** for pilot period  
✅ **Query response time <500ms**

---

## References

- AWS Bedrock Documentation: https://docs.aws.amazon.com/bedrock/
- Amazon Titan Embeddings: https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html
- pgvector GitHub: https://github.com/pgvector/pgvector
- RAG Best Practices: https://arxiv.org/abs/2005.11401
