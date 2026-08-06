from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class OrderItemCreate(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int = Field(..., gt=0)

class CheckoutRequest(BaseModel):
    items: List[OrderItemCreate]
    shipping_provider: str = Field(..., pattern="^(IN_HOUSE|GHN)$")
    shipping_fee: float = Field(..., ge=0)
    to_name: Optional[str] = None
    to_phone: Optional[str] = None
    to_address: Optional[str] = None
    to_district_id: Optional[int] = None
    to_ward_code: Optional[str] = None

class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: str
    shipping_provider: str
    tracking_code: Optional[str] = None
    shipping_fee: float
    shipper_id: Optional[int] = None
    items: List[OrderItemRead]

    class Config:
        from_attributes = True

class OrderSummary(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: str
    shipping_provider: str
    tracking_code: Optional[str] = None
    customer_email: Optional[str] = None

    class Config:
        from_attributes = True


ALLOWED_STATUSES = ["PROCESSING", "SHIPPING", "DELIVERED", "CANCELED", "FAILED"]
SHIPPER_ALLOWED_TRANSITIONS = {
    "PROCESSING": ["SHIPPING"],
    "SHIPPING": ["DELIVERED", "FAILED"],
}

class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ALLOWED_STATUSES:
            raise ValueError(f"Invalid status: {v}")
        return v

class OrderItemQuantityUpdate(BaseModel):
    item_id: int
    quantity: int = Field(..., gt=0)
