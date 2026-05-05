import { UserProfile } from "@/hooks/useAuth";

export const LIMITS = {
  FREE: {
    dailyReadings: 3,
    maxDialogueTurns: 2,
    maxCloudHistory: 5,
  },
  SHENG: {
    dailyReadings: 10,
    maxDialogueTurns: 8,
    maxCloudHistory: Infinity,
  }
};

export const isPaidUser = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  if (profile.subscriptionTier === "sheng") {
    // Basic expiry check: Assuming profile has subscriptionExpiry (timestamp)
    if (profile.subscriptionExpiry && profile.subscriptionExpiry < Date.now()) {
      return false;
    }
    return true;
  }
  return false;
};

export const getDailyReadingLimit = (profile: UserProfile | null): number => {
  return isPaidUser(profile) ? LIMITS.SHENG.dailyReadings : LIMITS.FREE.dailyReadings;
};

export const getMaxDialogueTurns = (profile: UserProfile | null): number => {
  return isPaidUser(profile) ? LIMITS.SHENG.maxDialogueTurns : LIMITS.FREE.maxDialogueTurns;
};

export const canSaveMoreReadings = (profile: UserProfile | null, currentCount: number): boolean => {
  if (isPaidUser(profile)) return true;
  return currentCount < LIMITS.FREE.maxCloudHistory;
};

export const canViewFullTenReport = (profile: UserProfile | null): boolean => {
  return isPaidUser(profile);
};
