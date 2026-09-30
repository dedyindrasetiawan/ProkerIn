/* eslint-env browser */
/* global console, ProkerIn, sb, bootstrap, alert, confirm */

/* ============================================
   ProkerIn — Super Admin Periode Script
   Kelola periode kepengurusan per-ormawa (Supabase).
   - Fetch semua periode + jumlah proker per periode
   - Buka periode baru → INSERT untuk SEMUA ormawa aktif
     (otomatis arsipkan periode aktif lama per ormawa)
   - Arsipkan periode → UPDATE status = 'arsip'
   - Detail periode
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     State
     ============================================ */
  var semuaPeriode = [];      // baris mentah dari tabel periode
  var semuaOrmawa = [];       // untuk lookup nama ormawa
  var ormawaMap = {};
  var prokerCountByPeriode = {}; // map periode_id -> jumlah proker

  var state = {
    search: "",
    status: "",
    sortBy: "terbaru",
    confirmAction: null,
  };

  /* ============================================
     Helper
     ============================================ */
  function formatTanggal(dateStr) {
    if (!dateStr) return "\u2014";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    var bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatTanggalSingkat(dateStr) {
    if (!dateStr) return "\u2014";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    var bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function hitungDurasiBulan(mulai, selesai) {
    var d1 = new Date(mulai);
    var d2 = new Date(selesai);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    return (
      (d2.getFullYear() - d1.getFullYear()) * 12 +
      (d2.getMonth() - d1.getMonth()) +
      1
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
    var el = document.getElementById("pageAlert");
    if (!el) return;
    type = type || "success";
    el.className = "alert alert-" + type;
    el.textContent = message;
    el.classList.remove("d-none");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(function () { el.classList.add("d-none"); }, 4500);
  }

  function getOrmawa(id) {
    return ormawaMap[id] || { id: id, nama: "Ormawa #" + id, jenis: "-" };
  }

  /* ============================================
     Kartu periode aktif — KITA TAMPILKAN YANG PALING BARU
     (karena sekarang multi-ormawa, kita render sebagai list)
     ============================================ */
  function renderPeriodeAktif() {
    var card = document.getElementById("periodeAktifCard");
    if (!card) return;

    // Ambil semua periode berstatus aktif
    var aktifList = semuaPeriode.filter(function (p) { return p.status === "aktif"; });

    if (!aktifList.length) {
      card.innerHTML =
        '<div class="periode-aktif__empty">' +
          '<i class="bi bi-calendar-x" aria-hidden="true"></i>' +
          "<p>Belum ada periode aktif. Buka periode baru untuk memulai.</p>" +
        "</div>";
      return;
    }

    // Kelompokkan by label supaya ringkas (label sama = 1 baris, tampilkan jumlah ormawa)
    var byLabel = {};
    aktifList.forEach(function (p) {
      if (!byLabel[p.label]) {
        byLabel[p.label] = {
          label: p.label,
          tanggal_mulai: p.tanggal_mulai,
          tanggal_selesai: p.tanggal_selesai,
          catatan: p.catatan,
          jumlah_ormawa: 0,
          jumlah_proker: 0,
        };
      }
      byLabel[p.label].jumlah_ormawa++;
      byLabel[p.label].jumlah_proker += (prokerCountByPeriode[p.id] || 0);
    });

    var labels = Object.keys(byLabel).sort().reverse();
    if (!labels.length) return;

    // Tampilkan label terbaru sebagai hero
    var utama = byLabel[labels[0]];
    var durasi = hitungDurasiBulan(utama.tanggal_mulai, utama.tanggal_selesai);

    card.innerHTML =
      '<div class="periode-aktif__main">' +
        '<span class="periode-aktif__badge">' +
          '<i class="bi bi-circle-fill"></i>Periode Aktif' +
        "</span>" +
        '<h3 class="periode-aktif__label">' + escapeHtml(utama.label) + "</h3>" +
        '<p class="periode-aktif__rentang">' +
          '<i class="bi bi-calendar-event"></i>' +
          escapeHtml(formatTanggal(utama.tanggal_mulai)) + " \u2014 " +
          escapeHtml(formatTanggal(utama.tanggal_selesai)) +
        "</p>" +
        (utama.catatan
          ? '<p class="periode-aktif__rentang mt-2" style="opacity:0.7;">' +
            '<i class="bi bi-info-circle"></i>' + escapeHtml(utama.catatan) + "</p>"
          : "") +
      "</div>" +
      '<div class="periode-aktif__stats">' +
        '<div class="periode-aktif__stat">' +
          '<p class="periode-aktif__stat-value">' + utama.jumlah_ormawa + "</p>" +
          '<p class="periode-aktif__stat-label">Ormawa</p>' +
        "</div>" +
        '<div class="periode-aktif__stat">' +
          '<p class="periode-aktif__stat-value">' + utama.jumlah_proker + "</p>" +
          '<p class="periode-aktif__stat-label">Proker</p>' +
        "</div>" +
        '<div class="periode-aktif__stat">' +
          '<p class="periode-aktif__stat-value">' + durasi + "</p>" +
          '<p class="periode-aktif__stat-label">Bulan</p>' +
        "</div>" +
      "</div>";
  }

  /* ============================================
     Filter + Sort
     ============================================ */
  function getFiltered() {
    var q = state.search.toLowerCase();

    var list = semuaPeriode.filter(function (p) {
      if (state.status && p.status !== state.status) return false;
      if (q) {
        var ormawa = getOrmawa(p.ormawa_id);
        var hay = (p.label + " " + ormawa.nama).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    list = list.slice();
    list.sort(function (a, b) {
      var da = new Date(a.tanggal_mulai);
      var db = new Date(b.tanggal_mulai);
      return state.sortBy === "terbaru" ? db - da : da - db;
    });

    return list;
  }

  /* ============================================
     Render tabel
     ============================================ */
  function renderTabel(data) {
    var tbody = document.getElementById("periodeTableBody");
    var emptyState = document.getElementById("emptyState");
    var totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " periode";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (p) {
      var isAktif = p.status === "aktif";
      var durasi = hitungDurasiBulan(p.tanggal_mulai, p.tanggal_selesai);
      var ormawa = getOrmawa(p.ormawa_id);
      var jumlahProker = prokerCountByPeriode[p.id] || 0;

      var tr = document.createElement("tr");
      if (isAktif) tr.classList.add("is-aktif");

      var labelIcon = isAktif ? "bi-calendar-check-fill" : "bi-calendar3";
      var labelClass = isAktif ? "periode-label--aktif" : "";

      var statusCell = isAktif
        ? '<span class="status-badge status-badge--aktif">' +
            '<i class="bi bi-circle-fill"></i>Aktif</span>'
        : '<span class="status-badge status-badge--arsip">' +
            '<i class="bi bi-archive"></i>Arsip</span>';

      // Aksi dropdown
      var aksiItems = "";
      aksiItems +=
        '<li><button class="dropdown-item" data-action="detail" data-id="' + p.id + '">' +
          '<i class="bi bi-eye"></i> Lihat Detail</button></li>';
      if (isAktif) {
        aksiItems +=
          '<li><hr class="dropdown-divider"></li>' +
          '<li><button class="dropdown-item dropdown-item--warning" data-action="arsip" data-id="' + p.id + '">' +
            '<i class="bi bi-archive"></i> Arsipkan Periode</button></li>';
      }

      tr.innerHTML =
        "<td>" +
          '<span class="periode-label ' + labelClass + '">' +
            '<i class="bi ' + labelIcon + '"></i>' + escapeHtml(p.label) +
          "</span>" +
          '<span class="d-block text-muted mt-1" style="font-size:0.75rem;">' +
            escapeHtml(ormawa.nama) +
          "</span>" +
        "</td>" +
        '<td class="periode-rentang">' +
          '<i class="bi bi-calendar-event"></i>' +
          escapeHtml(formatTanggalSingkat(p.tanggal_mulai)) + " \u2014 " +
          escapeHtml(formatTanggalSingkat(p.tanggal_selesai)) +
        "</td>" +
        '<td class="periode-durasi">' +
          durasi + " bulan" +
        "</td>" +
        '<td class="periode-proker">' +
          '<i class="bi bi-clipboard-data"></i>' +
          jumlahProker +
          " <small>proker</small>" +
        "</td>" +
        "<td>" + statusCell + "</td>" +
        '<td class="text-end">' +
          '<div class="dropdown">' +
            '<button class="btn-action dropdown-toggle" type="button" ' +
              'data-bs-toggle="dropdown" aria-expanded="false" ' +
              'aria-label="Aksi untuk periode ' + escapeHtml(p.label) + '">' +
              '<i class="bi bi-three-dots-vertical"></i>' +
            "</button>" +
            '<ul class="dropdown-menu dropdown-menu-end">' + aksiItems + "</ul>" +
          "</div>" +
        "</td>";

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var aksi = btn.getAttribute("data-action");
        var id = parseInt(btn.getAttribute("data-id"), 10);
        handleAction(aksi, id);
      });
    });
  }

  /* ============================================
     Handle action
     ============================================ */
  function handleAction(aksi, id) {
    var periode = semuaPeriode.find(function (p) { return p.id === id; });
    if (!periode) return;

    if (aksi === "detail") {
      openDetailModal(periode);
    } else if (aksi === "arsip") {
      var ormawa = getOrmawa(periode.ormawa_id);
      openConfirmModal(
        "Arsipkan Periode?",
        "Periode " + periode.label + " untuk " + ormawa.nama +
        " akan diubah statusnya menjadi arsip. Data proker & LPJ tetap tersimpan.",
        function () {
          sb
            .from("periode")
            .update({ status: "arsip" })
            .eq("id", id)
            .then(function (res) {
              if (res.error) {
                console.error("[ProkerIn] Gagal arsipkan:", res.error);
                showAlert("Gagal mengarsipkan: " + res.error.message, "danger");
                return;
              }
              periode.status = "arsip";
              showAlert(
                "Periode " + periode.label + " (" + ormawa.nama + ") diarsipkan.",
                "warning"
              );
              refresh();
            });
        }
      );
    }
  }

  /* ============================================
     Modal: Buka Periode Baru (untuk SEMUA ormawa)
     ============================================ */
  function openAddModal() {
    document.getElementById("periodeModalLabel").textContent =
      "Buka Periode Baru (Semua Ormawa)";
    document.getElementById("periodeForm").reset();
    document.getElementById("simpanText").textContent = "Buka Periode";

    // Info: periode baru akan dibuat untuk SEMUA ormawa sekaligus
    var warn = document.getElementById("warningPeriodeAktif");
    warn.classList.remove("d-none");
    document.getElementById("warningText").textContent =
      "Periode baru akan dibuat untuk SEMUA ormawa aktif (" +
      semuaOrmawa.length + " ormawa). Periode aktif lama per-ormawa " +
      "akan otomatis diarsipkan.";

    // Default tanggal: hari ini + 1 tahun
    var tglMulai = new Date();
    document.getElementById("tanggalMulai").value =
      tglMulai.toISOString().slice(0, 10);
    var tglSelesai = new Date(tglMulai);
    tglSelesai.setFullYear(tglSelesai.getFullYear() + 1);
    tglSelesai.setDate(tglSelesai.getDate() - 1);
    document.getElementById("tanggalSelesai").value =
      tglSelesai.toISOString().slice(0, 10);

    // Default label
    var tahunAwal = tglMulai.getFullYear();
    document.getElementById("labelPeriode").value =
      tahunAwal + "/" + (tahunAwal + 1);

    clearInvalid();
    var modal = bootstrap.Modal.getInstance(document.getElementById("periodeModal"));
    if (!modal) modal = new bootstrap.Modal(document.getElementById("periodeModal"));
    modal.show();
  }

  function clearInvalid() {
    document.querySelectorAll("#periodeForm .is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  /* ============================================
     Submit form
     ============================================ */
  function setupForm() {
    var form = document.getElementById("periodeForm");
    var labelInput = document.getElementById("labelPeriode");
    var tanggalMulai = document.getElementById("tanggalMulai");
    var tanggalSelesai = document.getElementById("tanggalSelesai");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearInvalid();

      var label = labelInput.value.trim();
      var mulai = tanggalMulai.value;
      var selesai = tanggalSelesai.value;
      var status = document.getElementById("statusPeriode").value;
      var catatan = document.getElementById("catatanPeriode").value.trim();

      var ok = true;

      // Validasi label
      var labelRegex = /^\d{4}\/\d{4}$/;
      if (!labelRegex.test(label)) {
        labelInput.classList.add("is-invalid");
        ok = false;
      }

      if (!mulai) {
        tanggalMulai.classList.add("is-invalid");
        ok = false;
      }
      if (!selesai) {
        tanggalSelesai.classList.add("is-invalid");
        ok = false;
      }
      if (mulai && selesai && new Date(selesai) <= new Date(mulai)) {
        tanggalSelesai.classList.add("is-invalid");
        document.getElementById("tglSelesaiFeedback").textContent =
          "Tanggal selesai harus setelah tanggal mulai.";
        ok = false;
      }
      if (!ok) return;

      // Cek: ormawa aktif harus ada
      if (!semuaOrmawa.length) {
        showAlert("Tidak ada ormawa aktif untuk diberi periode.", "danger");
        return;
      }

      // Loading
      var btn = document.getElementById("simpanPeriodeBtn");
      var spinner = document.getElementById("simpanSpinner");
      var icon = document.getElementById("simpanIcon");
      var text = document.getElementById("simpanText");

      btn.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Menyimpan...";

      // Bangun array payload: 1 periode per ormawa
      var payload = semuaOrmawa.map(function (o) {
        return {
          ormawa_id: o.id,
          label: label,
          tanggal_mulai: mulai,
          tanggal_selesai: selesai,
          status: status,
          catatan: catatan || null,
        };
      });

      // Kalau status = aktif → arsipkan periode aktif lama per ormawa dulu
      var arsipPromise = Promise.resolve();
      if (status === "aktif") {
        arsipPromise = sb
          .from("periode")
          .update({ status: "arsip" })
          .eq("status", "aktif")
          .neq("label", label); // jangan arsipkan label yang sama (kalau ada)
      }

      arsipPromise
        .then(function () {
          // Insert batch — pakai upsert untuk handle duplikat (ormawa_id, label)
          return sb.from("periode").upsert(payload, {
            onConflict: "ormawa_id,label",
          });
        })
        .then(function (res) {
          btn.disabled = false;
          spinner.classList.add("d-none");
          icon.classList.remove("d-none");
          text.textContent = "Buka Periode";

          if (res.error) {
            console.error("[ProkerIn] Gagal buat periode:", res.error);
            showAlert("Gagal membuka periode: " + res.error.message, "danger");
            return;
          }

          console.log("[ProkerIn] Periode baru dibuat untuk", payload.length, "ormawa");

          showAlert(
            "Periode " + label + " berhasil dibuka untuk " +
            payload.length + " ormawa.",
            "success"
          );

          var modalEl = document.getElementById("periodeModal");
          var modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          // Reload data dari server
          muatData().then(function () { refresh(); });
        });
    });
  }

  /* ============================================
     Modal: Detail Periode
     ============================================ */
  function openDetailModal(periode) {
    var body = document.getElementById("detailModalBody");
    var ormawa = getOrmawa(periode.ormawa_id);
    document.getElementById("detailModalLabel").textContent =
      "Detail Periode " + periode.label + " — " + ormawa.nama;

    var durasi = hitungDurasiBulan(periode.tanggal_mulai, periode.tanggal_selesai);
    var statusBadge = periode.status === "aktif"
      ? '<span class="status-badge status-badge--aktif">' +
        '<i class="bi bi-circle-fill"></i>Aktif</span>'
      : '<span class="status-badge status-badge--arsip">' +
        '<i class="bi bi-archive"></i>Arsip</span>';

    var jumlahProker = prokerCountByPeriode[periode.id] || 0;

    body.innerHTML =
      '<dl class="detail-grid">' +
        "<div>" +
          "<dt>Label</dt>" +
          '<dd class="label-besar">' + escapeHtml(periode.label) + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Ormawa</dt>" +
          "<dd>" + escapeHtml(ormawa.nama) + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Status</dt>" +
          "<dd>" + statusBadge + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Durasi</dt>" +
          "<dd>" + durasi + " bulan</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Tanggal Mulai</dt>" +
          "<dd>" + escapeHtml(formatTanggal(periode.tanggal_mulai)) + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Tanggal Selesai</dt>" +
          "<dd>" + escapeHtml(formatTanggal(periode.tanggal_selesai)) + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Jumlah Proker</dt>" +
          "<dd>" + jumlahProker + " proker</dd>" +
        "</div>" +
        (periode.catatan
          ? '<div style="grid-column: 1 / -1;">' +
            "<dt>Catatan</dt>" +
            "<dd>" + escapeHtml(periode.catatan) + "</dd>" +
            "</div>"
          : "") +
      "</dl>";

    var modal = bootstrap.Modal.getInstance(document.getElementById("detailModal"));
    if (!modal) modal = new bootstrap.Modal(document.getElementById("detailModal"));
    modal.show();
  }

  /* ============================================
     Modal: Konfirmasi
     ============================================ */
  function openConfirmModal(title, message, onOk) {
    document.getElementById("konfirmasiModalLabel").textContent = title;
    document.getElementById("konfirmasiPesan").textContent = message;
    state.confirmAction = onOk;

    var modalEl = document.getElementById("konfirmasiModal");
    var modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  function setupConfirmModal() {
    var okBtn = document.getElementById("konfirmasiOkBtn");
    if (!okBtn) return;
    okBtn.onclick = function () {
      if (typeof state.confirmAction === "function") {
        state.confirmAction();
      }
      var modalEl = document.getElementById("konfirmasiModal");
      var modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      state.confirmAction = null;
    };
  }

  /* ============================================
     Filter events
     ============================================ */
  function setupFilters() {
    var searchInput = document.getElementById("searchInput");
    var filterStatus = document.getElementById("filterStatus");
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
    if (filterStatus) {
      filterStatus.addEventListener("change", function () {
        state.status = filterStatus.value;
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
        state.status = "";
        state.sortBy = "terbaru";
        if (searchInput) searchInput.value = "";
        if (filterStatus) filterStatus.value = "";
        if (sortBy) sortBy.value = "terbaru";
        refresh();
      });
    }
  }

  /* ============================================
     Refresh
     ============================================ */
  function refresh() {
    renderPeriodeAktif();
    renderTabel(getFiltered());
  }

  /* ============================================
     Fetch dari Supabase
     ============================================ */
  async function muatData() {
    var results = await Promise.all([
      sb.from("periode").select("*").order("tanggal_mulai", { ascending: false }),
      sb.from("ormawa").select("id, nama, jenis").eq("aktif", true).order("nama"),
      sb.from("proker").select("periode_id"),
    ]);

    var periodeRes = results[0];
    var ormawaRes = results[1];
    var prokerRes = results[2];

    if (periodeRes.error) {
      console.error("[ProkerIn] Gagal memuat periode:", periodeRes.error);
      alert("Gagal memuat data periode.");
      return;
    }
    if (ormawaRes.error) {
      console.warn("[ProkerIn] Gagal memuat ormawa:", ormawaRes.error);
    }
    if (prokerRes.error) {
      console.warn("[ProkerIn] Gagal memuat proker count:", prokerRes.error);
    }

    semuaPeriode = periodeRes.data || [];
    semuaOrmawa = ormawaRes.data || [];

    ormawaMap = {};
    semuaOrmawa.forEach(function (o) { ormawaMap[o.id] = o; });

    // Hitung jumlah proker per periode
    prokerCountByPeriode = {};
    (prokerRes.data || []).forEach(function (p) {
      if (p.periode_id) {
        prokerCountByPeriode[p.periode_id] =
          (prokerCountByPeriode[p.periode_id] || 0) + 1;
      }
    });
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready; // WAJIB

    await muatData();
    setupFilters();
    setupForm();
    setupConfirmModal();

    var btnBuka = document.getElementById("btnBukaPeriode");
    if (btnBuka) btnBuka.addEventListener("click", openAddModal);

    refresh();
  });
})();