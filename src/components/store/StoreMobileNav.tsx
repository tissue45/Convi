import React from 'react';
import { NavLink } from 'react-router-dom';

const pillClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
    isActive
      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-sm'
      : 'bg-white/90 text-slate-600 ring-1 ring-slate-200/80 hover:bg-green-50'
  }`;

/** md 미만에서 사이드바 대신 표시 */
const StoreMobileNav: React.FC = () => {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-green-100/70 bg-white/60 px-3 py-2 backdrop-blur-sm md:hidden">
      <NavLink to="/store/dashboard" className={pillClass} end>
        대시보드
      </NavLink>
      <NavLink to="/store/orders" className={pillClass}>
        주문
      </NavLink>
      <NavLink to="/store/inventory" className={pillClass}>
        재고
      </NavLink>
      <NavLink to="/store/supply" className={pillClass}>
        물류
      </NavLink>
      <NavLink to="/store/analytics" className={pillClass}>
        매출
      </NavLink>
      <NavLink to="/store/inventory-analytics" className={pillClass}>
        재고분석
      </NavLink>
    </nav>
  );
};

export default StoreMobileNav;
