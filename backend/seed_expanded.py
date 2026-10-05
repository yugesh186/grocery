import sys
import os
# Adjust python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine, Base
from backend.models import Category, Product, CartItem, OrderItem, WishlistItem, InventoryLog, Recipe
from sqlalchemy.orm import Session
import re

# Lucide Icons Map for categories
CATEGORY_ICONS = {
    "fresh-fruits": "Grape",
    "fresh-vegetables": "Leaf",
    "dairy-products": "Egg",
    "bakery": "Cookie",
    "rice-grains": "Wheat",
    "flour-atta": "ChefHat",
    "pulses-lentils": "FlameKindling",
    "cooking-oils": "Sparkles",
    "spices-masalas": "Flame",
    "dry-fruits-nuts": "Nut",
    "snacks": "Candy",
    "beverages": "GlassWater",
    "frozen-foods": "IceCream",
    "instant-foods": "Clock",
    "organic-foods": "Sprout",
    "personal-care": "User",
    "baby-care": "Baby",
    "pet-care": "Dog",
    "household-essentials": "Home",
    "kitchen-essentials": "Soup",
    "stationery": "PenTool",
    "sweets-desserts": "Cake",
    "health-wellness": "Activity",
    "cleaning-supplies": "Wand2",
    "popular-indian-foods": "ChefHat"
}

