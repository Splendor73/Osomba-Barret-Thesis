import sys
import os
from datetime import datetime

# Add the backend root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db.database import SessionLocal
from app.models.support import ForumCategory, ForumTopic, ForumPost, FAQ, AiQueryLog
from app.models.user import User, UserRole
from app.schemas.support import ForumCategoryCreate, FAQCreate
from app.services.forum_service import create_category
from app.services.faq_service import create_faq
from app.services.ai_service import generate_embedding

def create_sample_users(db: Session):
    print("Ensuring sample users exist...")
    users_to_create = [
        {"email": "admin@osomba.com", "full_name": "Admin User", "role": UserRole.admin},
        {"email": "agent1@osomba.com", "full_name": "Agent One", "role": UserRole.agent},
        {"email": "agent2@osomba.com", "full_name": "Agent Two", "role": UserRole.agent},
        {"email": "customer1@osomba.com", "full_name": "Customer One", "role": UserRole.BUYER},
        {"email": "customer2@osomba.com", "full_name": "Customer Two", "role": UserRole.BUYER},
        {"email": "customer3@osomba.com", "full_name": "Customer Three", "role": UserRole.BUYER},
    ]
    
    created_users = {}
    for u_data in users_to_create:
        user = db.query(User).filter(User.email == u_data["email"]).first()
        if not user:
            user = User(
                email=u_data["email"],
                full_name=u_data["full_name"],
                role=u_data["role"],
                is_onboarded=True,
                country="DRC",
                accepted_terms_at=func.now(),
                terms_version="1.0"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        created_users[u_data["role"].value] = user.user_id
    
    return created_users

def seed_db():
    db = SessionLocal()
    try:
        # WIPE EXISING THESIS DATA for a clean state
        print("Cleaning up existing thesis tables (FAQs, Topics, Posts, Logs, Categories)...")
        db.query(AiQueryLog).delete()
        db.query(ForumPost).delete()
        db.query(ForumTopic).delete()
        db.query(FAQ).delete()
        db.query(ForumCategory).delete()
        db.commit()

        # Users
        users_map = create_sample_users(db)
        admin_id = users_map.get(UserRole.admin.value)
        agent_id = users_map.get(UserRole.agent.value)
        customer_id = users_map.get(UserRole.BUYER.value)

        # 1. Seed Categories
        print("Seeding Forum Categories...")
        categories_data = [
            {"name": "Payments", "description": "Questions about MPESA, refunds.", "icon": "paid"},
            {"name": "Listings", "description": "How to create and manage listings.", "icon": "inventory"},
            {"name": "Safety", "description": "Trust, scams, and protections.", "icon": "health_and_safety"},
            {"name": "Disputes", "description": "Resolving issues with orders.", "icon": "gavel"},
            {"name": "Account", "description": "Passwords, emails, and profile.", "icon": "account_circle"},
            {"name": "Delivery", "description": "Shipping and tracking.", "icon": "local_shipping"},
            {"name": "General", "description": "Everything else.", "icon": "info"}
        ]
        
        category_map = {}
        for cat_data in categories_data:
            cat = ForumCategoryCreate(**cat_data)
            db_cat = create_category(db, cat)
            category_map[cat_data["name"]] = db_cat.id
        print(f"Inserted {len(categories_data)} categories.")

        # 2. Seed FAQs
        print("Seeding 20 FAQs (generating embeddings via Bedrock)...")
        faqs_data = [
            ("Payments", "How do I pay with MPESA?", "Go to checkout -> Select MPESA -> Enter number -> Confirm on phone."),
            ("Payments", "What if my payment fails?", "Check balance, check network, wait 5 mins, contact support."),
            ("Payments", "How do I request a refund?", "Go to Orders -> Select Order -> Click 'Request Refund'. Only within 48 hours."),
            ("Payments", "Do you accept credit cards?", "Yes, Visa and Mastercard are supported."),
            ("Listings", "How do I create a listing?", "Click 'Sell' button -> Upload photos -> Add description -> Set price."),
            ("Listings", "Can I edit my listing after posting?", "Yes, go to 'My Listings' -> Click 'Edit'. Price changes require approval."),
            ("Listings", "How many photos can I upload?", "Minimum 3, Maximum 10. High quality recommended."),
            ("Listings", "Why was my listing rejected?", "Check prohibited items list. Usually due to low quality photos or banned items."),
            ("Safety", "How do I report a scam?", "Click 'Report User' on their profile or listing. We investigate within 24 hours."),
            ("Safety", "What are buyer protections?", "We hold funds until you confirm receipt of item (Escrow)."),
            ("Safety", "Is it safe to meet sellers in person?", "Only meet in public places. Do not carry large cash amounts."),
            ("Disputes", "The item is not as described.", "Open a dispute immediately. Do not release funds. Upload photos of item."),
            ("Disputes", "Seller is not responding.", "If >24 hours after payment, contact support to cancel order."),
            ("Account", "How do I reset my password?", "Click 'Forgot Password' on login screen -> Check email for link."),
            ("Account", "Can I change my email address?", "Yes, in Settings -> Profile. Requires verification of new email."),
            ("Account", "How do I delete my account?", "Contact support. We retain data for 30 days for legal reasons."),
            ("Delivery", "Who pays for shipping?", "Buyer pays unless Seller offers 'Free Shipping'."),
            ("Delivery", "How do I track my order?", "Go to Orders -> Click 'Track'. Status updates from courier."),
            ("Delivery", "Delivery is delayed.", "Check tracking. If stuck >3 days, contact support."),
            ("General", "How do I contact support?", "Use the 'Ask a Question' form or email support@somba.com.")
        ]
        
        for i, (cat_name, q, a) in enumerate(faqs_data):
            faq = FAQCreate(question=q, answer=a, order_num=i+1)
            create_faq(db, faq)
        print(f"Inserted {len(faqs_data)} FAQs with embeddings.")

        # 3. Sample Forum Topics & Answers
        print("Seeding sample forum topics and official answers...")
        topics_data = [
            ("I can't access my seller dashboard", "It keeps saying unauthorized even though I am a seller.", "Account"),
            ("MPESA payment is stuck pending since yesterday", "I paid for an item but the status hasn't updated. What should I do?", "Payments"),
            ("Is it allowed to sell homemade food?", "I want to list some baked goods, are there restrictions?", "Listings"),
        ]
        
        for title, content, cat_name in topics_data:
            cat_id = category_map[cat_name]
            # Create Topic
            topic = ForumTopic(
                title=title, 
                content=content, 
                category_id=cat_id, 
                user_id=customer_id
            )
            # generate embedding for topic! Because search uses it
            text_to_encode = f"{title} {content}"
            topic.embedding = generate_embedding(text_to_encode)
            db.add(topic)
            db.commit()
            db.refresh(topic)
            
            # Create Official Answer Post
            post = ForumPost(
                topic_id=topic.id,
                user_id=agent_id,
                content=f"Hello! Thank you for reaching out. Here is the official answer regarding your question about {title}.",
                is_accepted_answer=True
            )
            db.add(post)
            
        db.commit()
        print(f"Inserted {len(topics_data)} forum topics with official answers.")

        # 4. AiQueryLogs
        print("Seeding sample AI query logs...")
        sample_queries = [
            ("How to list an item?", 5, 0.85, False),
            ("MPESA refund not working", 2, 0.60, True),
            ("Forgot my password!", 3, 0.92, False),
            ("Report scam seller", 4, 0.77, False),
            ("I want to delete my account", 1, 0.95, False),
            ("Where is my delivery?", 5, 0.65, True),
            ("Payment failed MPESA", 3, 0.88, False),
            ("How to list an item?", 4, 0.85, False),
            ("MPESA refund not working", 2, 0.60, True),
            ("How to list an item?", 5, 0.85, False),
        ]
        
        for q, results, score, esc in sample_queries:
            log = AiQueryLog(
                query_text=q,
                results_returned=results,
                top_result_score=score,
                escalated_to_forum=esc,
                user_id=customer_id
            )
            db.add(log)
        db.commit()
        print(f"Inserted {len(sample_queries)} AI query logs.")

        print("Database seeded successfully!")
    except Exception as e:
        print(f"Failed to seed db: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
