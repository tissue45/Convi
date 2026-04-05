import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { validateInventoryAvailability, getRealTimeStock, type InventoryItem } from '../../lib/inventory/inventoryManager';
import type { Product, Category, StoreProduct } from '../../types/common';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import Cart from '../../components/customer/Cart';
import { useCartStore } from '../../stores/cartStore';
import { WishlistButton } from '../../components/common/WishlistButton';
import { useAuthStore } from '../../stores/common/authStore';
import { ProductCard } from '../../components/product/ProductCard';
import { useToast } from '../../hooks/useToast';

interface ProductWithStock extends Product {
  store_products: StoreProduct[];
  promotionInfo?: {
    promotion_type: 'buy_one_get_one' | 'buy_two_get_one' | null;
    promotion_name: string | null;
  };
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistedProducts, setWishlistedProducts] = useState<Record<string, boolean>>({});
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const { addItem, getItemCount, items } = useCartStore();
  const { showWarning, showSuccess } = useToast();

  // 선택된 지점 정보 가져오기
  const selectedStore = JSON.parse(localStorage.getItem('selectedStore') || '{}');

  // 찜 목록 로드
  const loadWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const wishlistMap: Record<string, boolean> = {};
      data.forEach(item => {
        wishlistMap[item.product_id] = true;
      });
      setWishlistedProducts(wishlistMap);
    } catch (error) {
      console.error('찜 목록 로드 중 오류:', error);
    }
  };

  useEffect(() => {
    if (!selectedStore.id) {
      // 지점이 선택되지 않았으면 지점 선택 페이지로 이동
      navigate('/customer/store');
      return;
    }
    
    // URL 파라미터에서 카테고리 정보 읽기
    const categorySlug = searchParams.get('category');
    const categoryName = location.state?.categoryName;

    // 찜 목록 로드
    loadWishlist();
    
    fetchCategories().then(() => {
      // 카테고리 데이터 로드 후 URL 파라미터 처리
      if (categorySlug) {
        const category = categories.find(cat => cat.slug === categorySlug);
        if (category) {
          setSelectedCategory(category.id);
        }
      }
    });
    
    fetchProducts();
  }, [selectedStore.id, selectedCategory, navigate, searchParams, location.state]);

  const fetchCategories = async () => {
    try {
      console.log('📂 카테고리 데이터 조회 중...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      
      setCategories(data || []);
      console.log('📂 카테고리 데이터 로드 완료:', data?.length || 0, '개');
      
      // URL 파라미터에서 카테고리 정보 읽기 (카테고리 로드 후)
      const categorySlug = searchParams.get('category');
      if (categorySlug) {
        const category = data?.find(cat => cat.slug === categorySlug);
        if (category) {
          setSelectedCategory(category.id);
        }
      }
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('카테고리를 불러오는데 실패했습니다.');
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('🛍️ 상품 데이터 조회 중...');
      setLoading(true);
      setError(null);

      // 선택된 지점의 상품만 조회
      let query = supabase
        .from('products')
        .select(`
          *,
          store_products!inner(*)
        `)
        .eq('store_products.store_id', selectedStore.id)
        .eq('store_products.is_available', true)
        .eq('is_active', true);

      // 카테고리 필터 적용
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // 행사 정보 가져오기 (전체 매장 행사 + 해당 지점 행사)
      const { data: promotionData, error: promotionError } = await supabase
        .from('promotion_products')
        .select(`
          product_id,
          store_id,
          promotions!inner(
            name,
            promotion_type
          )
        `)
        .or(`store_id.is.null,store_id.eq.${selectedStore.id}`) // 전체 매장 행사 또는 해당 지점 행사
        .eq('promotions.is_active', true);

      if (promotionError) {
        console.error('행사 정보 조회 오류:', promotionError);
      }

      // 행사 정보를 상품 데이터에 추가
      const productsWithPromotion = (data || []).map((product: any) => {
        const promotion = promotionData?.find(p => p.product_id === product.id);
        return {
          ...product,
          promotionInfo: promotion ? {
            promotion_type: promotion.promotions.promotion_type,
            promotion_name: promotion.promotions.name
          } : {
            promotion_type: null,
            promotion_name: null
          }
        };
      });
      
      setProducts(productsWithPromotion);
      console.log('🛍️ 상품 데이터 로드 완료:', productsWithPromotion?.length || 0, '개');
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = useCallback(async (product: ProductWithStock) => {
    const storeProduct = product.store_products[0];
    
    try {
      // 1. 실시간 재고 확인
      const realTimeStock = await getRealTimeStock(selectedStore.id, [product.id]);
      const currentStock = realTimeStock[product.id] || 0;
      
      // 2. 현재 장바구니에 담긴 수량 확인
      const cartItem = items.find(item => item.product.id === product.id);
      const cartQuantity = cartItem ? cartItem.quantity : 0;
      const availableStock = currentStock - cartQuantity;
      
      if (availableStock <= 0) {
        showWarning('재고 부족', `${product.name}은(는) 재고가 부족합니다. (현재 재고: ${currentStock}개, 장바구니: ${cartQuantity}개)`);
        return;
      }
      
      // 3. 재고 가용성 검증 (추가로 1개 담을 수 있는지)
      const inventoryValidation = await validateInventoryAvailability(
        selectedStore.id,
        [{ productId: product.id, productName: product.name, quantity: cartQuantity + 1 }]
      );
      
      if (!inventoryValidation.isValid) {
        showWarning('재고 부족', inventoryValidation.errors.join(', '));
        return;
      }
      
      // 4. 장바구니에 추가
      const storeProductWithPromotion = {
        ...storeProduct,
        stock_quantity: currentStock, // 실시간 재고로 업데이트
        promotionType: product.promotionInfo?.promotion_type || null,
        promotionName: product.promotionInfo?.promotion_name || null
      };
      
      console.log(`🛒 장바구니 추가: ${product.name} (실시간 재고: ${currentStock}개, 장바구니: ${cartQuantity} → ${cartQuantity + 1})`);
      addItem(product, storeProductWithPromotion, 1);
      
      // 5. 행사 상품인 경우 알림
      if (product.promotionInfo?.promotion_type) {
        const isOneOnePromotion = product.promotionInfo.promotion_type === 'buy_one_get_one';
        const promotionTitle = isOneOnePromotion ? '1+1 행사!' : '2+1 행사!';
        const promotionMessage = isOneOnePromotion 
          ? '2개 담으면 1개 가격! 🎉'
          : '3개 담으면 2개 가격! 🎉';
        
        showSuccess(promotionTitle, promotionMessage);
      }
      
    } catch (error) {
      console.error('❌ 실시간 재고 확인 실패:', error);
      showWarning('재고 확인 실패', '재고 정보를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [items, addItem, showWarning, showSuccess, selectedStore.id]);

  const goBackToStoreSelection = () => {
    console.log('🔄 지점 변경 버튼 클릭');
    localStorage.removeItem('selectedStore');
    
    // 지점 선택 페이지로 이동
    const targetRoute = '/customer/store';
    console.log('🎯 이동할 경로:', targetRoute);
    navigate(targetRoute);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // URL 업데이트 (선택적)
    if (categoryId === 'all') {
      navigate('/customer/products', { replace: true });
    } else {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        navigate(`/customer/products?category=${category.slug}`, { replace: true });
      }
    }
  };

  // 현재 선택된 카테고리 이름 가져오기
  const getCurrentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return '전체 상품';
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : '전체 상품';
  }, [selectedCategory, categories]);

  if (!selectedStore.id) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">지점을 먼저 선택해주세요.</div>
          <button 
            onClick={goBackToStoreSelection}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            지점 선택하기
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            다시 시도
          </button>
          <button 
            onClick={goBackToStoreSelection}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            지점 다시 선택
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-6 shadow-md shadow-blue-900/5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-gray-900">{selectedStore.name}</h1>
              <p className="truncate text-sm text-gray-600">{selectedStore.address}</p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200/60">
                <span aria-hidden>📂</span> {getCurrentCategoryName}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-xl p-2.5 text-gray-600 transition hover:bg-white/80 hover:text-blue-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-sm">
                    {getItemCount()}
                  </span>
                )}
              </button>
              
              <button
                onClick={goBackToStoreSelection}
                className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-purple-600 ring-1 ring-purple-200/60 transition hover:bg-purple-50"
              >
                지점 변경
              </button>
            </div>
          </div>
          
          {/* 검색 */}
          <div className="relative">
            <input
              type="text"
              placeholder="상품 검색..."
              className="w-full rounded-xl border border-blue-100/80 bg-white/90 p-3 pl-10 shadow-inner ring-1 ring-white/60 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* 카테고리 필터 */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-md shadow-blue-900/5 backdrop-blur-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" aria-hidden />
            카테고리
          </h2>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            <button
              className={`rounded-full px-6 py-3 whitespace-nowrap font-semibold shadow-sm transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              🏪 전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`rounded-full px-6 py-3 whitespace-nowrap font-semibold shadow-sm transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const storeProduct = product.store_products[0];
              
              // 장바구니에 담긴 수량 계산
              const cartItem = items.find(item => item.product.id === product.id);
              const cartQuantity = cartItem ? cartItem.quantity : 0;
              
              // 실시간 재고 계산 (원래 재고 - 장바구니 수량)
              const realTimeStock = storeProduct.stock_quantity - cartQuantity;

              // 상품 데이터를 ProductCard에 맞게 변환
              const productWithStoreData = {
                ...product,
                base_price: storeProduct.price,
                discount_rate: storeProduct.discount_rate,
                stock_quantity: realTimeStock,
                safety_stock: storeProduct.safety_stock,
                price: storeProduct.price, // 기본 price 필드도 유지
                promotionInfo: product.promotionInfo // 행사 정보 추가
              };

              return (
                <ProductCard
                  key={product.id}
                  product={productWithStoreData}
                  showWishlist={!!user}
                  isWishlisted={wishlistedProducts[product.id] || false}
                  onWishlistToggle={(newState) => {
                    setWishlistedProducts(prev => ({
                      ...prev,
                      [product.id]: newState
                    }));
                  }}
                  showGallery={true}
                  onAddToCart={() => addToCart(product)}
                />
              );
            })}
          </div>
        )}
        
        {/* 상품이 없는 경우 */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm ? '검색 결과가 없습니다.' : `${getCurrentCategoryName}에 등록된 상품이 없습니다.`}
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                전체 상품 보기
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* 장바구니 */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ProductCatalog;