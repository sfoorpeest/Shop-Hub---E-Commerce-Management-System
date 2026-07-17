from app.services.vnpay_service import VNPayService

s = VNPayService()
print('tmn:', s.tmn_code)
print('secret:', s.hash_secret)
print('payment_url:', s.payment_url)
print('return_url:', s.return_url)
print('url:', s.generate_payment_url(order_id=5, amount_usd=249000.0, ip_address='127.0.0.1'))
