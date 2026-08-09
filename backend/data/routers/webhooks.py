from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.order import OrderDB
from schemas.webhook import GHNWebhookPayload

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

GHN_STATUS_MAP = {
    "ready_to_pick": "PROCESSING",
    "picking": "PROCESSING",
    "picked": "SHIPPING",
    "storing": "SHIPPING",
    "transporting": "SHIPPING",
    "sorting": "SHIPPING",
    "delivering": "SHIPPING",
    "delivered": "DELIVERED",
    "delivery_fail": "FAILED",
    "waiting_to_return": "FAILED",
    "return": "FAILED",
    "returned": "FAILED",
    "cancel": "CANCELED",
    "exception": "FAILED",
    "damage": "FAILED",
    "lost": "FAILED",
}


@router.post("/ghn")
def ghn_webhook(payload: GHNWebhookPayload, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.tracking_code == payload.OrderCode).first()
    if not order:
        return {"received": True, "matched": False}

    new_status = GHN_STATUS_MAP.get(payload.Status)
    if new_status and order.status not in ("DELIVERED", "CANCELED"):
        order.status = new_status
        db.commit()

    return {"received": True, "matched": True, "new_status": order.status}
