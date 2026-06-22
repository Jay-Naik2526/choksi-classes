import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            role: null, // 'sir' | 'student' | 'parent'

            setAuth: (user, token) => {
                // FIX #13: Don't double-store — api.js reads from localStorage.getItem('token')
                // which is the same key we set here; Zustand persist stores the full state
                localStorage.setItem('token', token);
                set({ user, token, role: user.role });
                // Request push notification permission after login
                setTimeout(() => {
                    import('../utils/pushNotifications').then(({ subscribeToPush }) => {
                        subscribeToPush().catch(() => {});
                    }).catch(() => {});
                }, 3000);
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, role: null });
                // Unsubscribe from push on logout
                import('../utils/pushNotifications').then(({ unsubscribeFromPush }) => {
                    unsubscribeFromPush().catch(() => {});
                }).catch(() => {});
            },
        }),
        {
            name: 'choksi-auth',
        }
    )
);

export default useAuthStore;