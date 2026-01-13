'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!login(username, password)) {
        setError('Invalid username or password. Try admin/admin');
        return;
      }
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">IP</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">InvParser</h1>
          <p className="text-slate-600 mt-2">Invoice Management Dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials</p>
              <div className="bg-slate-50 rounded p-3 space-y-1 text-xs">
                <p><span className="font-semibold">Username:</span> admin</p>
                <p><span className="font-semibold">Password:</span> admin</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
