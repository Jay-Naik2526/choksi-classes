const CACHE = 'choksi-classes-v2';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    if (e.request.url.includes('/api/')) return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            const net = fetch(e.request).then(res => {
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => cached);
            return cached || net;
        })
    );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
    if (!e.data) return;
    let payload = {};
    try { payload = e.data.json(); } catch { payload = { title:'Choksi Classes', body: e.data.text() }; }

    const options = {
        body:    payload.body  || '',
        icon:    payload.icon  || '/favicon.svg',
        badge:   payload.badge || '/favicon.svg',
        tag:     payload.tag   || 'choksi-notification',
        data:    { url: payload.data?.url || '/' },
        actions: [{ action:'open', title:'Open App' }],
        vibrate: [200, 100, 200],
    };

    e.waitUntil(
        self.registration.showNotification(payload.title || 'Choksi Classes', options)
    );
});

self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    const url = e.notification.data?.url || '/';
    e.waitUntil(
        clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
            const existing = list.find(c => c.url.includes(self.location.origin) && 'focus' in c);
            if (existing) return existing.focus().then(c => c.navigate(url));
            return clients.openWindow(url);
        })
    );
});
