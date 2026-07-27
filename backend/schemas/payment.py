from pydantic import BaseModel
from typing import Optional

class StripeCreateSessionRequest(BaseModel):
    order_id: int

class PaypalCreateOrderRequest(BaseModel):
    order_id: int

class VnpayCreateUrlRequest(BaseModel):
    order_id: int
    
class PaymentConfirmRequest(BaseModel):
    order_id: int
    provider: str
    paypal_order_id: Optional[str] = None