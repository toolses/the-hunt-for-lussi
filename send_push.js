// ============================================================
// JAKTEN PÅ LUSSI — Push Notification Sender (Mac / Node.js)
//
// Usage:
//   1. Install dependency (once):
//        npm install web-push
//
//   2. Paste the subscription JSON from the iPad's DevTools
//      console into the `subscription` variable below.
//
//   3. Run:
//        node send_push.js
// ============================================================

const webPush = require("web-push");

// ── VAPID keys ────────────────────────────────────────────────
// These must match the keys in js/push_config.js.
// Keep the private key secret — never commit it to a public repo.
const vapidKeys = {
  publicKey:
    "BBa41s_ul5wTaHJa32Sjbf_iBl5TWQ822-bVBFg8vjz23i-GJy1vDZH-mEbmSbJ8-PeOFcsdr0V739l989FBiHI",
  privateKey: "yTBngEqWcD8YpSS_LVyKvrFLGXtCmeFs-8OuPQVb8fo",
};

webPush.setVapidDetails(
  "mailto:din@epost.no",   // Replace with your actual e-mail
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// ── Subscription ──────────────────────────────────────────────
// Paste the full JSON object logged to the console on the iPad.
// It looks like this (keys will differ):
//
// {
//   "endpoint": "https://web.push.apple.com/...",
//   "keys": {
//     "p256dh": "...",
//     "auth": "..."
//   }
// }
const subscription = {
  endpoint: "PASTE_ENDPOINT_HERE",
  keys: {
    p256dh: "PASTE_P256DH_HERE",
    auth: "PASTE_AUTH_HERE",
  },
};

// ── Message ───────────────────────────────────────────────────
const payload = JSON.stringify({
  title: "Jakten på Lussi 🐈",
  body: "Pappa har oppdatert spillet! Finn Lussi nå! 🐈",
});

// ── Send ──────────────────────────────────────────────────────
webPush
  .sendNotification(subscription, payload)
  .then(() => {
    console.log("✅ Varselet ble sendt!");
  })
  .catch((err) => {
    console.error("❌ Feil ved sending av varsel:", err);
  });
