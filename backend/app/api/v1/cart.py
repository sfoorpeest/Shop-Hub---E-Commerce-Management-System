from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import logging

from app.db.session import get_db
from app.crud import crud
from app.schemas.schemas import (
    CartDetailResponse,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
)
from app.api.deps import get_current_user
from app.models.models import User, CartItem

router = APIRouter(prefix="/cart", tags=["Cart"], redirect_slashes=False)
logger = logging.getLogger("ShopHub.Cart")


def _build_cart_detail(cart) -> dict:
    """Transform ORM cart into CartDetailResponse-compatible dict."""
    items = []
    for item in cart.items:
        variant = item.variant
        product = variant.product if variant else None
        if not variant or not product:
            continue
        items.append(
            {
                "id": item.id,
                "cart_id": item.cart_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "variant": variant,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "base_price": product.base_price,
                    "image_url": product.image_url,
                },
            }
        )
    return {"id": cart.id, "user_id": cart.user_id, "items": items}


@router.get("/", response_model=CartDetailResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's shopping cart with product details."""
    cart = crud.get_cart_with_details(db, user_id=current_user.id)
    return _build_cart_detail(cart)


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_item_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a product variant to the cart."""
    cart = crud.get_or_create_cart(db, user_id=current_user.id)
    cart_item = crud.add_item_to_cart(db, cart_id=cart.id, item=item_in)
    return cart_item


@router.put("/items/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update quantity of a cart item."""
    cart = crud.get_or_create_cart(db, user_id=current_user.id)

    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart",
        )

    if item_update.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be at least 1. Use DELETE to remove item.",
        )

    updated_item = crud.update_cart_item(db, item_id=item_id, item_update=item_update)
    return updated_item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove an item from the cart."""
    cart = crud.get_or_create_cart(db, user_id=current_user.id)

    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart",
        )

    crud.delete_cart_item(db, item_id=item_id)
    logger.info("User %s deleted cart item %s", current_user.username, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all items from the cart."""
    cart = crud.get_or_create_cart(db, user_id=current_user.id)
    crud.clear_cart(db, cart_id=cart.id)
    logger.info("User %s cleared their cart", current_user.username)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
