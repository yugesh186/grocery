from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# Profile schemas
class ProfileBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    password: str

class ProfileLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileResponse(ProfileBase):
    id: int
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Category schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    mrp: float
    weight: Optional[str] = None
    image_url: Optional[str] = None
    stock: int
    category_id: int
    is_organic: bool = False
    shelf_life: Optional[str] = None
    origin: Optional[str] = None
    nutrition: Optional[Dict[str, str]] = None
    ingredients: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    category: Optional[CategoryResponse] = None
    class Config:
        from_attributes = True

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    class Config:
        from_attributes = True

# Order schemas
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    product: Optional[ProductResponse] = None
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    delivery_address: str
    delivery_slot: str
    coupon_code: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderResponse(BaseModel):
    id: int
    status: str
    total_amount: float
    delivery_address: str
    delivery_slot: str
    coupon_code: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []
    class Config:
        from_attributes = True

# Wishlist schemas
class WishlistCreate(BaseModel):
    product_id: int

class WishlistResponse(BaseModel):
    id: int
    product: ProductResponse
    class Config:
        from_attributes = True

# Coupon schemas
class CouponResponse(BaseModel):
    id: int
    code: str
    discount_percent: float
    active: bool
    expiry_date: datetime
    class Config:
        from_attributes = True

# Recipe schemas
class RecipeResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    ingredients: List[Dict[str, str]]
    instructions: List[str]
    image_url: Optional[str] = None
    prep_time: Optional[str] = None
    class Config:
        from_attributes = True

# Inventory logs
class InventoryLogCreate(BaseModel):
    quantity_changed: int
    type: str # restock, sale, adjustment
    remarks: Optional[str] = None

class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    quantity_changed: int
    type: str
    remarks: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Paginated response for products
class PaginatedProductResponse(BaseModel):
    products: List[ProductResponse]
    total_count: int
    page: int
    total_pages: int
    class Config:
        from_attributes = True

