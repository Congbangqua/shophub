from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from auth.deps import require_admin
from models.product import ProductDB
from models.order import OrderDB
from models.user import UserDB
from schemas.stats import OverviewStats, MonthlyRevenueStats

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"], dependencies=[Depends(require_admin)])


@router.get("/overview", response_model=OverviewStats)
def get_overview(db: Session = Depends(get_db)):
    total_products = db.query(func.count(ProductDB.id)).scalar() or 0
    total_orders = db.query(func.count(OrderDB.id)).scalar() or 0
    total_revenue = (
        db.query(func.sum(OrderDB.total_amount))
        .filter(OrderDB.status.in_(["PROCESSING", "SHIPPING", "DELIVERED"]))
        .scalar()
        or 0.0
    )
    total_users = db.query(func.count(UserDB.id)).scalar() or 0

    return OverviewStats(
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_users=total_users,
    )


@router.get("/monthly-revenue", response_model=MonthlyRevenueStats)
def get_monthly_revenue(db: Session = Depends(get_db)):
    month_expr = func.to_char(OrderDB.created_at, "YYYY-MM").label("month")

    cutoff = datetime.utcnow() - timedelta(days=365)

    results = (
        db.query(month_expr, func.sum(OrderDB.total_amount).label("revenue"))
        .filter(OrderDB.status.in_(["PROCESSING", "SHIPPING", "DELIVERED"]))
        .filter(OrderDB.created_at >= cutoff)
        .group_by(month_expr)
        .order_by(month_expr)
        .all()
    )

    months = [row.month for row in results]
    revenues = [float(row.revenue) for row in results]

    return MonthlyRevenueStats(months=months, revenues=revenues)
