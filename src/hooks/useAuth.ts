import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { subscribeToAuthChanges, login, logoutUser } from "@/services/authService";
import { initializeUserProfile } from "@/services/readingService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        await initializeUserProfile(user);
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const loggedInUser = await login();
      if (loggedInUser) {
        await initializeUserProfile(loggedInUser);
      }
      return loggedInUser;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  return { user, loading, login: handleLogin, logout: handleLogout };
};
