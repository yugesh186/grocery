import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp, API_BASE_URL, ProductType } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, Leaf } from 'lucide-react';
const CATEGORY_BANNERS: Record<string, string> = {
  'fresh-fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1200&q=80',
  'fresh-vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80',
  'dairy-products': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1200&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80',
  'rice-grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=80',
  'flour-atta': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&q=80',
  'pulses-lentils': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=1200&q=80',
  'cooking-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=80',
  'spices-masalas': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&q=80',
  'dry-fruits-nuts': 'https://images.unsplash.com/photo-1508061253366-f7da158b6cd9?w=1200&q=80',
  'snacks': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=1200&q=80',
  'beverages': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80',
  'frozen-foods': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1200&q=80',
  'instant-foods': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80',
  'organic-foods': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=1200&q=80',
  'personal-care': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=1200&q=80',
  'baby-care': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&q=80',
  'pet-care': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&q=80',
  'household-essentials': 'https://images.unsplash.com/photo-1607006986941-46e301d67837?w=1200&q=80',
  'kitchen-essentials': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1200&q=80',
  'stationery': 'https://images.unsplash.com/photo-1585336139080-b019d77a3393?w=1200&q=80',
  'sweets-desserts': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=1200&q=80',
  'health-wellness': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80',
  'cleaning-supplies': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
  'popular-indian-foods': 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=1200&q=80'
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

const ProductCatalog: React.FC = () => {
  const { categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states from URL query
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync state if URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSearchVal(searchParam);
    setPage(1);
  }, [categoryParam, searchParam]);

  // Fetch products matching filters
  const loadProducts = () => {
    setLoading(true);
    let url = `${API_BASE_URL}/products?page=${page}&limit=9&sort_by=${sortBy}`;

    if (selectedCategory) url += `&category_id=${selectedCategory}`;
    if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;
    if (organicOnly) url += `&is_organic=true`;
    if (minPrice) url += `&min_price=${minPrice}`;
    if (maxPrice) url += `&max_price=${maxPrice}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchVal, organicOnly, sortBy, page]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleClearAll = () => {
    setSearchVal('');
    setSelectedCategory('');
    setOrganicOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
    setSearchParams({});
  };

  const activeCategory = categories.find((c: any) => String(c.id) === selectedCategory);
  const activeBanner = activeCategory ? (CATEGORY_BANNERS[activeCategory.slug] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80') : null;
  const activeDesc = activeCategory ? (CATEGORY_DESCRIPTIONS[activeCategory.slug] || '') : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">

      {/* Category Hero or Default Header */}
      {activeCategory && activeBanner ? (
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[32/10] w-full mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <img src={activeBanner} alt={activeCategory.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-center px-6 md:px-12 text-left space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary-light/95 dark:bg-primary-light/90 px-3 py-1 rounded-full w-fit">
              Browse Category
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white">{activeCategory.name}</h1>
            <p className="text-xs md:text-sm text-gray-200 max-w-md">{activeDesc}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Browse Groceries
            </h1>
            <p className="text-xs text-gray-400 mt-1">Sourced fresh from pesticide-free organic local farms</p>
          </div>

          {/* Dynamic Search */}
          <div className="w-full md:max-w-md relative flex">
            <input
              type="text"
              placeholder="Search catalog items..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setSearchParams({ search: e.target.value, category: selectedCategory });
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-primary focus:outline-none text-sm transition-all shadow-sm"
            />
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-white text-base flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
            </h3>
            <button onClick={handleClearAll} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
              Clear All
            </button>
          </div>

          {/* Categories select */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-gray-400 tracking-wide uppercase">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchParams({ search: searchVal });
                }}
                className={`text-left text-sm py-1.5 px-2 rounded-lg font-medium transition-colors ${selectedCategory === ''
                    ? 'bg-primary-light text-primary-dark font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                  }`}
              >
                All Categories
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(String(cat.id));
                    setSearchParams({ search: searchVal, category: String(cat.id) });
                  }}
                  className={`text-left text-sm py-1.5 px-2 rounded-lg font-medium transition-colors ${selectedCategory === String(cat.id)
                      ? 'bg-primary-light text-primary-dark font-bold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Organic switch */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <Leaf className="w-4 h-4 text-emerald-500" /> Organic Only
            </span>
            <button
              onClick={() => setOrganicOnly(!organicOnly)}
              className={`w-11 h-6 rounded-full transition-all relative ${organicOnly ? 'bg-primary' : 'bg-gray-200'
                }`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${organicOnly ? 'right-1' : 'left-1'
                }`} />
            </button>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-xs text-gray-400 tracking-wide uppercase">Price Range</h4>
            <form onSubmit={handlePriceApply} className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs focus:bg-white focus:border-primary focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs focus:bg-white focus:border-primary focus:outline-none"
              />
              <button type="submit" className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg font-bold">
                Go
              </button>
            </form>
          </div>

        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3 space-y-8">

          {/* Sorting and Summary Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-850 rounded-2xl">
            <span className="text-xs text-gray-400 font-semibold">{products.length} Products Available</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1.5 rounded-lg border-none focus:outline-none"
              >
                <option value="name">Alphabetical</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="h-72 rounded-2xl skeleton-shimmer"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 rounded-3xl p-8">
              <span className="text-4xl">🔎</span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-4">No Products Found</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">Try clearing some filters, searching for a different keyword or checking back later.</p>
              <button onClick={handleClearAll} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products.map(prod => (
                <div key={prod.id}>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-150 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 font-bold px-3">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-150 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProductCatalog;
