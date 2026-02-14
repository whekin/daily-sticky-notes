self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {
    title: "Valentine",
    body: "A new note is waiting for you.",
    url: "/",
  };

  try {
    const parsed = event.data.json();
    payload = {
      title: typeof parsed.title === "string" ? parsed.title : payload.title,
      body: typeof parsed.body === "string" ? parsed.body : payload.body,
      url: typeof parsed.url === "string" ? parsed.url : payload.url,
    };
  } catch (_error) {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: {
        url: payload.url,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    event.notification.data && typeof event.notification.data.url === "string"
      ? event.notification.data.url
      : "/";
  const absoluteTarget = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === absoluteTarget && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(absoluteTarget);
      }

      return undefined;
    }),
  );
});
