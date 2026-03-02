import sys
import os
from datetime import datetime, timedelta
import random

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
        {"email": "agent@osomba.com", "full_name": "Agent Support", "role": UserRole.agent},
        {"email": "agent2@osomba.com", "full_name": "Agent Two", "role": UserRole.agent},
        {"email": "user@osomba.com", "full_name": "Demo Customer", "role": UserRole.BUYER},
        {"email": "customer2@osomba.com", "full_name": "Marie Kabila", "role": UserRole.BUYER},
        {"email": "customer3@osomba.com", "full_name": "Jean Mutombo", "role": UserRole.BUYER},
        {"email": "customer4@osomba.com", "full_name": "Grace Lumumba", "role": UserRole.BUYER},
        {"email": "customer5@osomba.com", "full_name": "Patrick Tshisekedi", "role": UserRole.BUYER},
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
        created_users[u_data["email"]] = user.user_id

    return created_users

def seed_db():
    db = SessionLocal()
    try:
        # WIPE EXISTING THESIS DATA for a clean state
        print("Cleaning up existing thesis tables...")
        db.query(AiQueryLog).delete()
        db.query(ForumPost).delete()
        db.query(ForumTopic).delete()
        db.query(FAQ).delete()
        db.query(ForumCategory).delete()
        db.commit()

        # Users
        users_map = create_sample_users(db)
        admin_id = users_map["admin@osomba.com"]
        agent_id = users_map["agent@osomba.com"]
        agent2_id = users_map["agent2@osomba.com"]
        customer_ids = [
            users_map["user@osomba.com"],
            users_map["customer2@osomba.com"],
            users_map["customer3@osomba.com"],
            users_map["customer4@osomba.com"],
            users_map["customer5@osomba.com"],
        ]

        # 1. Seed Categories
        print("Seeding Forum Categories...")
        categories_data = [
            {"name": "Payments", "description": "Questions about MPESA, refunds, and transactions.", "icon": "💳"},
            {"name": "Listings", "description": "How to create and manage product listings.", "icon": "📝"},
            {"name": "Safety", "description": "Trust, scams, and buyer/seller protections.", "icon": "🛡️"},
            {"name": "Disputes", "description": "Resolving issues with orders and transactions.", "icon": "⚠️"},
            {"name": "Account", "description": "Passwords, emails, profile, and settings.", "icon": "👤"},
            {"name": "Delivery", "description": "Shipping, tracking, and logistics.", "icon": "🚚"},
            {"name": "General", "description": "Everything else about using Osomba.", "icon": "💬"},
        ]

        category_map = {}
        for cat_data in categories_data:
            cat = ForumCategoryCreate(**cat_data)
            db_cat = create_category(db, cat)
            category_map[cat_data["name"]] = db_cat.id
        print(f"Inserted {len(categories_data)} categories.")

        # 2. Seed FAQs (with category_id)
        print("Seeding 20 FAQs (generating embeddings via Bedrock)...")
        faqs_data = [
            ("Payments", "How do I pay with MPESA?", "Go to checkout -> Select MPESA -> Enter your phone number -> Confirm the payment on your phone. The transaction usually completes within 30 seconds."),
            ("Payments", "What if my payment fails?", "Check your M-Pesa balance, ensure you have a stable network connection, and wait 5 minutes before retrying. If the issue persists, contact our support team."),
            ("Payments", "How do I request a refund?", "Go to Orders -> Select the Order -> Click 'Request Refund'. Refunds are only available within 48 hours of payment and before the item has been shipped."),
            ("Payments", "Do you accept credit cards?", "Yes, we accept Visa and Mastercard through our Stripe integration. You can also pay with Paystack for local card payments."),
            ("Listings", "How do I create a listing?", "Click the 'Sell' button -> Upload at least 3 photos -> Add a detailed description -> Set your price -> Choose a category -> Submit for review."),
            ("Listings", "Can I edit my listing after posting?", "Yes, go to 'My Listings' -> Click 'Edit'. Note that price changes greater than 20% require re-approval by our team."),
            ("Listings", "How many photos can I upload?", "You can upload between 3 and 10 photos per listing. We recommend high-quality images with good lighting for better sales."),
            ("Listings", "Why was my listing rejected?", "Common reasons include: prohibited items, low quality photos, misleading descriptions, or pricing that appears fraudulent. Check our guidelines for details."),
            ("Safety", "How do I report a scam?", "Click 'Report User' on their profile or listing page. Our trust & safety team investigates all reports within 24 hours. You can also email safety@osomba.com."),
            ("Safety", "What are buyer protections?", "We use an escrow system: your payment is held securely until you confirm receipt of the item in good condition. If the item doesn't match the description, you can open a dispute."),
            ("Safety", "Is it safe to meet sellers in person?", "We recommend meeting in public, well-lit places during daytime. Never carry large amounts of cash. Use our in-app messaging to coordinate safely."),
            ("Disputes", "The item is not as described.", "Open a dispute immediately through the order page. Upload photos showing the discrepancy. Do NOT release the escrow funds until the dispute is resolved."),
            ("Disputes", "Seller is not responding.", "If the seller hasn't responded within 24 hours after payment, contact our support team. We can cancel the order and issue a full refund."),
            ("Account", "How do I reset my password?", "Click 'Forgot Password' on the login screen -> Enter your email -> Check your inbox for a reset link. The link expires after 1 hour."),
            ("Account", "Can I change my email address?", "Yes, go to Settings -> Profile -> Change Email. You'll need to verify the new email address before it takes effect."),
            ("Account", "How do I delete my account?", "Contact our support team at support@osomba.com. We retain anonymized data for 30 days as required by our terms of service."),
            ("Delivery", "Who pays for shipping?", "The buyer pays shipping unless the seller has opted for 'Free Shipping'. Shipping costs are calculated based on distance and item weight."),
            ("Delivery", "How do I track my order?", "Go to Orders -> Click 'Track'. You'll see real-time status updates from the courier service. You also receive SMS notifications."),
            ("Delivery", "Delivery is delayed.", "Check the tracking status first. If the shipment has been stuck for more than 3 days, contact our support team and we'll investigate with the courier."),
            ("General", "How do I contact support?", "You can post a question in this forum, use the AI Help feature for instant answers, or email us at support@osomba.com. Our team responds within 24 hours."),
        ]

        for i, (cat_name, q, a) in enumerate(faqs_data):
            faq_obj = FAQ(
                question=q,
                answer=a,
                order_num=i + 1,
                category_id=category_map[cat_name],
                is_active=True,
            )
            text_to_encode = f"{q} {a}"
            faq_obj.embedding = generate_embedding(text_to_encode)
            db.add(faq_obj)
        db.commit()
        print(f"Inserted {len(faqs_data)} FAQs with embeddings.")

        # 3. Sample Forum Topics & Answers (~28 topics across all categories)
        print("Seeding forum topics and replies...")
        topics_data = [
            # Payments (4 topics)
            ("MPESA payment stuck pending since yesterday", "I paid for an item via MPESA but the status hasn't updated. Order #12345. What should I do?", "Payments", True,
             "This usually happens when the M-Pesa callback is delayed. We've manually verified your payment and updated your order. It should show as 'Paid' now."),
            ("Can I pay with Airtel Money?", "I don't have M-Pesa. Does Osomba accept Airtel Money or Orange Money?", "Payments", True,
             "Yes! We support Airtel Money and Orange Money in addition to M-Pesa. Select your preferred provider at checkout."),
            ("Refund taking too long", "I requested a refund 5 days ago and still nothing. Order #67890.", "Payments", False, None),
            ("How to split payment between M-Pesa and card?", "I want to pay part with M-Pesa and part with my Visa card. Is that possible?", "Payments", False, None),

            # Listings (4 topics)
            ("Is it allowed to sell homemade food?", "I want to list some baked goods and pastries. Are there restrictions on food items?", "Listings", True,
             "Food items are allowed but require you to upload a valid food handler's certificate. Go to Settings -> Seller Verification to upload your documents."),
            ("My photos keep getting rejected", "I've uploaded clear photos but my listing keeps getting rejected. What am I doing wrong?", "Listings", True,
             "Make sure your photos are at least 800x800 pixels, well-lit, and show the actual item (not stock photos). Watermarks are also not allowed."),
            ("How to boost my listing visibility?", "My items aren't getting any views. Any tips to improve visibility?", "Listings", False, None),
            ("Can I list services, not just products?", "I offer tailoring and repair services. Can I list these on Osomba?", "Listings", False, None),

            # Safety (4 topics)
            ("Suspicious buyer keeps messaging me", "Someone is asking me to share my M-Pesa PIN to 'verify my account'. Is this legit?", "Safety", True,
             "This is a SCAM. Osomba will NEVER ask for your M-Pesa PIN. Please report this user immediately using the 'Report User' button on their profile. We've flagged the account."),
            ("How does escrow work exactly?", "I'm new to Osomba. Can someone explain the escrow payment system step by step?", "Safety", True,
             "When you buy an item: 1) Your payment goes to Osomba's escrow account, 2) Seller ships the item, 3) You confirm receipt, 4) Funds are released to seller. If there's an issue, you can dispute before releasing funds."),
            ("Seller sent me a fake item", "I received a counterfeit phone instead of the genuine one listed. What should I do?", "Safety", False, None),
            ("Can sellers see my personal info?", "I'm concerned about privacy. What information do sellers have access to?", "Safety", False, None),

            # Disputes (4 topics)
            ("Item arrived damaged during shipping", "My order arrived with a cracked screen. The seller says it was fine when shipped. Who is responsible?", "Disputes", True,
             "In cases of shipping damage, we investigate with the courier. Please upload photos of the damaged item and packaging. We'll process either a refund or replacement within 48 hours."),
            ("Seller won't accept my return", "The item doesn't fit and the seller is refusing the return even though it's within the return window.", "Disputes", True,
             "If the return is within our 7-day policy and the item is in original condition, the seller must accept it. We've contacted the seller. If they don't respond within 24 hours, we'll process your refund automatically."),
            ("Dispute has been open for 2 weeks", "My dispute #D-4567 has been pending for 14 days with no resolution. This is frustrating.", "Disputes", False, None),
            ("Wrong item delivered", "I ordered a blue dress size M but received a red one size L. Need help!", "Disputes", False, None),

            # Account (4 topics)
            ("Can't access my seller dashboard", "It keeps saying 'unauthorized' even though I registered as a seller. My account is verified.", "Account", True,
             "This issue was caused by a session token expiry. Please log out completely, clear your browser cache, and log back in. Your seller permissions should now be active."),
            ("How to enable two-factor authentication?", "I want to add extra security to my account. Is 2FA available?", "Account", True,
             "Yes! Go to Settings -> Security -> Enable Two-Factor Authentication. We support both SMS codes and authenticator apps like Google Authenticator."),
            ("Account was suspended without warning", "I just got an email saying my account is suspended. I haven't done anything wrong!", "Account", False, None),
            ("How to become a verified seller?", "I see some sellers have a verified badge. How do I get one?", "Account", False, None),

            # Delivery (4 topics)
            ("Package shows delivered but I didn't receive it", "Tracking says delivered but nobody was home and no package at the door.", "Delivery", True,
             "We've contacted the courier. Sometimes packages are left with neighbors or at a nearby collection point. The courier will attempt re-delivery within 24 hours. If still not received, we'll process a full refund."),
            ("Can I change delivery address after ordering?", "I just moved and need to update the shipping address on my current order.", "Delivery", True,
             "You can change the address if the order hasn't been shipped yet. Go to Orders -> Select Order -> Edit Address. If already shipped, contact the courier directly with your tracking number."),
            ("International shipping available?", "I want to order from a seller in Kenya but I'm in DRC. Is cross-border shipping possible?", "Delivery", False, None),
            ("Delivery partner lost my package", "Tracking hasn't updated in 7 days and the courier says they can't locate it.", "Delivery", False, None),

            # General (4 topics)
            ("Feature request: Dark mode", "It would be great to have a dark mode option, especially for browsing at night.", "General", True,
             "Thanks for the suggestion! Dark mode is on our roadmap for Q2 2026. In the meantime, you can use your device's built-in dark mode which works with our app."),
            ("How to use the AI Help feature?", "I see there's an AI help button but I'm not sure how it works. Can someone explain?", "General", True,
             "The AI Help feature uses our knowledge base to find instant answers. Just type your question in the search bar and our AI will suggest relevant FAQs and forum posts. If it can't find a good answer, it will offer to create a new forum post."),
            ("App is very slow on my phone", "The Osomba app takes forever to load on my Samsung A10. Any tips?", "General", False, None),
            ("Is there a desktop version?", "I prefer shopping on my laptop. Is there a web version of Osomba?", "General", False, None),
        ]

        topic_count = 0
        for title, content, cat_name, has_answer, answer_text in topics_data:
            cat_id = category_map[cat_name]
            customer_id = random.choice(customer_ids)

            topic = ForumTopic(
                title=title,
                content=content,
                category_id=cat_id,
                user_id=customer_id,
                view_count=random.randint(5, 150),
            )
            text_to_encode = f"{title} {content}"
            topic.embedding = generate_embedding(text_to_encode)
            db.add(topic)
            db.commit()
            db.refresh(topic)

            if has_answer and answer_text:
                # Official answer from agent
                post = ForumPost(
                    topic_id=topic.id,
                    user_id=random.choice([agent_id, agent2_id]),
                    content=answer_text,
                    is_accepted_answer=True,
                )
                db.add(post)

                # Sometimes add a follow-up reply from the customer
                if random.random() > 0.5:
                    followup = ForumPost(
                        topic_id=topic.id,
                        user_id=customer_id,
                        content="Thank you, that solved my issue!",
                        is_accepted_answer=False,
                    )
                    db.add(followup)

            topic_count += 1

        db.commit()
        print(f"Inserted {topic_count} forum topics with replies.")

        # 4. AiQueryLogs (40 entries spread across dates)
        print("Seeding AI query logs...")
        sample_queries = [
            ("How to list an item?", 5, 0.85, False),
            ("MPESA refund not working", 2, 0.60, True),
            ("Forgot my password", 3, 0.92, False),
            ("Report scam seller", 4, 0.77, False),
            ("I want to delete my account", 1, 0.95, False),
            ("Where is my delivery?", 5, 0.65, True),
            ("Payment failed MPESA", 3, 0.88, False),
            ("How to pay with card", 4, 0.82, False),
            ("Refund request", 2, 0.70, True),
            ("Change email address", 3, 0.91, False),
            ("Shipping cost calculator", 1, 0.55, True),
            ("How does escrow work", 5, 0.89, False),
            ("Listing rejected why", 2, 0.73, True),
            ("Track my order", 4, 0.94, False),
            ("Seller not responding help", 1, 0.48, True),
            ("How to upload photos listing", 3, 0.86, False),
            ("What payment methods accepted", 5, 0.93, False),
            ("Item not as described what to do", 2, 0.67, True),
            ("Cancel my order", 4, 0.88, False),
            ("Is Osomba safe to use", 3, 0.79, False),
            ("Airtel money payment", 2, 0.61, True),
            ("How to contact seller", 5, 0.90, False),
            ("Verify my account", 3, 0.84, False),
            ("Dispute resolution time", 1, 0.52, True),
            ("Free shipping available?", 4, 0.76, False),
            ("How to become seller", 5, 0.91, False),
            ("Two factor authentication setup", 2, 0.83, False),
            ("Package lost in transit", 1, 0.45, True),
            ("Edit listing price", 3, 0.87, False),
            ("Orange money supported?", 4, 0.72, False),
            ("Buyer protection guarantee", 5, 0.88, False),
            ("Account suspended reason", 1, 0.40, True),
            ("How long for refund", 3, 0.78, False),
            ("Report fake product", 2, 0.66, True),
            ("International shipping DRC Kenya", 1, 0.53, True),
            ("Reset password not working", 4, 0.85, False),
            ("Meet seller safety tips", 3, 0.81, False),
            ("Delivery delayed 5 days", 2, 0.59, True),
            ("How to rate a seller", 5, 0.92, False),
            ("Coinbase crypto payment", 1, 0.44, True),
        ]

        now = datetime.utcnow()
        for i, (q, results, score, esc) in enumerate(sample_queries):
            # Spread across last 30 days
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            log = AiQueryLog(
                query_text=q,
                results_returned=results,
                top_result_score=score,
                escalated_to_forum=esc,
                user_id=random.choice(customer_ids),
            )
            db.add(log)
        db.commit()
        print(f"Inserted {len(sample_queries)} AI query logs.")

        # Print demo account info
        print("\n" + "="*50)
        print("DEMO ACCOUNTS (use with Cognito)")
        print("="*50)
        print("Admin:    admin@osomba.com")
        print("Agent:    agent@osomba.com")
        print("Customer: user@osomba.com")
        print("="*50)
        print("\nDatabase seeded successfully!")
    except Exception as e:
        print(f"Failed to seed db: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
