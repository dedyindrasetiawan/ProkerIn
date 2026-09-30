/* eslint-env browser */
/* global console, ProkerIn, sb, alert */

/* ============================================
   ProkerIn — Admin Pengajuan Script
   Antrian pengajuan + quick tabs + filter + search + sort
   Data dari Supabase
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     State (cache + filter)
     ============================================ */
  var semuaProker = [];
  var ormawaMap = {};
  var state = {
    statusTab: "",
    ormawa: "",
    kategori: "",
    search: "",
    sortBy: "terbaru",
  };

  /* ============================================
     Mapping
     ============================================ */
  var labelPengajuan = {
    diajukan: "Diajukan",
    direvisi: "Direvisi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
  };
  var badgePengajuan = {
    diajukan: "badge bg-warning text-dark",
    direvisi: "badge bg-info text-dark",
    disetujui: "badge bg-primary",
    ditolak: "badge bg-danger",
  };

  /* ============================================
     Helper
     ============================================ */
  function getOrmawa(id) {
    return ormawaMap[id] || { id: id, nama: "Ormawa #" + id, jenis: "-" };
  }

  function formatRupiah(angka) {
    if (typeof ProkerIn !== "undefined" && ProkerIn.formatRupiah) {
      return ProkerIn.formatRupiah(angka);
    }
    angka = Number(angka);
    if (isNaN(angka)) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  }

  function formatTanggalSingkat(dateStr) {
    if (!dateStr) return "-";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    var bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatRentangTanggal(mulai, selesai) {
    if (mulai === selesai) return formatTanggalSingkat(mulai);
    return formatTanggalSingkat(mulai) + " – " + formatTanggalSingkat(selesai);
  }

  function formatDatetimeSingkat(dateStr) {
    if (!dateStr) return "-";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    var bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    var jam = String(d.getHours()).padStart(2, "0");
    var menit = String(d.getMinutes()).padStart(2, "0");
    return (
      d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear() +
      " · " + jam + ":" + menit
    );
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ============================================
     Tab count (dari cache)
     ============================================ */
  function renderTabCount() {
    var counts = {
      semua: semuaProker.length,
      diajukan: 0,
      direvisi: 0,
      disetujui: 0,
      ditolak: 0,
    };
    semuaProker.forEach(function (p) {
      if (counts[p.status_pengajuan] !== undefined) {
        counts[p.status_pengajuan]++;
      }
    });
    var set = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("countSemua", counts.semua);
    set("countDiajukan", counts.diajukan);
    set("countDirevisi", counts.direvisi);
    set("countDisetujui", counts.disetujui);
    set("countDitolak", counts.ditolak);
  }

  /* ============================================
     Filter & Sort
     ============================================ */
  function getFiltered() {
    var q = state.search.toLowerCase();

    var list = semuaProker.filter(function (p) {
      if (state.statusTab && p.status_pengajuan !== state.statusTab) return false;
      if (state.ormawa && String(p.ormawa_id) !== state.ormawa) return false;
      if (state.kategori && p.kategori !== state.kategori) return false;
      if (q) {
        var ormawa = getOrmawa(p.ormawa_id);
        var haystack = (p.nama + " " + ormawa.nama).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    // Sort
    list = list.slice();
    if (state.sortBy === "terbaru") {
      list.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else if (state.sortBy === "terlama") {
      list.sort(function (a, b) {
        return new Date(a.created_at) - new Date(b.created_at);
      });
    } else if (state.sortBy === "anggaran_desc") {
      list.sort(function (a, b) {
        return Number(b.anggaran) - Number(a.anggaran);
      });
    } else if (state.sortBy === "deadline") {
      list.sort(function (a, b) {
        return new Date(a.jadwal_selesai) - new Date(b.jadwal_selesai);
      });
    }

    return list;
  }

  /* ============================================
     Render tabel
     ============================================ */
  function renderTabel(data) {
    var tbody = document.getElementById("prokerTableBody");
    var emptyState = document.getElementById("emptyState");
    var totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " proker";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (p) {
      var ormawa = getOrmawa(p.ormawa_id);
      var kategoriLabel =
        p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
          '<span class="proker-table__nama">' +
            escapeHtml(p.nama) +
          "</span>" +
          '<span class="proker-table__kategori">' +
            escapeHtml(kategoriLabel) +
          "</span>" +
        "</td>" +
        "<td>" +
          '<span class="proker-table__ormawa">' +
            escapeHtml(ormawa.nama) +
          "</span>" +
          '<span class="proker-table__ormawa-jenis">' +
            escapeHtml(ormawa.jenis || "-") +
          "</span>" +
        "</td>" +
        '<td class="proker-table__jadwal">' +
          '<i class="bi bi-calendar-event"></i>' +
          escapeHtml(formatRentangTanggal(p.jadwal_mulai, p.jadwal_selesai)) +
        "</td>" +
        '<td class="proker-table__jadwal">' +
          escapeHtml(formatRupiah(p.anggaran)) +
        "</td>" +
        "<td>" +
          '<span class="' +
            (badgePengajuan[p.status_pengajuan] || "badge bg-secondary") +
            '">' +
            escapeHtml(
              labelPengajuan[p.status_pengajuan] || p.status_pengajuan
            ) +
          "</span>" +
        "</td>" +
        '<td class="proker-table__waktu">' +
          escapeHtml(formatDatetimeSingkat(p.created_at)) +
        "</td>" +
        '<td class="text-end">' +
          '<div class="action-group">' +
            '<a href="../proker-detail/index.html?id=' +
              p.id +
              '" class="btn-detail" ' +
              'aria-label="Tinjau proker ' +
              escapeHtml(p.nama) +
              '">' +
              '<i class="bi bi-eye"></i> Tinjau' +
            "</a>" +
          "</div>" +
        "</td>";
      tbody.appendChild(tr);
    });
  }

  /* ============================================
     Populate filter ormawa
     ============================================ */
  function populateFilterOrmawa(list) {
    var sel = document.getElementById("filterOrmawa");
    if (!sel) return;
    // Hindari duplikasi kalau fungsi dipanggil 2x
    while (sel.options.length > 1) sel.remove(1);
    list.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = String(o.id);
      opt.textContent = o.nama;
      sel.appendChild(opt);
    });
  }

  /* ============================================
     Refresh tampilan
     ============================================ */
  function refresh() {
    renderTabel(getFiltered());
  }

  /* ============================================
     Quick tabs
     ============================================ */
  function setupTabs() {
    var tabs = document.querySelectorAll(".quick-tabs .nav-link");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        state.statusTab = tab.getAttribute("data-status") || "";
        refresh();
      });
    });
  }

  /* ============================================
     Filter events
     ============================================ */
  function setupFilters() {
    var searchInput = document.getElementById("searchInput");
    var filterOrmawa = document.getElementById("filterOrmawa");
    var filterKategori = document.getElementById("filterKategori");
    var sortBy = document.getElementById("sortBy");
    var resetBtn = document.getElementById("resetFilter");

    if (searchInput) {
      var t = null;
      searchInput.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(function () {
          state.search = searchInput.value.trim();
          refresh();
        }, 200);
      });
    }

    if (filterOrmawa) {
      filterOrmawa.addEventListener("change", function () {
        state.ormawa = filterOrmawa.value;
        refresh();
      });
    }

    if (filterKategori) {
      filterKategori.addEventListener("change", function () {
        state.kategori = filterKategori.value;
        refresh();
      });
    }

    if (sortBy) {
      sortBy.addEventListener("change", function () {
        state.sortBy = sortBy.value;
        refresh();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.search = "";
        state.ormawa = "";
        state.kategori = "";
        state.sortBy = "terbaru";
        state.statusTab = "";

        if (searchInput) searchInput.value = "";
        if (filterOrmawa) filterOrmawa.value = "";
        if (filterKategori) filterKategori.value = "";
        if (sortBy) sortBy.value = "terbaru";

        var tabs = document.querySelectorAll(".quick-tabs .nav-link");
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        var tabSemua = document.getElementById("tabSemua");
        if (tabSemua) {
          tabSemua.classList.add("active");
          tabSemua.setAttribute("aria-selected", "true");
        }

        refresh();
      });
    }
  }

  /* ============================================
     Fetch Supabase
     ============================================ */
  async function muatData() {
    var results = await Promise.all([
      sb
        .from("proker")
        .select("*")
        .order("created_at", { ascending: false }),
      sb.from("ormawa").select("id, nama, jenis").order("nama"),
    ]);

    var prokerRes = results[0];
    var ormawaRes = results[1];

    if (prokerRes.error) {
      console.error("[ProkerIn] Gagal memuat proker:", prokerRes.error);
      alert("Gagal memuat data proker. Coba muat ulang halaman.");
      return { proker: [], ormawa: [] };
    }
    if (ormawaRes.error) {
      console.error("[ProkerIn] Gagal memuat ormawa:", ormawaRes.error);
      alert("Gagal memuat data ormawa. Coba muat ulang halaman.");
      return { proker: [], ormawa: [] };
    }

    return {
      proker: prokerRes.data || [],
      ormawa: ormawaRes.data || [],
    };
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready; // WAJIB: tunggu sesi & role terverifikasi

    var hasil = await muatData();
    semuaProker = hasil.proker;

    ormawaMap = {};
    hasil.ormawa.forEach(function (o) {
      ormawaMap[o.id] = o;
    });

    populateFilterOrmawa(hasil.ormawa);
    renderTabCount();
    setupTabs();
    setupFilters();
    refresh();
  });
})();