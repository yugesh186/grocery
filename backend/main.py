from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import uvicorn

from .database import engine, Base, SessionLocal
from .models import Category, Product, Recipe, Coupon, Profile
from .routers import auth, products, orders, admin, ai
from .routers.auth import get_password_hash

app = FastAPI(title="FreshKart AI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prefix all routes with /api
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default data if empty
    db = SessionLocal()
    try:
        # 1. Seed or Reset admin profiles to ensure correct password hashing format
        admin_user = db.query(Profile).filter(Profile.email == "admin@freshkart.ai").first()
        if admin_user:
            admin_user.hashed_password = get_password_hash("admin123")
        else:
            admin_user = Profile(
                email="admin@freshkart.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="FreshKart Administrator",
                role="admin"
            )
            db.add(admin_user)

        customer_user = db.query(Profile).filter(Profile.email == "user@freshkart.ai").first()
        if customer_user:
            customer_user.hashed_password = get_password_hash("user123")
        else:
            customer_user = Profile(
                email="user@freshkart.ai",
                hashed_password=get_password_hash("user123"),
                full_name="Alex Smith",
                role="customer"
            )
            db.add(customer_user)
        db.commit()

        # 2. Seed Categories
        if db.query(Category).count() == 0:
            categories_data = [
                {"name": "Vegetables", "slug": "vegetables", "icon": "Leaf"},
                {"name": "Fruits", "slug": "fruits", "icon": "Grape"},
                {"name": "Dairy & Milk", "slug": "dairy", "icon": "Egg"},
                {"name": "Bakery", "slug": "bakery", "icon": "Cookie"},
                {"name": "Snacks & Munchies", "slug": "snacks", "icon": "Candy"},
                {"name": "Beverages", "slug": "beverages", "icon": "GlassWater"},
                {"name": "Pantry & Oils", "slug": "pantry", "icon": "Sparkles"},
            ]
            for cat in categories_data:
                db.add(Category(**cat))
            db.commit()

        # 3. Seed Coupons
        if db.query(Coupon).count() == 0:
            coupons = [
                {"code": "FRESH20", "discount_percent": 20.0, "active": True, "expiry_date": datetime.utcnow() + timedelta(days=90)},
                {"code": "SUPERGROW", "discount_percent": 15.0, "active": True, "expiry_date": datetime.utcnow() + timedelta(days=60)},
                {"code": "BOGO50", "discount_percent": 50.0, "active": True, "expiry_date": datetime.utcnow() + timedelta(days=30)},
            ]
            for c in coupons:
                db.add(Coupon(**c))
            db.commit()

        # 4. Seed Products
        if db.query(Product).count() == 0:
            veg_cat = db.query(Category).filter(Category.slug == "vegetables").first()
            fruit_cat = db.query(Category).filter(Category.slug == "fruits").first()
            dairy_cat = db.query(Category).filter(Category.slug == "dairy").first()
            bakery_cat = db.query(Category).filter(Category.slug == "bakery").first()
            snacks_cat = db.query(Category).filter(Category.slug == "snacks").first()

            products_data = [
                # Vegetables
                {
                    "name": "Organic Tomatoes",
                    "slug": "organic-tomatoes",
                    "description": "Vine-ripened organic red tomatoes. Fresh and locally sourced.",
                    "price": 2.99,
                    "mrp": 3.99,
                    "weight": "500g",
                    "image_url": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80",
                    "stock": 50,
                    "category_id": veg_cat.id if veg_cat else 1,
                    "is_organic": True,
                    "shelf_life": "6 Days",
                    "origin": "California, USA",
                    "nutrition": {"Calories": "18", "Water": "95%", "Protein": "0.9g", "Carbs": "3.9g"},
                    "ingredients": "100% Organic Fresh Tomatoes"
                },
                {
                    "name": "Fresh Spinach Bunch",
                    "slug": "fresh-spinach",
                    "description": "Crisp green spinach leaves. Pre-washed and ready to cook.",
                    "price": 1.49,
                    "mrp": 1.99,
                    "weight": "250g",
                    "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
                    "stock": 40,
                    "category_id": veg_cat.id if veg_cat else 1,
                    "is_organic": True,
                    "shelf_life": "4 Days",
                    "origin": "Arizona, USA",
                    "nutrition": {"Calories": "23", "Protein": "2.9g", "Fiber": "2.2g"},
                    "ingredients": "Spinach"
                },
                # Fruits
                {
                    "name": "Organic Avocados",
                    "slug": "organic-avocados",
                    "description": "Rich and creamy Hass Avocados. Perfect for making custom fresh guacamole.",
                    "price": 4.99,
                    "mrp": 5.99,
                    "weight": "3 units",
                    "image_url": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80",
                    "stock": 35,
                    "category_id": fruit_cat.id if fruit_cat else 2,
                    "is_organic": True,
                    "shelf_life": "5 Days",
                    "origin": "Michoacán, Mexico",
                    "nutrition": {"Calories": "160", "Fats": "15g", "Fiber": "7g"},
                    "ingredients": "Avocados"
                },
                {
                    "name": "Gala Apples",
                    "slug": "gala-apples",
                    "description": "Sweet, crisp and aromatic Gala apples.",
                    "price": 3.49,
                    "mrp": 3.99,
                    "weight": "1 kg",
                    "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80",
                    "stock": 60,
                    "category_id": fruit_cat.id if fruit_cat else 2,
                    "is_organic": False,
                    "shelf_life": "14 Days",
                    "origin": "Washington, USA",
                    "nutrition": {"Calories": "52", "Water": "86%", "Carbs": "14g"},
                    "ingredients": "Apples"
                },
                # Dairy
                {
                    "name": "Organic Whole Milk",
                    "slug": "whole-milk",
                    "description": "Vitamin D fortified pasteurized organic whole milk.",
                    "price": 4.29,
                    "mrp": 4.99,
                    "weight": "1 Gallon",
                    "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
                    "stock": 25,
                    "category_id": dairy_cat.id if dairy_cat else 3,
                    "is_organic": True,
                    "shelf_life": "10 Days",
                    "origin": "Local Dairy Farm",
                    "nutrition": {"Calories": "150", "Protein": "8g", "Calcium": "30%"},
                    "ingredients": "Organic Whole Milk, Vitamin D3"
                },
                {
                    "name": "Greek Yogurt - Blueberry",
                    "slug": "greek-yogurt-blueberry",
                    "description": "Thick, high-protein strained Greek yogurt with real blueberry puree.",
                    "price": 1.89,
                    "mrp": 2.29,
                    "weight": "150g",
                    "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
                    "stock": 45,
                    "category_id": dairy_cat.id if dairy_cat else 3,
                    "is_organic": False,
                    "shelf_life": "12 Days",
                    "origin": "Oregon, USA",
                    "nutrition": {"Calories": "120", "Protein": "12g", "Sugars": "11g"},
                    "ingredients": "Cultured Pasteurized Grade A Milk, Blueberries, Sugar"
                },
                # Bakery
                {
                    "name": "Fresh Sourdough Bread",
                    "slug": "fresh-sourdough-bread",
                    "description": "Freshly baked sourdough loaf with a crispy crust and soft airy crumb.",
                    "price": 3.99,
                    "mrp": 4.49,
                    "weight": "500g",
                    "image_url": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
                    "stock": 15,
                    "category_id": bakery_cat.id if bakery_cat else 4,
                    "is_organic": False,
                    "shelf_life": "3 Days",
                    "origin": "In-house Bakery",
                    "nutrition": {"Calories": "180", "Carbs": "36g", "Protein": "6g"},
                    "ingredients": "Wheat Flour, Water, Starter, Salt"
                },
                # Snacks
                {
                    "name": "Salted Tortilla Chips",
                    "slug": "salted-tortilla-chips",
                    "description": "Crunchy corn tortilla chips lightly sprinkled with sea salt.",
                    "price": 2.49,
                    "mrp": 2.99,
                    "weight": "300g",
                    "image_url": "https://images.unsplash.com/photo-1518047601542-79f18c655718?w=400&q=80",
                    "stock": 30,
                    "category_id": snacks_cat.id if snacks_cat else 5,
                    "is_organic": True,
                    "shelf_life": "60 Days",
                    "origin": "Texas, USA",
                    "nutrition": {"Calories": "140", "Total Fats": "7g", "Sodium": "110mg"},
                    "ingredients": "Organic White Corn, Organic Sunflower Oil, Sea Salt"
                }
            ]
            for prod in products_data:
                db.add(Product(**prod))
            db.commit()

        # 5. Seed Recipes
        if db.query(Recipe).count() == 0:
            recipes_data = [
                {
                    "title": "Avocado Caprese Salad",
                    "description": "A fresh summer salad combination of ripe avocados, organic vine tomatoes, and high quality olive oil.",
                    "ingredients": [
                        {"name": "Organic Tomatoes", "qty": "250g"},
                        {"name": "Organic Avocados", "qty": "2 units"},
                        {"name": "Fresh Spinach Bunch", "qty": "50g"}
                    ],
                    "instructions": [
                        "Slice the tomatoes and avocados into bite-size wedges.",
                        "Toss spinach leaves on the serving platter as a bed.",
                        "Arrange avocado and tomatoes on top.",
                        "Drizzle with sea salt, olive oil, and balsamic vinegar."
                    ],
                    "prep_time": "15 mins",
                    "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80"
                },
                {
                    "title": "Creamy Avocado & Sourdough Toast",
                    "description": "High energy organic breakfast toast with ripe avocado spread and tomatoes.",
                    "ingredients": [
                        {"name": "Organic Avocados", "qty": "1 unit"},
                        {"name": "Fresh Sourdough Bread", "qty": "2 slices"},
                        {"name": "Organic Tomatoes", "qty": "1 unit"}
                    ],
                    "instructions": [
                        "Toast sourdough bread to your liking.",
                        "Mash avocado in a bowl, season with salt and lime juice.",
                        "Spread avocado on the bread slices.",
                        "Top with thinly sliced tomatoes and red pepper flakes."
                    ],
                    "prep_time": "10 mins",
                    "image_url": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&q=80"
                }
            ]
            for r in recipes_data:
                db.add(Recipe(**r))
            db.commit()

    except Exception as e:
        print("Error seeding database: ", e)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to FreshKart AI API Server. Head over to /docs to view Swagger APIs."}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
