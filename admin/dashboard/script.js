/* eslint-env browser */
/* global console, ProkerIn, sb, alert */

/* ============================================
   ProkerIn — Admin Dashboard Script
   Data dari Supabase + rekap kampus + filter
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     State
     ============================================ */
  var ormawaMap = {}; // id -> { nama, jenis }
  var semuaProker = []; // cache hasil fetch

  /* ============================================
     Mapping label & badge
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
  var labelProgress = {
    belum_mulai: "Belum Mulai",
    berjalan: "Berjalan",
    selesai: "Selesai",
    ditunda: "Ditunda",
  };
  var badgeProgress = {
    belum_mulai: "badge bg-secondary",
    berjalan: "badge bg-success",
    selesai: "badge bg-dark",
    ditunda: "badge bg-warning text-dark",
  };

  /* ============================================
     Helper format (lokal, sesuai gaya existing)
     ============================================ */
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

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getOrmawa(id) {
    return ormawaMap[id] || { id: id, nama: "Ormawa #" + id, jenis: "-" };
  }

  /* ============================================
     Render statistik
     ============================================ */
  function renderStatistik(data) {
    var counts = { diajukan: 0, disetujui: 0, berjalan: 0, selesai: 0 };
    data.forEach(function (p) {
      if (p.status_pengajuan === "diajukan") counts.diajukan++;
      if (p.status_pengajuan === "disetujui") counts.disetujui++;
      if (p.status_progress === "berjalan") counts.berjalan++;
      if (p.status_progress === "selesai") counts.selesai++;
    });
    var elD = document.getElementById("statDiajukan");
    var elS = document.getElementById("statDisetujui");
    var elB = document.getElementById("statBerjalan");
    var elF = document.getElementById("statSelesai");
    if (elD) elD.textContent = counts.diajukan;
    if (elS) elS.textContent = counts.disetujui;
    if (elB) elB.textContent = counts.berjalan;
    if (elF) elF.textContent = counts.selesai;
  }

  /* ============================================
     Render rekap per ormawa (kartu)
     ============================================ */
  function renderRekapOrmawa(data) {
    var container = document.getElementById("rekapOrmawaList");
    if (!container) return;

    var perOrmawa = {};
    data.forEach(function (p) {
      if (!perOrmawa[p.ormawa_id]) {
        perOrmawa[p.ormawa_id] = {
          total: 0, diajukan: 0, disetujui: 0, berjalan: 0, selesai: 0,
        };
      }
      var g = perOrmawa[p.ormawa_id];
      g.total++;
      if (p.status_pengajuan === "diajukan") g.diajukan++;
      if (p.status_pengajuan === "disetujui") g.disetujui++;
      if (p.status_progress === "berjalan") g.berjalan++;
      if (p.status_progress === "selesai") g.selesai++;
    });

    var entries = Object.keys(perOrmawa)
      .map(function (k) {
        return { ormawa_id: parseInt(k, 10), data: perOrmawa[k] };
      })
      .sort(function (a, b) {
        return b.data.total - a.data.total;
      })
      .slice(0, 8);

    if (!entries.length) {
      container.innerHTML =
        '<div class="col-12"><p class="text-muted mb-0 text-center py-3">Belum ada data proker.</p></div>';
      return;
    }

    container.innerHTML = entries
      .map(function (e) {
        var o = getOrmawa(e.ormawa_id);
        var d = e.data;
        return (
          '<div class="col-12 col-sm-6 col-lg-3">' +
            '<article class="ormawa-card">' +
              '<div class="ormawa-card__header">' +
                '<h4 class="ormawa-card__nama">' +
                  escapeHtml(o.nama) +
                "</h4>" +
                '<span class="ormawa-card__jenis">' +
                  escapeHtml((o.jenis || "-").toUpperCase()) +
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
     Populate dropdown filter ormawa
     ============================================ */
  function populateFilterOrmawa(list) {
    var sel = document.getElementById("filterOrmawa");
    if (!sel) return;
    list.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = String(o.id);
      opt.textContent = o.nama;
      sel.appendChild(opt);
    });
  }

  /* ============================================
     Filter
     ============================================ */
  function applyFilter() {
    var fOrmawa = document.getElementById("filterOrmawa").value;
    var fPengajuan = document.getElementById("filterPengajuan").value;
    var fProgress = document.getElementById("filterProgress").value;

    var filtered = semuaProker.filter(function (p) {
      if (fOrmawa && String(p.ormawa_id) !== fOrmawa) return false;
      if (fPengajuan && p.status_pengajuan !== fPengajuan) return false;
      if (fProgress && p.status_progress !== fProgress) return false;
      return true;
    });

    renderTabel(filtered);
  }

  /* ============================================
     Fetch dari Supabase
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

    // Build map ormawa untuk lookup cepat
    ormawaMap = {};
    hasil.ormawa.forEach(function (o) {
      ormawaMap[o.id] = o;
    });

    // Render
    populateFilterOrmawa(hasil.ormawa);
    renderStatistik(semuaProker);
    renderRekapOrmawa(semuaProker);
    renderTabel(semuaProker);

    // Event filter
    var fOrmawa = document.getElementById("filterOrmawa");
    var fPengajuan = document.getElementById("filterPengajuan");
    var fProgress = document.getElementById("filterProgress");
    var resetBtn = document.getElementById("resetFilter");

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