import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    storeId,
    storeName,
    orderType,
    subtotal,
    taxAmount,
    deliveryFee,
    totalAmount,
    removeItem,
    updateQuantity,
    clearCart,
    setOrderType,
    calculateTotals
  } = useCartStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setIsUpdating(true);
    try {
      updateQuantity(productId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (window.confirm('이 상품을 장바구니에서 제거하시겠습니까?')) {
      removeItem(productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니의 모든 상품을 제거하시겠습니까?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    navigate('/customer/checkout');
  };

  const handleContinueShopping = () => {
    if (storeId) {
      navigate(`/customer/products?store=${storeId}`);
    } else {
      navigate('/customer/store');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-2xl border border-blue-100/80 bg-white/90 p-12 text-center shadow-lg shadow-blue-900/5 ring-1 ring-white/60 backdrop-blur-sm">
            <div className="mb-4 text-gray-400">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="mb-4 text-gray-600">장바구니가 비어있습니다.</p>
            <button
              onClick={handleContinueShopping}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-2.5 font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-600 hover:to-purple-700"
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-6 shadow-md shadow-blue-900/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                장바구니
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-600">
                {storeName} · 총 {items.length}개 상품
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleClearCart}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                장바구니 비우기
              </button>
              <button
                onClick={handleContinueShopping}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-600 hover:to-purple-700"
              >
                쇼핑 계속하기
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 장바구니 상품 목록 */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-md shadow-blue-900/5">
              <div className="border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-transparent p-6">
                <h2 className="text-lg font-bold text-gray-900">상품 목록</h2>
              </div>
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* 상품 이미지 */}
                      <div className="flex-shrink-0">
                        {(item.product.image_urls && item.product.image_urls.length > 0) || item.product.image_url ? (
                          <img
                            src={item.product.image_urls?.[0] || item.product.image_url}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.storeProduct.discount_rate > 0 ? (
                            <>
                              <span className="line-through text-gray-400">
                                {item.storeProduct.price.toLocaleString()}원
                              </span>
                              <span className="ml-2 text-red-600 font-medium">
                                {Math.round(item.storeProduct.price * (1 - item.storeProduct.discount_rate)).toLocaleString()}원
                              </span>
                            </>
                          ) : (
                            <span>{item.storeProduct.price.toLocaleString()}원</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          재고: {item.storeProduct.stock_quantity}개
                        </p>
                      </div>

                      {/* 수량 조절 */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          disabled={isUpdating || item.quantity >= item.storeProduct.stock_quantity}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* 소계 */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {item.subtotal.toLocaleString()}원
                        </p>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-blue-100/80 bg-white/95 p-6 shadow-lg shadow-blue-900/10 ring-1 ring-white/60 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">주문 요약</h2>
              
              {/* 주문 타입 선택 */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  주문 타입
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      orderType === 'pickup'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    픽업
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      orderType === 'delivery'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/25'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    배송
                  </button>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>부가세 (10%)</span>
                  <span>{taxAmount.toLocaleString()}원</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>{deliveryFee.toLocaleString()}원</span>
                  </div>
                )}
                <div className="border-t border-blue-100 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제 금액</span>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 주문하기 버튼 */}
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || isUpdating}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">처리 중...</span>
                  </div>
                ) : (
                  '주문하기'
                )}
              </button>

              {/* 안내 메시지 */}
              <div className="mt-4 text-xs text-gray-500">
                {orderType === 'delivery' && (
                  <p>• 2만원 이상 주문 시 배송비 무료</p>
                )}
                <p>• 주문 후 결제 페이지에서 결제 방법을 선택하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
