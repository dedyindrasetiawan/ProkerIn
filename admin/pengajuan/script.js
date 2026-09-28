/* eslint-env browser */
/* global console */

/* ============================================
   ProkerIn — Admin Pengajuan Script
   Antrian pengajuan + quick tabs + filter + search + sort
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy
     ============================================ */
  const dummyOrmawa = [
    { id: 1, nama: "HMP UEC", jenis: "hmp" },
    { id: 2, nama: "HMP PBSI", jenis: "hmp" },
    { id: 3, nama: "HMP PPKN", jenis: "hmp" },
    { id: 4, nama: "HMP Ekonomi", jenis: "hmp" },
    { id: 5, nama: "HMP PTI", jenis: "hmp" },
    { id: 6, nama: "HMP Matematika", jenis: "hmp" },
    { id: 7, nama: "UKM Taekwondo", jenis: "ukm" },
    { id: 8, nama: "UKM LPM Sinergi dan Kepenyiaran", jenis: "ukm" },
    { id: 9, nama: "UKM KSR", jenis: "ukm" },
    { id: 10, nama: "UKM Pramuka dan Pecinta Alam", jenis: "ukm" },
    { id: 11, nama: "UKM UKKI", jenis: "ukm" },
    { id: 12, nama: "UKM PR", jenis: "ukm" },
    { id: 13, nama: "UKM Kesenian", jenis: "ukm" },
    { id: 14, nama: "UKM KOMI", jenis: "ukm" },
    { id: 15, nama: "UKM Multimedia", jenis: "ukm" },
    { id: 16, nama: "UKM SAF Musik", jenis: "ukm" },
  ];

  const dummyProker = [
    {
      id: 1, ormawa_id: 5,
      nama: "Pelatihan Public Speaking Anggota Baru",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-05", jadwal_selesai: "2025-11-07",
      anggaran: 2500000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
      diajukan_pada: "2025-10-15T09:30:00",
    },
    {
      id: 2, ormawa_id: 5,
      nama: "Seminar Nasional Teknologi Pendidikan",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-01", jadwal_selesai: "2025-12-01",
      anggaran: 7500000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-20T14:15:00",
    },
    {
      id: 3, ormawa_id: 5,
      nama: "Bakti Sosial Desa Binaan",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-20", jadwal_selesai: "2025-10-21",
      anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
      diajukan_pada: "2025-10-01T10:00:00",
    },
    {
      id: 4, ormawa_id: 2,
      nama: "Festival Sastra Bulan Bahasa",
      kategori: "pendanaan",
      jadwal_mulai: "2025-10-28", jadwal_selesai: "2025-10-30",
      anggaran: 4200000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
      diajukan_pada: "2025-10-05T11:00:00",
    },
    {
      id: 5, ormawa_id: 2,
      nama: "Workshop Penulisan Puisi",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-11-12", jadwal_selesai: "2025-11-12",
      anggaran: 0,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-22T08:45:00",
    },
    {
      id: 6, ormawa_id: 3,
      nama: "Seminar Kebangsaan dan Pancasila",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-18", jadwal_selesai: "2025-11-18",
      anggaran: 5500000,
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-12T13:30:00",
    },
    {
      id: 7, ormawa_id: 4,
      nama: "Pelatihan Akuntansi Dasar",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-22", jadwal_selesai: "2025-11-23",
      anggaran: 3200000,
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-08T10:15:00",
    },
    {
      id: 8, ormawa_id: 6,
      nama: "Olimpiade Matematika Internal",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-05", jadwal_selesai: "2025-12-05",
      anggaran: 2800000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-24T15:00:00",
    },
    {
      id: 9, ormawa_id: 7,
      nama: "Kejuaraan Taekwondo Antar Sabuk",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-30", jadwal_selesai: "2025-12-01",
      anggaran: 6000000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
      diajukan_pada: "2025-10-10T09:00:00",
    },
    {
      id: 10, ormawa_id: 9,
      nama: "Donor Darah Bersama PMI",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-15", jadwal_selesai: "2025-10-15",
      anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
      diajukan_pada: "2025-09-28T14:00:00",
    },
    {
      id: 11, ormawa_id: 10,
      nama: "Kemah Bakti Pramuka",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-20", jadwal_selesai: "2025-12-22",
      anggaran: 8000000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-26T16:20:00",
    },
    {
      id: 12, ormawa_id: 11,
      nama: "Kajian Rutin Keislaman",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-11-08", jadwal_selesai: "2025-11-08",
      anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
      diajukan_pada: "2025-10-02T11:00:00",
    },
    {
      id: 13, ormawa_id: 13,
      nama: "Pentas Seni Akhir Tahun",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-15", jadwal_selesai: "2025-12-15",
      anggaran: 9000000,
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-16T10:30:00",
    },
    {
      id: 14, ormawa_id: 15,
      nama: "Workshop Videografi dan Editing",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-25", jadwal_selesai: "2025-11-26",
      anggaran: 3500000,
      status_pengajuan: "ditolak", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-14T09:00:00",
    },
    {
      id: 15, ormawa_id: 16,
      nama: "Konser Mini SAF Musik",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-08", jadwal_selesai: "2025-12-08",
      anggaran: 4000000,
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-06T14:45:00",
    },
  ];

  /* ============================================
     Mapping
     ============================================ */
  const labelPengajuan = {
    diajukan: "Diajukan",
    direvisi: "Direvisi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
  };
  const badgePengajuan = {
    diajukan: "badge bg-warning text-dark",
    direvisi: "badge bg-info text-dark",
    disetujui: "badge bg-primary",
    ditolak: "badge bg-danger",
  };

  /* ============================================
     State filter
     ============================================ */
  const state = {
    statusTab: "",
    ormawa: "",
    kategori: "",
    search: "",
    sortBy: "terbaru",
  };

  /* ============================================
     Helper
     ============================================ */
  function getOrmawaById(id) {
    return (
      dummyOrmawa.find(function (o) {
        return o.id === id;
      }) || { id: id, nama: "Ormawa #" + id, jenis: "-" }
    );
  }

  function formatRupiah(angka) {
    if (!angka || angka === 0) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  }

  function formatTanggalSingkat(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const bulan = [
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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const jam = String(d.getHours()).padStart(2, "0");
    const menit = String(d.getMinutes()).padStart(2, "0");
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
     Hitung jumlah per status (untuk tab count)
     ============================================ */
  function hitungCountPerStatus() {
    const counts = {
      semua: dummyProker.length,
      diajukan: 0,
      direvisi: 0,
      disetujui: 0,
      ditolak: 0,
    };
    dummyProker.forEach(function (p) {
      if (counts[p.status_pengajuan] !== undefined) {
        counts[p.status_pengajuan]++;
      }
    });
    return counts;
  }

  function renderTabCount() {
    const c = hitungCountPerStatus();
    const set = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set("countSemua", c.semua);
    set("countDiajukan", c.diajukan);
    set("countDirevisi", c.direvisi);
    set("countDisetujui", c.disetujui);
    set("countDitolak", c.ditolak);
  }

  /* ============================================
     Filter & Sort
     ============================================ */
  function getFiltered() {
    const q = state.search.toLowerCase();

    let list = dummyProker.filter(function (p) {
      if (state.statusTab && p.status_pengajuan !== state.statusTab) return false;
      if (state.ormawa && String(p.ormawa_id) !== state.ormawa) return false;
      if (state.kategori && p.kategori !== state.kategori) return false;
      if (q) {
        const ormawa = getOrmawaById(p.ormawa_id);
        const haystack = (p.nama + " " + ormawa.nama).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    // Sort
    list = list.slice();
    if (state.sortBy === "terbaru") {
      list.sort(function (a, b) {
        return new Date(b.diajukan_pada) - new Date(a.diajukan_pada);
      });
    } else if (state.sortBy === "terlama") {
      list.sort(function (a, b) {
        return new Date(a.diajukan_pada) - new Date(b.diajukan_pada);
      });
    } else if (state.sortBy === "anggaran_desc") {
      list.sort(function (a, b) {
        return b.anggaran - a.anggaran;
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
    const tbody = document.getElementById("prokerTableBody");
    const emptyState = document.getElementById("emptyState");
    const totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " proker";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (p) {
      const ormawa = getOrmawaById(p.ormawa_id);
      const kategoriLabel =
        p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";

      const tr = document.createElement("tr");
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
            escapeHtml(ormawa.jenis) +
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
          escapeHtml(formatDatetimeSingkat(p.diajukan_pada)) +
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
  function populateFilterOrmawa() {
    const sel = document.getElementById("filterOrmawa");
    if (!sel) return;
    dummyOrmawa.forEach(function (o) {
      const opt = document.createElement("option");
      opt.value = String(o.id);
      opt.textContent = o.nama;
      sel.appendChild(opt);
    });
  }

  /* ============================================
     Apply & render
     ============================================ */
  function refresh() {
    renderTabel(getFiltered());
  }

  /* ============================================
     Quick tabs
     ============================================ */
  function setupTabs() {
    const tabs = document.querySelectorAll(".quick-tabs .nav-link");
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
    const searchInput = document.getElementById("searchInput");
    const filterOrmawa = document.getElementById("filterOrmawa");
    const filterKategori = document.getElementById("filterKategori");
    const sortBy = document.getElementById("sortBy");
    const resetBtn = document.getElementById("resetFilter");

    if (searchInput) {
      let t = null;
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

        const tabs = document.querySelectorAll(".quick-tabs .nav-link");
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        const tabSemua = document.getElementById("tabSemua");
        if (tabSemua) {
          tabSemua.classList.add("active");
          tabSemua.setAttribute("aria-selected", "true");
        }

        refresh();
      });
    }
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    populateFilterOrmawa();
    renderTabCount();
    setupTabs();
    setupFilters();
    refresh();
  });
})();