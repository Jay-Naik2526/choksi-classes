import api from './api';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export async function subscribeToPush() {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;

        const { data } = await api.get('/push/vapid-key');
        if (!data.publicKey) return false;

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });

        await api.post('/push/subscribe', { subscription: sub.toJSON() });
        return true;
    } catch (err) {
        console.warn('Push subscription failed:', err.message);
        return false;
    }
}

export async function unsubscribeFromPush() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        await api.delete('/push/unsubscribe');
        return true;
    } catch (err) {
        return false;
    }
}

export async function isPushSubscribed() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        return !!sub;
    } catch {
        return false;
    }
}
