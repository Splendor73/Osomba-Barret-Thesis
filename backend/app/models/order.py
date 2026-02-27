import enum
from sqlalchemy import Column, Integer, Numeric, String, ForeignKey, Boolean, Enum as SQLEnum, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class PaymentProvider(str, enum.Enum):
    MPESA = "MPESA"
    PAYSTACK = "PAYSTACK"
    AIRTEL = "AIRTEL"
    STRIPE = "STRIPE"
    COINBASE = "COINBASE"
    ORANGE = "ORANGE"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    payment_id = Column(Integer, nullable=True)  # Can be linked after payment creation
    total_cost = Column(Numeric, nullable=False)
    shipping_type = Column(String, nullable=False)  # 'Local Pickup', 'Shipping'
    shipping_status = Column(String, default='Not Shipped')
    shipping_address = Column(String)

    buyer = relationship("User", backref="orders")
    items = relationship("OrderItem", cascade="all, delete-orphan", back_populates="order")
    payments = relationship("Payment", cascade="all, delete-orphan", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_of_item = Column(Numeric, nullable=False)

    product = relationship("Product")
    order = relationship("Order", back_populates="items")


class Payment(Base):
    __tablename__ = "payment"

    payment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    payment_type = Column(SQLEnum(PaymentProvider), nullable=False)
    payment_amount = Column(Numeric, nullable=False)
    currency = Column(String, default='USD')
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    provider_transaction_id = Column(String, nullable=True, unique=True, index=True)
    metadata_json = Column(JSON, nullable=True)  # Stores provider-specific response data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    order = relationship("Order", back_populates="payments")
