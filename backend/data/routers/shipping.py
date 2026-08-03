from fastapi import APIRouter, Depends
from auth.deps import get_current_user
from schemas.shipping import ShippingFeeRequest, ShippingFeeResponse
from services.ghn_service import calculate_shipping_fee

router = APIRouter(prefix="/shipping", tags=["shipping"])

@router.post("/calculate-fee", response_model=ShippingFeeResponse)
def get_shipping_fee(payload: ShippingFeeRequest, user=Depends(get_current_user)):
    fee = calculate_shipping_fee(
        to_district_id=payload.to_district_id,
        to_ward_code=payload.to_ward_code,
        weight=payload.weight,
        insurance_value=payload.insurance_value,
    )
    return ShippingFeeResponse(fee=fee)
