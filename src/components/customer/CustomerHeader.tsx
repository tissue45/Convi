import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import { useCartStore } from '../../stores/cartStore';
import Cart from './Cart';

const CustomerHeader: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getDisplayName = () => {
    if (profile) {
      return `${profile.first_name} ${profile.last_name}`.trim() || '고객';
    }
    return '고객';
  };

  const itemCount = getItemCount();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/80 shadow-sm shadow-blue-900/5 backdrop-blur-md">
        <div
          className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
          aria-hidden
        />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigate('/customer/home')}
              className="flex min-w-0 items-center gap-2 rounded-xl text-left transition-opacity hover:opacity-90"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-lg shadow-md shadow-blue-500/30">
                🏪
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold tracking-tight text-gray-900">Convi</p>
                <p className="truncate text-xs font-medium text-blue-600/90">고객 쇼핑</p>
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-xl p-2.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                aria-label="장바구니 미리보기"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-1 text-xs font-bold text-white shadow-sm">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/cart')}
                className="hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-600 hover:to-purple-700 sm:inline"
              >
                장바구니
              </button>

              <span className="hidden max-w-[5.5rem] truncate text-xs font-medium text-gray-600 sm:inline md:max-w-[8rem]">
                {getDisplayName()}님
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.reload();
                  } catch (error) {
                    console.warn('로그아웃 중 오류, 페이지 새로고침:', error);
                    window.location.reload();
                  }
                }}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-purple-600 transition hover:bg-purple-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default CustomerHeader;
