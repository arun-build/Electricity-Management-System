import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import { Sun, Moon, Menu, LogOut, Shield, User, Crown } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-amber-500/15 transition-colors shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Luxury Priority Grid indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/10 to-yellow-500/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wide shadow-xs">
          <Crown className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Priority Grid Active</span>
        </div>

        {/* Dark/Light Mode Switch */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-600 dark:text-amber-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-200 dark:border-amber-500/20 hover:border-amber-400/50 shadow-xs"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Info & Role Badge */}
        {user && (
          <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-amber-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-950/20 ring-2 ring-amber-400/30">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight font-serif tracking-wide">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Luxury Role Badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-400/15 via-yellow-500/10 to-amber-600/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 shadow-xs'
                  : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs'
              }`}
            >
              {isAdmin ? <Shield className="w-3 h-3 text-amber-500" /> : <User className="w-3 h-3 text-slate-400" />}
              {user.role}
            </span>

            {/* Logout action */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
