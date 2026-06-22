import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { userService } from '@/services/userService';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  hasPermission: (roles: UserRole[]) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoading: false,

  login: async (name: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await userService.login(name, password);
      if (user) {
        userService.setCurrentUser(user);
        set({ currentUser: user, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    userService.clearCurrentUser();
    set({ currentUser: null });
  },

  getCurrentUser: async () => {
    const user = await userService.getCurrentUser();
    set({ currentUser: user });
  },

  hasPermission: (roles: UserRole[]) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  },
}));
