import os
from dotenv import load_dotenv

load_dotenv()

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_SUCCESS_URL = os.environ.get("STRIPE_SUCCESS_URL")
STRIPE_CANCEL_URL = os.environ.get("STRIPE_CANCEL_URL")

PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.environ.get("PAYPAL_CLIENT_SECRET")
PAYPAL_API_BASE = os.environ.get("PAYPAL_API_BASE")
PAYPAL_RETURN_URL = os.environ.get("PAYPAL_RETURN_URL")
PAYPAL_CANCEL_URL = os.environ.get("PAYPAL_CANCEL_URL")

VNPAY_TMN_CODE = os.environ.get("VNPAY_TMN_CODE")
VNPAY_HASH_SECRET = os.environ.get("VNPAY_HASH_SECRET")
VNPAY_RETURN_URL = os.environ.get("VNPAY_RETURN_URL")
VNPAY_BASE_URL = os.environ.get("VNPAY_BASE_URL")
USD_TO_VND_RATE = 25000
