// ============================================================
// JAKTEN PÅ LUSSI — Web Push VAPID configuration
//
// These keys were generated with Node.js crypto (ECDH / P-256).
// The PUBLIC key is shared here (safe for the browser).
// The PRIVATE key lives ONLY in send_push.js on your Mac and
// must NEVER be committed to a public repository.
//
// To regenerate:
//   node -e "const c=require('crypto'),e=c.createECDH('prime256v1');e.generateKeys();
//            const b=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
//            console.log('PUBLIC:',b(e.getPublicKey()));console.log('PRIVATE:',b(e.getPrivateKey()));"
// ============================================================

var VAPID_PUBLIC_KEY =
  "BBa41s_ul5wTaHJa32Sjbf_iBl5TWQ822-bVBFg8vjz23i-GJy1vDZH-mEbmSbJ8-PeOFcsdr0V739l989FBiHI";
