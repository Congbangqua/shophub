from pydantic import BaseModel
from typing import Optional

class ShippingFeeRequest(BaseModel):
    to_district_id: int
    to_ward_code: str
    weight: int
    insurance_value: Optional[int] = 0

class ShippingFeeResponse(BaseModel):
    fee: float
