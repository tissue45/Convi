import React from 'react';
import { useAuthStore } from '../../stores/common/authStore';
import { useNavigate } from 'react-router-dom';

const HQHeader: React.FC = () => {
  const { profile, signOut, forceSignOut } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-red-100/80 bg-white/85 shadow-sm shadow-red-900/5 backdrop-blur-md">
      <div
        className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-500"
        aria-hidden
      />
      <div className="px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/hq/dashboard')}
            className="flex min-w-0 items-center gap-3 rounded-xl text-left transition-opacity hover:opacity-90"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-pink-600 text-lg shadow-md shadow-red-500/35">
              🏢
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight text-slate-900">본사 관리</p>
              <p className="truncate text-xs font-medium text-red-700/90">지점 · 상품 · 물류 통합</p>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-600 sm:inline">
              {profile?.first_name} {profile?.last_name}
            </span>
            <button
              type="button"
              onClick={async () => {
                console.log('🔓 HQ 로그아웃 버튼 클릭');
                try {
                  const result = await signOut();
                  console.log('🔓 로그아웃 결과:', result);

                  if (result.success) {
                    setTimeout(() => {
                      console.log('🔄 성공 후 페이지 이동');
                      navigate('/');
                    }, 1000);
                  } else {
                    console.warn('⚠️ 일반 로그아웃 실패, 강제 로그아웃 시도');
                    forceSignOut();
                  }
                } catch (error) {
                  console.warn('⚠️ 로그아웃 중 예외, 강제 로그아웃:', error);
                  forceSignOut();
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

export default HQHeader;
