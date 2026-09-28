/* eslint-env browser */
/* global console, ProkerIn */

/* ============================================
   ProkerIn — Admin Dashboard Script
   Rekap seluruh kampus + filter + rekap per ormawa
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy — semua ormawa (lihat lampiran dokumen)
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
    },
    {
      id: 2, ormawa_id: 5,
      nama: "Seminar Nasional Teknologi Pendidikan",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-01", jadwal_selesai: "2025-12-01",
      anggaran: 7500000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
    },
    {
      id: 3, ormawa_id: 5,
      nama: "Bakti Sosial Desa Binaan",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-20", jadwal_selesai: "2025-10-21",
      anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
    },
    {
      id: 4, ormawa_id: 2,
      nama: "Festival Sastra Bulan Bahasa",
      kategori: "pendanaan",
      jadwal_mulai: "2025-10-28", jadwal_selesai: "2025-10-30",
      anggaran: 4200000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
    },
    {
      id: 5, ormawa_id: 2,
      nama: "Workshop Penulisan Puisi",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-11-12", jadwal_selesai: "2025-11-12",
      anggaran: 0,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
    },
    {
      id: 6, ormawa_id: 3,
      nama: "Seminar Kebangsaan dan Pancasila",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-18", jadwal_selesai: "2025-11-18",
      anggaran: 5500000,
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
    },
    {
      id: 7, ormawa_id: 4,
      nama: "Pelatihan Akuntansi Dasar",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-22", jadwal_selesai: "2025-11-23",
      anggaran: 3200000,
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
    },
    {
      id: 8, ormawa_id: 6,
      nama: "Olimpiade Matematika Internal",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-05", jadwal_selesai: "2025-12-05",
      anggaran: 2800000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
    },
    {
      id: 9, ormawa_id: 7,
      nama: "Kejuaraan Taekwondo Antar Sabuk",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-30", jadwal_selesai: "2025-12-01",
      anggaran: 6000000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
    },
    {
      id: 10, ormawa_id: 9,
      nama: "Donor Darah Bersama PMI",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-15", jadwal_selesai: "2025-10-15",
      anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
    },
    {
      id: 11, ormawa_id: 10,
      nama: "Kemah Bakti Pramuka",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-20", jadwal_selesai: "2025-12-22",
      anggaran: 8000000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
    },
    {
      id: 12, ormawa_id: 11,
      nama: "Kajian Rutin Keislaman",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-11-08", jadwal_selesai: "2025-11-08",
      anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
    },
    {
      id: 13, ormawa_id: 13,
      nama: "Pentas Seni Akhir Tahun",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-15", jadwal_selesai: "2025-12-15",
      anggaran: 9000000,
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
    },
    {
      id: 14, ormawa_id: 15,
      nama: "Workshop Videografi dan Editing",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-25", jadwal_selesai: "2025-11-26",
      anggaran: 3500000,
      status_pengajuan: "ditolak", status_progress: "belum_mulai",
    },
    {
      id: 15, ormawa_id: 16,
      nama: "Konser Mini SAF Musik",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-08", jadwal_selesai: "2025-12-08",
      anggaran: 4000000,
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
    },
  ];

  /* ============================================
     Mapping label & badge
     ============================================ */
  const labelPengajuan = {
    diajukan: "Diajukan", direvisi: "Direvisi",
    disetujui: "Disetujui", ditolak: "Ditolak",
  };
  const badgePengajuan = {
    diajukan: "badge bg-warning text-dark",
    direvisi: "badge bg-info text-dark",
    disetujui: "badge bg-primary",
    ditolak: "badge bg-danger",
  };
  const labelProgress = {
    belum_mulai: "Belum Mulai", berjalan: "Berjalan",
    selesai: "Selesai", ditunda: "Ditunda",
  };
  const badgeProgress = {
    belum_mulai: "badge bg-secondary",
    berjalan: "badge bg-success",
    selesai: "badge bg-dark",
    ditunda: "badge bg-warning text-dark",
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

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ============================================
     Render statistik ringkasan
     ============================================ */
  function renderStatistik(data) {
    const counts = { diajukan: 0, disetujui: 0, berjalan: 0, selesai: 0 };
    data.forEach(function (p) {
      if (p.status_pengajuan === "diajukan") counts.diajukan++;
      if (p.status_pengajuan === "disetujui") counts.disetujui++;
      if (p.status_progress === "berjalan") counts.berjalan++;
      if (p.status_progress === "selesai") counts.selesai++;
    });
    document.getElementById("statDiajukan").textContent = counts.diajukan;
    document.getElementById("statDisetujui").textContent = counts.disetujui;
    document.getElementById("statBerjalan").textContent = counts.berjalan;
    document.getElementById("statSelesai").textContent = counts.selesai;
  }

  /* ============================================
     Render rekap per ormawa (kartu)
     ============================================ */
  function renderRekapOrmawa(data) {
    const container = document.getElementById("rekapOrmawaList");
    if (!container) return;

    // Kelompokkan per ormawa
    const perOrmawa = {};
    data.forEach(function (p) {
      if (!perOrmawa[p.ormawa_id]) {
        perOrmawa[p.ormawa_id] = {
          total: 0, diajukan: 0, disetujui: 0, berjalan: 0, selesai: 0,
        };
      }
      const g = perOrmawa[p.ormawa_id];
      g.total++;
      if (p.status_pengajuan === "diajukan") g.diajukan++;
      if (p.status_pengajuan === "disetujui") g.disetujui++;
      if (p.status_progress === "berjalan") g.berjalan++;
      if (p.status_progress === "selesai") g.selesai++;
    });

    // Urutkan by total desc
    const entries = Object.keys(perOrmawa)
      .map(function (k) {
        return { ormawa_id: parseInt(k, 10), data: perOrmawa[k] };
      })
      .sort(function (a, b) {
        return b.data.total - a.data.total;
      })
      .slice(0, 8); // tampilkan 8 teratas

    if (!entries.length) {
      container.innerHTML =
        '<div class="col-12"><p class="text-muted mb-0 text-center py-3">Belum ada data proker.</p></div>';
      return;
    }

    container.innerHTML = entries
      .map(function (e) {
        const o = getOrmawaById(e.ormawa_id);
        const d = e.data;
        return (
          '<div class="col-12 col-sm-6 col-lg-3">' +
            '<article class="ormawa-card">' +
              '<div class="ormawa-card__header">' +
                '<h4 class="ormawa-card__nama">' +
                  escapeHtml(o.nama) +
                "</h4>" +
                '<span class="ormawa-card__jenis">' +
                  escapeHtml(o.jenis.toUpperCase()) +
                "</span>" +
              "</div>" +
              '<p class="ormawa-card__total">' +
                d.total +
                ' <span>proker</span>' +
              "</p>" +
              '<div class="ormawa-card__bars">' +
                '<span><span class="ormawa-card__dot dot-diajukan"></span>' +
                  d.diajukan + "</span>" +
                '<span><span class="ormawa-card__dot dot-disetujui"></span>' +
                  d.disetujui + "</span>" +
                '<span><span class="ormawa-card__dot dot-berjalan"></span>' +
                  d.berjalan + "</span>" +
                '<span><span class="ormawa-card__dot dot-selesai"></span>' +
                  d.selesai + "</span>" +
              "</div>" +
            "</article>" +
          "</div>"
        );
      })
      .join("");
  }

  /* ============================================
     Render tabel semua pengajuan
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
        "<td>" +
          '<span class="' +
            (badgeProgress[p.status_progress] || "badge bg-secondary") +
            '">' +
            escapeHtml(
              labelProgress[p.status_progress] || p.status_progress
            ) +
          "</span>" +
        "</td>" +
        '<td class="text-end">' +
          '<a href="../proker-detail/index.html?id=' +
            p.id +
            '" class="btn-detail" ' +
            'aria-label="Tinjau proker ' +
            escapeHtml(p.nama) +
            '">' +
            '<i class="bi bi-eye"></i> Tinjau' +
          "</a>" +
        "</td>";
      tbody.appendChild(tr);
    });
  }

  /* ============================================
     Isi dropdown filter ormawa
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
     Filter
     ============================================ */
  function applyFilter() {
    const fOrmawa = document.getElementById("filterOrmawa").value;
    const fPengajuan = document.getElementById("filterPengajuan").value;
    const fProgress = document.getElementById("filterProgress").value;

    const filtered = dummyProker.filter(function (p) {
      if (fOrmawa && String(p.ormawa_id) !== fOrmawa) return false;
      if (fPengajuan && p.status_pengajuan !== fPengajuan) return false;
      if (fProgress && p.status_progress !== fProgress) return false;
      return true;
    });

    renderTabel(filtered);
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    populateFilterOrmawa();
    renderStatistik(dummyProker);
    renderRekapOrmawa(dummyProker);
    renderTabel(dummyProker);

    const fOrmawa = document.getElementById("filterOrmawa");
    const fPengajuan = document.getElementById("filterPengajuan");
    const fProgress = document.getElementById("filterProgress");
    const resetBtn = document.getElementById("resetFilter");

    if (fOrmawa) fOrmawa.addEventListener("change", applyFilter);
    if (fPengajuan) fPengajuan.addEventListener("change", applyFilter);
    if (fProgress) fProgress.addEventListener("change", applyFilter);

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        fOrmawa.value = "";
        fPengajuan.value = "";
        fProgress.value = "";
        applyFilter();
      });
    }
  });
})();