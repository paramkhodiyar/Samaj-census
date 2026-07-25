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
    userName?: string;
    familyId?: string | null;
  };
  children: React.ReactNode;
}

const GREETING_LISTS = {
  en: ['Jay Shree Krishna', 'Jay Swaminarayan', 'Ram Ram', 'Namaste', 'Pranam', 'Jai Jinendra', 'Welcome'],
  hi: ['जय श्री कृष्णा', 'जय स्वामीनारायण', 'राम राम', 'नमस्ते', 'प्रणाम', 'जय जिनेन्द्र', 'स्वागत है'],
  gu: ['જય શ્રી કૃષ્ણ', 'જય સ્વામિનારાયણ', 'રામ રામ', 'નમસ્તે', 'પ્રણામ', 'જય જિનેન્દ્ર', 'સ્વાગત છે'],
};

export default function DashboardShell({ session, children }: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useTranslation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Rotating greeting state with premium slide-up ticker animation
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [animClass, setAnimClass] = useState('translate-y-0 opacity-100');

  React.useEffect(() => {
    const interval = setInterval(() => {
      // 1. Slide UP and fade out (exit transition)
      setAnimClass('-translate-y-full opacity-0 transition-all duration-400 ease-in');
      
      setTimeout(() => {
        // 2. Teleport to bottom instantly while invisible
        setGreetingIndex((prev) => (prev + 1) % GREETING_LISTS.en.length);
        setAnimClass('translate-y-full opacity-0');
        
        // 3. Slide up to center and fade in (enter transition)
        setTimeout(() => {
          setAnimClass('translate-y-0 opacity-100 transition-all duration-400 ease-out');
        }, 30);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
            <div className="w-11 h-11 rounded-full bg-white border border-[#D4A373] flex items-center justify-center overflow-hidden p-1 shrink-0">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-bold text-sm md:text-base text-[#8B5E3C] truncate max-w-[160px] sm:max-w-none">
              {t('samajTitle')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Animated Dynamic Indian Greeting Card */}
            <div className="hidden sm:flex items-center">
              <div className="border-l-2 border-[#8B5E3C] bg-[#FAF7F2]/80 px-3 py-1.5 text-xs font-serif font-bold text-[#8B5E3C] flex items-center gap-2 overflow-hidden shadow-2xs rounded-r-md">
                <svg className="w-4 h-4 text-[#8B5E3C] shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path className="animate-pulse origin-bottom" d="M12 2c-.5 1.5-2 3.5-2 5.5s1.5 3.5 2 3.5 2-1.5 2-3.5S12.5 3.5 12 2z" />
                  <path d="M4 14c0 3.866 3.582 7 8 7s8-3.134 8-7c0-1.8-1.5-3.5-3-4.5-1.5-1-3-1.5-5-1.5s-3.5.5-5 1.5c-1.5 1-3 2.7-3 4.5z" />
                </svg>
                <div className="h-4 overflow-hidden relative min-w-[140px] md:min-w-[170px]">
                  <div className={`absolute transform ${animClass}`}>
                    {GREETING_LISTS[language as keyof typeof GREETING_LISTS]?.[greetingIndex] || GREETING_LISTS.en[greetingIndex]}, {session.userName || 'Member'}
                  </div>
                </div>
              </div>
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

          <div className="border-t border-[#E5DDD0]/60 pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs px-1 bg-[#FAF7F2] p-2 rounded-lg border border-[#E5DDD0]/50">
              <span className="text-[10px] font-bold text-[#6A5B4D] uppercase tracking-wider">{t('role')}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRoleBadgeColor(session.role)}`}>
                {session.role.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[10px] text-center text-[#6A5B4D] tracking-wider leading-relaxed pt-1">
              <p className="font-semibold text-[#8B5E3C]">Shri K.G.K. Samaj</p>
              <p>Community Census Portal</p>
            </div>
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
