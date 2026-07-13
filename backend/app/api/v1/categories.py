from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.crud import crud
from app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"], redirect_slashes=False)


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Create a new category. Only admins can do this.
    """
    # Check if category with same name exists
    existing_category = db.query(crud.Category).filter(crud.Category.name == category_in.name).first()
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    return crud.create_category(db=db, category=category_in)


@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all categories. Publicly accessible.
    """
    return crud.get_categories(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """
    Get category by ID.
    """
    category = crud.get_category_by_id(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Update a category. Only admins can do this.
    """
    category = crud.update_category(db, category_id=category_id, category_update=category_in)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Delete a category. Only admins can do this.
    """
    success = crud.delete_category(db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
