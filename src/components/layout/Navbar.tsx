'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          {/* Logo SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="48" height="48" className="flex-shrink-0">
            <defs>
              <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#3b9dd9',stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#1ec8a0',stopOpacity:1}} />
              </linearGradient>
            </defs>
            <rect x="30" y="35" width="85" height="115" rx="8" fill="url(#docGrad)"/>
            <rect x="42" y="52" width="28" height="4" rx="2" fill="#ffffff" opacity="0.8"/>
            <rect x="42" y="64" width="48" height="4" rx="2" fill="#ffffff" opacity="0.8"/>
            <rect x="42" y="76" width="48" height="4" rx="2" fill="#ffffff" opacity="0.8"/>
            <rect x="42" y="88" width="32" height="4" rx="2" fill="#ffffff" opacity="0.8"/>
            <circle cx="95" cy="105" r="42" fill="none" stroke="#1ec8a0" strokeWidth="4.5"/>
            <line x1="125" y1="135" x2="155" y2="165" stroke="#1ec8a0" strokeWidth="4.5" strokeLinecap="round"/>
            <circle cx="108" cy="38" r="5" fill="#3b9dd9"/>
          </svg>
          
          {/* Text branding */}
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-xl font-bold text-blue-600">Inv</span>
            <span className="text-xl font-bold text-green-600 -mt-1">Parser</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <span className="text-sm text-slate-600">
            Welcome, <span className="font-semibold text-slate-900">{user?.username}</span>
          </span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
