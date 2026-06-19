from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.models import Order, User
from app.schemas.schemas import OrderResponse
from app.api.deps import get_current_shipper

router = APIRouter(prefix="/shipper", tags=["Shipper Module"])


@router.get("/available-orders", response_model=List[OrderResponse])
def get_available_orders(
    db: Session = Depends(get_db),
    current_shipper: User = Depends(get_current_shipper)
):
    """
    Get all orders that are processing and ready to be claimed for shipping.
    """
    orders = db.query(Order).filter(
        Order.status == "processing",
        Order.shipper_id == None
    ).order_by(Order.id.asc()).all()
    return orders


@router.get("/my-deliveries", response_model=List[OrderResponse])
def get_my_deliveries(
    db: Session = Depends(get_db),
    current_shipper: User = Depends(get_current_shipper)
):
    """
    Get all orders currently claimed by the logged-in shipper.
    """
    orders = db.query(Order).filter(
        Order.shipper_id == current_shipper.id
    ).order_by(Order.id.desc()).all()
    return orders


@router.put("/orders/{order_id}/claim", response_model=OrderResponse)
def claim_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_shipper: User = Depends(get_current_shipper)
):
    """
    Claim an order for shipping. Sets status to 'shipping'.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    if order.status != "processing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be claimed. Status is '{order.status}'"
        )
        
    if order.shipper_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order has already been claimed by another shipper"
        )
        
    order.shipper_id = current_shipper.id
    order.status = "shipping"
    db.commit()
    db.refresh(order)
    
    return order


@router.put("/orders/{order_id}/deliver", response_model=OrderResponse)
def deliver_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_shipper: User = Depends(get_current_shipper)
):
    """
    Mark an order as delivered. Sets status to 'delivered'.
    Must be the claimed shipper of the order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    if order.shipper_id != current_shipper.id and current_shipper.role != "admin" and not current_shipper.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to deliver this order"
        )
        
    if order.status != "shipping":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be marked as delivered. Current status is '{order.status}'"
        )
        
    order.status = "delivered"
    db.commit()
    db.refresh(order)
    
    return order
