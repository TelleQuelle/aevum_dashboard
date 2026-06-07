export type Platform = 'Telegram' | 'X' | 'TikTok' | 'Instagram' | 'Website';

export type ContentFormat = 
  | 'short_post' 
  | 'long_post' 
  | 'essay' 
  | 'thread' 
  | 'slideshow' 
  | 'video_script' 
  | 'interview' 
  | 'research_note';

export type Topic = 
  | 'DeFi' 
  | 'Stablecoins' 
  | 'Solana' 
  | 'Infrastructure' 
  | 'Wallets' 
  | 'Payments' 
  | 'AI Agents' 
  | 'Tokenomics' 
  | 'Market Structure' 
  | 'UX' 
  | 'Regulation' 
  | 'Macro' 
  | 'Other';

export interface Post {
  id: string;
  title: string;
  platform: Platform;
  format: ContentFormat;
  topic: Topic;
  language: string;
  publish_date: string;
  post_url?: string;
  hook?: string;
  description?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  subscriber_growth: number;
  notes?: string;
  what_worked?: string;
  what_did_not_work?: string;
  improvement_ideas?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriberSnapshot {
  id: string;
  date: string;
  subscriber_count: number;
  notes?: string;
  created_at: string;
}

export interface PlatformMetric {
  id: string;
  platform: Platform;
  date: string;
  followers: number;
  views: number;
  profile_visits: number;
  link_clicks: number;
  notes?: string;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface AllowedAdmin {
  id: string;
  telegram_user_id: string;
  username?: string;
  role: 'admin' | 'viewer';
  created_at: string;
}

export interface DashboardStats {
  totalSubscribers: number;
  subscriberGrowthToday: number;
  subscriberGrowthWeek: number;
  subscriberGrowthMonth: number;
  totalPosts: number;
  postsThisWeek: number;
  avgViews: number;
  avgEngagementRate: number;
  bestPerformingPost?: Post;
  bestPerformingTopic?: Topic;
  bestPerformingFormat?: ContentFormat;
  consistencyScore: number;
}

export interface TopicPerformance {
  topic: Topic;
  avgViews: number;
  avgEngagementRate: number;
  totalPosts: number;
  totalSaves: number;
  totalClicks: number;
}

export interface FormatPerformance {
  format: ContentFormat;
  avgViews: number;
  avgEngagementRate: number;
  totalSaves: number;
  totalClicks: number;
  frequency: number;
}
