from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import random

from ..database import get_db
from ..models import Product, Category, Recipe
from ..schemas import ProductResponse, RecipeResponse

router = APIRouter(prefix="/ai", tags=["ai"])

# AI MEAL PLANNER & RECIPE SUGGESTIONS
@router.get("/meal-planner", response_model=List[RecipeResponse])
def get_meal_planner(db: Session = Depends(get_db)):
    recipes = db.query(Recipe).all()
    if not recipes:
        # Fallback dummy recipes if seeding isn't complete yet
        return [
            {
                "id": 1,
                "title": "Avocado Tomato Toast",
                "description": "Healthy high-fiber breakfast",
                "ingredients": [{"name": "Organic Avocado", "qty": "1 unit"}, {"name": "Sourdough Bread", "qty": "2 slices"}, {"name": "Cherry Tomatoes", "qty": "50g"}],
                "instructions": ["Toast the sourdough slices.", "Mash the organic avocado with salt and pepper.", "Spread avocado on toast and garnish with cherry tomatoes."],
                "prep_time": "10 mins"
            }
        ]
    return recipes

@router.get("/healthy-alternatives/{product_id}", response_model=List[ProductResponse])
def get_healthy_alternatives(product_id: int, db: Session = Depends(get_db)):
    # Find alternatives in same category that are organic or lower price/premium
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    alternatives = db.query(Product).filter(
        Product.category_id == product.category_id,
        Product.id != product.id
    ).all()

    # Prefer organic or high-rated products
    organic_alts = [p for p in alternatives if p.is_organic]
    if organic_alts:
        return organic_alts[:3]
    return alternatives[:3]

@router.post("/chat-assistant")
def chat_assistant(message: str, db: Session = Depends(get_db)):
    msg = message.lower()
    reply = ""
    products_suggested = []

    # Simple smart regex / keyword matching for realistic AI chatbot
    if "recipe" in msg or "cook" in msg or "meal" in msg or "dinner" in msg:
        recipes = db.query(Recipe).all()
        if recipes:
            r = random.choice(recipes)
            reply = f"Here is a smart recipe recommendation: **{r.title}** ({r.prep_time} prep time). Description: {r.description}. Would you like me to add these ingredients to your cart?"
            # Try to find products that match ingredients
            for ing in r.ingredients:
                name = ing.get("name", "")
                p = db.query(Product).filter(Product.name.like(f"%{name}%")).first()
                if p:
                    products_suggested.append({
                        "id": p.id,
                        "name": p.name,
                        "price": p.price,
                        "image_url": p.image_url
                    })
        else:
            reply = "I can suggest some delicious organic salads or pasta. What ingredients do you have in mind?"
    elif "healthy" in msg or "diet" in msg or "organic" in msg:
        reply = "Here are some of our premium, nutrient-rich organic products that can help elevate your health:"
        organic_prods = db.query(Product).filter(Product.is_organic == True).limit(3).all()
        for op in organic_prods:
            products_suggested.append({
                "id": op.id,
                "name": op.name,
                "price": op.price,
                "image_url": op.image_url
            })
    elif "discount" in msg or "cheap" in msg or "offer" in msg or "sale" in msg:
        reply = "Here are some top deals with great discounts right now:"
        # items where mrp > price
        deals = db.query(Product).filter(Product.mrp > Product.price).limit(3).all()
        for d in deals:
            products_suggested.append({
                "id": d.id,
                "name": d.name,
                "price": d.price,
                "mrp": d.mrp,
                "image_url": d.image_url
            })
    elif "track" in msg or "order status" in msg or "where is my order" in msg:
        reply = "You can track your active orders by going to your **User Dashboard** and clicking on **Order History**, or click the tracking link shown immediately after checking out. If you've just placed an order, it will show as 'pending' or 'accepted' while we pack it fresh!"
    elif "address" in msg or "location" in msg or "deliver" in msg:
        reply = "You can set your delivery location and shipping address directly on the **Checkout** page. When you're ready, click 'Checkout' in your cart, enter your address (House/Apartment No, Street, City), select a preferred delivery slot, and we'll deliver it fresh within 2 hours!"
    elif "checkout" in msg or "buy" in msg or "cart" in msg:
        reply = "To check out your cart, click the Cart icon in the navigation bar, review your items, and click **Checkout Now**. Enter your shipping address and choose a delivery slot to complete your order securely!"
    else:
        # Search matching keywords
        words = msg.split()
        matched = []
        for word in words:
            if len(word) > 2:
                prods = db.query(Product).filter(Product.name.like(f"%{word}%")).all()
                matched.extend(prods)
        matched = list(set(matched)) # unique

        if matched:
            reply = f"I found some items matching your search request. Take a look at these:"
            for p in matched[:3]:
                products_suggested.append({
                    "id": p.id,
                    "name": p.name,
                    "price": p.price,
                    "image_url": p.image_url
                })
        else:
            reply = "Hello! I am your FreshKart AI Assistant. Ask me for recipes, healthy product alternatives, discount offers, or help checking out your cart!"

    return {
        "reply": reply,
        "suggested_products": products_suggested
    }
