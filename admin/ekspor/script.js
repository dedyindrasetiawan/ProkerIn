/* eslint-env browser */
/* global console */

/* ============================================
   ProkerIn — Admin Ekspor Script
   Filter laporan + preview + simulasi ekspor
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
    { id: 1, ormawa_id: 5, nama: "Pelatihan Public Speaking Anggota Baru",
      kategori: "pendanaan", jadwal_mulai: "2025-11-05",
      jadwal_selesai: "2025-11-07", anggaran: 2500000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
      lpj_status: null },
    { id: 2, ormawa_id: 5, nama: "Seminar Nasional Teknologi Pendidikan",
      kategori: "pendanaan", jadwal_mulai: "2025-12-01",
      jadwal_selesai: "2025-12-01", anggaran: 7500000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 3, ormawa_id: 5, nama: "Bakti Sosial Desa Binaan",
      kategori: "non_pendanaan", jadwal_mulai: "2025-10-20",
      jadwal_selesai: "2025-10-21", anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
      lpj_status: "menunggu" },
    { id: 4, ormawa_id: 2, nama: "Festival Sastra Bulan Bahasa",
      kategori: "pendanaan", jadwal_mulai: "2025-10-28",
      jadwal_selesai: "2025-10-30", anggaran: 4200000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
      lpj_status: null },
    { id: 5, ormawa_id: 2, nama: "Workshop Penulisan Puisi",
      kategori: "non_pendanaan", jadwal_mulai: "2025-11-12",
      jadwal_selesai: "2025-11-12", anggaran: 0,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 6, ormawa_id: 3, nama: "Seminar Kebangsaan dan Pancasila",
      kategori: "pendanaan", jadwal_mulai: "2025-11-18",
      jadwal_selesai: "2025-11-18", anggaran: 5500000,
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 7, ormawa_id: 4, nama: "Pelatihan Akuntansi Dasar",
      kategori: "pendanaan", jadwal_mulai: "2025-11-22",
      jadwal_selesai: "2025-11-23", anggaran: 3200000,
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 8, ormawa_id: 6, nama: "Olimpiade Matematika Internal",
      kategori: "pendanaan", jadwal_mulai: "2025-12-05",
      jadwal_selesai: "2025-12-05", anggaran: 2800000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 9, ormawa_id: 7, nama: "Kejuaraan Taekwondo Antar Sabuk",
      kategori: "pendanaan", jadwal_mulai: "2025-11-30",
      jadwal_selesai: "2025-12-01", anggaran: 6000000,
      status_pengajuan: "disetujui", status_progress: "berjalan",
      lpj_status: null },
    { id: 10, ormawa_id: 9, nama: "Donor Darah Bersama PMI",
      kategori: "non_pendanaan", jadwal_mulai: "2025-10-15",
      jadwal_selesai: "2025-10-15", anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
      lpj_status: "terverifikasi" },
    { id: 11, ormawa_id: 10, nama: "Kemah Bakti Pramuka",
      kategori: "pendanaan", jadwal_mulai: "2025-12-20",
      jadwal_selesai: "2025-12-22", anggaran: 8000000,
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 12, ormawa_id: 11, nama: "Kajian Rutin Keislaman",
      kategori: "non_pendanaan", jadwal_mulai: "2025-11-08",
      jadwal_selesai: "2025-11-08", anggaran: 0,
      status_pengajuan: "disetujui", status_progress: "selesai",
      lpj_status: "terverifikasi" },
    { id: 13, ormawa_id: 13, nama: "Pentas Seni Akhir Tahun",
      kategori: "pendanaan", jadwal_mulai: "2025-12-15",
      jadwal_selesai: "2025-12-15", anggaran: 9000000,
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 14, ormawa_id: 15, nama: "Workshop Videografi dan Editing",
      kategori: "pendanaan", jadwal_mulai: "2025-11-25",
      jadwal_selesai: "2025-11-26", anggaran: 3500000,
      status_pengajuan: "ditolak", status_progress: "belum_mulai",
      lpj_status: null },
    { id: 15, ormawa_id: 16, nama: "Konser Mini SAF Musik",
      kategori: "pendanaan", jadwal_mulai: "2025-12-08",
      jadwal_selesai: "2025-12-08", anggaran: 4000000,
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
      lpj_status: null },
  ];

  const labelPengajuan = {
    diajukan: "Diajukan", direvisi: "Direvisi",
    disetujui: "Disetujui", ditolak: "Ditolak",
  };
  const labelVerifikasi = {
    menunggu: "Menunggu", terverifikasi: "Terverifikasi", ditolak: "Ditolak",
  };

  /* ============================================
     Helper
     ============================================ */
  function getOrmawaById(id) {
    return (
      dummyOrmawa.find(function (o) { return o.id === id; }) ||
      { id: id, nama: "Ormawa #" + id, jenis: "-" }
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

  function formatDatetime(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    const bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const jam = String(d.getHours()).padStart(2, "0");
    const menit = String(d.getMinutes()).padStart(2, "0");
    return (
      d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear() +
      " \u00b7 " + jam + ":" + menit
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

  function showAlert(message, type) {
    const el = document.getElementById("pageAlert");
    if (!el) return;
    type = type || "success";
    el.className = "alert alert-" + type;
    el.textContent = message;
    el.classList.remove("d-none");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(function () { el.classList.add("d-none"); }, 4500);
  }

  /* ============================================
     Ambil filter dari form
     ============================================ */
  function getFilter() {
    const ormawaEl = document.querySelector('input[name="jenisLaporan"]:checked');
    const formatEl = document.querySelector('input[name="formatEkspor"]:checked');
    return {
      periode: document.getElementById("periode").value,
      ormawa: document.getElementById("ormawa").value,
      tanggalDari: document.getElementById("tanggalDari").value,
      tanggalSampai: document.getElementById("tanggalSampai").value,
      status: document.getElementById("statusFilter").value,
      jenis: ormawaEl ? ormawaEl.value : "rekap",
      format: formatEl ? formatEl.value : "excel",
    };
  }

  /* ============================================
     Filter data berdasarkan filter
     ============================================ */
  function filterData(f) {
    return dummyProker.filter(function (p) {
      if (f.ormawa && String(p.ormawa_id) !== f.ormawa) return false;
      if (f.status && p.status_pengajuan !== f.status) return false;
      if (f.tanggalDari && p.jadwal_mulai < f.tanggalDari) return false;
      if (f.tanggalSampai && p.jadwal_selesai > f.tanggalSampai) return false;
      return true;
    });
  }

  /* ============================================
     Render ringkasan kanan
     ============================================ */
  function renderRingkasan(data) {
    let totalAnggaran = 0;
    let disetujui = 0;
    let ditolak = 0;
    let lpjVerified = 0;

    data.forEach(function (p) {
      totalAnggaran += p.anggaran || 0;
      if (p.status_pengajuan === "disetujui") disetujui++;
      if (p.status_pengajuan === "ditolak") ditolak++;
      if (p.lpj_status === "terverifikasi") lpjVerified++;
    });

    document.getElementById("sumTotalProker").textContent = data.length;
    document.getElementById("sumDisetujui").textContent = disetujui;
    document.getElementById("sumDitolak").textContent = ditolak;
    document.getElementById("sumAnggaran").textContent = formatRupiah(totalAnggaran);
    document.getElementById("sumLpjVerified").textContent = lpjVerified;
  }

  /* ============================================
     Render preview tabel
     ============================================ */
  function renderPreview(data, f) {
    const box = document.getElementById("previewBox");

    if (!data.length) {
      box.innerHTML =
        '<p class="preview-empty">' +
          '<i class="bi bi-inbox" aria-hidden="true"></i>' +
          "Tidak ada data yang cocok dengan filter." +
        "</p>";
      return;
    }

    if (f.jenis === "rekap") {
      let html =
        '<table class="preview-table"><thead><tr>' +
          "<th>No</th><th>Proker</th><th>Ormawa</th><th>Status</th>" +
        "</tr></thead><tbody>";
      data.slice(0, 30).forEach(function (p, i) {
        const ormawa = getOrmawaById(p.ormawa_id);
        html +=
          "<tr>" +
            "<td>" + (i + 1) + "</td>" +
            "<td>" + escapeHtml(p.nama) + "</td>" +
            "<td>" + escapeHtml(ormawa.nama) + "</td>" +
            "<td>" + escapeHtml(labelPengajuan[p.status_pengajuan] || p.status_pengajuan) + "</td>" +
          "</tr>";
      });
      html += "</tbody></table>";
      if (data.length > 30) {
        html += '<p class="text-muted small mt-2 mb-0">Menampilkan 30 dari ' +
          data.length + " baris.</p>";
      }
      box.innerHTML = html;
    } else if (f.jenis === "anggaran") {
      // Kelompokkan per ormawa
      const perOrmawa = {};
      data.forEach(function (p) {
        if (!perOrmawa[p.ormawa_id]) perOrmawa[p.ormawa_id] = 0;
        perOrmawa[p.ormawa_id] += p.anggaran || 0;
      });

      let html =
        '<table class="preview-table"><thead><tr>' +
          "<th>Ormawa</th><th>Jumlah Proker</th><th>Total Anggaran</th>" +
        "</tr></thead><tbody>";
      let grandTotal = 0;
      Object.keys(perOrmawa).forEach(function (id) {
        const ormawa = getOrmawaById(parseInt(id, 10));
        const jumlah = data.filter(function (p) {
          return String(p.ormawa_id) === String(id);
        }).length;
        grandTotal += perOrmawa[id];
        html +=
          "<tr>" +
            "<td>" + escapeHtml(ormawa.nama) + "</td>" +
            '<td class="num">' + jumlah + "</td>" +
            '<td class="num">' + escapeHtml(formatRupiah(perOrmawa[id])) + "</td>" +
          "</tr>";
      });
      html +=
        "<tr><td><strong>Total</strong></td>" +
          '<td class="num"><strong>' + data.length + "</strong></td>" +
          '<td class="num"><strong>' + escapeHtml(formatRupiah(grandTotal)) + "</strong></td></tr>";
      html += "</tbody></table>";
      box.innerHTML = html;
    } else if (f.jenis === "lpj") {
      const withLpj = data.filter(function (p) { return p.lpj_status; });
      if (!withLpj.length) {
        box.innerHTML =
          '<p class="preview-empty">' +
            '<i class="bi bi-info-circle" aria-hidden="true"></i>' +
            "Belum ada LPJ pada data yang difilter." +
          "</p>";
        return;
      }
      let html =
        '<table class="preview-table"><thead><tr>' +
          "<th>Proker</th><th>Ormawa</th><th>Status LPJ</th>" +
        "</tr></thead><tbody>";
      withLpj.forEach(function (p) {
        const ormawa = getOrmawaById(p.ormawa_id);
        html +=
          "<tr>" +
            "<td>" + escapeHtml(p.nama) + "</td>" +
            "<td>" + escapeHtml(ormawa.nama) + "</td>" +
            "<td>" + escapeHtml(labelVerifikasi[p.lpj_status] || p.lpj_status) + "</td>" +
          "</tr>";
      });
      html += "</tbody></table>";
      box.innerHTML = html;
    }
  }

  /* ============================================
     Riwayat ekspor (in-memory)
     ============================================ */
  const riwayatEkspor = [];

  function renderRiwayat() {
    const list = document.getElementById("riwayatList");
    if (!list) return;

    if (!riwayatEkspor.length) {
      list.innerHTML =
        '<li class="riwayat-empty">Belum ada riwayat ekspor.</li>';
      return;
    }

    list.innerHTML = riwayatEkspor.map(function (r) {
      const isExcel = r.format === "excel";
      const iconClass = isExcel
        ? "riwayat-item__icon--excel"
        : "riwayat-item__icon--pdf";
      const iconName = isExcel
        ? "bi-file-earmark-excel"
        : "bi-file-earmark-pdf";
      return (
        '<li class="riwayat-item">' +
          '<span class="riwayat-item__icon ' + iconClass + '">' +
            '<i class="bi ' + iconName + '"></i>' +
          "</span>" +
          '<div class="riwayat-item__info">' +
            '<span class="riwayat-item__nama">' + escapeHtml(r.nama) + "</span>" +
            '<span class="riwayat-item__meta">' +
              escapeHtml(r.jenis) + " \u00b7 " + escapeHtml(r.periode) +
            "</span>" +
          "</div>" +
          '<span class="riwayat-item__size">' + escapeHtml(r.waktu) + "</span>" +
        "</li>"
      );
    }).join("");
  }

  /* ============================================
     Populate dropdown ormawa
     ============================================ */
  function populateOrmawa() {
    const sel = document.getElementById("ormawa");
    if (!sel) return;
    dummyOrmawa.forEach(function (o) {
      const opt = document.createElement("option");
      opt.value = String(o.id);
      opt.textContent = o.nama;
      sel.appendChild(opt);
    });
  }

  /* ============================================
     Event: preview
     ============================================ */
  function setupPreview() {
    const btn = document.getElementById("previewBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const f = getFilter();
      const data = filterData(f);
      renderRingkasan(data);
      renderPreview(data, f);
      showAlert(
        "Pratinjau diperbarui: " + data.length + " proker.",
        "info"
      );
    });
  }

  /* ============================================
     Event: export
     ============================================ */
  function setupExport() {
    const form = document.getElementById("eksporForm");
    const btn = document.getElementById("exportBtn");
    const spinner = document.getElementById("exportSpinner");
    const icon = document.getElementById("exportIcon");
    const text = document.getElementById("exportText");

    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const f = getFilter();
      const data = filterData(f);

      if (!data.length) {
        showAlert(
          "Tidak ada data untuk diekspor. Ubah filter terlebih dahulu.",
          "danger"
        );
        return;
      }

      btn.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Menyiapkan...";

      setTimeout(function () {
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Ekspor Laporan";
        btn.disabled = false;

        const ext = f.format === "excel" ? "xlsx" : "pdf";
        const jenisLabel = {
          rekap: "Rekap-Proker",
          anggaran: "Rekap-Anggaran",
          lpj: "Rekap-LPJ",
        }[f.jenis];
        const ormawaLabel = f.ormawa
          ? getOrmawaById(parseInt(f.ormawa, 10)).nama.replace(/\s+/g, "-")
          : "Semua-Ormawa";
        const namaFile =
          "ProkerIn_" + jenisLabel + "_" + ormawaLabel + "_" +
          f.periode.replace("/", "-") + "." + ext;

        riwayatEkspor.unshift({
          nama: namaFile,
          format: f.format,
          jenis: jenisLabel.replace("-", " "),
          periode: f.periode,
          waktu: "Baru saja",
        });
        renderRiwayat();

        console.log("[ProkerIn] Ekspor dijalankan:", {
          filter: f,
          jumlah: data.length,
          namaFile: namaFile,
        });

        showAlert(
          "Laporan berhasil dibuat: " + namaFile +
          " (" + data.length + " proker).",
          "success"
        );

        // Buka preview juga biar user lihat isinya
        renderRingkasan(data);
        renderPreview(data, f);
      }, 1300);
    });
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    populateOrmawa();
    renderRiwayat();
    setupPreview();
    setupExport();

    // Render awal ringkasan dengan seluruh data
    renderRingkasan(dummyProker);
  });
})();