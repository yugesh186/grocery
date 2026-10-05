from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import math

from ..database import get_db
from ..models import Product, Category
from ..schemas import ProductResponse, CategoryResponse, PaginatedProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("", response_model=PaginatedProductResponse)

def get_products(
    db: Session = Depends(get_db),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_organic: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "name",  # name, price_asc, price_desc, rating (mock)
    page: int = 1,
    limit: int = 12
):
    query = db.query(Product).options(joinedload(Product.category))

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.name.like(f"%{search}%") | Product.description.like(f"%{search}%"))
    if is_organic is not None:
        query = query.filter(Product.is_organic == is_organic)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Sorting logic
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.name.asc())

    # Pagination calculation
    total_count = query.count()
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    return {
        "products": products,
        "total_count": total_count,
        "page": page,
        "total_pages": total_pages
    }

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
