import os
from dotenv import load_dotenv

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("sk_test_51TxDNmFxYxE1Xw2Z2TN5jiAWwLJP2GqOEKbwLQJvo2Bh4QCWQFRsoFCHWRyECNrgvWwrTHLG3cXj1rKMRqVfuR0k0063lojDgp")
STRIPE_SUCCESS_URL = os.getenv("https://shophub-qs3z.vercel.app/payment/stripe/success", "http://localhost:5173/payment/stripe/success")
STRIPE_CANCEL_URL = os.getenv("https://shophub-qs3z.vercel.app/payment/stripe/cancel", "http://localhost:5173/payment/stripe/cancel")

PAYPAL_CLIENT_ID = os.getenv("BAAjoV6LAWwiJ_1yPm7ZE73_V-emJdOmwqhKhzzh9FMM8imTg7JcgESz3I-iI5i8iCqV2tiohLeI-xvb98")
PAYPAL_CLIENT_SECRET = os.getenv("EK3zDySGbN5hD70jBcBQHjvetu59qhJeVQBTQ4vi8viFC0FzU9d5gU9fy92q1p8MNv_VfI1V5Kl0R7Qz")
PAYPAL_RETURN_URL = os.getenv("https://shophub-qs3z.vercel.app/payment/paypal/success", "http://localhost:5173/payment/paypal/success")
PAYPAL_CANCEL_URL = os.getenv("https://shophub-qs3z.vercel.app/payment/stripe/cancel", "http://localhost:5173/payment/paypal/cancel")
PAYPAL_API_BASE = os.getenv("https://api-m.sandbox.paypal.com")

VNPAY_TMN_CODE = os.getenv("FT4EZ7TS")
VNPAY_HASH_SECRET = os.getenv("TQBWSNWJWKHTCWEUCKMFOWMUVKSIBRAT")
VNPAY_RETURN_URL = os.getenv("https://shophub-qs3z.vercel.app/payment/vnpay/success", "http://localhost:5173/payment/vnpay/success")
VNPAY_BASE_URL = os.getenv("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
USD_TO_VND_RATE = 25000
