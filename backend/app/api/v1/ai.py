from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.db.session import get_db
from app.api.deps import get_current_active_user, get_current_admin
from app.models.models import User, Product
from app.schemas.schemas import (
    ChatRequest,
    ChatResponse,
    GenerateDescriptionRequest,
    GenerateDescriptionResponse,
)
from app.services import gemini as gemini_service

router = APIRouter(prefix="/ai", tags=["AI"], redirect_slashes=False)
logger = logging.getLogger("ShopHub.AI")


@router.post("/chat", response_model=ChatResponse)
def ai_chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """
    AI shopping assistant — tư vấn size, phối đồ (requires login).
    """
    product_context = None
    if body.product_id:
        product = db.query(Product).filter(Product.id == body.product_id).first()
        if product:
            variants_text = ", ".join(
                f"{v.size}/{v.color} (còn {v.stock_quantity})"
                for v in product.variants
            )
            product_context = (
                f"Tên: {product.name}\n"
                f"Giá: {product.base_price:,.0f} VND\n"
                f"Mô tả: {product.description or 'N/A'}\n"
                f"Biến thể: {variants_text or 'N/A'}"
            )

    try:
        reply = gemini_service.chat(body.message, product_context=product_context)
        logger.info("User %s chatted with AI. Message length: %d", getattr(_current_user, "username", "unknown"), len(body.message))
        return ChatResponse(reply=reply)
    except ValueError as e:
        logger.warning("AI Chat ValueError: %s", str(e))
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        logger.error("AI Chat Exception: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}",
        )


@router.post("/generate-description", response_model=GenerateDescriptionResponse)
def generate_description(
    body: GenerateDescriptionRequest,
    _current_admin: User = Depends(get_current_admin),
):
    """Admin: auto-generate product description using Gemini."""
    try:
        description = gemini_service.generate_product_description(
            name=body.name,
            category=body.category,
            material=body.material,
            notes=body.notes,
        )
        logger.info("Admin %s generated description for category %s", getattr(_current_admin, "username", "unknown"), body.category)
        return GenerateDescriptionResponse(description=description)
    except ValueError as e:
        logger.warning("AI GenDesc ValueError: %s", str(e))
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        logger.error("AI GenDesc Exception: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}",
        )
