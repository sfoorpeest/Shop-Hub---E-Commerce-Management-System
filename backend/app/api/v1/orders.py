from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.models import Order, OrderItem, Product, User
from app.schemas.schemas import OrderCreate, OrderResponse
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse)
def checkout(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Place a new order (Checkout).
    Deducts stock from product quantities.
    """
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )
    
    # 1. Create order header
    db_order = Order(
        user_id=current_user.id,
        total_amount=0.0,
        status="processing",  # Auto-approved/paid for demo purposes
        shipping_address=order_in.shipping_address
    )
    db.add(db_order)
    db.flush()  # Generate order ID
    
    total_amount = 0.0
    
    # 2. Process order items and verify inventory
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )
            
        if not product.is_active:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is no longer active"
            )
            
        if product.quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, requested: {item.quantity}"
            )
            
        # Deduct inventory
        product.quantity -= item.quantity
        
        # Calculate item price and subtotal
        item_price = product.price
        total_amount += item_price * item.quantity
        
        # Create order item record
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=item_price
        )
        db.add(db_item)
    
    # 3. Finalize order amount and commit
    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    
    return db_order


@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get order history of the current user.
    """
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.id.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get details of a specific order.
    Customers can only view their own orders; admins/shippers can view any.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Check permissions
    if (
        order.user_id != current_user.id
        and current_user.role != "admin"
        and current_user.role != "shipper"
        and not current_user.is_admin
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
        
    return order
