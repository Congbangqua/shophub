import hashlib
import hmac
import urllib.parse
from datetime import datetime


def build_vnpay_signature(params: dict, hash_secret: str) -> str:
    """
    VNPay yêu cầu:
    1. Sort params theo tên key (alphabetically).
    2. Build query string dạng key=value&key=value (đã urlencode value).
    3. HMAC-SHA512 chuỗi đó với hash_secret -> hex digest (viết hoa hoặc thường đều được, VNPay không phân biệt).
    """
    sorted_params = sorted(params.items())
    query_string = urllib.parse.urlencode(sorted_params, quote_via=urllib.parse.quote_plus)

    hmac_obj = hmac.new(
        hash_secret.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha512,
    )
    return hmac_obj.hexdigest()


def build_vnpay_payment_url(
    *,
    base_url: str,
    tmn_code: str,
    hash_secret: str,
    amount: float,
    order_id: int,
    order_info: str,
    return_url: str,
    ip_addr: str = "127.0.0.1",
) -> str:
    now = datetime.now()
    create_date = now.strftime("%Y%m%d%H%M%S")
    txn_ref = f"{order_id}-{create_date}"  # unique mỗi lần tạo

    params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": tmn_code,
        "vnp_Amount": str(int(amount * 100)),  # VNPay yêu cầu nhân 100, không có phần thập phân
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,
        "vnp_OrderInfo": order_info,
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": return_url,
        "vnp_IpAddr": ip_addr,
        "vnp_CreateDate": create_date,
    }

    secure_hash = build_vnpay_signature(params, hash_secret)
    params["vnp_SecureHash"] = secure_hash

    query_string = urllib.parse.urlencode(params, quote_via=urllib.parse.quote_plus)
    return f"{base_url}?{query_string}"