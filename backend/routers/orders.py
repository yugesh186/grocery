from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import List, Optional

from ..database import get_db
from ..models import Product, CartItem, Order, OrderItem, WishlistItem, Coupon, Profile
from ..schemas import CartItemResponse, OrderResponse, WishlistResponse, CouponResponse
from .auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

# CART ENDPOINTS
@router.get("/cart", response_model=List[CartItemResponse])
def get_cart(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CartItem).options(joinedload(CartItem.product)).filter(CartItem.user_id == current_user.id).all()

@router.post("/cart", response_model=CartItemResponse)
def add_to_cart(product_id: int, quantity: int = 1, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    existing_item = db.query(CartItem).filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id).first()
    if existing_item:
        if product.stock < (existing_item.quantity + quantity):
            raise HTTPException(status_code=400, detail="Cannot add more. Exceeds stock limit.")
        existing_item.quantity += quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        new_item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item

@router.put("/cart/{item_id}", response_model=CartItemResponse)
def update_cart_item(item_id: int, quantity: int, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if product.stock < quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    cart_item.quantity = quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/cart/{item_id}")
def remove_from_cart(item_id: int, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}

# COUPONS ENDPOINTS
@router.get("/coupons", response_model=List[CouponResponse])
def get_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).filter(Coupon.active == True, Coupon.expiry_date > datetime.utcnow()).all()

# WISHLIST ENDPOINTS
@router.get("/wishlist", response_model=List[WishlistResponse])
def get_wishlist(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(WishlistItem).options(joinedload(WishlistItem.product)).filter(WishlistItem.user_id == current_user.id).all()

@router.post("/wishlist", response_model=WishlistResponse)
def add_to_wishlist(product_id: int, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id).first()
    if existing:
        return existing

    new_wish = WishlistItem(user_id=current_user.id, product_id=product_id)
    db.add(new_wish)
    db.commit()
    db.refresh(new_wish)
    return new_wish

@router.delete("/wishlist/{wish_id}")
def remove_from_wishlist(wish_id: int, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    wish = db.query(WishlistItem).filter(WishlistItem.id == wish_id, WishlistItem.user_id == current_user.id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    db.delete(wish)
    db.commit()
    return {"message": "Removed from wishlist"}

# CHECKOUT & ORDER PLACEMENT
@router.post("/checkout", response_model=OrderResponse)
def checkout(
    delivery_address: str,
    delivery_slot: str,
    coupon_code: Optional[str] = None,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(CartItem).options(joinedload(CartItem.product)).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cannot place order with empty cart")

    # Compute amount and validate stocks
    subtotal = 0.0
    for item in cart_items:
        if item.product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Item {item.product.name} is out of stock")
        subtotal += item.product.price * item.quantity

    # Apply Coupon
    discount = 0.0
    if coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == coupon_code, Coupon.active == True, Coupon.expiry_date > datetime.utcnow()).first()
        if coupon:
            discount = (coupon.discount_percent / 100.0) * subtotal

    total = subtotal - discount
    # Add mock tax and shipping
    total += 15.0 # flat delivery + tax

    # Create Order
    new_order = Order(
        user_id=current_user.id,
        status="pending",
        total_amount=round(total, 2),
        delivery_address=delivery_address,
        delivery_slot=delivery_slot,
        coupon_code=coupon_code
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create Order Items and decrease stock
    for item in cart_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.product.price
        )
        db.add(order_item)
        # Decrement product stock
        item.product.stock -= item.quantity
        # Remove from cart
        db.delete(item)

    db.commit()
    db.refresh(new_order)

    # Refetch order with relations to return full detail
    full_order = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.id == new_order.id).first()
    return full_order

@router.get("", response_model=List[OrderResponse])
def get_orders(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Allowed if user is admin OR order owner
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access to order details")
    return order
