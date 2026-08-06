from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from models.product import ProductDB
from database import get_db
from models.order import OrderDB, OrderItemDB
from schemas.order import (
    CheckoutRequest,
    OrderRead,
    OrderItemRead,
    OrderSummary,
    OrderStatusUpdate,
    OrderItemQuantityUpdate,
    SHIPPER_ALLOWED_TRANSITIONS,
)
from auth.deps import get_current_user, require_admin, require_shipper
from services.ghn_service import create_ghn_order
from schemas.order import SHIPPER_ALLOWED_TRANSITIONS
from auth.deps import require_shipper

router = APIRouter(prefix="/orders", tags=["orders"])

def _to_order_read(order: OrderDB) -> OrderRead:
    return OrderRead(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        created_at=str(order.created_at),
        shipping_provider=order.shipping_provider,
        tracking_code=order.tracking_code,
        shipping_fee=order.shipping_fee,
        shipper_id=order.shipper_id,
        items=[
            OrderItemRead(
                id=oi.id,
                product_id=oi.product_id,
                product_name=oi.product_name,
                product_price=oi.product_price,
                quantity=oi.quantity,
                line_total=oi.line_total,
            )
            for oi in order.items
        ],
    )

def _to_order_summary(order: OrderDB) -> OrderSummary:
    return OrderSummary(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        created_at=str(order.created_at),
        shipping_provider=order.shipping_provider,
        tracking_code=order.tracking_code,
        customer_email=order.user.email if order.user else None,
    )

@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout_order(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total_amount = 0.0
    products_to_update = []

    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item quantity")

        product = db.query(ProductDB).filter(ProductDB.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product '{item.name}' not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for '{product.name}'. Available: {product.stock}",
            )

        products_to_update.append((product, item.quantity))
        total_amount += item.price * item.quantity

    tracking_code = None
    if payload.shipping_provider == "GHN":
        if not all([payload.to_name, payload.to_phone, payload.to_address,
                    payload.to_district_id, payload.to_ward_code]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing shipping address for GHN",
            )
        ghn_items = [
            {"name": item.name, "quantity": item.quantity}
            for item in payload.items
        ]
        tracking_code = create_ghn_order(
            to_name=payload.to_name,
            to_phone=payload.to_phone,
            to_address=payload.to_address,
            to_district_id=payload.to_district_id,
            to_ward_code=payload.to_ward_code,
            items=ghn_items,
            weight=sum(item.quantity for item in payload.items) * 200,  # ước lượng 200g/món
        )

    try:
        order = OrderDB(
            user_id=user.id,
            status="PLACED",
            total_amount=total_amount + payload.shipping_fee,
            shipping_provider=payload.shipping_provider,
            shipping_fee=payload.shipping_fee,
            tracking_code=tracking_code,
        )
        db.add(order)
        db.flush()

        for item in payload.items:
            db.add(OrderItemDB(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.name,
                product_price=item.price,
                quantity=item.quantity,
                line_total=item.price * item.quantity,
            ))

        for product, qty in products_to_update:
            product.stock -= qty

        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise

    return _to_order_read(order)


@router.get("/my", response_model=List[OrderSummary])
def get_my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.user_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [_to_order_summary(o) for o in orders]


@router.get("/admin/all", response_model=List[OrderSummary], dependencies=[Depends(require_admin)])
def get_all_orders_for_admin(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).order_by(desc(OrderDB.created_at)).all()
    return [_to_order_summary(o) for o in orders]

@router.get("/shipper/history", response_model=List[OrderSummary])
def get_shipper_history(db: Session = Depends(get_db), user=Depends(require_shipper)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.shipper_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [_to_order_summary(o) for o in orders]

@router.get("/shipper/queue", response_model=List[OrderSummary])
def get_shipper_queue(db: Session = Depends(get_db), user=Depends(require_shipper)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.shipping_provider == "IN_HOUSE")
        .filter(OrderDB.status == "PROCESSING")
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [
        OrderSummary(
            id=o.id, status=o.status, total_amount=o.total_amount,
            created_at=str(o.created_at), shipping_provider=o.shipping_provider,
            tracking_code=o.tracking_code,
        )
        for o in orders
    ]

@router.get("/{order_id}", response_model=OrderRead)
def get_order_by_id(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    is_owner = order.user_id == user.id
    is_admin = user.role == "Admin"
    is_assigned_shipper = user.role == "Shipper" and order.shipper_id == user.id

    if not (is_owner or is_admin or is_assigned_shipper):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return _to_order_read(order)


@router.patch("/{order_id}/status", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _to_order_read(order)


@router.patch("/{order_id}/items/quantity", response_model=OrderRead, dependencies=[Depends(require_admin)])
def admin_update_order_item_quantity(order_id: int, payload: OrderItemQuantityUpdate, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    item = db.query(OrderItemDB).filter(
        OrderItemDB.id == payload.item_id,
        OrderItemDB.order_id == order_id,
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order item not found")

    item.quantity = payload.quantity
    item.line_total = item.quantity * item.product_price
    order.total_amount = sum(oi.line_total for oi in order.items)

    db.commit()
    db.refresh(order)
    return _to_order_read(order)


@router.patch("/{order_id}/shipper-status", response_model=OrderRead)
def shipper_update_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_shipper),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.shipping_provider != "IN_HOUSE":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not an in-house order")

    allowed_next = SHIPPER_ALLOWED_TRANSITIONS.get(order.status, [])
    if payload.status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {order.status} to {payload.status}",
        )

    order.status = payload.status
    if order.status == "SHIPPING":
        order.shipper_id = user.id

    db.commit()
    db.refresh(order)
    return _to_order_read(order)
