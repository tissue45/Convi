import React from 'react';
import { useAuthStore } from '../../stores/common/authStore';
import { useNavigate } from 'react-router-dom';

const StoreHeader: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-green-100/80 bg-white/85 shadow-sm shadow-green-900/5 backdrop-blur-md">
      <div
        className="h-1 w-full bg-gradient-to-r from-green-500 via-teal-500 to-emerald-600"
        aria-hidden
      />
      <div className="px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/store/dashboard')}
            className="flex min-w-0 items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-90"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 text-lg shadow-md shadow-green-500/35">
              🏬
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight text-slate-900">점주 대시보드</p>
              <p className="truncate text-xs font-medium text-green-700/90">매장 운영 · 주문 · 재고</p>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-600 sm:inline">
              {profile?.first_name} {profile?.last_name}
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
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
