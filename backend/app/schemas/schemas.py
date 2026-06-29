from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ============= User Schemas =============

class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Create user schema"""
    password: str
    admin_code: Optional[str] = None


class UserUpdate(BaseModel):
    """Update user schema"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool
    is_admin: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    """Schema for updating user role"""
    role: str


# ============= Category Schemas =============

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# ============= Product Variant Schemas =============

class ProductVariantBase(BaseModel):
    size: str
    color: str
    stock_quantity: int = 0
    additional_price: float = 0.0

class ProductVariantCreate(ProductVariantBase):
    pass # product_id will be handled by path or parent

class ProductVariantUpdate(BaseModel):
    size: Optional[str] = None
    color: Optional[str] = None
    stock_quantity: Optional[int] = None
    additional_price: Optional[float] = None

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True


# ============= Product Schemas =============

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: float
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    category_id: int
    variants: List[ProductVariantCreate] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    category_id: int
    owner_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    variants: List[ProductVariantResponse] = []
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


# ============= Cart Schemas =============

class CartItemBase(BaseModel):
    variant_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(CartItemBase):
    id: int
    cart_id: int
    variant: Optional[ProductVariantResponse] = None

    class Config:
        from_attributes = True


class ProductCartSummary(BaseModel):
    """Minimal product info for cart display"""
    id: int
    name: str
    base_price: float
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class CartItemDetailResponse(CartItemBase):
    id: int
    cart_id: int
    variant: ProductVariantResponse
    product: ProductCartSummary

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True


class CartDetailResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemDetailResponse] = []

    class Config:
        from_attributes = True


# ============= Order Schemas =============

class OrderItemBase(BaseModel):
    """Base order item schema"""
    variant_id: int
    quantity: int
    price_at_time: float


class OrderItemCreate(BaseModel):
    """Create order item schema"""
    variant_id: int
    quantity: int


class OrderItemResponse(OrderItemBase):
    """Order item response schema"""
    id: int
    order_id: int
    variant: Optional[ProductVariantResponse] = None

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    """Base order schema"""
    total_amount: float
    status: str = "pending"
    shipping_address: str


class OrderCreate(BaseModel):
    """Create order schema"""
    shipping_address: str
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    """Update order schema"""
    status: Optional[str] = None
    shipping_address: Optional[str] = None


class OrderResponse(OrderBase):
    """Order response schema"""
    id: int
    user_id: int
    shipper_id: Optional[int] = None
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Token Schemas =============

class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token data schema"""
    username: Optional[str] = None


# ============= Dashboard & Custom Schemas =============

class DashboardStatsResponse(BaseModel):
    """Dashboard statistics response"""
    total_products: int
    total_orders: int
    total_revenue: float
    total_users: int


class RevenueChartItem(BaseModel):
    """Item for revenue chart"""
    month: str
    revenue: float


# ============= AI Schemas =============

class ChatRequest(BaseModel):
    message: str
    product_id: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str


class GenerateDescriptionRequest(BaseModel):
    name: str
    category: str
    material: Optional[str] = None
    notes: Optional[str] = None


class GenerateDescriptionResponse(BaseModel):
    description: str
