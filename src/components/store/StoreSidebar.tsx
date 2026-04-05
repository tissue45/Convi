import React from 'react';
import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `mb-1 flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md shadow-green-500/30'
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'
  }`;

const StoreSidebar: React.FC = () => {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-green-100/70 bg-white/70 shadow-sm shadow-green-900/5 backdrop-blur-sm md:block lg:w-64">
      <div className="p-3 pt-6">
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-green-800/70">메뉴</p>
        <nav>
          <NavLink to="/store/dashboard" className={linkClass} end>
            <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            대시보드
          </NavLink>
          <NavLink to="/store/orders" className={linkClass}>
            <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            주문 관리
          </NavLink>
          <NavLink to="/store/inventory" className={linkClass}>
            <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            재고 관리
          </NavLink>
          <NavLink to="/store/supply" className={linkClass}>
            <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            물류 관리
          </NavLink>
          <NavLink to="/store/analytics" className={linkClass}>
            <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            매출 분석
          </NavLink>
          <NavLink to="/store/inventory-analytics" className={linkClass}>
            <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            재고 분석
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default StoreSidebar;