# Image Map for all items to guarantee high resolution & no mismatch
PRODUCT_IMAGES = {
    # Fruits
    "Apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
    "Banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    "Orange": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80",
    "Mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80",
    "Grapes": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80",
    "Watermelon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    "Pineapple": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80",
    "Guava": "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&auto=format&fit=crop&q=80",
    "Papaya": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&auto=format&fit=crop&q=80",
    "Pomegranate": "https://images.unsplash.com/photo-1581074817539-9400f89ff63a?w=600&auto=format&fit=crop&q=80",
    "Kiwi": "https://images.unsplash.com/photo-1585059895524-72359e061381?w=600&auto=format&fit=crop&q=80",
    "Pear": "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&auto=format&fit=crop&q=80",
    "Dragon Fruit": "https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&auto=format&fit=crop&q=80",
    "Strawberry": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",
    "Muskmelon": "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&auto=format&fit=crop&q=80",
    "Sapota": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80",
    "Custard Apple": "https://images.unsplash.com/photo-1528826064028-56ba17f093a5?w=600&auto=format&fit=crop&q=80",
    "Litchi": "https://images.unsplash.com/photo-1501746877-14782df589a0?w=600&auto=format&fit=crop&q=80",
    "Jamun": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop&q=80",
    "Coconut": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80",

    # Vegetables
    "Tomato": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop&q=80",
    "Onion": "https://images.unsplash.com/photo-1580145690606-ca97ee767293?w=600&auto=format&fit=crop&q=80",
    "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
    "Carrot": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80",
    "Beetroot": "https://images.unsplash.com/photo-1585559606869-7b3b3a32f143?w=600&auto=format&fit=crop&q=80",
    "Cabbage": "https://images.unsplash.com/photo-1550159930-40066082a4fc?w=600&auto=format&fit=crop&q=80",
    "Cauliflower": "https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=600&auto=format&fit=crop&q=80",
    "Brinjal": "https://images.unsplash.com/photo-1590373977678-75c13fe23d53?w=600&auto=format&fit=crop&q=80",
    "Lady Finger": "https://images.unsplash.com/photo-1627845347209-a7c8c364ff78?w=600&auto=format&fit=crop&q=80",
    "Okra": "https://images.unsplash.com/photo-1627845347209-a7c8c364ff78?w=600&auto=format&fit=crop&q=80",
    "Green Chilli": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80",
    "Capsicum": "https://images.unsplash.com/photo-1563513374803-5d07de9c2149?w=600&auto=format&fit=crop&q=80",
    "Pumpkin": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80",
    "Bottle Gourd": "https://images.unsplash.com/photo-1603058866750-6de84d16feee?w=600&auto=format&fit=crop&q=80",
    "Bitter Gourd": "https://images.unsplash.com/photo-1583091176214-5d51d8b6cd9a?w=600&auto=format&fit=crop&q=80",
    "Ridge Gourd": "https://images.unsplash.com/photo-1583091176214-5d51d8b6cd9a?w=600&auto=format&fit=crop&q=80",
    "Snake Gourd": "https://images.unsplash.com/photo-1583091176214-5d51d8b6cd9a?w=600&auto=format&fit=crop&q=80",
    "Spinach": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
    "Coriander": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop&q=80",
    "Mint": "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600&auto=format&fit=crop&q=80",
    "Radish": "https://images.unsplash.com/photo-1590373977678-75c13fe23d53?w=600&auto=format&fit=crop&q=80",

    # Dairy Products
    "Milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
    "Butter": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80",
    "Cheese": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&auto=format&fit=crop&q=80",
    "Paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    "Yogurt": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
    "Curd": "https://images.unsplash.com/photo-1571244856353-fb087a321150?w=600&auto=format&fit=crop&q=80",
    "Cream": "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&auto=format&fit=crop&q=80",
    "Ghee": "https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=600&auto=format&fit=crop&q=80",
    "Flavored Milk": "https://images.unsplash.com/photo-1563823251941-b9989d1e8d97?w=600&auto=format&fit=crop&q=80",
    "Buttermilk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",

    # Bakery
    "Bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    "Bun": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    "Cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    "Cookies": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80",
    "Biscuit": "https://images.unsplash.com/photo-1558961312-50a49c95419e?w=600&auto=format&fit=crop&q=80",
    "Muffins": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&auto=format&fit=crop&q=80",
    "Croissant": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80",
    "Donut": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
    "Pizza Base": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    "Rusk": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",

    # Rice & Grains
    "Basmati Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    "Ponni Rice": "https://images.unsplash.com/photo-1590005354167-6da97870c913?w=600&auto=format&fit=crop&q=80",
    "Brown Rice": "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600&auto=format&fit=crop&q=80",
    "Red Rice": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80",
    "Millet": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Ragi": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Jowar": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Bajra": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Quinoa": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    "Barley": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",

    # Flour & Atta
    "Wheat Flour": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
    "Rice Flour": "https://images.unsplash.com/photo-1613233486160-b6f48c10f3c5?w=600&auto=format&fit=crop&q=80",
    "Maida": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    "Ragi Flour": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Besan": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80",
    "Corn Flour": "https://images.unsplash.com/photo-1590005354167-6da97870c913?w=600&auto=format&fit=crop&q=80",

    # Pulses & Lentils
    "Toor Dal": "https://images.unsplash.com/photo-1585996387063-e847063e8706?w=600&auto=format&fit=crop&q=80",
    "Urad Dal": "https://images.unsplash.com/photo-1545114197-2decb3346452?w=600&auto=format&fit=crop&q=80",
    "Moong Dal": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Masoor Dal": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80",
    "Chana Dal": "https://images.unsplash.com/photo-1585996387063-e847063e8706?w=600&auto=format&fit=crop&q=80",
    "Kabuli Chana": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80",
    "Green Gram": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Black Gram": "https://images.unsplash.com/photo-1545114197-2decb3346452?w=600&auto=format&fit=crop&q=80",
    "Rajma": "https://images.unsplash.com/photo-1585996387063-e847063e8706?w=600&auto=format&fit=crop&q=80",
    "Cowpea": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",

    # Cooking Oils
    "Sunflower Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    "Groundnut Oil": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80",
    "Coconut Oil": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80",
    "Olive Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    "Mustard Oil": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80",
    "Gingelly Oil": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80",

    # Spices & Masalas
    "Turmeric": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    "Chilli Powder": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Pepper": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80",
    "Coriander Powder": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop&q=80",
    "Garam Masala": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Cumin": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    "Mustard Seeds": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80",
    "Fennel": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    "Fenugreek": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop&q=80",
    "Cardamom": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80",
    "Cloves": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Cinnamon": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    "Bay Leaf": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=600&auto=format&fit=crop&q=80",

    # Dry Fruits & Nuts
    "Almonds": "https://images.unsplash.com/photo-1508061253366-f7da158b6cd9?w=600&auto=format&fit=crop&q=80",
    "Cashews": "https://images.unsplash.com/photo-1508061458087-05d14d232b1d?w=600&auto=format&fit=crop&q=80",
    "Pistachios": "https://images.unsplash.com/photo-1528659107936-f08b3dbdf7c5?w=600&auto=format&fit=crop&q=80",
    "Walnuts": "https://images.unsplash.com/photo-1606923829579-0ac9c49ea20a?w=600&auto=format&fit=crop&q=80",
    "Raisins": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop&q=80",
    "Dates": "https://images.unsplash.com/photo-1508061253366-f7da158b6cd9?w=600&auto=format&fit=crop&q=80",

    # Snacks
    "Chips": "https://images.unsplash.com/photo-1566478431376-787c4f9d0c2e?w=600&auto=format&fit=crop&q=80",
    "Namkeen": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Popcorn": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&auto=format&fit=crop&q=80",
    "Mixture": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Biscuits": "https://images.unsplash.com/photo-1558961312-50a49c95419e?w=600&auto=format&fit=crop&q=80",
    "Chocolates": "https://images.unsplash.com/photo-1549007994-cb92ca813bec?w=600&auto=format&fit=crop&q=80",
    "Potato Chips": "https://images.unsplash.com/photo-1566478431376-787c4f9d0c2e?w=600&auto=format&fit=crop&q=80",
    "Banana Chips": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Murukku": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Wafer": "https://images.unsplash.com/photo-1558961312-50a49c95419e?w=600&auto=format&fit=crop&q=80",
    "Peanut Chikki": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",

    # Beverages
    "Tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    "Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
    "Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Soft Drinks": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "Soft Drink": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
    "Energy Drinks": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80",
    "Energy Drink": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80",
    "Coconut Water": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80",
    "Green Tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",

    # Frozen Foods
    "Frozen Peas": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
    "Frozen Corn": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&auto=format&fit=crop&q=80",
    "French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    "Frozen Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    "Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&auto=format&fit=crop&q=80",

    # Instant Foods
    "Instant Noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
    "Pasta": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    "Oats": "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80",
    "Ready Mix": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Soup Mix": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",

    # Organic Foods
    "Organic Vegetables": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
    "Organic Fruits": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",
    "Organic Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    "Organic Dal": "https://images.unsplash.com/photo-1585996387063-e847063e8706?w=600&auto=format&fit=crop&q=80",
    "Organic Honey": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",

    # Personal Care
    "Shampoo": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    "Soap": "https://images.unsplash.com/photo-1607006342411-92fc462a2fb0?w=600&auto=format&fit=crop&q=80",
    "Toothpaste": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&auto=format&fit=crop&q=80",
    "Face Wash": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    "Lotion": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80",
    "Perfume": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",

    # Baby Care
    "Baby Food": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    "Baby Lotion": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80",
    "Baby Soap": "https://images.unsplash.com/photo-1607006342411-92fc462a2fb0?w=600&auto=format&fit=crop&q=80",
    "Baby Shampoo": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    "Diapers": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80",

    # Pet Care
    "Dog Food": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80",
    "Cat Food": "https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?w=600&auto=format&fit=crop&q=80",
    "Pet Shampoo": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    "Pet Toys": "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80",
    "Pet Treats": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80",

    # Household Essentials
    "Detergent": "https://images.unsplash.com/photo-1607006986941-46e301d67837?w=600&auto=format&fit=crop&q=80",
    "Dishwash Liquid": "https://images.unsplash.com/photo-1607006986941-46e301d67837?w=600&auto=format&fit=crop&q=80",
    "Floor Cleaner": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
    "Toilet Cleaner": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
    "Garbage Bags": "https://images.unsplash.com/photo-1607006986941-46e301d67837?w=600&auto=format&fit=crop&q=80",

    # Kitchen Essentials
    "Pressure Cooker": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    "Pan": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    "Knife": "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=600&auto=format&fit=crop&q=80",
    "Spoon Set": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",
    "Storage Containers": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80",

    # Stationery
    "Pen": "https://images.unsplash.com/photo-1585336139080-b019d77a3393?w=600&auto=format&fit=crop&q=80",
    "Pencil": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80",
    "Notebook": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80",
    "Marker": "https://images.unsplash.com/photo-1585336139080-b019d77a3393?w=600&auto=format&fit=crop&q=80",
    "Stapler": "https://images.unsplash.com/photo-1585336139080-b019d77a3393?w=600&auto=format&fit=crop&q=80",
    "Sticky Notes": "https://images.unsplash.com/photo-1585336139080-b019d77a3393?w=600&auto=format&fit=crop&q=80",

    # Sweets & Desserts
    "Gulab Jamun": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Laddu": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Barfi": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Rasgulla": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Chocolate": "https://images.unsplash.com/photo-1549007994-cb92ca813bec?w=600&auto=format&fit=crop&q=80",

    # Health & Wellness
    "Honey": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    "Protein Powder": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80",
    "Multivitamins": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
    "Herbal Drinks": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",

    # Cleaning Supplies
    "Glass Cleaner": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
    "Surface Cleaner": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
    "Disinfectant Spray": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",

    # Popular Indian Foods
    "Idli": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    "Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    "Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    "Pongal": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    "Upma": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    "Poha": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Sambar": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    "Rasam": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    "Lemon Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    "Tamarind Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    "Vegetable Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
    "Paneer Butter Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    "Palak Paneer": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Chole Bhature": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80",
    "Rajma Chawal": "https://images.unsplash.com/photo-1585996387063-e847063e8706?w=600&auto=format&fit=crop&q=80",
    "Pav Bhaji": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Vada Pav": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Pani Puri": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Chapati": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    "Poori": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    "Parotta": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    "Fish Curry": "https://images.unsplash.com/photo-1535401991746-da3d9055713e?w=600&auto=format&fit=crop&q=80",
    "Egg Curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    "Payasam": "https://images.unsplash.com/photo-1571244856353-fb087a321150?w=600&auto=format&fit=crop&q=80",

    "Sona Masoori Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
    "Foxtail Millet": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Little Millet": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Barnyard Millet": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Jowar Flour": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Bajra Flour": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Sambar Powder": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Rasam Powder": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80",
    "Sesame Oil": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80",
    "Rice Bran Oil": "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80",
    "Brown Bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    "Burger Bun": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    "Muffin": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&auto=format&fit=crop&q=80",
    "Peanuts": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80",
    "Chikki": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80",
    "Black Tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    "Fruit Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "Lassi": "https://images.unsplash.com/photo-1571244856353-fb087a321150?w=600&auto=format&fit=crop&q=80",
    "Frozen Paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    "Tissues": "https://images.unsplash.com/photo-1607006986941-46e301d67837?w=600&auto=format&fit=crop&q=80",
    "Aluminium Foil": "https://images.unsplash.com/photo-1607006986941-46e301d67837?w=600&auto=format&fit=crop&q=80",
    "Conditioner": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    "Toothbrush": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&auto=format&fit=crop&q=80",
    "Body Wash": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    "Deodorant": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
    "Hand Wash": "https://images.unsplash.com/photo-1607006342411-92fc462a2fb0?w=600&auto=format&fit=crop&q=80"
}

