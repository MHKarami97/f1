/**
 * FINAL — public/push-sw.js
 *
 * Real Web Push listener. Merged into the Workbox-generated service worker
 * via `workbox.importScripts` in vite.config.ts (see SETUP.md).
 * We keep `generateSW` (so the existing OpenF1 runtime-caching block stays
 * untouched) and only add the two listeners Workbox doesn't provide:
 * 'push' and 'notificationclick'. Reference:
 * https://github.com/vite-pwa/docs/issues/132
 */

self.addEventListener('push', (event) => {
  /** @type {{ title: string, body: string, url?: string, icon?: string }} */
  let payload = { title: 'F1', body: '' };

  try {
    if (event.data) payload = event.data.json();
  } catch (err) {
    console.error('[push-sw] failed to parse push payload', err);
    return;
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon ?? '/icon192.png',
    badge: '/icon96.png',
    dir: 'rtl',
    lang: 'fa',
    tag: payload.url ?? 'f1-race-reminder',
    renotify: true,
    data: { url: payload.url ?? '/' },
  };

  event.waitUntil(self.registration.showNotification(payload.title, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((client) => client.url.includes(targetUrl));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    }),
  );
});
