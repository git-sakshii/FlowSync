import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from './api-client';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: 'ADMIN' | 'MEMBER';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: (user, tokens) => {
                localStorage.setItem('token', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);
                set({ user, isAuthenticated: true, isLoading: false });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                set({ user: null, isAuthenticated: false, isLoading: false });
            },

            updateUser: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                }));
            },

            checkAuth: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        set({ user: null, isAuthenticated: false, isLoading: false });
                        return;
                    }

                    const { data } = await api.get('/auth/me');
                    set({ user: data, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
