import React from 'react';
import { NavLink } from 'react-router-dom';

const pillClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
    isActive
      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-sm'
      : 'bg-white/90 text-slate-600 ring-1 ring-slate-200/80 hover:bg-red-50'
  }`;

const HQMobileNav: React.FC = () => {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-red-100/70 bg-white/60 px-3 py-2 backdrop-blur-sm md:hidden">
      <NavLink to="/hq/dashboard" className={pillClass} end>
        대시보드
      </NavLink>
      <NavLink to="/hq/stores" className={pillClass}>
        지점
      </NavLink>
      <NavLink to="/hq/products" className={pillClass}>
        상품
      </NavLink>
      <NavLink to="/hq/supply" className={pillClass}>
        물류
      </NavLink>
      <NavLink to="/hq/members" className={pillClass}>
        회원
      </NavLink>
      <NavLink to="/hq/analytics" className={pillClass}>
        분석
      </NavLink>
    </nav>
  );
};

export default HQMobileNav;
