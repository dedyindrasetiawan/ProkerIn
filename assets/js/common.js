/* ============================================
   ProkerIn — Common Functions
   Guard halaman (Supabase Auth + cek role), sidebar,
   logout, helper format
   ============================================ */

/* ============================================
   Guard halaman — sembunyikan halaman sampai sesi
   & role terverifikasi, lalu redirect jika tidak sesuai
   ============================================ */
(function () {
  "use strict";

  var LOGIN_URL = "../../auth/login/index.html";

  // Folder -> role yang boleh masuk
  var ACCESS = {
    ormawa: ["ketua_pengurus"],
    admin: ["admin_kemahasiswaan", "super_admin"],
    superadmin: ["super_admin"],
  };

  // Halaman utama tiap role (untuk redirect jika salah folder)
  var HOME = {
    ketua_pengurus: "../../ormawa/dashboard/index.html",
    admin_kemahasiswaan: "../../admin/dashboard/index.html",
    super_admin: "../../superadmin/akun/index.html",
  };

  var segments = window.location.pathname.replace(/\\/g, "/").split("/");
  var area = null;
  for (var i = 0; i < segments.length; i++) {
    if (ACCESS[segments[i]]) area = segments[i];
  }

  window.ProkerIn = window.ProkerIn || {};

  // Halaman publik (login): tidak perlu guard
  if (!area) {
    window.ProkerIn.ready = Promise.resolve(null);
    return;
  }

  document.documentElement.style.visibility = "hidden";

  function redirect(url) {
    window.location.replace(url);
  }

  window.ProkerIn.ready = (async function () {
    if (!window.sb) {
      console.error("[ProkerIn] Supabase client tidak ditemukan.");
      return redirect(LOGIN_URL);
    }

    var sessionRes = await window.sb.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if (!session) return redirect(LOGIN_URL);

    var profRes = await window.sb
      .from("profiles")
      .select("nama, email, role, ormawa_id, aktif")
      .eq("id", session.user.id)
      .single();
    var profile = profRes.data;

    if (profRes.error || !profile || !profile.aktif) {
      await window.sb.auth.signOut();
      return redirect(LOGIN_URL);
    }

    if (ACCESS[area].indexOf(profile.role) === -1) {
      return redirect(HOME[profile.role] || LOGIN_URL);
    }

    window.ProkerIn.user = profile;

    // Isi nama user di topbar / elemen bertanda data-user-name
    document.addEventListener("DOMContentLoaded", fillUser);
    if (document.readyState !== "loading") fillUser();
    function fillUser() {
      document
        .querySelectorAll(".prokerin-topbar__user-name, [data-user-name]")
        .forEach(function (el) {
          el.textContent = profile.nama;
        });
    }

    document.documentElement.style.visibility = "";
    return profile;
  })();
})();

(function () {
  "use strict";

  function initSidebarToggle() {
    var toggleBtn = document.getElementById("sidebarToggle");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebarOverlay");

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("show");
      if (overlay) overlay.classList.toggle("show");
    });

    if (overlay) {
      overlay.addEventListener("click", function () {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
      });
    }
  }

  /**
   * Logout — akhiri sesi Supabase lalu kembali ke login
   */
  function initLogout() {
    document
      .querySelectorAll("[data-action='logout']")
      .forEach(function (btn) {
        btn.addEventListener("click", async function (e) {
          e.preventDefault();
          if (!confirm("Yakin ingin keluar dari ProkerIn?")) return;
          try {
            if (window.sb) await window.sb.auth.signOut();
          } catch (err) {
            console.warn("[ProkerIn] signOut gagal:", err);
          }
          window.location.replace("../../auth/login/index.html");
        });
      });
  }

  function initActiveMenu() {
    var currentPath = window.location.pathname;
    document.querySelectorAll(".prokerin-sidebar__link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && currentPath.includes(href.replace("../", ""))) {
        link.classList.add("active");
      }
    });
  }

  function formatTanggal(date) {
    var d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    var bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatRupiah(angka) {
    angka = Number(angka);
    if (isNaN(angka)) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  }

  window.ProkerIn = window.ProkerIn || {};
  window.ProkerIn.formatTanggal = formatTanggal;
  window.ProkerIn.formatRupiah = formatRupiah;

  document.addEventListener("DOMContentLoaded", function () {
    initSidebarToggle();
    initLogout();
    initActiveMenu();
  });
})();