from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.models import Order, OrderItem, Product, ProductVariant, User, Cart, CartItem
from app.schemas.schemas import OrderCreate, OrderResponse
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/orders", tags=["Orders"], redirect_slashes=False)


@router.post("", response_model=OrderResponse)
def checkout(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Place a new order (Checkout).
    Deducts stock from product variant quantities.
    """
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )
    
    # 1. Create order header
    order_status = "pending" if order_in.payment_method == "BANK_TRANSFER" else "processing"
    db_order = Order(
        user_id=current_user.id,
        total_amount=0.0,
        status=order_status,
        shipping_address=order_in.shipping_address,
        payment_method=order_in.payment_method,
        payment_status="unpaid"
    )
    db.add(db_order)
    db.flush()  # Generate order ID
    
    total_amount = 0.0
    
    # 2. Process order items and verify inventory
    for item in order_in.items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        if not variant:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product Variant with ID {item.variant_id} not found"
            )
            
        product = db.query(Product).filter(Product.id == variant.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product for variant ID {item.variant_id} not found"
            )
            
        if not product.is_active:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is no longer active"
            )
            
        if variant.stock_quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for variant '{variant.size} - {variant.color}'. Available: {variant.stock_quantity}, requested: {item.quantity}"
            )
            
        # Deduct inventory
        variant.stock_quantity -= item.quantity
        
        # Calculate item price and subtotal
        item_price = product.base_price + variant.additional_price
        total_amount += item_price * item.quantity
        
        # Create order item record
        db_item = OrderItem(
            order_id=db_order.id,
            variant_id=variant.id,
            quantity=item.quantity,
            price_at_time=item_price
        )
        db.add(db_item)
    
    # 3. Finalize order amount and commit
    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    
    # 4. Optional: Clear the user's cart after successful checkout
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    
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


@router.put("/{order_id}/pay", response_model=OrderResponse)
def confirm_payment(
    order_id: int,
    payment_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Confirm payment for an order (Mock Payment confirmation).
    Moves order from 'pending' status to 'processing' and sets payment_status to 'paid'.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Check permissions (only order owner or admin can trigger)
    if order.user_id != current_user.id and current_user.role != "admin" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm payment for this order"
        )
        
    order.payment_status = "paid"
    order.payment_id = payment_id or f"MOCK_PAY_{int(datetime.now().timestamp())}"
    if order.status == "pending":
        order.status = "processing"
        
    db.commit()
    db.refresh(order)
    return order