# 25 Categories Data
CATEGORIES_LIST = [
    {"name": "Fresh Fruits", "slug": "fresh-fruits"},
    {"name": "Fresh Vegetables", "slug": "fresh-vegetables"},
    {"name": "Dairy Products", "slug": "dairy-products"},
    {"name": "Bakery", "slug": "bakery"},
    {"name": "Rice & Grains", "slug": "rice-grains"},
    {"name": "Flour & Atta", "slug": "flour-atta"},
    {"name": "Pulses & Lentils", "slug": "pulses-lentils"},
    {"name": "Cooking Oils", "slug": "cooking-oils"},
    {"name": "Spices & Masalas", "slug": "spices-masalas"},
    {"name": "Dry Fruits & Nuts", "slug": "dry-fruits-nuts"},
    {"name": "Snacks", "slug": "snacks"},
    {"name": "Beverages", "slug": "beverages"},
    {"name": "Frozen Foods", "slug": "frozen-foods"},
    {"name": "Instant Foods", "slug": "instant-foods"},
    {"name": "Organic Foods", "slug": "organic-foods"},
    {"name": "Personal Care", "slug": "personal-care"},
    {"name": "Baby Care", "slug": "baby-care"},
    {"name": "Pet Care", "slug": "pet-care"},
    {"name": "Household Essentials", "slug": "household-essentials"},
    {"name": "Kitchen Essentials", "slug": "kitchen-essentials"},
    {"name": "Stationery", "slug": "stationery"},
    {"name": "Sweets & Desserts", "slug": "sweets-desserts"},
    {"name": "Health & Wellness", "slug": "health-wellness"},
    {"name": "Cleaning Supplies", "slug": "cleaning-supplies"},
    {"name": "Popular Indian Foods", "slug": "popular-indian-foods"}
]

# Products categorized by slug
PRODUCTS_BY_CATEGORY = {
    "fresh-fruits": [
        "Apple", "Banana", "Orange", "Mango", "Grapes", "Watermelon", 
        "Pineapple", "Guava", "Papaya", "Pomegranate", "Kiwi", "Pear", 
        "Dragon Fruit", "Strawberry", "Muskmelon", "Sapota", "Custard Apple",
        "Litchi", "Jamun", "Coconut"
    ],
    "fresh-vegetables": [
        "Tomato", "Onion", "Potato", "Carrot", "Beetroot", "Cabbage", 
        "Cauliflower", "Brinjal", "Lady Finger", "Okra", "Green Chilli", "Capsicum", 
        "Pumpkin", "Bottle Gourd", "Bitter Gourd", "Ridge Gourd", "Snake Gourd",
        "Spinach", "Coriander", "Mint", "Radish"
    ],
    "dairy-products": [
        "Milk", "Butter", "Cheese", "Paneer", "Yogurt", "Curd", "Cream", "Ghee", "Flavored Milk", "Buttermilk"
    ],
    "bakery": [
        "Bread", "Bun", "Cake", "Cookies", "Biscuit", "Muffins", "Croissant", "Donut", "Pizza Base", "Rusk", "Brown Bread", "Burger Bun", "Muffin"
    ],
    "rice-grains": [
        "Basmati Rice", "Ponni Rice", "Brown Rice", "Red Rice", "Millet", "Quinoa", "Ragi", "Jowar", "Bajra", "Barley", "Sona Masoori Rice", "Foxtail Millet", "Little Millet", "Barnyard Millet", "Oats"
    ],
    "flour-atta": [
        "Wheat Flour", "Rice Flour", "Maida", "Ragi Flour", "Besan", "Corn Flour", "Jowar Flour", "Bajra Flour"
    ],
    "pulses-lentils": [
        "Toor Dal", "Urad Dal", "Moong Dal", "Masoor Dal", "Chana Dal", "Green Gram", "Kabuli Chana", "Black Gram", "Rajma", "Cowpea"
    ],
    "cooking-oils": [
        "Sunflower Oil", "Groundnut Oil", "Coconut Oil", "Olive Oil", "Mustard Oil", "Gingelly Oil", "Sesame Oil", "Rice Bran Oil", "Ghee"
    ],
    "spices-masalas": [
        "Turmeric", "Chilli Powder", "Pepper", "Coriander Powder", "Garam Masala", "Cumin", "Mustard Seeds",
        "Fennel", "Fenugreek", "Cardamom", "Cloves", "Cinnamon", "Bay Leaf", "Sambar Powder", "Rasam Powder"
    ],
    "dry-fruits-nuts": [
        "Almonds", "Cashews", "Pistachios", "Walnuts", "Raisins", "Dates"
    ],
    "snacks": [
        "Chips", "Namkeen", "Popcorn", "Mixture", "Biscuits", "Chocolates",
        "Potato Chips", "Banana Chips", "Murukku", "Wafer", "Peanut Chikki", "Peanuts", "Chocolate", "Chikki"
    ],
    "beverages": [
        "Tea", "Coffee", "Juice", "Soft Drinks", "Soft Drink", "Energy Drinks", "Energy Drink", "Coconut Water", "Green Tea", "Black Tea", "Fruit Juice", "Lassi"
    ],
    "frozen-foods": [
        "Frozen Peas", "Frozen Corn", "French Fries", "Frozen Pizza", "Ice Cream", "Frozen Paratha"
    ],
    "instant-foods": [
        "Instant Noodles", "Pasta", "Oats", "Ready Mix", "Soup Mix"
    ],
    "organic-foods": [
        "Organic Vegetables", "Organic Fruits", "Organic Rice", "Organic Dal", "Organic Honey"
    ],
    "personal-care": [
        "Shampoo", "Soap", "Toothpaste", "Face Wash", "Lotion", "Perfume", "Conditioner", "Toothbrush", "Body Wash", "Deodorant", "Hand Wash"
    ],
    "baby-care": [
        "Baby Food", "Baby Lotion", "Baby Soap", "Baby Shampoo", "Diapers"
    ],
    "pet-care": [
        "Dog Food", "Cat Food", "Pet Shampoo", "Pet Toys", "Pet Treats"
    ],
    "household-essentials": [
        "Detergent", "Dishwash Liquid", "Floor Cleaner", "Toilet Cleaner", "Garbage Bags"
    ],
    "kitchen-essentials": [
        "Pressure Cooker", "Pan", "Knife", "Spoon Set", "Storage Containers"
    ],
    "stationery": [
        "Pen", "Pencil", "Notebook", "Marker", "Stapler", "Sticky Notes"
    ],
    "sweets-desserts": [
        "Gulab Jamun", "Laddu", "Barfi", "Rasgulla", "Ice Cream", "Chocolate"
    ],
    "health-wellness": [
        "Honey", "Green Tea", "Protein Powder", "Multivitamins", "Herbal Drinks"
    ],
    "cleaning-supplies": [
        "Floor Cleaner", "Glass Cleaner", "Toilet Cleaner", "Surface Cleaner", "Disinfectant Spray"
    ],
    "popular-indian-foods": [
        "Idli", "Dosa", "Masala Dosa", "Pongal", "Upma", "Poha", "Sambar", "Rasam", "Lemon Rice", "Tamarind Rice",
        "Vegetable Biryani", "Chicken Biryani", "Butter Chicken", "Paneer Butter Masala", "Palak Paneer", "Chole Bhature",
        "Rajma Chawal", "Pav Bhaji", "Vada Pav", "Pani Puri", "Chapati", "Poori", "Parotta", "Fish Curry", "Egg Curry", "Payasam"
    ]
}

