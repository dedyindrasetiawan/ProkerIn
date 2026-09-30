/* ============================================
   ProkerIn — Supabase Client
   Wajib dimuat SETELAH library supabase-js (CDN)
   dan SEBELUM common.js
   ============================================ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://qbrbuhvhtlzmhitergew.supabase.co";
  // Publishable key aman ada di front-end (keamanan dijaga oleh RLS).
  // JANGAN pernah taruh key "sb_secret_..." / service_role di sini.
  var SUPABASE_KEY = "sb_publishable_shOMzlQbeQofjE3sl4v-sQ_T2PgNHhn";

  if (!window.supabase || !window.supabase.createClient) {
    console.error("[ProkerIn] Library supabase-js belum dimuat.");
    return;
  }

  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
})();