import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { subscribeToAuthChanges, login, logoutUser } from "@/services/authService";
import { initializeUserProfile } from "@/services/readingService";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  subscriptionTier: "free" | "sheng";
  subscriptionExpiry?: number;
  localMigrationCompleted?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthChanges(async (authUser) => {
      if (authUser) {
        await initializeUserProfile(authUser);
        
        // Listen to the user document for profile changes
        unsubscribeProfile = onSnapshot(doc(db, "users", authUser.uid), (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const loggedInUser = await login();
      if (loggedInUser) {
        await initializeUserProfile(loggedInUser);
      }
      return loggedInUser;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
        return null;
      }

      // Handle Firebase internal assertion failed errors which can happen in iframe environments
      if (error.message?.includes("INTERNAL ASSERTION FAILED")) {
        console.error("Firebase Internal Error:", error);
        alert("认证系统遇到内部异常。这通常是因为浏览器环境限制（如 iFrame）导致的。请尝试刷新页面，或在独立标签页中打开应用。");
        return null;
      }

      console.error("Login Error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  return { 
    user, 
    profile,
    subscriptionTier: profile?.subscriptionTier || "free",
    loading, 
    login: handleLogin, 
    logout: handleLogout 
  };
};
