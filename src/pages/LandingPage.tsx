import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../stores/common/authStore';
import SystemDemo from '../components/demo/SystemDemo';

const LandingPage: React.FC = () => {
  const { isAuthenticated, user, profile, signOut } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        window.location.reload();
      } else {
        console.warn('로그아웃 중 일부 오류:', result.error);
        window.location.reload();
      }
    } catch (error) {
      console.warn('로그아웃 중 예외 발생, 페이지 새로고침:', error);
      window.location.reload();
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/auth';

    switch (user.role) {
      case 'customer':
        return '/customer';
      case 'store_owner':
        return '/store';
      case 'headquarters':
      case 'hq_admin':
        return '/hq';
      default:
        return '/auth';
    }
  };

  const base = import.meta.env.BASE_URL;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15), transparent), radial-gradient(circle at 15% 40%, rgba(16,185,129,0.08), transparent 45%), radial-gradient(circle at 85% 30%, rgba(245,158,11,0.1), transparent 40%), radial-gradient(circle at 50% 100%, rgba(139,92,246,0.08), transparent 50%)',
        }}
      />

      <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/75 shadow-sm shadow-slate-900/5 backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-violet-500" aria-hidden />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-600 text-lg shadow-lg shadow-emerald-500/25">
              🏪
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Convi</h1>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">편의점 통합 솔루션</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden max-w-[8rem] truncate text-sm font-medium text-slate-600 sm:inline md:max-w-xs">
                  {profile?.first_name} {profile?.last_name}님
                </span>
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" className="rounded-xl font-semibold">
                    대시보드
                  </Button>
                </Link>
                <Button variant="ghost" className="rounded-xl font-semibold text-violet-700 hover:bg-violet-50" onClick={handleSignOut}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="rounded-xl font-semibold">
                    로그인
                  </Button>
                </Link>
                <Link to="/auth">
                  <span className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:from-emerald-700 hover:via-cyan-700 hover:to-indigo-700">
                    시작하기
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              고객 · 점주 · 본사를 잇는 한 플랫폼
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              편의점의{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                디지털 혁신
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              주문·재고·물류·분석까지 한곳에서. 매장 운영은 더 가볍게, 고객 경험은 더 편하게.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to="/auth" className="sm:flex-1 sm:max-w-xs">
                <span className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-base font-bold text-white shadow-xl shadow-emerald-500/30 transition hover:from-emerald-700 hover:to-cyan-700">
                  무료로 시작하기
                </span>
              </Link>
              <Link to="/manual" className="sm:flex-1 sm:max-w-xs">
                <span className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-slate-200 bg-white/90 text-base font-bold text-slate-800 shadow-md backdrop-blur-sm transition hover:border-indigo-200 hover:bg-indigo-50/50">
                  📋 사용자 매뉴얼
                </span>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-2xl border-2 border-violet-200 bg-violet-50/50 font-bold text-violet-900 hover:bg-violet-100 sm:flex-1 sm:max-w-xs"
                onClick={() => setShowDemo(true)}
              >
                데모 보기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-y border-slate-200/60 bg-white/60 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 text-center sm:gap-14">
          {[
            { n: '3in1', l: '고객·점주·본사' },
            { n: '실시간', l: '주문·재고 연동' },
            { n: '통합', l: '결제·물류·분석' },
          ].map((item) => (
            <div key={item.l}>
              <p className="text-2xl font-black text-transparent bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text sm:text-3xl">
                {item.n}
              </p>
              <p className="text-sm font-medium text-slate-500">{item.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">모든 것을 한 곳에서</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">역할별 화면이 분리되어 있어도, 데이터는 하나로 이어집니다.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="group rounded-3xl border border-emerald-100/80 bg-gradient-to-b from-white to-emerald-50/40 p-8 shadow-lg shadow-emerald-900/5 ring-1 ring-white transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/30 transition group-hover:scale-105">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-slate-900">고객</h3>
              <p className="mb-6 text-center text-slate-600">간편한 주문부터 픽업까지, 편리한 쇼핑 경험을 제공합니다.</p>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> 실시간 주문 상태 확인
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> 간편한 결제
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> 맞춤 추천·행사
                </li>
              </ul>
            </div>

            <div className="group rounded-3xl border border-amber-100/80 bg-gradient-to-b from-white to-amber-50/40 p-8 shadow-lg shadow-amber-900/5 ring-1 ring-white transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 transition group-hover:scale-105">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-slate-900">점주</h3>
              <p className="mb-6 text-center text-slate-600">매장 운영과 재고를 실시간으로 관리합니다.</p>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> 주문 처리·알림
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> 스마트 재고
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✓</span> 매출·재고 분석
                </li>
              </ul>
            </div>

            <div className="group rounded-3xl border border-violet-100/80 bg-gradient-to-b from-white to-violet-50/40 p-8 shadow-lg shadow-violet-900/5 ring-1 ring-white transition hover:-translate-y-1 hover:shadow-xl md:col-span-1">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 transition group-hover:scale-105">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-slate-900">본사</h3>
              <p className="mb-6 text-center text-slate-600">전 지점 통합 관리와 데이터 기반 의사결정을 지원합니다.</p>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> 지점·상품·회원 관리
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> 통합 매출 분석
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> 물류·승인 워크플로
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251,191,36,0.4), transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">지금 바로 시작하세요</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">무료로 가입하고 역할에 맞는 대시보드를 바로 써 보세요.</p>
          <div className="mt-10">
            <Link to="/auth">
              <span className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-base font-bold text-indigo-700 shadow-xl transition hover:bg-indigo-50">
                무료 계정 만들기
              </span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="relative border-t border-slate-800/80 bg-slate-950 text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 via-amber-500/50 via-violet-500/50 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 text-sm">🏪</span>
                <h3 className="text-lg font-bold">Convi</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">편의점 비즈니스의 디지털 혁신을 이끄는 통합 플랫폼입니다.</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">제품</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <button
                    type="button"
                    className="text-left transition hover:text-white"
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = base + 'auth';
                        return;
                      }
                      if (user?.role === 'customer') {
                        window.location.href = base + 'customer';
                      } else {
                        alert('계정을 확인해주세요!');
                      }
                    }}
                  >
                    고객 앱
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-left transition hover:text-white"
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = base + 'auth';
                        return;
                      }
                      if (user?.role === 'store_owner') {
                        window.location.href = base + 'store';
                      } else {
                        alert('계정을 확인해주세요!');
                      }
                    }}
                  >
                    점주 대시보드
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-left transition hover:text-white"
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = base + 'auth';
                        return;
                      }
                      if (user?.role === 'headquarters' || user?.role === 'hq_admin') {
                        window.location.href = base + 'hq';
                      } else {
                        alert('계정을 확인해주세요!');
                      }
                    }}
                  >
                    본사 관리 시스템
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">지원</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <button type="button" className="text-left transition hover:text-white" onClick={() => (window.location.href = base + 'support/customer')}>
                    고객센터
                  </button>
                </li>
                <li>
                  <button type="button" className="text-left transition hover:text-white" onClick={() => (window.location.href = base + 'support/qa')}>
                    문의하기
                  </button>
                </li>
                <li>
                  <button type="button" className="text-left transition hover:text-white" onClick={() => (window.location.href = base + 'support/faq')}>
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">회사</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <button type="button" className="text-left transition hover:text-white" onClick={() => (window.location.href = base + 'company/about')}>
                    소개
                  </button>
                </li>
                <li>
                  <button type="button" className="text-left transition hover:text-white" onClick={() => (window.location.href = base + 'company/careers')}>
                    채용
                  </button>
                </li>
                <li>
                  <button type="button" className="text-left transition hover:text-white" onClick={() => (window.location.href = base + 'company/privacy')}>
                    개인정보처리방침
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Convi · 편의점 솔루션. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <SystemDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
};

export default LandingPage;
