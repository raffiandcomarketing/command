'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#09203F] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-4 mb-12">
            <img src="/raffi-logo.svg" alt="Raffi" className="h-12 w-12 brightness-0 invert" />
            <div>
              <h1 className="text-white text-xl font-bold tracking-[0.25em]">RAFFI</h1>
              <p className="text-white/40 text-xs tracking-[0.2em] uppercase">Jewellers</p>
            </div>
          </div>
          <h2 className="text-white/90 text-4xl font-light leading-tight mb-6">
            Command<br />Centre
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Your luxury retail operating system. Manage departments, workflows, approvals, and KPIs from a single dashboard.
          </p>
          <div className="mt-16 flex gap-8">
            <div>
              <p className="text-white/90 text-2xl font-light">18</p>
              <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Departments</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-white/90 text-2xl font-light">5</p>
              <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Role levels</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-white/90 text-2xl font-light">24/7</p>
              <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Automation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <img src="/raffi-logo.svg" alt="Raffi" className="h-8 w-8" />
            <span className="text-[#09203F] font-bold tracking-[0.2em] text-sm">COMMAND CENTRE</span>
          </div>

          <div className="mb-10">
            <h2 className="text-[#09203F] text-2xl font-semibold">Welcome back</h2>
            <p className="text-gray-400 text-sm mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@raffi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09203F]/20 focus:border-[#09203F]/40 transition-all disabled:opacity-50"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#09203F]/20 focus:border-[#09203F]/40 transition-all disabled:opacity-50"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#09203F] text-white text-sm font-medium rounded-lg hover:bg-[#0a2848] active:bg-[#071a30] focus:outline-none focus:ring-2 focus:ring-[#09203F]/50 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-300 text-center tracking-wide">
              RAFFI JEWELLERS · LUXURY RETAIL OPERATING SYSTEM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
