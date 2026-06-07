import { Post } from '@/types';

/**
 * Calculates engagement rate for a post.
 * Formula: (likes + comments + shares + saves) / views * 100
 */
export const calculateEngagementRate = (post: Partial<Post>): number => {
  if (!post.views || post.views === 0) return 0;
  
  const engagement = 
    (post.likes || 0) + 
    (post.comments || 0) + 
    (post.shares || 0) + 
    (post.saves || 0);
    
  return (engagement / post.views) * 100;
};

/**
 * Calculates conversion score for a post.
 * Weighted score based on deep engagement metrics.
 * Normalize to 0-100.
 */
export const calculateConversionScore = (post: Partial<Post>): number => {
  if (!post.views || post.views === 0) return 0;

  const weights = {
    saves: 3,
    shares: 3,
    comments: 2,
    clicks: 4,
    subscriber_growth: 5
  };

  const weightedSum = 
    ((post.saves || 0) * weights.saves) +
    ((post.shares || 0) * weights.shares) +
    ((post.comments || 0) * weights.comments) +
    ((post.clicks || 0) * weights.clicks) +
    ((post.subscriber_growth || 0) * weights.subscriber_growth);

  // Normalization factor: This is arbitrary and depends on expected volume.
  // We'll use a baseline of 500 weighted points per 1000 views for a 100 score.
  const score = (weightedSum / (post.views / 1000)) / 5;
  
  return Math.min(Math.round(score), 100);
};

/**
 * Calculates content consistency score.
 * Formula: (actual posts / planned posts) * 100
 */
export const calculateConsistencyScore = (actual: number, planned: number): number => {
  if (planned === 0) return 100;
  const score = (actual / planned) * 100;
  return Math.min(Math.round(score), 100);
};

/**
 * Returns a human-readable interpretation of the consistency score.
 */
export const getConsistencyLabel = (score: number): string => {
  if (score >= 100) return 'Perfect execution';
  if (score >= 70) return 'Slightly inconsistent';
  if (score >= 40) return 'Unstable';
  return 'Weak execution';
};

/**
 * Compare a value against an average and return percentage difference.
 */
export const compareToAverage = (value: number, average: number): number => {
  if (average === 0) return value > 0 ? 100 : 0;
  return Math.round(((value - average) / average) * 100);
};
