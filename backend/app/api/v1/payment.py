from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import logging
from datetime import datetime

from app.db.session import get_db
from app.models.models import User, Order
from app.api.deps import get_current_active_user
from app.services.vnpay_service import vnpay_service

router = APIRouter(prefix="/payment", tags=["Payment"], redirect_slashes=False)
logger = logging.getLogger("ShopHub.Payment")


@router.post("/vnpay/create_url/{order_id}")
def create_vnpay_payment_url(
    order_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate VNPay payment URL for an order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this order")
        
    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order is already paid")

    # Get client IP address
    ip_addr = request.client.host if request.client else "127.0.0.1"

    payment_url = vnpay_service.generate_payment_url(
        order_id=order.id,
        amount=float(order.total_amount),
        ip_address=ip_addr
    )

    order.payment_id = order.payment_id or f"VNPAY_{order.id}_{int(datetime.now().timestamp())}"
    db.commit()

    return {"payment_url": payment_url, "order_id": order.id}


@router.get("/vnpay/return")
def vnpay_return(request: Request, db: Session = Depends(get_db)):
    """
    Handle VNPay return callback (for frontend verification).
    """
    query_params = dict(request.query_params)
    
    if not vnpay_service.validate_return(query_params):
        return {"success": False, "message": "Invalid Signature"}

    vnp_response_code = query_params.get("vnp_ResponseCode")
    vnp_txn_ref = query_params.get("vnp_TxnRef", "")
    
    # Extract order_id from vnp_TxnRef (format: {order_id}_{timestamp})
    try:
        order_id_str = vnp_txn_ref.split("_")[0]
        order_id = int(order_id_str)
    except (ValueError, IndexError):
        return {"success": False, "message": "Invalid Transaction Reference"}

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"success": False, "message": "Order not found"}

    if vnp_response_code == "00":
        if order.payment_status != "paid":
            order.payment_status = "paid"
            order.status = "processing"
            order.payment_id = vnp_txn_ref or order.payment_id
            db.commit()
            logger.info("Order %s marked as paid via VNPay", order_id)
        return {
            "success": True,
            "message": "Payment successful",
            "order_id": order_id,
            "transaction_ref": vnp_txn_ref,
        }

    order.payment_status = "failed"
    order.payment_id = vnp_txn_ref or order.payment_id
    db.commit()
    logger.warning("Order %s payment failed. Code: %s", order_id, vnp_response_code)
    return {
        "success": False,
        "message": f"Payment failed with code {vnp_response_code}",
        "order_id": order_id,
        "transaction_ref": vnp_txn_ref,
    }
