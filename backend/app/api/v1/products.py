from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.crud import crud
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.models.models import Product, User
from app.api.deps import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=dict)
def read_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get all active products with optional search, category filter, sorting and pagination.
    """
    query = db.query(Product).filter(Product.is_active == True)
    
    # Filter by category_id
    if category and category.strip() != "":
        try:
            cat_id = int(category)
            query = query.filter(Product.category_id == cat_id)
        except ValueError:
            pass
        
    # Text search on name or description
    if search and search.strip() != "":
        query = query.filter(
            Product.name.ilike(f"%{search}%") | 
            Product.description.ilike(f"%{search}%")
        )
        
    total = query.count()
    
    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.base_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.base_price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name.desc())
    else:
        # Default sort by newest
        query = query.order_by(Product.id.desc())
        
    items = query.offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product details by ID.
    """
    product = crud.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("/", response_model=ProductResponse)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Create a new product (Admin only).
    """
    # Create product using admin's user ID as the owner
    return crud.create_product(db, product=product_in, owner_id=int(current_admin.id))  # type: ignore


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Update a product by ID (Admin only).
    """
    # Verify product exists
    product = crud.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = crud.update_product(db, product_id=product_id, product_update=product_in)
    return updated_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Delete a product by ID (Admin only).
    """
    product = crud.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    crud.delete_product(db, product_id=product_id)
    return {"message": "Product deleted successfully", "id": product_id}
