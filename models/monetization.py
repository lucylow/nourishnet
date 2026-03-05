from __future__ import annotations

import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class SubscriptionTier(enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"


class BusinessCustomer(Base):
    __tablename__ = "business_customers"

    id = Column(Integer, primary_key=True)
    business_id = Column(String(50), unique=True, nullable=False)
    stripe_customer_id = Column(String(100), unique=True)
    stripe_subscription_id = Column(String(100))
    tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    subscription_status = Column(String(20), default="incomplete")
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transactions = relationship("Transaction", back_populates="customer")
    sponsored_listings = relationship("SponsoredListing", back_populates="customer")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("business_customers.id"))
    stripe_invoice_id = Column(String(100), unique=True)
    amount = Column(Float)
    currency = Column(String(3), default="GBP")
    status = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("BusinessCustomer", back_populates="transactions")


class SponsoredListing(Base):
    __tablename__ = "sponsored_listings"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("business_customers.id"))
    surplus_id = Column(String(50), unique=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)

    customer = relationship("BusinessCustomer", back_populates="sponsored_listings")

