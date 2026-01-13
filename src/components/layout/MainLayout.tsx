'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Navbar } from './Navbar';

const navigationItems = [
  // Core
  { href: '/dashboard', label: 'Dashboard', icon: '📊', group: 'Core' },
  { href: '/upload', label: 'Upload Invoice', icon: '📁', group: 'Core' },
  { href: '/invoices', label: 'All Invoices', icon: '📋', group: 'Core' },
  { href: '/favorites', label: 'Favorites', icon: '⭐', group: 'Core' },
  
  // Analytics & Reports
  { href: '/analytics', label: 'Analytics', icon: '📈', group: 'Analytics' },
  { href: '/reports', label: 'Reports', icon: '📄', group: 'Analytics' },
  { href: '/vendors', label: 'Vendors', icon: '🏢', group: 'Analytics' },
  
  // Management
  { href: '/approvals', label: 'Approvals', icon: '✓', group: 'Management' },
  { href: '/bulk-operations', label: 'Bulk Ops', icon: '⚙️', group: 'Management' },
  { href: '/duplicate-detection', label: 'Duplicates', icon: '🔍', group: 'Management' },
  
  // System
  { href: '/activity-log', label: 'Activity Log', icon: '📝', group: 'System' },
  { href: '/archive', label: 'Archive', icon: '🗂️', group: 'System' },
  { href: '/integrations', label: 'Integrations', icon: '🔗', group: 'System' },
  { href: '/settings', label: 'Settings', icon: '⚙️', group: 'System' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRequireAuth();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 overflow-y-auto max-h-screen">
          <nav className="space-y-1">
            {(() => {
              const groups = new Map<string, typeof navigationItems>();
              navigationItems.forEach((item) => {
                if (!groups.has(item.group)) {
                  groups.set(item.group, []);
                }
                groups.get(item.group)!.push(item);
              });

              return Array.from(groups.entries()).map(([groupName, items]) => (
                <div key={groupName} className="mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase px-4 mb-2">{groupName}</p>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                            transition-colors duration-200
                            ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
