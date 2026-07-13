// laika-push-sw.js
// Service Worker for LaikaClub Push Notifications
// Handles background notifications when the app is closed.

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: data.icon || '/117.png',
        badge: '/117.png',
        data: data.url || '/',
        requireInteraction: data.requireInteraction || false,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'LaikaClub', options)
      );
    } catch (e) {
      // Fallback if data is not JSON
      event.waitUntil(
        self.registration.showNotification('LaikaClub', {
          body: event.data.text(),
          icon: '/117.png',
          badge: '/117.png'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
