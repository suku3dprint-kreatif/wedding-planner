'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Calendar,
  DollarSign,
  Target,
  Gift,
  FileText,
  Users,
  Music,
  Phone,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Timeline', href: '/timeline', icon: Calendar },
  { label: 'Budget', href: '/budget', icon: DollarSign },
  { label: 'Tabungan', href: '/savings', icon: Target },
  { label: 'Seserahan', href: '/gifts', icon: Gift },
  { label: 'Administrasi', href: '/admin', icon: FileText },
  { label: 'Vendor', href: '/vendors', icon: Phone },
  { label: 'Tamu', href: '/guests', icon: Users },
  { label: 'Lagu', href: '/songs', icon: Music },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden">
        <div className="flex overflow-x-auto">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center border-t-2 px-3 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon className="mb-1 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-1 flex-col items-center justify-center border-t-2 border-transparent px-3 py-3 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <span className="text-xl">⋯</span>
            Lainnya
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:fixed md:left-0 md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
        <div className="border-b border-gray-200 px-6 py-8 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bismillah Nikah
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile More Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 top-auto bottom-20 z-40 bg-black/30 md:hidden">
          <div className="absolute bottom-20 left-0 right-0 flex flex-col border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            {navItems.slice(5).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center border-b border-gray-200 px-4 py-4 text-gray-900 hover:bg-gray-50 dark:border-gray-800 dark:text-white dark:hover:bg-gray-800"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-4 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
