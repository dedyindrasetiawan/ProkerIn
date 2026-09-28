/* eslint-env browser */
/* global console, ProkerIn */

/* ============================================
   ProkerIn — Ormawa Dashboard Script
   Data dummy + render tabel + filter + statistik
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy proker (nanti diganti dari backend)
     ============================================ */
  const dummyProker = [
    {
      id: 1,
      nama: "Pelatihan Public Speaking Anggota Baru",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-05",
      jadwal_selesai: "2025-11-07",
      anggaran: 2500000,
      status_pengajuan: "disetujui",
      status_progress: "berjalan",
    },
    {
      id: 2,
      nama: "Seminar Nasional Teknologi Pendidikan",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-01",
      jadwal_selesai: "2025-12-01",
      anggaran: 7500000,
      status_pengajuan: "diajukan",
      status_progress: "belum_mulai",
    },
    {
      id: 3,
      nama: "Bakti Sosial Desa Binaan",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-20",
      jadwal_selesai: "2025-10-21",
      anggaran: 0,
      status_pengajuan: "disetujui",
      status_progress: "selesai",
    },
    {
      id: 4,
      nama: "Workshop Desain Grafis untuk Anggota",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-15",
      jadwal_selesai: "2025-11-16",
      anggaran: 3000000,
      status_pengajuan: "direvisi",
      status_progress: "belum_mulai",
    },
    {
      id: 5,
      nama: "Lomba Cerdas Cermat Antar Kelas",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-10",
      jadwal_selesai: "2025-12-12",
      anggaran: 4500000,
      status_pengajuan: "ditolak",
      status_progress: "belum_mulai",
    },
    {
      id: 6,
      nama: "Pelatihan Kepemimpinan Dasar",
      kategori: "pendanaan",
      jadwal_mulai: "2026-01-08",
      jadwal_selesai: "2026-01-10",
      anggaran: 5000000,
      status_pengajuan: "disetujui",
      status_progress: "ditunda",
    },
  ];

  /* ============================================
     Mapping label & class badge untuk status
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

  const labelProgress = {
    belum_mulai: "Belum Mulai",
    berjalan: "Berjalan",
    selesai: "Selesai",
    ditunda: "Ditunda",
  };

  const badgeProgress = {
    belum_mulai: "badge bg-secondary",
    berjalan: "badge bg-success",
    selesai: "badge bg-dark",
    ditunda: "badge bg-warning text-dark",
  };

  /* ============================================
     Helper format
     ============================================ */
  function formatRupiah(angka) {
    if (typeof ProkerIn !== "undefined" && ProkerIn.formatRupiah) {
      return ProkerIn.formatRupiah(angka);
    }
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

  /* ============================================
     Escape HTML sederhana (keamanan dasar)
     ============================================ */
  function escapeHtml(str) {
    return String(str)
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
    const counts = {
      diajukan: 0,
      disetujui: 0,
      berjalan: 0,
      selesai: 0,
    };

    data.forEach(function (p) {
      if (p.status_pengajuan === "diajukan") counts.diajukan++;
      if (p.status_pengajuan === "disetujui") counts.disetujui++;
      if (p.status_progress === "berjalan") counts.berjalan++;
      if (p.status_progress === "selesai") counts.selesai++;
    });

    const elDiajukan = document.getElementById("statDiajukan");
    const elDisetujui = document.getElementById("statDisetujui");
    const elBerjalan = document.getElementById("statBerjalan");
    const elSelesai = document.getElementById("statSelesai");

    if (elDiajukan) elDiajukan.textContent = counts.diajukan;
    if (elDisetujui) elDisetujui.textContent = counts.disetujui;
    if (elBerjalan) elBerjalan.textContent = counts.berjalan;
    if (elSelesai) elSelesai.textContent = counts.selesai;
  }

  /* ============================================
     Render baris tabel
     ============================================ */
  function renderTabel(data) {
    const tbody = document.getElementById("prokerTableBody");
    const emptyState = document.getElementById("emptyState");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (p) {
      const tr = document.createElement("tr");

      const kategoriLabel =
        p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";

      tr.innerHTML =
        '<td>' +
          '<span class="proker-table__nama">' +
            escapeHtml(p.nama) +
          "</span>" +
          '<span class="proker-table__kategori">' +
            escapeHtml(kategoriLabel) +
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
            escapeHtml(labelPengajuan[p.status_pengajuan] || p.status_pengajuan) +
          "</span>" +
        "</td>" +
        "<td>" +
          '<span class="' +
            (badgeProgress[p.status_progress] || "badge bg-secondary") +
            '">' +
            escapeHtml(labelProgress[p.status_progress] || p.status_progress) +
          "</span>" +
        "</td>" +
        '<td class="text-end">' +
          '<a href="../proker-detail/index.html?id=' +
            p.id +
            '" class="btn-detail" ' +
            'aria-label="Lihat detail proker ' +
            escapeHtml(p.nama) +
            '">' +
            '<i class="bi bi-eye"></i> Detail' +
          "</a>" +
        "</td>";

      tbody.appendChild(tr);
    });
  }

  /* ============================================
     Filter
     ============================================ */
  function applyFilter() {
    const fPengajuan = document.getElementById("filterPengajuan").value;
    const fProgress = document.getElementById("filterProgress").value;

    const filtered = dummyProker.filter(function (p) {
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
    renderStatistik(dummyProker);
    renderTabel(dummyProker);

    const fPengajuan = document.getElementById("filterPengajuan");
    const fProgress = document.getElementById("filterProgress");
    const resetBtn = document.getElementById("resetFilter");

    if (fPengajuan) fPengajuan.addEventListener("change", applyFilter);
    if (fProgress) fProgress.addEventListener("change", applyFilter);

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        fPengajuan.value = "";
        fProgress.value = "";
        applyFilter();
      });
    }
  });
})();