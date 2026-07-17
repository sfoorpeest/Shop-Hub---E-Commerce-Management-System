import hashlib
import hmac
import logging
import urllib.parse
from datetime import datetime, timedelta
from app.core.config import settings

logger = logging.getLogger("ShopHub.VNPay")


class VNPayService:
    def __init__(self):
        self.tmn_code = settings.VNPAY_TMN_CODE.strip() if settings.VNPAY_TMN_CODE else None
        self.hash_secret = settings.VNPAY_HASH_SECRET.strip() if settings.VNPAY_HASH_SECRET else None
        self.payment_url = settings.VNPAY_PAYMENT_URL.strip() if settings.VNPAY_PAYMENT_URL else None
        self.return_url = settings.VNPAY_RETURN_URL.strip() if settings.VNPAY_RETURN_URL else None

    def _require_config(self) -> None:
        missing = [k for k, v in [
            ("VNPAY_TMN_CODE", self.tmn_code),
            ("VNPAY_HASH_SECRET", self.hash_secret),
            ("VNPAY_PAYMENT_URL", self.payment_url),
            ("VNPAY_RETURN_URL", self.return_url),
        ] if not v]
        if missing:
            raise ValueError(f"VNPay configuration is incomplete. Missing: {', '.join(missing)}")

    @staticmethod
    def _build_hash_data(params: dict) -> str:
        """Build the url-encoded string for HMAC signing (uses + for spaces)."""
        filtered = {k: v for k, v in params.items() if v is not None and str(v) != ""}
        sorted_items = sorted(filtered.items())
        return urllib.parse.urlencode(sorted_items)

    @staticmethod
    def _build_query_string(params: dict) -> str:
        """Build the URL query string with proper encoding (uses + for spaces)."""
        filtered = {k: v for k, v in params.items() if v is not None and str(v) != ""}
        sorted_items = sorted(filtered.items())
        return urllib.parse.urlencode(sorted_items)

    def _sign(self, hash_data: str) -> str:
        secret_key = self.hash_secret.encode("utf-8")
        return hmac.new(secret_key, hash_data.encode("utf-8"), hashlib.sha512).hexdigest()

    def generate_payment_url(self, order_id: int, amount: float, ip_address: str = "127.0.0.1") -> str:
        self._require_config()

        if order_id <= 0:
            raise ValueError("Order ID must be positive")
        if amount < 0:
            raise ValueError("Amount must not be negative")

        # DB prices are in VND. VNPay requires amount * 100 (no decimals).
        vnp_amount = str(int(amount) * 100)

        # VNPay only accepts IPv4
        if not ip_address or ":" in ip_address or ip_address in ("localhost", "::1"):
            ip_address = "127.0.0.1"

        now = datetime.now()
        vnp_params = {
            "vnp_Amount": vnp_amount,
            "vnp_Command": "pay",
            "vnp_CreateDate": now.strftime("%Y%m%d%H%M%S"),
            "vnp_CurrCode": "VND",
            "vnp_ExpireDate": (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S"),
            "vnp_IpAddr": ip_address,
            "vnp_Locale": "vn",
            "vnp_OrderInfo": f"Thanh toan don hang {order_id}",
            "vnp_OrderType": "other",
            "vnp_ReturnUrl": self.return_url,
            "vnp_TmnCode": self.tmn_code,
            "vnp_TxnRef": f"{order_id}_{now.strftime('%Y%m%d%H%M%S%f')}",
            "vnp_Version": "2.1.0",
        }

        hash_data = self._build_hash_data(vnp_params)
        secure_hash = self._sign(hash_data)

        logger.debug("VNPay hash_data: %s", hash_data)
        logger.debug("VNPay secure_hash: %s", secure_hash)

        query_string = self._build_query_string(vnp_params)
        final_url = f"{self.payment_url}?{query_string}&vnp_SecureHash={secure_hash}"
        return final_url

    def validate_return(self, query_params: dict) -> bool:
        self._require_config()

        if not isinstance(query_params, dict):
            query_params = dict(query_params)

        vnp_secure_hash = query_params.get("vnp_SecureHash")
        if not vnp_secure_hash:
            return False

        validation_params = {
            k: v for k, v in query_params.items()
            if k not in ("vnp_SecureHash", "vnp_SecureHashType")
        }

        hash_data = self._build_hash_data(validation_params)
        logger.debug("VNPay return hash_data: %s", hash_data)

        calculated_hash = self._sign(hash_data)
        return calculated_hash.lower() == vnp_secure_hash.lower()


vnpay_service = VNPayService()
