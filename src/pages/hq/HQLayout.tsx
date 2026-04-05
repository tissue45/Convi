import React from 'react';
import { Outlet } from 'react-router-dom';
import HQHeader from '../../components/hq/HQHeader';
import HQSidebar from '../../components/hq/HQSidebar';
import HQMobileNav from '../../components/hq/HQMobileNav';

const HQLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-red-50/50 to-pink-100/40">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(239,68,68,0.12) 0%, transparent 42%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 90%, rgba(244,114,182,0.08) 0%, transparent 45%)',
        }}
      />
      <div className="relative z-0 flex min-h-screen flex-col">
        <HQHeader />
        <HQMobileNav />
        <div className="flex min-h-0 flex-1">
          <HQSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HQLayout;
