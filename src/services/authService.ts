import { auth, loginWithGoogle as firebaseLogin, logout as firebaseLogout, sendOTP as firebaseSendOTP, verifyOTP as firebaseVerifyOTP } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const login = async () => {
  return await firebaseLogin();
};

export const sendOTP = async (email: string) => {
  return await firebaseSendOTP(email);
};

export const verifyOTP = async (email: string, otp: string) => {
  return await firebaseVerifyOTP(email, otp);
};

export const logoutUser = async () => {
  return await firebaseLogout();
};
