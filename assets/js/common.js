/* ============================================
   ProkerIn — Common Functions
   Fungsi umum: toggle sidebar, logout, helper
   ============================================ */

   /* ============================================
   Proteksi Halaman — redirect ke login jika belum login
   ============================================ */
(function guardPage() {
  // Daftar halaman yang DIPROTEKSI (semua dashboard)
  const protectedPaths = ["/ormawa/", "/admin/", "/superadmin/"];
  const currentPath = window.location.pathname.replace(/\\/g, "/");

  const isProtected = protectedPaths.some(function (p) {
    return currentPath.indexOf(p) !== -1;
  });

  if (!isProtected) return;

  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("prokerin_user") || "null");
  } catch (err) {
    user = null;
  }

  if (!user || !user.role) {
    // Belum login → balik ke login
    const depth = (currentPath.match(/\//g) || []).length;
    // naik 3 level dari /prokerin/ormawa/dashboard/index.html ke /prokerin/auth/login/
    window.location.href = "../../auth/login/index.html";
  }
})();

(function () {
  "use strict";

  /**
   * Toggle sidebar untuk tampilan mobile
   */
  function initSidebarToggle() {
    const toggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

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
   * Logout sederhana (simulasi)
   */
  function initLogout() {
    const logoutBtns = document.querySelectorAll("[data-action='logout']");
    logoutBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const konfirmasi = confirm("Yakin ingin keluar dari ProkerIn?");
        if (konfirmasi) {
          // Simulasi logout — nanti diganti redirect ke login
          console.log("[ProkerIn] Logout berhasil.");
          window.location.href = "../../auth/login/index.html";
        }
      });
    });
  }

  /**
   * Highlight menu aktif berdasarkan URL saat ini
   */
  function initActiveMenu() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(".prokerin-sidebar__link");
    links.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href && currentPath.includes(href.replace("../", ""))) {
        link.classList.add("active");
      }
    });
  }

  /**
   * Helper: format tanggal ke format Indonesia
   * @param {string|Date} date
   * @returns {string}
   */
  function formatTanggal(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  /**
   * Helper: format angka ke Rupiah
   * @param {number} angka
   * @returns {string}
   */
  function formatRupiah(angka) {
    if (typeof angka !== "number" || isNaN(angka)) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  }

  // Ekspos helper ke global scope
  window.ProkerIn = {
    formatTanggal: formatTanggal,
    formatRupiah: formatRupiah,
  };

  // Inisialisasi saat DOM siap
  document.addEventListener("DOMContentLoaded", function () {
    initSidebarToggle();
    initLogout();
    initActiveMenu();
  });
})();