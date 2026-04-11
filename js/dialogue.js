// ============================================================
// JAKTEN PÅ LUSSI — Dialogue & Voice-Over registry
//
// Every player-facing message and its voice-over live here.
// vo: null means the VO is not yet recorded/wired up.
//
// To trigger a dialogue event: say("id")
// ============================================================

var DIALOGUE = {
  // Kitchen — water bowl quest
  water_bowl_found:   { text: "Du fant en tom vannskål! Hva kan du bruke den til?",                                   vo: "vo_fant_skaal",  duration: 3   },
  water_bowl_filled:  { text: "Du fylte vannskålen med vann!",                                                        vo: "vo_fyller_vann", duration: 3   },
  water_bowl_done:    { text: "Lussi har nå ferskt vann å drikke! Kjempebra!",                                        vo: "vo_vann_ferdig", duration: 3   },

  // Hallway — hint after all rooms have been searched
  hint_check_outside: { text: "Nå tror jeg faktisk Lussi har gått ut en tur",                                         vo: "vo_lussi_gaat_ut",    duration: 3   },

  // Gata — Lussi chase sequence
  lussi_fled:         { text: "Lussi stakk av!",                                                                      vo: null,             duration: 1.5 },
  lussi_not_outside:  { text: "Nei, det ser ikke ut til at Lussi er her ute.\nHar du sjekket alle rommene i huset?",  vo: "vo_lussi_ikke_ute", duration: 3   },

  // Room entry voice-overs (no on-screen text)
  enter_vetle:        { text: null, vo: null },
  enter_ylva:         { text: null, vo: null },

  // Nabolaget — postboxes
  postbox_1: { text: "Du fant en tegning av Lussi! 🎨 Noen savner den nok!", vo: null, duration: 3 },
  postbox_2: { text: "Her bor Emma! Kanskje hun vet noe om Lussi? 🏠",       vo: null, duration: 3 },

  // Nabolaget — NPC friend greeting
  venn_hilsen: {
    text: "Hei! Skal vi leke? Jeg tror Lussi løp den veien! 🐈",
    vo:   "vo_venn_hilsen",
    duration: 4,
  },

  // Nabolaget — Emma ball challenge
  emma_challenge: {
    text: "Klarer du å dytte fotballen inn i naboens hage? Prøv! ⚽",
    vo:   null,
    duration: 4,
  },

  // Nabolaget — goal scored
  goal_scored: {
    text: "MÅL! Kjempebra! Du er en fotballstjerne! ⚽🎉",
    vo:   null,
    duration: 3,
  },

  // Bicycle — mount / dismount
  bike_mount: {
    text: "Du hopper på sykkelen! Nå er du kjemperask! 🚲",
    vo:   null,
    duration: 2,
  },
  bike_dismount: {
    text: "Du hopper av sykkelen.",
    vo:   null,
    duration: 2,
  },
};

// Safe VO playback — logs a placeholder when the audio file is missing.
function playVO(soundName) {
  try {
    play(soundName);
  } catch(e) {
    console.log("VO Placeholder: " + soundName + " | " + e.message);
  }
}

// Play the message and/or voice-over for a dialogue entry.
function say(id) {
  var d = DIALOGUE[id];
  if (!d) { console.warn("Unknown dialogue id: " + id); return; }
  if (d.text) showMessage(d.text, d.duration);
  if (d.vo)   playVO(d.vo);
}
