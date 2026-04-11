// ============================================================
// JAKTEN PÅ LUSSI — Web Push Manager (client-side)
//
// Depends on: js/push_config.js  (VAPID_PUBLIC_KEY)
// Called from: js/main.js        (initPushManager)
// Triggered by: pauseGame() button in js/helpers.js
// ============================================================

// Converts a base64url string to a Uint8Array, required by
// the browser's pushManager.subscribe() API.
function _urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  var rawData = atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── Service Worker registration ──────────────────────────────

var _swRegistration = null;

function initPushManager() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[Push] Service Workers are not supported in this browser.");
    return;
  }

  navigator.serviceWorker
    .register("/sw.js")
    .then(function (registration) {
      _swRegistration = registration;
      console.log("[Push] Service Worker registered:", registration.scope);
    })
    .catch(function (err) {
      console.error("[Push] Service Worker registration failed:", err);
    });
}

// ── Permission + subscription ────────────────────────────────

/**
 * Requests notification permission from the user.
 * Must be called from a direct user-gesture handler (e.g. button click).
 *
 * On success:  subscribes the browser to Web Push and logs the
 *              subscription JSON you need to paste into send_push.js.
 * On failure:  shows an alert explaining the situation.
 */
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Denne nettleseren støtter ikke varsler.");
    return;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Web Push støttes ikke i denne nettleseren.\nPrøv Safari på iOS 16.4+ installert som hjem-app.");
    return;
  }

  Notification.requestPermission().then(function (permission) {
    if (permission !== "granted") {
      console.warn("[Push] Notification permission denied.");
      alert("Varslinger ble ikke tillatt. Sjekk innstillingene på iPaden.");
      return;
    }

    console.log("[Push] Permission granted — subscribing…");
    _subscribeToPush();
  });
}

function _subscribeToPush() {
  if (!_swRegistration) {
    console.error("[Push] Service Worker not ready yet. Try again in a moment.");
    alert("Tjenesten er ikke klar ennå. Prøv igjen om et øyeblikk.");
    return;
  }

  var applicationServerKey = _urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  _swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription) {
      console.log(
        "%c[Push] ✅ Abonnement opprettet! Kopier JSON-en under og lim den inn i send_push.js:",
        "color: #4CAF50; font-weight: bold"
      );
      console.log(JSON.stringify(subscription.toJSON(), null, 2));
      alert(
        "✅ Varsler er skrudd på!\n\n" +
        "Kopier abonnementet fra DevTools-konsollen og lim det inn i send_push.js på Macen din."
      );
    })
    .catch(function (err) {
      console.error("[Push] Subscription failed:", err);
      alert(
        "Kunne ikke abonnere på varsler.\n\n" +
        "Husk: spillet MÅ være installert som hjem-app (Add to Home Screen) på iPaden for at varslene skal fungere."
      );
    });
}

// ── Current subscription status ──────────────────────────────

/**
 * Logs whether the device already has a push subscription.
 * Useful for debugging.
 */
function logPushStatus() {
  if (!_swRegistration) {
    console.log("[Push] SW not registered yet.");
    return;
  }
  _swRegistration.pushManager.getSubscription().then(function (sub) {
    if (sub) {
      console.log("[Push] Active subscription:", JSON.stringify(sub.toJSON(), null, 2));
    } else {
      console.log("[Push] No active subscription.");
    }
  });
}
