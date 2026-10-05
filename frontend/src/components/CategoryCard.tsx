import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { API_BASE_URL, ProductType } from '../context/AppContext';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
}

const CATEGORY_BANNERS: Record<string, string> = {
  'fresh-fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  'fresh-vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  'dairy-products': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  'rice-grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  'flour-atta': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  'pulses-lentils': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80',
  'cooking-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
  'spices-masalas': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
  'dry-fruits-nuts': 'https://images.unsplash.com/photo-1508061253366-f7da158b6cd9?w=600&auto=format&fit=crop&q=80',
  'snacks': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
  'beverages': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  'frozen-foods': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&auto=format&fit=crop&q=80',
  'instant-foods': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
  'organic-foods': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
  'personal-care': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80',
  'baby-care': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
  'pet-care': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
  'household-essentials': 'https://images.unsplash.com/photo-1607006986941-46e301d67837?w=600&auto=format&fit=crop&q=80',
  'kitchen-essentials': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
  'stationery': 'https://images.unsplash.com/photo-1585336139080-b019d77a3393?w=600&auto=format&fit=crop&q=80',
  'sweets-desserts': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
  'health-wellness': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  'cleaning-supplies': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
  'popular-indian-foods': 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=600&auto=format&fit=crop&q=80'
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'fresh-fruits': 'Farm fresh delicious fruits rich in essential vitamins & minerals.',
  'fresh-vegetables': 'Daily harvested pesticide-free vegetables sourced from local farms.',
  'dairy-products': 'Fresh farm milk, cheese, paneer, butter, and daily dairy essentials.',
  'bakery': 'Freshly baked artisanal breads, cookies, cakes, and breakfast buns.',
  'rice-grains': 'Premium basmati rice, organic millets, quinoa, and healthy grains.',
  'flour-atta': 'Stone ground organic wheat flour, ragi, and fine grain flours.',
  'pulses-lentils': 'Protein-rich farm fresh lentils, toor dal, and organic pulses.',
  'cooking-oils': 'Cholesterol-free healthy cooking oils, cold pressed and olive oils.',
  'spices-masalas': 'Authentic aromatic spices and blended masalas for rich flavor.',
  'dry-fruits-nuts': 'Premium quality almonds, cashews, raisins, and healthy nuts.',
  'snacks': 'Crispy chips, namkeens, premium chocolates, and tea-time snacks.',
  'beverages': 'Refreshing natural fruit juices, organic green teas, and coffee.',
  'frozen-foods': 'Quick cooking French fries, frozen corn, and delicious ice creams.',
  'instant-foods': 'Ready-in-minutes noodles, pasta mixes, and quick soup solutions.',
  'organic-foods': '100% certified organic groceries, honey, grains, and greens.',
  'personal-care': 'Gentle shampoos, soaps, toothpastes, and daily hygiene essentials.',
  'baby-care': 'Pediatric approved gentle formulas, baby lotion, soaps, and diapers.',
  'pet-care': 'Nutritional dog & cat foods, toys, and premium pet shampoos.',
  'household-essentials': 'High-power dishwash liquids, garbage bags, and cleaners.',
  'kitchen-essentials': 'Durable food-grade pans, pressure cookers, and spoon sets.',
  'stationery': 'Office & school essentials, high quality notebooks, pens, and markers.',
  'sweets-desserts': 'Delicious freshly made gulab jamuns, laddus, barfis, and desserts.',
  'health-wellness': 'Immunity support green teas, multivitamins, and proteins.',
  'cleaning-supplies': 'Germ-protection floor, glass, and disinfectant surface cleaners.',
  'popular-indian-foods': 'Delicious chef-curated ready-to-eat popular Indian dishes and meals.'
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [productCount, setProductCount] = useState<number>(0);
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products?category_id=${category.id}&limit=3`)
      .then(res => res.json())
      .then(data => {
        setProductCount(data.total_count || 0);
        setFeaturedProducts(data.products || []);
      })
      .catch(() => {});
  }, [category.id]);

  const IconComponent = (Icons as any)[category.icon] || Icons.Sparkles;
  const bannerImg = CATEGORY_BANNERS[category.slug] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';
  const description = CATEGORY_DESCRIPTIONS[category.slug] || 'Fresh premium groceries sourced directly for your family.';

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* 16:9 Banner Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={bannerImg}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Floating Category Icon */}
        <div className="absolute top-4 left-4 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-md rounded-2xl text-primary flex items-center justify-center">
          <IconComponent className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Count Badge */}
        <div className="absolute bottom-3 right-4 px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-full">
          {productCount} Products
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Featured Products Mini Previews */}
        {featuredProducts.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-450 dark:text-gray-450 block">Featured Items</span>
            <div className="flex gap-2">
              {featuredProducts.map(prod => (
                <Link
                  key={prod.id}
                  to={`/products/${prod.id}`}
                  title={prod.name}
                  className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary transition-all bg-gray-50 dark:bg-gray-850 shrink-0"
                >
                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Explore Button */}
        <Link
          to={`/products?category=${category.id}`}
          className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 group-hover:bg-primary group-hover:text-white text-gray-750 dark:text-gray-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          Explore Category <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
