'use client';

import { useEffect, useState } from 'react';
import { BottomNav } from '../navigation/BottomNav';
import { getWebAppUser, expandWebApp, readyWebApp } from '@/lib/telegram';
import { checkAdminAccess } from '@/lib/auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      expandWebApp();
      readyWebApp();

      const user = getWebAppUser();
      
      // For development, we allow access if no Telegram user is found (mocking)
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
        setIsLoading(false);
        return;
      }

      const hasAccess = await checkAdminAccess(user.id.toString());
      setIsAuthorized(hasAccess);
      setIsLoading(false);
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050608] text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">AEVUM</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050608] text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">This dashboard is restricted to AEVUM administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-gray-100 pb-20">
      <main className="max-w-md mx-auto px-4 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
