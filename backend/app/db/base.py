# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.database import Base  # noqa
from app.models.user import User  # noqa
from app.models.product import Product  # noqa
from app.models.auction import Auction, Bid  # noqa
from app.models.order import Order, OrderItem, Payment  # noqa
from app.models.social import Message, Notification, Review  # noqa
