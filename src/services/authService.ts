import { auth, loginWithGoogle as firebaseLogin, logout as firebaseLogout } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const login = async () => {
  return await firebaseLogin();
};

export const logoutUser = async () => {
  return await firebaseLogout();
};
