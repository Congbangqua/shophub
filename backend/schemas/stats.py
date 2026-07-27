from pydantic import BaseModel
from typing import List

class OverviewStats(BaseModel):
    total_products: int
    total_orders: int
    total_revenue: float
    total_users: int

class MonthlyRevenueStats(BaseModel):
    months: List[str]
    revenues: List[float]