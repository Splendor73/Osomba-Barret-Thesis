# Somba Customer Care Forum: API Endpoint Specification

## Project Information
**Author:** Yashu Gautamkumar Patel  
**Date:** November 30, 2025  
**API Version:** v1  
**Base URL:** `https://api.somba.com/v1` (production) or `http://localhost:3000/v1` (development)

---

## API Overview

This RESTful API provides endpoints for:
- User authentication and session management
- Forum post operations (CRUD)
- FAQ article management
- Unified search across Forum + FAQ
- AI Help Board suggestions
- Agent actions (official answers, FAQ conversion)
- Admin operations (user management, analytics)

**Authentication:** JWT Bearer tokens  
**Response Format:** JSON  
**Rate Limiting:** 100 requests/minute per user (search/read), 10 requests/minute (write operations)

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Description:** Create a new user account (default role: customer)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Jane Doe",
  "language_preference": "en"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "customer",
      "language_preference": "en",
      "created_at": "2025-11-30T10:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "customer"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### 4. Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {access_token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## Forum Endpoints

### 5. Get All Forum Posts
**GET** `/forum/posts`

**Query Parameters:**
- `category_id` (optional): Filter by category
- `status` (optional): Filter by status (open/answered/locked/closed)
- `language` (optional): Filter by language (en/fr)
- `page` (default: 1): Page number
- `limit` (default: 20): Results per page
- `sort` (default: created_at): Sort field
- `order` (default: desc): Sort order (asc/desc)

**Example Request:**
```
GET /forum/posts?category_id=1&status=open&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "title": "MPESA payment not reflecting in my account",
        "body": "I made a payment 2 hours ago...",
        "author": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Jane Doe"
        },
        "category": {
          "id": 1,
          "name": "Payments",
          "slug": "payments"
        },
        "status": "open",
        "language": "en",
        "view_count": 15,
        "has_official_answer": false,
        "created_at": "2025-11-30T08:30:00Z",
        "updated_at": "2025-11-30T08:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_results": 47,
      "per_page": 10
    }
  }
}
```

---

### 6. Get Single Forum Post
**GET** `/forum/posts/{post_id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "MPESA payment not reflecting in my account",
      "body": "I made a payment 2 hours ago via MPESA but I still don't see it...",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jane Doe"
      },
      "category": {
        "id": 1,
        "name": "Payments"
      },
      "status": "answered",
      "language": "en",
      "view_count": 42,
      "official_answer": {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "answer_text": "Thank you for contacting us. MPESA payments typically reflect within 5-10 minutes...",
        "agent": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "John Agent"
        },
        "created_at": "2025-11-30T09:00:00Z"
      },
      "created_at": "2025-11-30T08:30:00Z",
      "updated_at": "2025-11-30T09:00:00Z"
    }
  }
}
```

---

### 7. Create Forum Post
**POST** `/forum/posts`

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "title": "How do I cancel an order?",
  "body": "I accidentally placed an order and need to cancel it before it ships. What's the process?",
  "category_id": 2,
  "language": "en"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "How do I cancel an order?",
      "body": "I accidentally placed an order...",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jane Doe"
      },
      "category": {
        "id": 2,
        "name": "Listings"
      },
      "status": "open",
      "created_at": "2025-11-30T10:15:00Z"
    }
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 10 and 200 characters"
      },
      {
        "field": "category_id",
        "message": "Invalid category ID"
      }
    ]
  }
}
```

---

### 8. Update Forum Post Status (Agent Only)
**PATCH** `/forum/posts/{post_id}/status`

**Headers:** `Authorization: Bearer {access_token}`  
**Required Role:** Agent or Admin

**Request Body:**
```json
{
  "status": "locked"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "status": "locked",
      "updated_at": "2025-11-30T11:00:00Z"
    }
  }
}
```

---

### 9. Add Official Answer (Agent Only)
**POST** `/forum/posts/{post_id}/official-answer`

**Headers:** `Authorization: Bearer {access_token}`  
**Required Role:** Agent or Admin

**Request Body:**
```json
{
  "answer_text": "To cancel an order:\n1. Go to My Orders\n2. Select the order\n3. Click 'Cancel Order'\n4. Select reason and confirm\n\nRefunds typically process within 3-5 business days."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "official_answer": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "forum_post_id": "660e8400-e29b-41d4-a716-446655440001",
      "answer_text": "To cancel an order:\n1. Go to My Orders...",
      "agent": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Agent"
      },
      "created_at": "2025-11-30T10:30:00Z"
    },
    "post_status_updated": "answered"
  }
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "ANSWER_ALREADY_EXISTS",
    "message": "This thread already has an official answer"
  }
}
```

---

## FAQ Endpoints

### 10. Get All FAQ Articles
**GET** `/faq/articles`

**Query Parameters:**
- `category_id` (optional)
- `language` (optional): en/fr
- `status` (optional): published/draft/archived (default: published for customers)
- `page`, `limit`, `sort`, `order`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "title": "How do I pay with MPESA?",
        "body": "To pay with MPESA:\n1. Select MPESA at checkout...",
        "category": {
          "id": 1,
          "name": "Payments"
        },
        "language": "en",
        "view_count": 245,
        "helpful_count": 42,
        "created_at": "2025-11-15T09:00:00Z",
        "updated_at": "2025-11-20T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_results": 28
    }
  }
}
```

