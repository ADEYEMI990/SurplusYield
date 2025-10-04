// client/src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type{ User } from "../types/User";

interface AuthState {
  user: User | null;
  token: string | null;
  role: "admin" | "user" | null;
  setAuth: (payload: { user: User; token: string; role: "admin" | "user" }) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setAuth: ({ user, token, role }) => {
        console.log("🔑 Setting auth state:", { user, token, role }); // debug
        set({ user, token, role });
      },
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          referralCode: state.user.referralCode || "",
          referralUrl: state.user.referralUrl || "",
        } : null,
        token: state.token,
        role: state.role,
      }),
    }
  )
);

export default useAuthStore;
