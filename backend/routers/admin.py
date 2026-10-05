from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List, Optional

from ..database import get_db
from ..models import Product, Category, Order, OrderItem, Profile, Coupon, InventoryLog
from ..schemas import ProductResponse, ProductCreate, CategoryResponse, CategoryBase, OrderResponse, CouponResponse, InventoryLogResponse
from .auth import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_admin_user)])

# DASHBOARD STATISTICS
@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_revenue = db.query(Order).filter(Order.status != "cancelled").value(Order.total_amount) or []
    revenue = sum(total_revenue) if isinstance(total_revenue, list) else db.query(Order).filter(Order.status != "cancelled").with_entities(Order.total_amount).all()
    revenue_sum = sum([r[0] for r in revenue])

    orders_count = db.query(Order).count()
    customers_count = db.query(Profile).filter(Profile.role == "customer").count()
    products_count = db.query(Product).count()

    # Top categories count
    categories = db.query(Category).all()
    category_chart = []
    for cat in categories:
        prod_ids = db.query(Product.id).filter(Product.category_id == cat.id).all()
        prod_ids = [p[0] for p in prod_ids]
        sales_count = db.query(OrderItem).filter(OrderItem.product_id.in_(prod_ids)).count() if prod_ids else 0
        category_chart.append({"name": cat.name, "value": sales_count})

    # Recent Sales List
    recent_orders = db.query(Order).options(joinedload(Order.user)).order_by(Order.created_at.desc()).limit(5).all()
    recent_sales_list = []
    for ro in recent_orders:
        recent_sales_list.append({
            "id": ro.id,
            "customer": ro.user.full_name or ro.user.email,
            "status": ro.status,
            "amount": ro.total_amount,
            "date": ro.created_at
        })

    # Low Stock warning products
    low_stock_products = db.query(Product).filter(Product.stock <= 10).limit(5).all()
    low_stock_list = [{"id": p.id, "name": p.name, "stock": p.stock} for p in low_stock_products]

    return {
        "revenue": round(revenue_sum, 2),
        "orders": orders_count,
        "customers": customers_count,
        "products": products_count,
        "category_chart": category_chart,
        "recent_sales": recent_sales_list,
        "low_stock": low_stock_list
    }

# PRODUCT CRUD
@router.post("/products", response_model=ProductResponse)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(
        name=product_in.name,
        slug=product_in.slug,
        description=product_in.description,
        price=product_in.price,
        mrp=product_in.mrp,
        weight=product_in.weight,
        image_url=product_in.image_url,
        stock=product_in.stock,
        category_id=product_in.category_id,
        is_organic=product_in.is_organic,
        shelf_life=product_in.shelf_life,
        origin=product_in.origin,
        nutrition=product_in.nutrition,
        ingredients=product_in.ingredients
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Log initial inventory
    inv_log = InventoryLog(
        product_id=db_product.id,
        quantity_changed=db_product.stock,
        type="restock",
        remarks="Initial catalog upload"
    )
    db.add(inv_log)
    db.commit()

    return db_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    old_stock = product.stock
    for field, value in product_in.dict().items():
        setattr(product, field, value)

    # If stock is explicitly changed, log it
    if product.stock != old_stock:
        inv_log = InventoryLog(
            product_id=product.id,
            quantity_changed=product.stock - old_stock,
            type="adjustment",
            remarks="Manual inventory stock level override"
        )
        db.add(inv_log)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": f"Product {product_id} deleted successfully"}

# CATEGORY CREATE
@router.post("/categories", response_model=CategoryResponse)
def create_category(cat_in: CategoryBase, db: Session = Depends(get_db)):
    db_cat = Category(name=cat_in.name, slug=cat_in.slug, icon=cat_in.icon)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

# ORDER MANAGEMENT
@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    db.refresh(order)
    return order

# INVENTORY TRACKING LOGS
@router.get("/inventory/logs", response_model=List[InventoryLogResponse])
def get_inventory_logs(db: Session = Depends(get_db)):
    return db.query(InventoryLog).order_by(InventoryLog.created_at.desc()).all()

# COUPONS MANAGEMENT
@router.post("/coupons", response_model=CouponResponse)
def create_coupon(code: str, discount_percent: float, expiry_days: int = 30, db: Session = Depends(get_db)):
    expiry = datetime.utcnow() + timedelta(days=expiry_days)
    new_coupon = Coupon(code=code.upper(), discount_percent=discount_percent, expiry_date=expiry)
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon
