// client/src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: unknown | null;
  token: string | null;
  role: "admin" | "user" | null;
  setAuth: (payload: { user: unknown; token: string; role: "admin" | "user" }) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setAuth: ({ user, token, role }) =>
        set({ user, token, role }),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: "auth-storage", // key in localStorage
    }
  )
);

export default useAuthStore;
