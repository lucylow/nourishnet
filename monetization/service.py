from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Dict, List

from sqlalchemy.orm import Session

from models.monetization import BusinessCustomer, SponsoredListing, SubscriptionTier
from monetization.stripe_client import StripeClient


class MonetizationService:
    def __init__(self, db: Session | None):
        self.db = db
        self.stripe = StripeClient()

    async def subscribe_business(
        self, business_id: str, email: str, name: str, tier: str
    ) -> Dict[str, str]:
        if self.db is None:
            raise RuntimeError("Database session is required")

        customer = (
            self.db.query(BusinessCustomer)
            .filter_by(business_id=business_id)
            .first()
        )
        if not customer:
            stripe_customer_id = await self.stripe.create_customer(
                business_id, email, name
            )
            customer = BusinessCustomer(
                business_id=business_id,
                stripe_customer_id=stripe_customer_id,
                tier=SubscriptionTier[tier.upper()],
            )
            self.db.add(customer)
            self.db.commit()

        price_id = os.getenv(f"STRIPE_PRICE_ID_{tier.upper()}")
        if not price_id:
            raise RuntimeError(f"Stripe price id not configured for tier '{tier}'")

        sub_data = await self.stripe.create_subscription(
            customer.stripe_customer_id, price_id
        )

        customer.stripe_subscription_id = sub_data["subscription_id"]
        customer.subscription_status = sub_data["status"]
        customer.current_period_end = datetime.utcnow() + timedelta(days=30)
        self.db.commit()

        return {"client_secret": sub_data["client_secret"]}

    async def cancel_subscription(self, business_id: str) -> bool:
        if self.db is None:
            raise RuntimeError("Database session is required")

        customer = (
            self.db.query(BusinessCustomer)
            .filter_by(business_id=business_id)
            .first()
        )
        if not customer or not customer.stripe_subscription_id:
            return False

        success = await self.stripe.cancel_subscription(
            customer.stripe_subscription_id
        )
        if success:
            customer.subscription_status = "canceled"
            customer.tier = SubscriptionTier.FREE
            self.db.commit()
        return success

    async def sponsor_surplus(
        self, business_id: str, surplus_id: str, duration_hours: int = 24
    ) -> Dict[str, int]:
        if self.db is None:
            raise RuntimeError("Database session is required")

        customer = (
            self.db.query(BusinessCustomer)
            .filter_by(business_id=business_id)
            .first()
        )
        if not customer or customer.tier not in (
            SubscriptionTier.BASIC,
            SubscriptionTier.PREMIUM,
        ):
            raise ValueError("Business not eligible for sponsorship")

        now = datetime.utcnow()
        sponsored = SponsoredListing(
            customer_id=customer.id,
            surplus_id=surplus_id,
            start_time=now,
            end_time=now + timedelta(hours=duration_hours),
            is_active=True,
        )
        self.db.add(sponsored)
        self.db.commit()
        self.db.refresh(sponsored)

        return {"sponsored_id": sponsored.id}

    def get_sponsored_surplus_ids(self) -> List[str]:
        if self.db is None:
            raise RuntimeError("Database session is required")

        now = datetime.utcnow()
        active = (
            self.db.query(SponsoredListing)
            .filter(
                SponsoredListing.is_active.is_(True),
                SponsoredListing.start_time <= now,
                SponsoredListing.end_time >= now,
            )
            .all()
        )
        return [s.surplus_id for s in active]

