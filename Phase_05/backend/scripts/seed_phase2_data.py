import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.schemas.support import ForumCategoryCreate, FAQCreate, ForumTopicCreate, ForumPostCreate
from app.services.forum_service import create_category, get_categories, create_topic, create_post
from app.services.faq_service import create_faq, get_faqs
from app.models.user import User
from datetime import datetime

def seed_phase2_data():
    db = SessionLocal()
    try:
        # Create a dummy user for the forum posts if it doesn't exist
        dummy_user = db.query(User).filter(User.email == "jane.doe@example.com").first()
        if not dummy_user:
            dummy_user = User(
                email="jane.doe@example.com",
                full_name="Jane Doe",
                role="BUYER",
                accepted_terms_at=datetime.utcnow(),
                terms_version="1.0"
            )
            db.add(dummy_user)
            db.commit()
            db.refresh(dummy_user)
            print(f"Created dummy user: {dummy_user.full_name}")

        agent_user = db.query(User).filter(User.email == "john.agent@osomba.com").first()
        if not agent_user:
            agent_user = User(
                email="john.agent@osomba.com",
                full_name="John Agent",
                role="admin",
                accepted_terms_at=datetime.utcnow(),
                terms_version="1.0"
            )
            db.add(agent_user)
            db.commit()
            db.refresh(agent_user)
            print(f"Created dummy agent: {agent_user.full_name}")

        print("Seeding Phase 2 Categories...")
        phase2_categories = [
            {"name": "Payments", "description": "Payment issues and MPESA", "icon": "💳"},
            {"name": "Listings", "description": "Marketplace listings", "icon": "📝"},
            {"name": "Safety", "description": "Trust and safety", "icon": "🛡️"},
            {"name": "Disputes", "description": "Order disputes", "icon": "⚠️"},
            {"name": "Account", "description": "User account management", "icon": "👤"},
            {"name": "Delivery", "description": "Shipping and delivery", "icon": "🚚"},
        ]
        
        category_map = {}
        for cat_data in phase2_categories:
            # Check if category exists
            existing_categories = get_categories(db)
            existing = next((c for c in existing_categories if c.name == cat_data["name"]), None)
            if not existing:
                cat = create_category(db, ForumCategoryCreate(**cat_data))
                category_map[cat.name] = cat.id
            else:
                category_map[existing.name] = existing.id
        print("Phase 2 Categories seeded.")

        print("Seeding Phase 2 FAQs...")
        phase2_faqs = [
            {
                "question": "How do I pay with MPESA?",
                "answer": "MPESA payments are quick and secure. Simply select MPESA at checkout, enter your phone number, and approve the payment on your phone.",
                "order_num": 10
            },
            {
                "question": "How to report a suspicious listing?",
                "answer": "If you encounter a listing that seems fraudulent or violates our policies, you can report it by clicking the flag icon on the listing page.",
                "order_num": 11
            },
            {
                "question": "How long does delivery usually take?",
                "answer": "Delivery times vary by location. Within the same city, expect 1-2 days. For inter-city deliveries, allow 3-5 business days.",
                "order_num": 12
            }
        ]

        existing_faqs = get_faqs(db)
        faq_questions = [f.question for f in existing_faqs]
        
        for faq_data in phase2_faqs:
            if faq_data["question"] not in faq_questions:
                create_faq(db, FAQCreate(**faq_data))
        print("Phase 2 FAQs seeded with embeddings.")

        print("Seeding Phase 2 Forum Topics...")
        topics_data = [
            {
                "title": "My MPESA payment is not showing up",
                "content": "I made a payment via MPESA but it's not reflecting in my account. Transaction ID: MPX12345. Please help!",
                "category_name": "Payments",
                "user_id": dummy_user.user_id,
                "answer": "Thank you for reaching out! I understand how concerning this can be.\n\n**Here's what's happening:**\nMPESA payments typically reflect within 5-10 minutes. However, during peak hours, there may be delays of up to 30 minutes.\n\n**What you can do:**\n1. Check your MPESA message to confirm the transaction was successful\n2. Verify you sent the payment to the correct till number\n3. Wait 30 minutes from the time of payment\n4. If after 30 minutes the payment still hasn't reflected, contact us with your transaction ID\n\nI've checked your transaction ID (MPX12345) and can see it was received by our system. The payment should reflect in your account within the next 5 minutes. Please refresh your account balance."
            },
            {
                "title": "Why is my listing not appearing in search?",
                "content": "I posted a new listing yesterday but it's not showing up when I search for it. Is there a review process?",
                "category_name": "Listings",
                "user_id": dummy_user.user_id,
                "answer": None
            },
            {
                "title": "Buyer is asking for refund after receiving item",
                "content": "I sold an item and the buyer received it in perfect condition but now wants a refund. What should I do?",
                "category_name": "Disputes",
                "user_id": dummy_user.user_id,
                "answer": None
            }
        ]

        from app.models.support import ForumTopic
        for t_data in topics_data:
            existing_topic = db.query(ForumTopic).filter(ForumTopic.title == t_data["title"]).first()
            if not existing_topic:
                cat_id = category_map.get(t_data["category_name"])
                if cat_id:
                    topic = create_topic(db, ForumTopicCreate(
                        title=t_data["title"],
                        content=t_data["content"],
                        category_id=cat_id
                    ), user_id=dummy_user.user_id)
                    
                    if t_data["answer"]:
                        create_post(db, ForumPostCreate(
                            topic_id=topic.id,
                            content=t_data["answer"],
                            is_accepted_answer=True
                        ), user_id=agent_user.user_id)
        
        print("Phase 2 Forum Topics seeded.")
        print("Phase 2 Dummy Data Migration Complete!")

    except Exception as e:
        print(f"Failed to seed phase 2 db: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_phase2_data()