def slugify(text: str) -> str:
    return re.sub(r'[\s_]+', '-', text.lower()).strip('-')

# Realistic details: (Price in INR, MRP in INR, Weight/Measurement, Shelf Life, Origin)
PRODUCT_DETAILS_MAP = {
    # Fruits
    "Apple": (120.00, 150.00, "1 kg", "7 Days", "Himachal Pradesh"),
    "Banana": (60.00, 80.00, "1 Dozen", "3 Days", "Tamil Nadu"),
    "Orange": (90.00, 120.00, "1 kg", "7 Days", "Nagpur"),
    "Mango": (150.00, 200.00, "1 kg", "5 Days", "Ratnagiri"),
    "Grapes": (80.00, 100.00, "500g", "5 Days", "Nashik"),
    "Watermelon": (50.00, 70.00, "1 Unit (approx. 2-3 kg)", "10 Days", "Local Farm"),
    "Pineapple": (60.00, 80.00, "1 Unit", "7 Days", "Kerala"),
    "Guava": (60.00, 80.00, "500g", "6 Days", "Local Farm"),
    "Papaya": (45.00, 60.00, "1 Unit (approx. 1 kg)", "5 Days", "Karnataka"),
    "Pomegranate": (140.00, 180.00, "500g", "10 Days", "Maharashtra"),
    "Kiwi": (110.00, 140.00, "3 Units (Pack)", "10 Days", "Imported"),
    "Pear": (120.00, 160.00, "500g", "8 Days", "Ooty"),
    "Dragon Fruit": (90.00, 120.00, "1 Unit", "7 Days", "Gujarat"),
    "Strawberry": (70.00, 90.00, "200g Pack", "4 Days", "Mahabaleshwar"),
    "Muskmelon": (55.00, 75.00, "1 Unit (approx. 1 kg)", "7 Days", "Andhra Pradesh"),
    "Sapota": (50.00, 70.00, "500g", "4 Days", "Karnataka"),
    "Custard Apple": (90.00, 120.00, "500g", "4 Days", "Andhra Pradesh"),
    "Litchi": (100.00, 130.00, "250g", "4 Days", "Bihar"),
    "Jamun": (120.00, 150.00, "250g", "3 Days", "Uttar Pradesh"),
    "Coconut": (30.00, 40.00, "1 Unit", "15 Days", "Pollachi"),

    # Vegetables
    "Tomato": (40.00, 55.00, "1 kg", "6 Days", "Local Farm"),
    "Onion": (35.00, 50.00, "1 kg", "15 Days", "Nashik"),
    "Potato": (30.00, 45.00, "1 kg", "20 Days", "Agra"),
    "Carrot": (50.00, 70.00, "500g", "8 Days", "Ooty"),
    "Beetroot": (25.00, 35.00, "500g", "10 Days", "Local Farm"),
    "Cabbage": (30.00, 45.00, "1 Unit", "8 Days", "Local Farm"),
    "Cauliflower": (40.00, 60.00, "1 Unit", "6 Days", "Local Farm"),
    "Brinjal": (30.00, 45.00, "500g", "6 Days", "Local Farm"),
    "Lady Finger": (25.00, 35.00, "500g", "5 Days", "Local Farm"),
    "Okra": (25.00, 35.00, "500g", "5 Days", "Local Farm"),
    "Green Chilli": (15.00, 25.00, "100g", "7 Days", "Local Farm"),
    "Capsicum": (40.00, 60.00, "500g", "7 Days", "Local Farm"),
    "Pumpkin": (30.00, 45.00, "1 Unit (approx 1 kg)", "12 Days", "Local Farm"),
    "Bottle Gourd": (25.00, 35.00, "1 Unit", "7 Days", "Local Farm"),
    "Bitter Gourd": (30.00, 45.00, "500g", "7 Days", "Local Farm"),
    "Ridge Gourd": (30.00, 45.00, "500g", "7 Days", "Local Farm"),
    "Snake Gourd": (28.00, 40.00, "1 Unit", "7 Days", "Local Farm"),
    "Spinach": (20.00, 30.00, "1 Bunch", "3 Days", "Local Farm"),
    "Coriander": (15.00, 25.00, "1 Bunch", "3 Days", "Local Farm"),
    "Mint": (15.00, 25.00, "1 Bunch", "3 Days", "Local Farm"),
    "Radish": (25.00, 35.00, "500g", "7 Days", "Local Farm"),

    # Dairy Products
    "Milk": (30.00, 32.00, "500ml", "2 Days", "Amul"),
    "Butter": (55.00, 58.00, "100g", "30 Days", "Amul"),
    "Cheese": (125.00, 135.00, "200g Pack", "60 Days", "Amul"),
    "Paneer": (90.00, 100.00, "200g", "10 Days", "Nandini"),
    "Yogurt": (45.00, 50.00, "400g", "15 Days", "Mother Dairy"),
    "Curd": (35.00, 40.00, "400g", "7 Days", "Amul"),
    "Cream": (65.00, 70.00, "200ml", "10 Days", "Amul"),
    "Ghee": (320.00, 350.00, "500ml", "9 Months", "Aavin"),
    "Flavored Milk": (35.00, 40.00, "200ml Bottle", "90 Days", "Cavins"),
    "Buttermilk": (15.00, 18.00, "200ml Pack", "5 Days", "Amul"),

    # Bakery
    "Bread": (40.00, 45.00, "400g", "5 Days", "Modern Bread"),
    "Bun": (20.00, 25.00, "2 Units", "4 Days", "Britannia"),
    "Cake": (150.00, 180.00, "300g", "15 Days", "Elite"),
    "Cookies": (80.00, 100.00, "200g Pack", "3 Months", "Unibic"),
    "Biscuit": (30.00, 35.00, "200g", "4 Months", "Parle-G"),
    "Muffins": (60.00, 75.00, "2 Units", "6 Days", "Local Bakery"),
    "Croissant": (80.00, 100.00, "1 Unit", "4 Days", "French Crust"),
    "Donut": (60.00, 80.00, "1 Unit", "4 Days", "Mod Donuts"),
    "Pizza Base": (40.00, 50.00, "2 Units Pack", "7 Days", "Harvest Gold"),
    "Rusk": (45.00, 50.00, "300g Pack", "4 Months", "Britannia"),

    # Rice & Grains
    "Basmati Rice": (130.00, 160.00, "1 kg", "1 Year", "Daawat"),
    "Ponni Rice": (60.00, 75.00, "1 kg", "1 Year", "Karnataka"),
    "Brown Rice": (95.00, 120.00, "1 kg", "1 Year", "India Gate"),
    "Red Rice": (80.00, 100.00, "1 kg", "1 Year", "Kerala"),
    "Millet": (70.00, 90.00, "1 kg", "6 Months", "Rajasthan"),
    "Ragi": (55.00, 70.00, "1 kg", "6 Months", "Karnataka"),
    "Jowar": (65.00, 80.00, "1 kg", "6 Months", "Maharashtra"),
    "Bajra": (50.00, 65.00, "1 kg", "6 Months", "Rajasthan"),
    "Quinoa": (250.00, 300.00, "500g", "1 Year", "Imported"),
    "Barley": (60.00, 80.00, "1 kg", "1 Year", "Punjab"),

    # Flour & Atta
    "Wheat Flour": (60.00, 70.00, "1 kg", "4 Months", "Aashirvaad"),
    "Rice Flour": (50.00, 65.00, "1 kg", "4 Months", "Aashirvaad"),
    "Maida": (45.00, 55.00, "1 kg", "4 Months", "Rajdhani"),
    "Ragi Flour": (65.00, 80.00, "1 kg", "4 Months", "MTR"),
    "Besan": (90.00, 110.00, "1 kg", "4 Months", "Rajdhani"),
    "Corn Flour": (40.00, 50.00, "500g", "6 Months", "Weikfield"),

    # Pulses & Lentils
    "Toor Dal": (160.00, 190.00, "1 kg", "1 Year", "Tata Sampann"),
    "Urad Dal": (140.00, 170.00, "1 kg", "1 Year", "Tata Sampann"),
    "Moong Dal": (130.00, 160.00, "1 kg", "1 Year", "Tata Sampann"),
    "Masoor Dal": (110.00, 140.00, "1 kg", "1 Year", "Tata Sampann"),
    "Chana Dal": (100.00, 120.00, "1 kg", "1 Year", "Tata Sampann"),
    "Kabuli Chana": (150.00, 180.00, "1 kg", "1 Year", "Tata Sampann"),
    "Green Gram": (125.00, 150.00, "1 kg", "1 Year", "Organic Tattva"),
    "Black Gram": (130.00, 160.00, "1 kg", "1 Year", "Organic Tattva"),
    "Rajma": (140.00, 175.00, "1 kg", "1 Year", "Jammu"),
    "Cowpea": (95.00, 120.00, "1 kg", "1 Year", "Local Farmer"),

    # Cooking Oils
    "Sunflower Oil": (135.00, 160.00, "1 Litre", "9 Months", "Fortune"),
    "Groundnut Oil": (190.00, 220.00, "1 Litre", "9 Months", "Fortune"),
    "Coconut Oil": (230.00, 260.00, "1 Litre", "1 Year", "Parachute"),
    "Olive Oil": (750.00, 850.00, "1 Litre", "2 Years", "Figaro"),
    "Mustard Oil": (160.00, 190.00, "1 Litre", "1 Year", "Fortune"),
    "Gingelly Oil": (240.00, 280.00, "1 Litre", "1 Year", "Idhayam"),

    # Spices & Masalas
    "Turmeric": (45.00, 55.00, "200g Pack", "1 Year", "Everest"),
    "Chilli Powder": (55.00, 70.00, "200g Pack", "1 Year", "Everest"),
    "Pepper": (120.00, 150.00, "100g Pack", "1 Year", "Catch"),
    "Coriander Powder": (40.00, 50.00, "200g Pack", "1 Year", "Everest"),
    "Garam Masala": (70.00, 85.00, "100g Pack", "1 Year", "Everest"),
    "Cumin": (80.00, 100.00, "100g Pack", "1 Year", "Catch"),
    "Mustard Seeds": (30.00, 40.00, "200g Pack", "1 Year", "Catch"),
    "Fennel": (40.00, 50.00, "100g Pack", "1 Year", "Catch"),
    "Fenugreek": (25.00, 35.00, "100g Pack", "1 Year", "Catch"),
    "Cardamom": (180.00, 220.00, "50g Pack", "1 Year", "Kerala"),
    "Cloves": (90.00, 110.00, "50g Pack", "1 Year", "Kerala"),
    "Cinnamon": (60.00, 80.00, "50g Pack", "1 Year", "Kerala"),
    "Bay Leaf": (20.00, 30.00, "50g Pack", "1 Year", "Assam"),

    # Dry Fruits & Nuts
    "Almonds": (240.00, 290.00, "250g Pack", "6 Months", "California"),
    "Cashews": (260.00, 320.00, "250g Pack", "6 Months", "Mangalore"),
    "Pistachios": (290.00, 360.00, "250g Pack", "6 Months", "Iran"),
    "Walnuts": (320.00, 400.00, "250g Pack", "6 Months", "Kashmir"),
    "Raisins": (90.00, 120.00, "250g Pack", "6 Months", "Nashik"),
    "Dates": (150.00, 190.00, "500g Pack", "1 Year", "Arabian"),

    # Snacks
    "Chips": (20.00, 20.00, "50g Pack", "4 Months", "Lay's"),
    "Namkeen": (45.00, 50.00, "150g Pack", "6 Months", "Haldiram's"),
    "Popcorn": (30.00, 40.00, "100g Pack", "1 Year", "Act II"),
    "Mixture": (45.00, 50.00, "150g Pack", "6 Months", "Haldiram's"),
    "Biscuits": (20.00, 25.00, "120g Pack", "6 Months", "Sunfeast"),
    "Chocolates": (80.00, 100.00, "100g Bar", "8 Months", "Cadbury Dairy Milk"),
    "Potato Chips": (20.00, 20.00, "50g Pack", "4 Months", "Lay's"),
    "Banana Chips": (60.00, 75.00, "150g Pack", "3 Months", "Kerala Farms"),
    "Murukku": (45.00, 55.00, "150g Pack", "3 Months", "Grand Sweets"),
    "Wafer": (30.00, 35.00, "75g Pack", "6 Months", "Dukes"),
    "Peanut Chikki": (40.00, 50.00, "100g Pack", "4 Months", "Lonavala"),

    # Beverages
    "Tea": (140.00, 160.00, "500g Pack", "1 Year", "Tata Tea"),
    "Coffee": (180.00, 210.00, "100g Jar", "1.5 Years", "Bru Gold"),
    "Juice": (110.00, 125.00, "1 Litre Tetrapack", "6 Months", "Real Fruit Juice"),
    "Soft Drinks": (40.00, 45.00, "750ml Bottle", "6 Months", "Coca Cola"),
    "Soft Drink": (40.00, 45.00, "750ml Bottle", "6 Months", "Coca Cola"),
    "Energy Drinks": (110.00, 125.00, "250ml Can", "1 Year", "Red Bull"),
    "Energy Drink": (110.00, 125.00, "250ml Can", "1 Year", "Red Bull"),
    "Coconut Water": (40.00, 50.00, "1 Unit (Fresh)", "2 Days", "Local Farm"),
    "Green Tea": (220.00, 250.00, "25 Tea bags", "1 Year", "Lipton"),

    # Frozen Foods
    "Frozen Peas": (95.00, 110.00, "500g Pack", "1 Year", "Safal"),
    "Frozen Corn": (85.00, 100.00, "500g Pack", "1 Year", "Safal"),
    "French Fries": (120.00, 150.00, "750g Pack", "1 Year", "McCain"),
    "Frozen Pizza": (160.00, 200.00, "350g Pack", "6 Months", "Yummiez"),
    "Ice Cream": (150.00, 180.00, "700ml Tub", "4 Months", "Amul"),

    # Instant Foods
    "Instant Noodles": (14.00, 15.00, "70g Pack", "9 Months", "Maggi"),
    "Pasta": (70.00, 85.00, "500g Pack", "1 Year", "Bambino"),
    "Oats": (160.00, 190.00, "1 kg Pack", "1 Year", "Quaker"),
    "Ready Mix": (65.00, 80.00, "200g Pack", "9 Months", "MTR"),
    "Soup Mix": (40.00, 50.00, "45g Pack", "1 Year", "Knorr"),

    # Organic Foods
    "Organic Vegetables": (80.00, 100.00, "500g Combo", "5 Days", "Organic India"),
    "Organic Fruits": (160.00, 200.00, "1 kg Combo", "5 Days", "Organic India"),
    "Organic Rice": (110.00, 130.00, "1 kg Pack", "1 Year", "Organic India"),
    "Organic Dal": (170.00, 200.00, "1 kg Pack", "1 Year", "Organic India"),
    "Organic Honey": (290.00, 330.00, "250g Jar", "2 Years", "Organic India"),

    # Personal Care
    "Shampoo": (180.00, 220.00, "340ml Bottle", "2 Years", "Sunsilk"),
    "Soap": (120.00, 150.00, "3x125g Pack", "2 Years", "Dettol"),
    "Toothpaste": (95.00, 110.00, "200g Tube", "2 Years", "Colgate"),
    "Face Wash": (140.00, 165.00, "100g Tube", "2 Years", "Himalaya"),
    "Lotion": (220.00, 275.00, "400ml Bottle", "2 Years", "Nivea"),
    "Perfume": (290.00, 399.00, "120ml Spray", "3 Years", "Fogg"),

    # Baby Care
    "Baby Food": (320.00, 350.00, "400g Tin", "1 Year", "Cerelac"),
    "Baby Lotion": (160.00, 190.00, "200ml Bottle", "2 Years", "Johnson's"),
    "Baby Soap": (75.00, 85.00, "100g Bar", "2 Years", "Johnson's"),
    "Baby Shampoo": (180.00, 210.00, "200ml Bottle", "2 Years", "Johnson's"),
    "Diapers": (650.00, 799.00, "44 Units Pack", "3 Years", "Pampers"),

    # Pet Care
    "Dog Food": (650.00, 750.00, "1.2 kg Pack", "1.5 Years", "Pedigree"),
    "Cat Food": (190.00, 220.00, "450g Pack", "1.5 Years", "Whiskas"),
    "Pet Shampoo": (250.00, 300.00, "200ml Bottle", "2 Years", "Himalaya Pet"),
    "Pet Toys": (120.00, 150.00, "1 Unit (Ball)", "N/A", "Trixie"),
    "Pet Treats": (140.00, 175.00, "100g Pack", "1 Year", "Choostix"),

    # Household Essentials
    "Detergent": (210.00, 250.00, "1 kg Pack", "2 Years", "Surf Excel"),
    "Dishwash Liquid": (105.00, 120.00, "500ml Bottle", "2 Years", "Vim"),
    "Floor Cleaner": (140.00, 165.00, "1 Litre Bottle", "2 Years", "Lizol"),
    "Toilet Cleaner": (145.00, 170.00, "1 Litre Bottle", "2 Years", "Harpic"),
    "Garbage Bags": (90.00, 120.00, "30 Units Pack", "N/A", "Shalimar"),

    # Kitchen Essentials
    "Pressure Cooker": (1250.00, 1599.00, "3 Litre Unit", "5 Years Warranty", "Hawkins"),
    "Pan": (550.00, 750.00, "24cm Non-stick", "N/A", "Prestige"),
    "Knife": (95.00, 120.00, "1 Unit (Stainless)", "N/A", "Pigeon"),
    "Spoon Set": (180.00, 250.00, "6 Units Set", "N/A", "Prestige"),
    "Storage Containers": (290.00, 399.00, "3 Units Set", "N/A", "Cello"),

    # Stationery
    "Pen": (40.00, 50.00, "5 Units Pack", "N/A", "Reynolds"),
    "Pencil": (50.00, 60.00, "10 Units Pack", "N/A", "Apsara"),
    "Notebook": (60.00, 75.00, "172 Pages", "N/A", "Classmate"),
    "Marker": (25.00, 30.00, "1 Unit (Black)", "2 Years", "Camlin"),
    "Stapler": (45.00, 55.00, "1 Unit", "N/A", "Kangaroo"),
    "Sticky Notes": (80.00, 100.00, "100 Sheets Pack", "N/A", "3M Post-it"),

    # Sweets & Desserts
    "Gulab Jamun": (180.00, 220.00, "1 kg Tin", "6 Months", "Haldiram's"),
    "Laddu": (150.00, 180.00, "500g Pack", "10 Days", "Haldiram's"),
    "Barfi": (220.00, 260.00, "500g Pack", "7 Days", "Bikanervala"),
    "Rasgulla": (160.00, 200.00, "1 kg Tin", "6 Months", "Haldiram's"),
    "Chocolate": (80.00, 100.00, "100g Bar", "8 Months", "Cadbury"),

    # Health & Wellness
    "Honey": (199.00, 240.00, "500g Bottle", "2 Years", "Dabur"),
    "Protein Powder": (1850.00, 2200.00, "1 kg Tub", "1.5 Years", "MuscleBlaze"),
    "Multivitamins": (399.00, 499.00, "60 Tablets", "1.5 Years", "Revital H"),
    "Herbal Drinks": (120.00, 150.00, "500ml Bottle", "1 Year", "Patanjali"),

    # Cleaning Supplies
    "Glass Cleaner": (85.00, 99.00, "500ml Spray", "2 Years", "Colin"),
    "Surface Cleaner": (110.00, 135.00, "500ml Spray", "2 Years", "Dettol"),
    "Disinfectant Spray": (160.00, 199.00, "200ml Can", "2 Years", "Savlon"),

    # Popular Indian Foods
    "Idli": (40.00, 50.00, "4 Pcs", "1 Day", "Home Kitchen"),
    "Dosa": (50.00, 60.00, "1 Unit", "1 Day", "Home Kitchen"),
    "Masala Dosa": (70.00, 80.00, "1 Unit", "1 Day", "Home Kitchen"),
    "Pongal": (60.00, 75.00, "Plate", "1 Day", "Home Kitchen"),
    "Upma": (40.00, 50.00, "Plate", "1 Day", "Home Kitchen"),
    "Poha": (35.00, 45.00, "Plate", "1 Day", "Home Kitchen"),
    "Sambar": (30.00, 40.00, "250ml", "1 Day", "Home Kitchen"),
    "Rasam": (25.00, 35.00, "250ml", "1 Day", "Home Kitchen"),
    "Lemon Rice": (55.00, 70.00, "Plate", "1 Day", "Home Kitchen"),
    "Tamarind Rice": (55.00, 70.00, "Plate", "1 Day", "Home Kitchen"),
    "Vegetable Biryani": (120.00, 150.00, "Plate", "1 Day", "Home Kitchen"),
    "Chicken Biryani": (180.00, 220.00, "Plate", "1 Day", "Home Kitchen"),
    "Butter Chicken": (240.00, 290.00, "Plate", "1 Day", "Home Kitchen"),
    "Paneer Butter Masala": (160.00, 200.00, "Plate", "1 Day", "Home Kitchen"),
    "Palak Paneer": (150.00, 190.00, "Plate", "1 Day", "Home Kitchen"),
    "Chole Bhature": (80.00, 100.00, "2 Pcs Bhature + Chole", "1 Day", "Home Kitchen"),
    "Rajma Chawal": (80.00, 100.00, "Plate", "1 Day", "Home Kitchen"),
    "Pav Bhaji": (70.00, 90.00, "2 Pcs Pav + Bhaji", "1 Day", "Home Kitchen"),
    "Vada Pav": (25.00, 35.00, "1 Unit", "1 Day", "Home Kitchen"),
    "Pani Puri": (40.00, 50.00, "6 Pcs", "1 Day", "Home Kitchen"),
    "Chapati": (10.00, 12.00, "1 Unit", "1 Day", "Home Kitchen"),
    "Poori": (40.00, 50.00, "3 Pcs", "1 Day", "Home Kitchen"),
    "Parotta": (15.00, 20.00, "1 Unit", "1 Day", "Home Kitchen"),
    "Fish Curry": (220.00, 260.00, "Plate", "1 Day", "Home Kitchen"),
    "Egg Curry": (110.00, 130.00, "Plate", "1 Day", "Home Kitchen"),
    "Payasam": (50.00, 60.00, "200ml Cup", "1 Day", "Home Kitchen"),

    "Sona Masoori Rice": (65.00, 80.00, "1 kg", "1 Year", "Andhra Pradesh"),
    "Foxtail Millet": (90.00, 110.00, "500g", "6 Months", "Tamil Nadu"),
    "Little Millet": (85.00, 105.00, "500g", "6 Months", "Karnataka"),
    "Barnyard Millet": (95.00, 115.00, "500g", "6 Months", "Tamil Nadu"),
    "Jowar Flour": (70.00, 85.00, "1 kg", "4 Months", "Maharashtra"),
    "Bajra Flour": (65.00, 80.00, "1 kg", "4 Months", "Rajasthan"),
    "Sambar Powder": (65.00, 80.00, "100g Pack", "1 Year", "MTR"),
    "Rasam Powder": (60.00, 75.00, "100g Pack", "1 Year", "MTR"),
    "Sesame Oil": (260.00, 300.00, "1 Litre", "1 Year", "Tamil Nadu"),
    "Rice Bran Oil": (155.00, 180.00, "1 Litre", "1 Year", "Fortune"),
    "Brown Bread": (50.00, 55.00, "400g", "5 Days", "Modern Bread"),
    "Burger Bun": (25.00, 30.00, "2 Units Pack", "4 Days", "Britannia"),
    "Muffin": (35.00, 45.00, "1 Unit", "6 Days", "Local Bakery"),
    "Peanuts": (80.00, 100.00, "200g Pack", "6 Months", "Gujarat"),
    "Chikki": (40.00, 50.00, "100g Pack", "4 Months", "Lonavala"),
    "Black Tea": (120.00, 140.00, "250g Pack", "1 Year", "Taj Mahal"),
    "Fruit Juice": (110.00, 125.00, "1 Litre Tetrapack", "6 Months", "Real Fruit Juice"),
    "Lassi": (25.00, 30.00, "200ml Pack", "7 Days", "Amul"),
    "Frozen Paratha": (90.00, 110.00, "400g Pack", "9 Months", "ID Fresh"),
    "Tissues": (60.00, 75.00, "100 Pulls Pack", "N/A", "Premier"),
    "Aluminium Foil": (99.00, 120.00, "9 Metres Pack", "N/A", "Freshwrap"),
    "Conditioner": (190.00, 230.00, "180ml Bottle", "2 Years", "L'Oreal"),
    "Toothbrush": (30.00, 40.00, "1 Unit", "N/A", "Oral-B"),
    "Body Wash": (180.00, 220.00, "250ml Bottle", "2 Years", "Fiama"),
    "Deodorant": (199.00, 250.00, "150ml Can", "3 Years", "Nivea"),
    "Hand Wash": (85.00, 99.00, "200ml Refill Pack", "2 Years", "Dettol")
}

