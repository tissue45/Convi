import React from 'react';
import { Outlet } from 'react-router-dom';
import StoreHeader from '../../components/store/StoreHeader';
import StoreSidebar from '../../components/store/StoreSidebar';
import StoreMobileNav from '../../components/store/StoreMobileNav';

const StoreLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-green-50/40 to-teal-50/50">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(34,197,94,0.14) 0%, transparent 42%), radial-gradient(circle at 85% 15%, rgba(20,184,166,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 85%, rgba(16,185,129,0.08) 0%, transparent 45%)',
        }}
      />
      <div className="relative z-0 flex min-h-screen flex-col">
        <StoreHeader />
        <StoreMobileNav />
        <div className="flex min-h-0 flex-1">
          <StoreSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoreLayout;
