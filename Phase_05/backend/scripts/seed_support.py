import sys
import os

# Add the backend root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.schemas.support import ForumCategoryCreate, FAQCreate
from app.services.forum_service import create_category, get_categories
from app.services.faq_service import create_faq, get_faqs

def seed_db():
    db = SessionLocal()
    try:
        # 1. Check if Categories exist
        existing_categories = get_categories(db)
        if not existing_categories:
            print("Seeding Forum Categories...")
            categories = [
                ForumCategoryCreate(name="General Updates", description="News and updates regarding Osomba.", icon="news"),
                ForumCategoryCreate(name="Solar Setup Help", description="Technical assistance with your Kimuntu Power products.", icon="solar_power"),
                ForumCategoryCreate(name="Marketplace Selling", description="Tips and tricks for vendors.", icon="store"),
                ForumCategoryCreate(name="Bug Reports", description="Report issues with the mobile app.", icon="bug_report"),
            ]
            for cat in categories:
                create_category(db, cat)
            print(f"Inserted {len(categories)} categories.")
        else:
            print("Categories already seeded.")

        # 2. Check if FAQs exist
        existing_faqs = get_faqs(db)
        if not existing_faqs:
            print("Seeding FAQs (This might take a moment to download the AI model)...")
            faqs = [
                FAQCreate(
                    question="How do I register as a seller?",
                    answer="Navigate to your Profile tab and select 'Become a Seller'. You will need to provide your business details and accept the vendor agreement.",
                    order_num=1
                ),
                FAQCreate(
                    question="What payment methods are supported?",
                    answer="We currently support M-Pesa. More payment gateways will be added in upcoming updates.",
                    order_num=2
                ),
                FAQCreate(
                    question="How does Osomba arrange shipping?",
                    answer="Vendors are currently responsible for facilitating their own delivery networks. Osomba does not manage a centralized shipping process at this stage.",
                    order_num=3
                ),
            ]
            for faq in faqs:
                create_faq(db, faq)
            print(f"Inserted {len(faqs)} FAQs with semantic embeddings!")
        else:
            print("FAQs already seeded.")

    except Exception as e:
        print(f"Failed to seed db: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
