'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/context/I18nContext';
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  User, 
  Globe, 
  LogOut, 
  UserCheck, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { toast } from 'sonner';

interface DashboardShellProps {
  session: {
    userId: string;
    role: string;
    mobileNumber: string;
  };
  children: React.ReactNode;
}

export default function DashboardShell({ session, children }: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useTranslation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const toastShownRef = React.useRef(false);

  React.useEffect(() => {
    const authStatus = searchParams?.get('auth');
    if (authStatus === 'login' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success('Successfully logged in! Welcome back.');
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.pathname + url.search);
    } else if (authStatus === 'register' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success('Successfully registered! Welcome to the portal.');
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await logoutAction();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRADESHIK_ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'GHATAK_ADMIN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NRI_ADMIN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  // Define Navigation Items (Single Source of Truth)
  const navItems = [
    {
      label: t('home'),
      href: '/dashboard',
      icon: Home,
      roles: ['USER', 'GHATAK_ADMIN', 'PRADESHIK_ADMIN', 'SUPER_ADMIN', 'NRI_ADMIN'],
    },
    {
      label: t('family'),
      href: '/dashboard/family',
      icon: Users,
      roles: ['USER'],
    },
    {
      label: 'Registrations',
      href: '/dashboard/join-requests',
      icon: UserCheck,
      roles: ['NRI_ADMIN', 'SUPER_ADMIN'],
    },
    {
      label: session.role === 'NRI_ADMIN' ? 'Data Approvals' : t('requests'),
      href: '/dashboard/requests',
      icon: FileText,
      roles: ['USER', 'GHATAK_ADMIN', 'PRADESHIK_ADMIN', 'SUPER_ADMIN', 'NRI_ADMIN'],
    },
    {
      label: t('stats'),
      href: '/dashboard/stats',
      icon: BarChart3,
      roles: ['GHATAK_ADMIN', 'PRADESHIK_ADMIN', 'SUPER_ADMIN', 'NRI_ADMIN'],
    },
    {
      label: t('profile'),
      href: '/dashboard/profile',
      icon: User,
      roles: ['USER', 'GHATAK_ADMIN', 'PRADESHIK_ADMIN', 'SUPER_ADMIN', 'NRI_ADMIN'],
    },
    {
      label: 'Manage Users',
      href: '/dashboard/admin/users',
      icon: UserCheck,
      roles: ['SUPER_ADMIN'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(session.role));

  // Cap mobile bottom tab bar at 4 primary items + 1 "More" tab if total items > 5
  const primaryMobileNav = allowedNavItems.length > 5 ? allowedNavItems.slice(0, 4) : allowedNavItems;
  const extraMobileNav = allowedNavItems.length > 5 ? allowedNavItems.slice(4) : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5DDD0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#D4A373] flex items-center justify-center overflow-hidden p-0.5 shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-bold text-sm md:text-base text-[#8B5E3C] truncate max-w-[160px] sm:max-w-none">
              {t('samajTitle')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User Meta Card (Hidden on small screens) */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-[#2D2D2D]">{session.mobileNumber}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRoleBadgeColor(session.role)}`}>
                {session.role.replace('_', ' ')}
              </span>
            </div>

            {/* Language Switch */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1.5 rounded border border-[#E5DDD0] text-xs">
              <Globe className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent border-none outline-none font-medium text-[#8B5E3C] cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">हिन्दी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
            </div>

            {/* Logout (Desktop) */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 transition-all border border-red-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main layout frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 mb-20 md:mb-0">
        {/* Desktop Sidebar (Left side) */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border border-[#E5DDD0] rounded-lg p-4 h-[calc(100vh-8.5rem)] sticky top-24 shadow-xs justify-between">
          <div className="space-y-1">
            <div className="pb-3 border-b border-[#FAF7F2] mb-3">
              <p className="text-xs font-bold text-[#6A5B4D] uppercase tracking-wider px-3">
                Main Menu
              </p>
            </div>
            <nav className="space-y-1">
              {allowedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#8B5E3C] text-white shadow-xs'
                        : 'text-[#6A5B4D] hover:bg-[#FAF7F2] hover:text-[#8B5E3C]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-[#FAF7F2] pt-4 text-[10px] text-center text-[#6A5B4D] tracking-wider leading-relaxed">
            <p className="font-semibold text-[#8B5E3C]">Shri K.G.K. Samaj</p>
            <p>Community Census Portal</p>
          </div>
        </aside>

        {/* Dynamic Screen Content */}
        <main className="flex-1 min-w-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Shown on Mobile screens < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5DDD0] shadow-lg flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)] px-1">
        {primaryMobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-bold min-h-[44px] active:scale-95 transition-transform ${
                isActive ? 'text-[#8B5E3C]' : 'text-[#6A5B4D]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[64px] text-center">{item.label}</span>
            </Link>
          );
        })}

        {extraMobileNav.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-bold text-[#6A5B4D] min-h-[44px] active:scale-95 transition-transform cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-bold text-red-600 min-h-[44px] active:scale-95 transition-transform cursor-pointer"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span>{t('logout')}</span>
        </button>
      </nav>

      {/* Mobile "More" Sheet */}
      {showMoreMenu && extraMobileNav.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden">
          <div className="bg-white rounded-t-xl border-t border-[#E5DDD0] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E5DDD0] pb-3">
              <h3 className="text-sm font-serif font-bold text-[#8B5E3C]">Additional Controls</h3>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {extraMobileNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center gap-3 p-3 rounded text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                        : 'bg-[#FAF7F2] text-[#6A5B4D] border-[#E5DDD0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
