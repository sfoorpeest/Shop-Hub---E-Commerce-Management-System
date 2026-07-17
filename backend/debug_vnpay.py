import hashlib, hmac, urllib.parse

HASH_SECRET = "MACHIG94IW852R58EG8JGIY7OQ3X8HCF"
PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
RETURN_URL = "http://localhost:5173/payment-return"
TMN_CODE = "6ARKCNBL"

from datetime import datetime, timedelta

now = datetime.now()
create_date = now.strftime("%Y%m%d%H%M%S")
expire_date = (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S")

params = {
    "vnp_Amount": "44900000",
    "vnp_Command": "pay",
    "vnp_CreateDate": create_date,
    "vnp_CurrCode": "VND",
    "vnp_ExpireDate": expire_date,
    "vnp_IpAddr": "127.0.0.1",
    "vnp_Locale": "vn",
    "vnp_OrderInfo": "Thanh toan don hang 12",
    "vnp_OrderType": "other",
    "vnp_ReturnUrl": RETURN_URL,
    "vnp_TmnCode": TMN_CODE,
    "vnp_TxnRef": f"12_{create_date}",
    "vnp_Version": "2.1.0",
}

sorted_items = sorted(params.items())
hash_raw = "&".join(f"{k}={v}" for k, v in sorted_items)

def sign(data):
    return hmac.new(HASH_SECRET.encode(), data.encode(), hashlib.sha512).hexdigest()

query_percent = "&".join(f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in sorted_items)
query_plus = urllib.parse.urlencode(sorted_items)

print("--- Test URL 1: Hash RAW + Query PERCENT (%) ---")
print(f"{PAYMENT_URL}?{query_percent}&vnp_SecureHash={sign(hash_raw)}")
print()
print("--- Test URL 2: Hash PLUS (+) + Query PLUS (+) ---")
print(f"{PAYMENT_URL}?{query_plus}&vnp_SecureHash={sign(urllib.parse.urlencode(sorted_items))}")
print()
print("--- Test URL 3: Hash PERCENT (%) + Query PERCENT (%) ---")
hash_quote = "&".join(f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in sorted_items)
print(f"{PAYMENT_URL}?{query_percent}&vnp_SecureHash={sign(hash_quote)}")
print()
print("--- Test URL 4: Hash RAW + Query PLUS (+) ---")
print(f"{PAYMENT_URL}?{query_plus}&vnp_SecureHash={sign(hash_raw)}")

