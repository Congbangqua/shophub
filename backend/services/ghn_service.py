import httpx
from fastapi import HTTPException, status
from config import GHN_API_URL, GHN_API_TOKEN, GHN_SHOP_ID

def _ghn_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "Token": GHN_API_TOKEN,
        "ShopId": str(GHN_SHOP_ID),
    }


def calculate_shipping_fee(
    to_district_id: int,
    to_ward_code: str,
    weight: int,
    insurance_value: int = 0,
) -> float:
    body = {
        "to_district_id": to_district_id,
        "to_ward_code": to_ward_code,
        "weight": weight,
        "insurance_value": insurance_value,
        "service_type_id": 2,  # dịch vụ chuẩn của GHN sandbox
    }

    response = httpx.post(
        f"{GHN_API_URL}/v2/shipping-order/fee",
        json=body,
        headers=_ghn_headers(),
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GHN fee error: {response.text}",
        )

    data = response.json()
    return float(data["data"]["total"])


def create_ghn_order(
    to_name: str,
    to_phone: str,
    to_address: str,
    to_district_id: int,
    to_ward_code: str,
    items: list,
    weight: int,
    insurance_value: int = 0,
) -> str:
    body = {
        "payment_type_id": 2,
        "to_name": to_name,
        "to_phone": to_phone,
        "to_address": to_address,
        "to_district_id": to_district_id,
        "to_ward_code": to_ward_code,
        "weight": weight,
        "insurance_value": insurance_value,
        "service_type_id": 2,
        "items": items,
    }

    response = httpx.post(
        f"{GHN_API_URL}/v2/shipping-order/create",
        json=body,
        headers=_ghn_headers(),
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GHN create order error: {response.text}",
        )

    data = response.json()
    return data["data"]["order_code"]
