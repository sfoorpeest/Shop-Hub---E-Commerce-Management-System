import unittest

from app.services.vnpay_service import VNPayService


class VNPayServiceTests(unittest.TestCase):
    def test_generate_payment_url_requires_complete_config(self):
        service = VNPayService()
        service.tmn_code = None
        service.hash_secret = None
        service.payment_url = None
        service.return_url = None

        with self.assertRaises(ValueError):
            service.generate_payment_url(order_id=1, amount=100.0, ip_address="127.0.0.1")


if __name__ == "__main__":
    unittest.main()
