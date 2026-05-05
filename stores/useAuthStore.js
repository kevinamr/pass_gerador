import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,

            salvarToken: (token) => set({ token }),

            removerToken: () => set({ token: null }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);