import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            role: null, // 'sir' | 'student' | 'parent'

            setAuth: (user, token) => {
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