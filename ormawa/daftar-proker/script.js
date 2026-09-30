/* eslint-env browser */
/* global console, ProkerIn, sb, alert */

/* ============================================
   ProkerIn — Daftar Proker Script
   Data dari Supabase + render tabel + filter + pencarian
   ============================================ */

(function () {
  "use strict";

  let semuaProker = [];

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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ============================================
     Render baris tabel
     ============================================ */
  function renderTabel(data) {
    const tbody = document.getElementById("prokerTableBody");
    const emptyState = document.getElementById("emptyState");
    const hasilCount = document.getElementById("hasilCount");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (hasilCount) {
      hasilCount.textContent =
        "Menampilkan " + data.length + " dari " + semuaProker.length + " proker";
    }

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
     Filter + pencarian
     ============================================ */
  function applyFilter() {
    const fPengajuan = document.getElementById("filterPengajuan").value;
    const fProgress = document.getElementById("filterProgress").value;
    const kataKunci = document
      .getElementById("searchNama")
      .value.trim()
      .toLowerCase();

    const filtered = semuaProker.filter(function (p) {
      if (fPengajuan && p.status_pengajuan !== fPengajuan) return false;
      if (fProgress && p.status_progress !== fProgress) return false;
      if (kataKunci && p.nama.toLowerCase().indexOf(kataKunci) === -1) {
        return false;
      }
      return true;
    });

    renderTabel(filtered);
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  async function muatProker() {
    const { data, error } = await sb
      .from("proker")
      .select("*")
      .order("jadwal_mulai", { ascending: false });
    if (error) {
      console.error("[ProkerIn] Gagal memuat proker:", error);
      alert("Gagal memuat data proker. Coba muat ulang halaman.");
      return [];
    }
    return data || [];
  }

  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready; // tunggu sesi & role terverifikasi
    semuaProker = await muatProker();
    renderTabel(semuaProker);

    const fPengajuan = document.getElementById("filterPengajuan");
    const fProgress = document.getElementById("filterProgress");
    const search = document.getElementById("searchNama");
    const resetBtn = document.getElementById("resetFilter");

    if (fPengajuan) fPengajuan.addEventListener("change", applyFilter);
    if (fProgress) fProgress.addEventListener("change", applyFilter);
    if (search) search.addEventListener("input", applyFilter);

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        fPengajuan.value = "";
        fProgress.value = "";
        search.value = "";
        applyFilter();
      });
    }
  });
})();