/* global self, clients */

self.addEventListener('push', (event) => {
  let data = {
    title: 'JMI Result Update',
    body: 'A tracked course result was updated.',
    url: '/tracked-results',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // keep defaults
  }

  const options = {
    body: data.body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: {
      url: data.url || '/tracked-results',
      notificationId: data.notificationId,
      resultLink: data.resultLink,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title || 'JMI Result Update', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/tracked-results';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return undefined;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