---

### 11. Get Single FAQ Article
**GET** `/faq/articles/{article_id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "title": "How do I pay with MPESA?",
      "body": "To pay with MPESA:\n1. Select MPESA at checkout\n2. Enter your phone number...",
      "category": {
        "id": 1,
        "name": "Payments",
        "slug": "payments"
      },
      "language": "en",
      "status": "published",
      "view_count": 245,
      "helpful_count": 42,
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Agent"
      },
      "source_forum_post_id": null,
      "created_at": "2025-11-15T09:00:00Z",
      "updated_at": "2025-11-20T14:30:00Z"
    }
  }
}
```

---

### 12. Create FAQ Article (Agent Only)
**POST** `/faq/articles`

**Headers:** `Authorization: Bearer {access_token}`  
**Required Role:** Agent or Admin

**Request Body:**
```json
{
  "title": "What payment methods are supported?",
  "body": "Somba supports the following payment methods:\n- MPESA (Kenya, Tanzania)\n- AirtelMoney (Uganda)\n- Paystack (card payments)\n- Cryptocurrency (Bitcoin, USDT)",
  "category_id": 1,
  "language": "en",
  "status": "published"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "title": "What payment methods are supported?",
      "status": "published",
      "created_at": "2025-11-30T10:45:00Z"
    }
  }
}
```

---

### 13. Convert Forum Answer to FAQ (Agent Only)
**POST** `/faq/convert-from-forum/{post_id}`

**Headers:** `Authorization: Bearer {access_token}`  
**Required Role:** Agent or Admin

**Description:** Convert an officially answered forum thread into an FAQ article

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "880e8400-e29b-41d4-a716-446655440002",
      "title": "How do I cancel an order?",
      "body": "To cancel an order:\n1. Go to My Orders\n2. Select the order...",
      "category_id": 2,
      "language": "en",
      "status": "draft",
      "source_forum_post_id": "660e8400-e29b-41d4-a716-446655440001",
      "created_at": "2025-11-30T11:00:00Z"
    },
    "message": "FAQ article created in draft mode. Please review and publish."
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "NO_OFFICIAL_ANSWER",
    "message": "This forum post does not have an official answer yet"
  }
}
```

---

## Search Endpoints

### 14. Unified Search (Forum + FAQ)
**GET** `/search`

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): "all" (default), "forum", "faq"
- `category_id` (optional)
- `language` (optional)
- `limit` (default: 10)

**Example Request:**
```
GET /search?q=mpesa+payment+delay&type=all&limit=5
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "faq",
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "title": "How long do MPESA payments take to reflect?",
        "snippet": "MPESA payments typically reflect within 5-10 minutes. If your payment is delayed beyond...",
        "category": {
          "id": 1,
          "name": "Payments"
        },
        "relevance_score": 0.92,
        "created_at": "2025-11-15T09:00:00Z"
      },
      {
        "type": "forum",
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "title": "MPESA payment not reflecting in my account",
        "snippet": "Thank you for contacting us. MPESA payments typically reflect within 5-10 minutes...",
        "category": {
          "id": 1,
          "name": "Payments"
        },
        "has_official_answer": true,
        "relevance_score": 0.87,
        "created_at": "2025-11-30T08:30:00Z"
      }
    ],
    "query": "mpesa payment delay",
    "total_results": 12,
    "search_time_ms": 45
  }
}
```

---

## AI Help Board Endpoints

### 15. Get AI Suggestions
**POST** `/ai/suggest`

**Headers:** `Authorization: Bearer {access_token}` (optional for anonymous)

**Request Body:**
```json
{
  "query": "My MPESA payment is not showing up",
  "language": "en",
  "session_id": "sess_abc123xyz"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "faq",
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "title": "How long do MPESA payments take to reflect?",
        "snippet": "MPESA payments typically reflect within 5-10 minutes. If delayed beyond 30 minutes, check your transaction confirmation SMS...",
        "category": "Payments",
        "similarity_score": 0.8945,
        "url": "/faq/articles/880e8400-e29b-41d4-a716-446655440000"
      },
      {
        "type": "forum",
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "title": "MPESA payment not reflecting in my account",
        "snippet": "Thank you for contacting us. MPESA payments typically reflect within 5-10 minutes. Your transaction MPX12345 was successful...",
        "category": "Payments",
        "similarity_score": 0.8742,
        "url": "/forum/posts/660e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "query_logged": true,
    "suggested_action": "review_results",
    "escalation_available": true
  }
}
```

**Response (200 OK - No Good Matches):**
```json
{
  "success": true,
  "data": {
    "suggestions": [],
    "query_logged": true,
    "suggested_action": "post_to_forum",
    "escalation_available": true,
    "message": "We couldn't find a good answer to your question. Please post it to the forum and an agent will help you."
  }
}
```

---

### 16. Escalate to Forum (from AI Board)
**POST** `/ai/escalate`

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "query_log_id": "990e8400-e29b-41d4-a716-446655440000",
  "title": "My MPESA payment is not showing up",
  "body": "I made a payment 3 hours ago and it's still not reflected in my wallet. Transaction ID: MPX67890",
  "category_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "forum_post": {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "title": "My MPESA payment is not showing up",
      "status": "open",
      "created_at": "2025-11-30T11:30:00Z"
    },
    "query_log_updated": true,
    "message": "Your question has been posted to the forum. An agent will respond soon."
  }
}
```

