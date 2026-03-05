import os
from typing import Dict, Optional

import stripe


stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


class StripeClient:
    @staticmethod
    async def create_customer(business_id: str, email: str, name: str) -> str:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"business_id": business_id},
        )
        return customer.id

    @staticmethod
    async def create_subscription(customer_id: str, price_id: str) -> Dict:
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
        )
        return {
            "subscription_id": subscription.id,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret,
            "status": subscription.status,
        }

    @staticmethod
    async def cancel_subscription(subscription_id: str) -> bool:
        try:
            stripe.Subscription.delete(subscription_id)
            return True
        except Exception:
            return False

    @staticmethod
    async def handle_webhook(payload: bytes, sig_header: str) -> Optional[Dict]:
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except ValueError:
            return None
        except stripe.error.SignatureVerificationError:
            return None

        if event["type"] == "invoice.payment_succeeded":
            invoice = event["data"]["object"]
            return {"type": "payment_succeeded", "invoice": invoice}
        if event["type"] == "customer.subscription.updated":
            subscription = event["data"]["object"]
            return {"type": "subscription_updated", "subscription": subscription}

        return None

