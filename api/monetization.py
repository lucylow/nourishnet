from __future__ import annotations

from typing import Dict, List

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, SessionLocal
from monetization.service import MonetizationService


router = APIRouter(prefix="/monetization", tags=["monetization"])


class SubscribeRequest(BaseModel):
    business_id: str
    email: str
    name: str
    tier: str


@router.post("/subscribe")
async def subscribe(
    req: SubscribeRequest, db: Session = Depends(get_db)
) -> Dict[str, str]:
    service = MonetizationService(db)
    try:
        return await service.subscribe_business(
            req.business_id, req.email, req.name, req.tier
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/cancel/{business_id}")
async def cancel(business_id: str, db: Session = Depends(get_db)) -> Dict[str, str]:
    service = MonetizationService(db)
    success = await service.cancel_subscription(business_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"status": "canceled"}


class SponsorRequest(BaseModel):
    business_id: str
    surplus_id: str
    duration_hours: int = 24


@router.post("/sponsor")
async def sponsor(
    req: SponsorRequest, db: Session = Depends(get_db)
) -> Dict[str, int]:
    service = MonetizationService(db)
    try:
        return await service.sponsor_surplus(
            req.business_id, req.surplus_id, req.duration_hours
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/sponsored")
async def sponsored(db: Session = Depends(get_db)) -> Dict[str, List[str]]:
    service = MonetizationService(db)
    ids = service.get_sponsored_surplus_ids()
    return {"ids": ids}


@router.post("/webhook")
async def stripe_webhook(
    request: Request, stripe_signature: str = Header(None)
) -> Dict[str, bool]:
    payload = await request.body()
    service = MonetizationService(None)
    event = await service.stripe.handle_webhook(payload, stripe_signature or "")
    if not event:
        raise HTTPException(status_code=400, detail="Webhook error")

    # For now we only acknowledge receipt; detailed DB updates can be added later.
    if event["type"] in {"payment_succeeded", "subscription_updated"}:
        db: Session = SessionLocal()
        try:
            db.close()
        finally:
            db.close()

    return {"received": True}