def seed_database():
    db: Session = SessionLocal()
    try:
        print("Cleaning up old cart items, order items, wishlist items, inventory logs, products and categories...")
        db.query(CartItem).delete()
        db.query(OrderItem).delete()
        db.query(WishlistItem).delete()
        db.query(InventoryLog).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.query(Recipe).delete()
        db.commit()

        print("Seeding new categories...")
        cat_map = {}
        for c in CATEGORIES_LIST:
            icon_name = CATEGORY_ICONS.get(c["slug"], "Sparkles")
            new_cat = Category(name=c["name"], slug=c["slug"], icon=icon_name)
            db.add(new_cat)
            db.flush()
            cat_map[c["slug"]] = new_cat.id

        print("Seeding products...")
        seeded_slugs = set()
        for slug, prod_names in PRODUCTS_BY_CATEGORY.items():
            cat_id = cat_map[slug]
            for p_name in prod_names:
                prod_slug = slugify(p_name)
                if prod_slug in seeded_slugs:
                    prod_slug = f"{prod_slug}-{slug}"
                seeded_slugs.add(prod_slug)
                
                img_url = PRODUCT_IMAGES.get(p_name, "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80")
                is_organic = "organic" in p_name.lower() or "organic" in slug.lower()
                
                # Fetch realistic details
                price, mrp, weight, shelf_life, origin = PRODUCT_DETAILS_MAP.get(
                    p_name,
                    (45.00, 55.00, "500g" if "fruits" in slug or "vegetables" in slug else "1 unit", 
                     "7 Days" if "fruits" in slug or "vegetables" in slug else "6 Months", 
                     "Local Farm" if "fruits" in slug or "vegetables" in slug else "Premium Brand")
                )
                
                # Base parameters
                new_prod = Product(
                    name=p_name,
                    slug=prod_slug,
                    description=f"Fresh premium quality {p_name.lower()} sourced with care for your household needs.",
                    price=price,
                    mrp=mrp,
                    weight=weight,
                    image_url=img_url,
                    stock=50,
                    category_id=cat_id,
                    is_organic=is_organic,
                    shelf_life=shelf_life,
                    origin=origin,
                    nutrition={"Calories": "80", "Carbs": "15g"},
                    ingredients=p_name
                )
                db.add(new_prod)
        
        print("Seeding Recipes...")
        recipes_data = [
            {
                "title": "Traditional Masala Dosa",
                "description": "Crispy rice crepes filled with a savory spiced potato mash, served with fresh coconut chutney.",
                "ingredients": [
                    {"name": "Basmati Rice", "qty": "200g"},
                    {"name": "Potato", "qty": "300g"},
                    {"name": "Mustard Seeds", "qty": "1 tsp"},
                    {"name": "Turmeric", "qty": "1/2 tsp"},
                    {"name": "Coriander", "qty": "a few sprigs"},
                    {"name": "Green Chilli", "qty": "2 units"}
                ],
                "instructions": [
                    "Soak rice and urad dal, blend into a smooth batter, and ferment overnight.",
                    "Boil potatoes, mash them slightly.",
                    "Heat oil, splutter mustard seeds, sauté green chillies, onions, turmeric, and mix in potatoes.",
                    "Spread batter thinly on a hot griddle, drizzle ghee, cook until crispy, place potato filling inside and fold."
                ],
                "prep_time": "30 mins",
                "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80"
            },
            {
                "title": "Paneer Butter Masala",
                "description": "Rich, creamy curry prepared with fresh paneer blocks, fresh tomatoes, butter, and aromatic spices.",
                "ingredients": [
                    {"name": "Paneer", "qty": "200g"},
                    {"name": "Butter", "qty": "50g"},
                    {"name": "Tomato", "qty": "400g"},
                    {"name": "Chilli Powder", "qty": "1 tsp"},
                    {"name": "Garam Masala", "qty": "1 tsp"}
                ],
                "instructions": [
                    "Puree fresh tomatoes in a blender.",
                    "Sauté spices and tomato puree in butter until oil separates.",
                    "Add cream, paneer cubes, and garam masala.",
                    "Simmer for 5 minutes and garnish with fresh coriander."
                ],
                "prep_time": "25 mins",
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80"
            },
            {
                "title": "Vegetable Biryani",
                "description": "Aromatic, long-grain basmati rice cooked with assortment of fresh vegetables, herbs, and spices.",
                "ingredients": [
                    {"name": "Basmati Rice", "qty": "300g"},
                    {"name": "Onion", "qty": "2 units"},
                    {"name": "Carrot", "qty": "150g"},
                    {"name": "Potato", "qty": "150g"},
                    {"name": "Garam Masala", "qty": "1.5 tsp"},
                    {"name": "Mint", "qty": "handful"},
                    {"name": "Coriander", "qty": "handful"}
                ],
                "instructions": [
                    "Wash and soak basmati rice for 30 minutes.",
                    "Parboil the rice with whole spices.",
                    "Sauté vegetables, onions, and biryani spices in a pot.",
                    "Layer parboiled rice over the cooked vegetables, top with mint, coriander, and saffron water.",
                    "Seal and cook on low heat (dum) for 15-20 minutes."
                ],
                "prep_time": "45 mins",
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80"
            },
            {
                "title": "Sambar & Idli Combo",
                "description": "Soft fluffy steamed rice cakes (Idlis) served with a hot flavorful spiced lentil soup (Sambar).",
                "ingredients": [
                    {"name": "Basmati Rice", "qty": "200g"},
                    {"name": "Toor Dal", "qty": "150g"},
                    {"name": "Tomato", "qty": "150g"},
                    {"name": "Mustard Seeds", "qty": "1 tsp"},
                    {"name": "Chilli Powder", "qty": "1 tsp"}
                ],
                "instructions": [
                    "Steam fermented idli batter in idli moulds for 10-12 minutes.",
                    "Boil toor dal with turmeric and mash it.",
                    "Cook vegetables and tomatoes with sambar powder/chilli powder and tamarind extract.",
                    "Mix in the dal, temper with oil, mustard seeds, and curry leaves, and simmer."
                ],
                "prep_time": "35 mins",
                "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80"
            }
        ]
        
        for r in recipes_data:
            db.add(Recipe(**r))

        db.commit()
        print("Database seeded with 25 categories, products, and recipes successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
