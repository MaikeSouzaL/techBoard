import { create } from 'zustand';
import type { UserMode } from '@/lib/types';

interface AppState {
  userMode: UserMode;
  toggleUserMode: () => void;
  setUserMode: (mode: UserMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userMode: 'admin',

  toggleUserMode: () =>
    set(s => ({ userMode: s.userMode === 'admin' ? 'subscriber' : 'admin' })),

  setUserMode: (mode) => set({ userMode: mode }),
}));
