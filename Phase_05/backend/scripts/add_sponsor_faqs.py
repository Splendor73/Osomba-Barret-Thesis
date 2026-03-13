import sys
import os

# Add the backend root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.support import ForumCategory, FAQ
from app.services.ai_service import generate_embedding

def add_sponsor_faqs():
    db = SessionLocal()
    try:
        # Get existing categories or use a default one
        categories = {cat.name.lower(): cat.id for cat in db.query(ForumCategory).all()}
        
        def get_cat_id(name):
            return categories.get(name.lower(), categories.get("general"))

        faqs_data = [
            # 1. General Information
            ("General", "What is Osomba?", "Osomba is a modern digital marketplace and smart eCommerce platform designed to connect buyers, individual sellers, and business sellers in a secure, user-friendly environment. It integrates payment solutions, advanced analytics, and global marketplace connections to enable trading, paying, and receiving money with confidence."),
            ("General", "Who can use Osomba?", "Osomba is open to users worldwide, including the Democratic Republic of Congo (DRC).\nBuyers: Any person 18 years or older.\nSellers: Individuals who complete verification with a valid ID (Carte d’électeur, Driver’s Licence, Passport).\nBusiness Sellers: Registered businesses that complete verification with a form, business information, and supporting documents. Verification takes 7 to 14 business days."),
            ("General", "What makes Osomba unique?", "Global and local reach – DRC and worldwide operations.\nPayment options – Credit/debit cards, PayPal, Apple Pay, Google Pay, and M-Pesa, Orange Money, Airtel Money.\nMarketplace interoperability – Connect and sync with Amazon, Alibaba, TEMU, and other international platforms.\nUser roles and verification – Buyer, Seller, and Business Seller, each with specific permissions and product limits.\nAI-powered recommendations and business analytics.\nCommunity-driven support – Frequent questions become part of the FAQ for everyone."),
            
            # 2. Account Types & Verification
            ("Account", "What is the difference between Buyer, Seller, and Business Seller?", "Buyer: Can browse, add to cart, and purchase products. Must be 18+ years old.\nSeller: Individual users verified with a valid ID. Can list up to 200 products for free.\nBusiness Seller: Verified businesses that provide required documents. Can list up to 2,000 products."),
            ("Account", "How do I become a verified Seller?", "Submit a valid government-issued ID (Carte d’électeur, Driver’s Licence, or Passport). Once verified, your account will have full seller privileges."),
            ("Account", "How do I become a Business Seller?", "Complete the business verification process:\nFill the business verification form.\nProvide business information (name, registration, address, contact).\nSubmit official business documents.\nVerification takes 7 to 14 business days. Once approved, you can list up to 2,000 products."),
            ("Safety", "What happens to fake or suspicious accounts?", "Any account flagged as fake, fraudulent, or violating Osomba policies will be blocked and deleted by Osomba Administration Support."),
            ("Listings", "How many products can I list?", "Individual Seller: up to 200 products for free.\nBusiness Seller: up to 2,000 products with subscription"),
            
            # 3. Marketplace Operations
            ("Listings", "How do I list products or services on Osomba?", "Create an Osomba seller account.\nNavigate to the “Sell” section.\nAdd product/service details: title, description, images, pricing, and category.\nChoose shipping/delivery options if applicable.\nSubmit for review and publish once approved."),
            ("Listings", "How do buyers find products or services?", "Buyers can search using keywords, categories, or filters. Osomba also provides:\nPersonalized recommendations based on browsing and purchase history.\nTrending and featured items for quick discovery.\nSaved favorites for future purchase tracking."),
            ("General", "Can I buy internationally?", "Yes. Osomba supports international shipping and synchronization with Amazon, Alibaba, TEMU, and other marketplaces."),
            ("General", "How can I become an international buyer of Osomba?", "To become an international buyer, you need to qualify for Osomba’s international purchasing feature. Once approved, you will be able to shop globally through Osomba, including access to synchronized products and offers from major marketplaces such as Amazon, Alibaba, TEMU, and other partner platforms. This allows buyers to discover, purchase, and receive products from international sellers directly through the Osomba platform."),
            ("Delivery", "How is order tracking managed?", "Buyers can track order status in real-time via the “My Orders” section. Notifications are sent for order confirmation, shipping, delivery, and returns. Sellers can update shipping info, manage inventory, and monitor analytics."),
            ("Disputes", "Can I cancel or modify an order?", "Orders can be modified or canceled if the seller has not yet processed it. Specific policies depend on seller preferences, product type, and shipping status."),
            
            # 4. Payments & Transactions
            ("Payments", "What payment methods are supported?", "Osomba supports:\nCredit/debit cards: Visa, MasterCard, AMEX\nDigital wallets: PayPal, Apple Pay, Google Pay\nBank transfers\nMobile money services: M-Pesa, Orange Money, Airtel Money"),
            ("Payments", "How do sellers receive payments?", "Funds are automatically sent to the linked bank account, digital wallet, or mobile money account after transaction confirmation."),
            ("Payments", "Are there fees for selling?", "Yes, Osomba charges competitive platform fees for transactions, which vary depending on product category, subscription plan, and marketplace promotions. Sellers are notified of applicable fees before listing."),
            ("Payments", "How secure are transactions?", "Osomba uses end-to-end encryption, PCI DSS compliance, and secure authentication for all payments."),
            
            # 5. User Accounts & Profiles
            ("Account", "How do I create an Osomba account?", "Visit Osomba’s website or mobile app and click “Sign Up.” You can register as a buyer, seller, or service provider using your email, phone number, or social media login."),
            ("Account", "Can I have both buyer and seller accounts?", "Yes. Users can manage dual roles with a single account by enabling the seller dashboard within their profile."),
            ("Account", "How do I update my account information?", "Go to “Account Settings” → “Profile” to update personal info, contact details, payment methods, and notification preferences."),
            ("Account", "What if I forget my password?", "Use the “Forgot Password” link on the login page. A password reset link will be sent to your registered email."),
            
            # 6. Services & Features
            ("General", "What additional services does Osomba offer?", "Osomba provides:\nOrder & shipment tracking for both buyers and sellers.\nSaved favorites & wishlists for easy management of desired products.\nAI-powered recommendations based on user activity.\nMarketplace analytics to track sales, trends, and customer behavior.\nSeamless integration with social media and external eCommerce tools."),
            ("Listings", "Can businesses advertise on Osomba?", "Yes. Businesses can create sponsored listings, display ads, and featured promotions to reach target audiences within the marketplace."),
            ("General", "How does Osomba support international trade?", "The platform provides:\nMulti-currency support and localized payment options.\nShipping and logistics partnerships for global delivery.\nTranslation and localization tools for listings."),
            
            # 7. Security & Privacy
            ("Safety", "How is user data protected?", "Osomba complies with global data protection regulations (e.g., GDPR, CCPA). Data is encrypted at rest and in transit, and access is limited to authorized personnel."),
            ("Disputes", "How are disputes handled?", "Osomba has a dispute resolution system to mediate conflicts between buyers and sellers regarding payments, products, or services. Support agents provide guidance and escalate cases when needed."),
            ("Safety", "How can I report suspicious activity?", "Use the “Report” button on listings or accounts. Osomba’s security team investigates and takes appropriate action, including account suspension or removal of listings."),
            
            # 8. Community & Support
            ("General", "What are the community rules?", "All users must:\nRespect other members.\nAvoid posting prohibited content or fraudulent products.\nReport suspicious behavior to Osomba support."),
            ("General", "How does Osomba handle frequently asked questions?", "Questions asked often in the community are reviewed and added to the official FAQ, helping all users find answers quickly."),
            ("General", "How can I contact support?", "Support channels:\nLive chat on the website and mobile app\nEmail: support@osomba.com\nPhone: +1 (XXX) XXX-XXXX\nHelp Center: FAQs, tutorials, and guides are available 24/7."),
            
            # 7. Customer Service (Duplicate numbering in original text)
            ("General", "How can I contact Osomba customer service?", "Support is available via:\nLive chat on the website and mobile app.\nEmail: contact@osomba.com\nPhone: +1 (XXX) XXX-XXXX"),
            ("General", "What is the response time for inquiries?", "Typical response time is within 24 hours. Priority issues like payment disputes or security concerns are handled within a few hours."),
            ("General", "Are there tutorials or guides for new users?", "Yes. Osomba offers video tutorials, written guides, and interactive walkthroughs to help buyers and sellers maximize platform use."),
            
            # 8. Policies & Legal
            ("Safety", "What are the terms of service?", "Users must comply with Osomba’s Terms of Service, which cover account use, prohibited activities, intellectual property, dispute resolution, and liabilities."),
            ("Account", "Can I delete my account?", "Yes. Go to Account Settings → Delete Account. Data removal follows privacy regulations.")
        ]
        
        # Get highest order_num to append at the end
        highest_order = db.query(FAQ).order_by(FAQ.order_num.desc()).first()
        current_order = highest_order.order_num if highest_order else 0

        inserted_count = 0
        for cat_name, q, a in faqs_data:
            # Check if FAQ already exists (by question)
            existing_faq = db.query(FAQ).filter(FAQ.question == q).first()
            if existing_faq:
                print(f"Skipping existing FAQ: {q}")
                continue
                
            current_order += 1
            cat_id = get_cat_id(cat_name)
            
            faq_obj = FAQ(
                question=q,
                answer=a,
                order_num=current_order,
                category_id=cat_id,
                is_active=True,
            )
            text_to_encode = f"{q} {a}"
            try:
                faq_obj.embedding = generate_embedding(text_to_encode)
            except Exception as e:
                print(f"Error generating embedding for '{q}': {e}")
                pass

            db.add(faq_obj)
            inserted_count += 1
            
            if inserted_count % 5 == 0:
                print(f"Inserted {inserted_count} FAQs so far...")

        db.commit()
        print(f"Successfully inserted {inserted_count} new FAQs.")

    except Exception as e:
        print(f"Failed to add FAQs: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sponsor_faqs()