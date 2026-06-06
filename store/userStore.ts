import { create } from 'zustand';

interface UserState {
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
}

export const userStore = create<UserState>((set) => ({
    isAdmin: false,
    setIsAdmin: (isAdmin) => set({ isAdmin }),
}));