import os
from dotenv import load_dotenv

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:5173/payment/stripe/success")
STRIPE_CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "http://localhost:5173/payment/stripe/cancel")

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_RETURN_URL = os.getenv("PAYPAL_RETURN_URL", "http://localhost:5173/payment/paypal/success")
PAYPAL_CANCEL_URL = os.getenv("PAYPAL_CANCEL_URL", "http://localhost:5173/payment/paypal/cancel")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")

VNPAY_TMN_CODE = os.getenv("VNPAY_TMN_CODE")
VNPAY_HASH_SECRET = os.getenv("VNPAY_HASH_SECRET")
VNPAY_RETURN_URL = os.getenv("VNPAY_RETURN_URL", "http://localhost:5173/payment/vnpay/success")
VNPAY_BASE_URL = os.getenv("VNPAY_BASE_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
USD_TO_VND_RATE = 25000
USD_TO_VND_RATE = 25000
