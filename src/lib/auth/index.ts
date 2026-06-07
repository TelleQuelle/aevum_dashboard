import { supabase } from '../supabase';

export const checkAdminAccess = async (telegramId: string): Promise<boolean> => {
  if (!telegramId) return false;

  // For local development mock
  if (process.env.NODE_ENV === 'development' && telegramId === '123456789') {
    return true;
  }

  const { data, error } = await supabase
    .from('allowed_admins')
    .select('id')
    .eq('telegram_user_id', telegramId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
};