---

## Category Endpoints

### 17. Get All Categories
**GET** `/categories`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name_en": "Payments",
        "name_fr": "Paiements",
        "slug": "payments",
        "icon": "credit-card",
        "display_order": 1
      },
      {
        "id": 2,
        "name_en": "Listings",
        "name_fr": "Annonces",
        "slug": "listings",
        "icon": "list",
        "display_order": 2
      }
    ]
  }
}
```

---

## Admin Endpoints

### 18. Get Analytics Dashboard (Admin Only)
**GET** `/admin/analytics`

**Headers:** `Authorization: Bearer {access_token}`  
**Required Role:** Admin

**Query Parameters:**
- `start_date` (optional): ISO date
- `end_date` (optional): ISO date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date_range": {
      "start": "2025-11-01T00:00:00Z",
      "end": "2025-11-30T23:59:59Z"
    },
    "forum_stats": {
      "total_posts": 342,
      "open_posts": 45,
      "answered_posts": 278,
      "average_response_time_hours": 4.2
    },
    "faq_stats": {
      "total_articles": 28,
      "total_views": 8945,
      "average_helpful_rate": 0.78
    },
    "ai_stats": {
      "total_queries": 1523,
      "successful_deflections": 1102,
      "deflection_rate": 0.72,
      "escalations": 421,
      "average_similarity_score": 0.76
    },
    "top_categories": [
      {"name": "Payments", "post_count": 145},
      {"name": "Listings", "post_count": 98}
    ]
  }
}
```

---

### 19. Manage User Roles (Admin Only)
**PATCH** `/admin/users/{user_id}/role`

**Headers:** `Authorization: Bearer {access_token}`  
**Required Role:** Admin

**Request Body:**
```json
{
  "role": "agent"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "agent",
      "updated_at": "2025-11-30T12:00:00Z"
    }
  }
}
```

---

## Error Response Format

All errors follow this structure:

**Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
```

**Common Error Codes:**

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate) |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_SERVER_ERROR | Server error |

---

## Rate Limiting

**Headers Returned:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1701345600
```

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the rate limit. Please try again in 45 seconds.",
    "retry_after": 45
  }
}
```

---

## Authentication Flow

1. User registers or logs in → receives `access_token` (24h expiry) and `refresh_token` (30d expiry)
2. Include `Authorization: Bearer {access_token}` in all protected requests
3. When access token expires → use refresh token to get new access token
4. Logout invalidates both tokens

---

## Pagination Standard

All list endpoints support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response Structure:**
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_results": 94,
    "per_page": 20,
    "has_next": true,
    "has_prev": false
  }
}
```

---


