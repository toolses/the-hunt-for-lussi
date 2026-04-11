// ============================================================
// JAKTEN PÅ LUSSI — Service Worker
// Handles Web Push notifications and PWA caching.
// ============================================================

var CACHE_NAME = "lussi-v1";

// ── Install: cache the shell ─────────────────────────────────
self.addEventListener("install", function (event) {
  self.skipWaiting();
});

// ── Activate: claim all clients immediately ──────────────────
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

// ── Push: show a notification ────────────────────────────────
self.addEventListener("push", function (event) {
  var data = { title: "Jakten på Lussi", body: "Noe nytt skjer i spillet!" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // Fallback to defaults above
  }

  var title = data.title || "Jakten på Lussi";
  var options = {
    body: data.body || "",
    icon: "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
    tag: "lussi-notification",        // replaces previous notification
    renotify: true,
    requireInteraction: false,
    data: { url: "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click: focus or open the PWA ───────────────
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // If the PWA is already open, bring it to the front
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if ("focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
