import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/common/authStore';
import CustomerHeader from '../../components/customer/CustomerHeader';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CustomerLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasCheckedAuth) {
      setHasCheckedAuth(true);

      if (!isAuthenticated) {
        console.log('🔓 CustomerLayout: 인증되지 않은 사용자, 랜딩 페이지로 이동');
        navigate('/', { replace: true });
      } else if (user && user.role !== 'customer') {
        const roleRoutes = {
          store_owner: '/store/dashboard',
          headquarters: '/hq/dashboard',
          hq_admin: '/hq/dashboard',
        };
        const defaultRoute = roleRoutes[user.role as keyof typeof roleRoutes] || '/';
        console.log(`🔄 CustomerLayout: ${user.role} 역할 사용자, ${defaultRoute}로 이동`);
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, hasCheckedAuth]);

  const loadBg = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-100';

  if (isLoading) {
    return (
      <div className={loadBg}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasCheckedAuth || !isAuthenticated) {
    return (
      <div className={loadBg}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user && user.role !== 'customer') {
    return (
      <div className={loadBg}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log('✅ CustomerLayout: 고객 사용자 확인, 페이지 렌더링');
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50/70 to-purple-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(147,51,234,0.12) 0%, transparent 40%), radial-gradient(circle at 50% 90%, rgba(99,102,241,0.12) 0%, transparent 45%)',
        }}
      />
      <div className="relative z-0">
        <CustomerHeader />
        <main className="pb-24">
          <Outlet />
        </main>
        <CustomerBottomNav />
      </div>
    </div>
  );
};

export default CustomerLayout;
