from fastapi import APIRouter, Depends
from auth.deps import get_current_user
from schemas.shipping import ShippingFeeRequest, ShippingFeeResponse
from services.ghn_service import calculate_shipping_fee, get_provinces, get_districts, get_wards

router = APIRouter(prefix="/shipping", tags=["shipping"])


@router.get("/provinces")
def list_provinces(user=Depends(get_current_user)):
    return get_provinces()


@router.get("/districts")
def list_districts(province_id: int, user=Depends(get_current_user)):
    return get_districts(province_id)


@router.get("/wards")
def list_wards(district_id: int, user=Depends(get_current_user)):
    return get_wards(district_id)


@router.post("/calculate-fee", response_model=ShippingFeeResponse)
def get_shipping_fee(payload: ShippingFeeRequest, user=Depends(get_current_user)):
    fee = calculate_shipping_fee(
        to_district_id=payload.to_district_id,
        to_ward_code=payload.to_ward_code,
        weight=payload.weight,
        insurance_value=payload.insurance_value,
    )
    return ShippingFeeResponse(fee=fee)
