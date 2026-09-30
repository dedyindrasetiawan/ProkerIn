/* eslint-env browser */
/* global console, ProkerIn, sb, alert, Blob, URL, document */

/* ============================================
   ProkerIn — Admin Ekspor Script
   Filter laporan + preview + ekspor CSV asli
   Data dari Supabase
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     State
     ============================================ */
  var semuaProker = [];
  var semuaLpj = {}; // map proker_id -> { status_verifikasi, ... }
  var ormawaMap = {};

  /* ============================================
     Mapping label
     ============================================ */
  var labelPengajuan = {
    diajukan: "Diajukan",
    direvisi: "Direvisi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
  };
  var labelVerifikasi = {
    menunggu: "Menunggu",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
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

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showAlert(message, type) {
    var el = document.getElementById("pageAlert");
    if (!el) return;
    type = type || "success";
    el.className = "alert alert-" + type;
    el.textContent = message;
    el.classList.remove("d-none");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(function () { el.classList.add("d-none"); }, 4500);
  }

  /* ============================================
     Filter dari form
     ============================================ */
  function getFilter() {
    var jenisEl = document.querySelector('input[name="jenisLaporan"]:checked');
    var formatEl = document.querySelector('input[name="formatEkspor"]:checked');
    return {
      periode: document.getElementById("periode").value,
      ormawa: document.getElementById("ormawa").value,
      tanggalDari: document.getElementById("tanggalDari").value,
      tanggalSampai: document.getElementById("tanggalSampai").value,
      status: document.getElementById("statusFilter").value,
      jenis: jenisEl ? jenisEl.value : "rekap",
      format: formatEl ? formatEl.value : "excel",
    };
  }

  /* ============================================
     Filter data
     ============================================ */
  function filterData(f) {
    return semuaProker.filter(function (p) {
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
    var totalAnggaran = 0;
    var disetujui = 0;
    var ditolak = 0;
    var lpjVerified = 0;

    data.forEach(function (p) {
      totalAnggaran += Number(p.anggaran) || 0;
      if (p.status_pengajuan === "disetujui") disetujui++;
      if (p.status_pengajuan === "ditolak") ditolak++;
      var lpj = semuaLpj[p.id];
      if (lpj && lpj.status_verifikasi === "terverifikasi") lpjVerified++;
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
    var box = document.getElementById("previewBox");

    if (!data.length) {
      box.innerHTML =
        '<p class="preview-empty">' +
          '<i class="bi bi-inbox" aria-hidden="true"></i>' +
          "Tidak ada data yang cocok dengan filter." +
        "</p>";
      return;
    }

    if (f.jenis === "rekap") {
      var html =
        '<table class="preview-table"><thead><tr>' +
          "<th>No</th><th>Proker</th><th>Ormawa</th><th>Status</th>" +
        "</tr></thead><tbody>";
      data.slice(0, 30).forEach(function (p, i) {
        var ormawa = getOrmawa(p.ormawa_id);
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
      var perOrmawa = {};
      data.forEach(function (p) {
        if (!perOrmawa[p.ormawa_id]) perOrmawa[p.ormawa_id] = 0;
        perOrmawa[p.ormawa_id] += Number(p.anggaran) || 0;
      });

      var htmlA =
        '<table class="preview-table"><thead><tr>' +
          "<th>Ormawa</th><th>Jumlah Proker</th><th>Total Anggaran</th>" +
        "</tr></thead><tbody>";
      var grandTotal = 0;
      Object.keys(perOrmawa).forEach(function (id) {
        var ormawa = getOrmawa(parseInt(id, 10));
        var jumlah = data.filter(function (p) {
          return String(p.ormawa_id) === String(id);
        }).length;
        grandTotal += perOrmawa[id];
        htmlA +=
          "<tr>" +
            "<td>" + escapeHtml(ormawa.nama) + "</td>" +
            '<td class="num">' + jumlah + "</td>" +
            '<td class="num">' + escapeHtml(formatRupiah(perOrmawa[id])) + "</td>" +
          "</tr>";
      });
      htmlA +=
        "<tr><td><strong>Total</strong></td>" +
          '<td class="num"><strong>' + data.length + "</strong></td>" +
          '<td class="num"><strong>' + escapeHtml(formatRupiah(grandTotal)) + "</strong></td></tr>";
      htmlA += "</tbody></table>";
      box.innerHTML = htmlA;
    } else if (f.jenis === "lpj") {
      var withLpj = data.filter(function (p) { return semuaLpj[p.id]; });
      if (!withLpj.length) {
        box.innerHTML =
          '<p class="preview-empty">' +
            '<i class="bi bi-info-circle" aria-hidden="true"></i>' +
            "Belum ada LPJ pada data yang difilter." +
          "</p>";
        return;
      }
      var htmlL =
        '<table class="preview-table"><thead><tr>' +
          "<th>Proker</th><th>Ormawa</th><th>Status LPJ</th>" +
        "</tr></thead><tbody>";
      withLpj.forEach(function (p) {
        var ormawa = getOrmawa(p.ormawa_id);
        var lpj = semuaLpj[p.id];
        htmlL +=
          "<tr>" +
            "<td>" + escapeHtml(p.nama) + "</td>" +
            "<td>" + escapeHtml(ormawa.nama) + "</td>" +
            "<td>" + escapeHtml(labelVerifikasi[lpj.status_verifikasi] || lpj.status_verifikasi) + "</td>" +
          "</tr>";
      });
      htmlL += "</tbody></table>";
      box.innerHTML = htmlL;
    }
  }

  /* ============================================
     Riwayat ekspor (in-memory, per sesi)
     ============================================ */
  var riwayatEkspor = [];

  function renderRiwayat() {
    var list = document.getElementById("riwayatList");
    if (!list) return;

    if (!riwayatEkspor.length) {
      list.innerHTML =
        '<li class="riwayat-empty">Belum ada riwayat ekspor.</li>';
      return;
    }

    list.innerHTML = riwayatEkspor.map(function (r) {
      var isExcel = r.format === "excel";
      var iconClass = isExcel
        ? "riwayat-item__icon--excel"
        : "riwayat-item__icon--pdf";
      var iconName = isExcel
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
  function populateOrmawa(list) {
    var sel = document.getElementById("ormawa");
    if (!sel) return;
    while (sel.options.length > 1) sel.remove(1);
    list.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = String(o.id);
      opt.textContent = o.nama;
      sel.appendChild(opt);
    });
  }

  /* ============================================
     Generate CSV + trigger download
     ============================================ */
  function csvEscape(val) {
    if (val === null || val === undefined) return "";
    var s = String(val);
    // Kalau ada koma, kutip, atau newline → bungkus dengan kutip ganda
    if (/[",\n\r]/.test(s)) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function rowsToCsv(rows) {
    return rows
      .map(function (row) {
        return row.map(csvEscape).join(",");
      })
      .join("\r\n");
  }

  function downloadCsv(namaFile, csvContent) {
    // Tambah BOM supaya Excel baca UTF-8 dengan benar
    var blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = namaFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function buildRowsForCsv(data, f) {
    if (f.jenis === "rekap") {
      var rows = [
        ["No", "Nama Proker", "Ormawa", "Kategori", "Jadwal Mulai",
         "Jadwal Selesai", "Anggaran", "Status Pengajuan",
         "Status Progress", "PJ"],
      ];
      data.forEach(function (p, i) {
        var ormawa = getOrmawa(p.ormawa_id);
        rows.push([
          i + 1,
          p.nama,
          ormawa.nama,
          p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan",
          p.jadwal_mulai,
          p.jadwal_selesai,
          p.anggaran,
          labelPengajuan[p.status_pengajuan] || p.status_pengajuan,
          p.status_progress,
          (p.pj_nama || "") + (p.pj_jabatan ? " (" + p.pj_jabatan + ")" : ""),
        ]);
      });
      return rows;
    } else if (f.jenis === "anggaran") {
      var perOrmawa = {};
      data.forEach(function (p) {
        if (!perOrmawa[p.ormawa_id]) {
          perOrmawa[p.ormawa_id] = { jumlah: 0, total: 0 };
        }
        perOrmawa[p.ormawa_id].jumlah++;
        perOrmawa[p.ormawa_id].total += Number(p.anggaran) || 0;
      });
      var rowsA = [["Ormawa", "Jenis", "Jumlah Proker", "Total Anggaran"]];
      var grand = 0;
      Object.keys(perOrmawa).forEach(function (id) {
        var ormawa = getOrmawa(parseInt(id, 10));
        grand += perOrmawa[id].total;
        rowsA.push([
          ormawa.nama,
          (ormawa.jenis || "-").toUpperCase(),
          perOrmawa[id].jumlah,
          perOrmawa[id].total,
        ]);
      });
      rowsA.push(["TOTAL", "", data.length, grand]);
      return rowsA;
    } else if (f.jenis === "lpj") {
      var withLpj = data.filter(function (p) { return semuaLpj[p.id]; });
      var rowsL = [["Nama Proker", "Ormawa", "Status LPJ",
                    "Nama File", "Deskripsi", "Tanggal Upload",
                    "Catatan Verifikasi"]];
      withLpj.forEach(function (p) {
        var ormawa = getOrmawa(p.ormawa_id);
        var lpj = semuaLpj[p.id];
        rowsL.push([
          p.nama,
          ormawa.nama,
          labelVerifikasi[lpj.status_verifikasi] || lpj.status_verifikasi,
          lpj.file_nama || "",
          lpj.deskripsi || "",
          lpj.uploaded_at || "",
          lpj.catatan_verifikasi || "",
        ]);
      });
      return rowsL;
    }
    return [];
  }

  /* ============================================
     Event: preview
     ============================================ */
  function setupPreview() {
    var btn = document.getElementById("previewBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var f = getFilter();
      var data = filterData(f);
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
    var form = document.getElementById("eksporForm");
    var btn = document.getElementById("exportBtn");
    var spinner = document.getElementById("exportSpinner");
    var icon = document.getElementById("exportIcon");
    var text = document.getElementById("exportText");

    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = getFilter();
      var data = filterData(f);

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
        var rows = buildRowsForCsv(data, f);
        var csv = rowsToCsv(rows);

        var jenisLabel = {
          rekap: "Rekap-Proker",
          anggaran: "Rekap-Anggaran",
          lpj: "Rekap-LPJ",
        }[f.jenis];

        var ormawaLabel = f.ormawa
          ? getOrmawa(parseInt(f.ormawa, 10)).nama.replace(/\s+/g, "-")
          : "Semua-Ormawa";

        // Format CSV selalu .csv (Excel & Google Sheets bisa buka).
        // Kalau user pilih PDF, kita tetap ekspor CSV + kasih notice.
        var namaFile =
          "ProkerIn_" + jenisLabel + "_" + ormawaLabel + "_" +
          f.periode.replace("/", "-") + ".csv";

        try {
          downloadCsv(namaFile, csv);
        } catch (err) {
          console.error("[ProkerIn] Gagal download CSV:", err);
          showAlert("Gagal mengunduh berkas: " + err.message, "danger");
          btn.disabled = false;
          spinner.classList.add("d-none");
          icon.classList.remove("d-none");
          text.textContent = "Ekspor Laporan";
          return;
        }

        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Ekspor Laporan";
        btn.disabled = false;

        riwayatEkspor.unshift({
          nama: namaFile,
          format: f.format,
          jenis: jenisLabel.replace(/-/g, " "),
          periode: f.periode,
          waktu: "Baru saja",
        });
        renderRiwayat();

        console.log("[ProkerIn] Ekspor CSV dijalankan:", {
          filter: f,
          jumlah: data.length,
          namaFile: namaFile,
        });

        var catatan = f.format === "pdf"
          ? " (format PDF belum tersedia — berkas diunduh sebagai CSV)"
          : "";

        showAlert(
          "Laporan berhasil dibuat: " + namaFile +
          " (" + data.length + " proker)." + catatan,
          "success"
        );

        renderRingkasan(data);
        renderPreview(data, f);
      }, 900);
    });
  }

  /* ============================================
     Fetch dari Supabase
     ============================================ */
  async function muatData() {
    var results = await Promise.all([
      sb.from("proker").select("*").order("created_at", { ascending: false }),
      sb.from("ormawa").select("id, nama, jenis").order("nama"),
      sb.from("lpj").select("proker_id, status_verifikasi, file_nama, deskripsi, uploaded_at, catatan_verifikasi"),
    ]);

    var prokerRes = results[0];
    var ormawaRes = results[1];
    var lpjRes = results[2];

    if (prokerRes.error) {
      console.error("[ProkerIn] Gagal memuat proker:", prokerRes.error);
      alert("Gagal memuat data proker.");
      return { proker: [], ormawa: [], lpj: [] };
    }
    if (ormawaRes.error) {
      console.error("[ProkerIn] Gagal memuat ormawa:", ormawaRes.error);
      alert("Gagal memuat data ormawa.");
      return { proker: [], ormawa: [], lpj: [] };
    }
    if (lpjRes.error) {
      console.warn("[ProkerIn] Gagal memuat LPJ:", lpjRes.error);
      // LPJ opsional — lanjut walau kosong
    }

    return {
      proker: prokerRes.data || [],
      ormawa: ormawaRes.data || [],
      lpj: lpjRes.data || [],
    };
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready; // WAJIB

    var hasil = await muatData();
    semuaProker = hasil.proker;

    ormawaMap = {};
    hasil.ormawa.forEach(function (o) {
      ormawaMap[o.id] = o;
    });

    semuaLpj = {};
    hasil.lpj.forEach(function (l) {
      semuaLpj[l.proker_id] = l;
    });

    populateOrmawa(hasil.ormawa);
    renderRiwayat();
    setupPreview();
    setupExport();

    renderRingkasan(semuaProker);
  });
})();