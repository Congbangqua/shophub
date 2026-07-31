from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import stripe
import httpx

from database import get_db
from models.order import OrderDB
from auth.deps import get_current_user
from data.routers.vnpay_utils import build_vnpay_payment_url
from schemas.payment import (
    StripeCreateSessionRequest, PaypalCreateOrderRequest,
    VnpayCreateUrlRequest, PaymentConfirmRequest,
)
from config import (
    STRIPE_SECRET_KEY, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL,
    PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE,
    PAYPAL_RETURN_URL, PAYPAL_CANCEL_URL,
    VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_RETURN_URL, VNPAY_BASE_URL, USD_TO_VND_RATE,
)

stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["payments"])


def get_paypal_access_token() -> str:
    response = httpx.post(
        f"{PAYPAL_API_BASE}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
        headers={"Accept": "application/json"},
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to authenticate with PayPal",
        )
    return response.json()["access_token"]


def capture_paypal_order(paypal_order_id: str) -> dict:
    access_token = get_paypal_access_token()
    response = httpx.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders/{paypal_order_id}/capture",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
    )
    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"PayPal capture error: {response.text}",
        )
    return response.json()


@router.post("/stripe/create-session")
def create_stripe_session(
    payload: StripeCreateSessionRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if order.status == "PAID":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already paid")

    line_items = [
        {
            "price_data": {
                "currency": "usd",
                "product_data": {"name": item.product_name},
                "unit_amount": int(round(item.product_price * 100)),
            },
            "quantity": item.quantity,
        }
        for item in order.items
    ]

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{STRIPE_SUCCESS_URL}?order_id={order.id}",
            cancel_url=f"{STRIPE_CANCEL_URL}?order_id={order.id}",
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    return {"url": session.url}


@router.post("/paypal/create-order")
def create_paypal_order(
    payload: PaypalCreateOrderRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if order.status == "PAID":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already paid")

    access_token = get_paypal_access_token()

    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(order.id),
                "amount": {
                    "currency_code": "USD",
                    "value": f"{order.total_amount:.2f}",
                },
            }
        ],
        "application_context": {
            "return_url": f"{PAYPAL_RETURN_URL}?order_id={order.id}",
            "cancel_url": f"{PAYPAL_CANCEL_URL}?order_id={order.id}",
        },
    }

    response = httpx.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders",
        json=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
    )

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"PayPal error: {response.text}",
        )

    data = response.json()
    approve_link = next(
        (link["href"] for link in data.get("links", []) if link.get("rel") == "approve"),
        None,
    )

    if not approve_link:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="PayPal did not return an approval link",
        )

    return {"approve_url": approve_link}


@router.post("/vnpay/create-url")
def create_vnpay_url(
    payload: VnpayCreateUrlRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if order.status == "PAID":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order already paid")

    amount_vnd = order.total_amount * USD_TO_VND_RATE

    payment_url = build_vnpay_payment_url(
        base_url=VNPAY_BASE_URL,
        tmn_code=VNPAY_TMN_CODE,
        hash_secret=VNPAY_HASH_SECRET,
        amount=amount_vnd,
        order_id=order.id,
        order_info=f"Thanh toan don hang {order.id}",
        return_url=f"{VNPAY_RETURN_URL}?order_id={order.id}",
    )

    return {"url": payment_url}


@router.post("/confirm")
def confirm_payment(
    payload: PaymentConfirmRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != user.id and user.role != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if order.status == "PAID":
        return {"id": order.id, "status": order.status}

    if payload.provider == "paypal":
        if not payload.paypal_order_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing paypal_order_id",
            )
        capture_data = capture_paypal_order(payload.paypal_order_id)
        if capture_data.get("status") != "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PayPal payment was not completed",
            )

    order.status = "PAID"
    db.commit()
    db.refresh(order)

    return {"id": order.id, "status": order.status}
