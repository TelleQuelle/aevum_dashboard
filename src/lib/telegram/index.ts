'use client';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface WebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  start_param?: string;
  auth_date?: number;
  hash?: string;
}

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp;
  }
  return null;
};

export const getWebAppUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  if (webApp?.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user;
  }
  return null;
};

export const expandWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.expand();
  }
};

export const readyWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
  }
};
