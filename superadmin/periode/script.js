/* eslint-env browser */
/* global console, bootstrap */

/* ============================================
   ProkerIn — Super Admin Periode Script
   Kelola periode kepengurusan:
   tabel, buka periode baru, arsipkan, detail
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy periode
     ============================================ */
  let dummyPeriode = [
    {
      id: 1,
      label: "2025/2026",
      tanggal_mulai: "2025-08-01",
      tanggal_selesai: "2026-07-31",
      status: "aktif",
      jumlah_proker: 15,
      catatan: "Periode kepengurusan hasil Musyawarah Besar XIV.",
    },
    {
      id: 2,
      label: "2024/2025",
      tanggal_mulai: "2024-08-01",
      tanggal_selesai: "2025-07-31",
      status: "arsip",
      jumlah_proker: 42,
      catatan: "Periode kepengurusan 2024/2025 — sudah diarsipkan.",
    },
    {
      id: 3,
      label: "2023/2024",
      tanggal_mulai: "2023-08-01",
      tanggal_selesai: "2024-07-31",
      status: "arsip",
      jumlah_proker: 38,
      catatan: "",
    },
    {
      id: 4,
      label: "2022/2023",
      tanggal_mulai: "2022-08-01",
      tanggal_selesai: "2023-07-31",
      status: "arsip",
      jumlah_proker: 35,
      catatan: "",
    },
  ];

  /* ============================================
     State
     ============================================ */
  const state = {
    search: "",
    status: "",
    sortBy: "terbaru",
    confirmTarget: null,
    confirmAction: null,
    editMode: false,
  };

  /* ============================================
     Helper
     ============================================ */
  let nextId = 100;

  function formatTanggal(dateStr) {
    if (!dateStr) return "\u2014";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatTanggalSingkat(dateStr) {
    if (!dateStr) return "\u2014";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    const bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function hitungDurasiBulan(mulai, selesai) {
    const d1 = new Date(mulai);
    const d2 = new Date(selesai);
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
    const el = document.getElementById("pageAlert");
    if (!el) return;
    type = type || "success";
    el.className = "alert alert-" + type;
    el.textContent = message;
    el.classList.remove("d-none");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(function () { el.classList.add("d-none"); }, 4500);
  }

  function getPeriodeAktif() {
    return dummyPeriode.find(function (p) { return p.status === "aktif"; }) || null;
  }

  /* ============================================
     Render kartu periode aktif
     ============================================ */
  function renderPeriodeAktif() {
    const card = document.getElementById("periodeAktifCard");
    if (!card) return;

    const aktif = getPeriodeAktif();

    if (!aktif) {
      card.innerHTML =
        '<div class="periode-aktif__empty">' +
          '<i class="bi bi-calendar-x" aria-hidden="true"></i>' +
          "<p>Belum ada periode aktif. Buka periode baru untuk memulai.</p>" +
        "</div>";
      return;
    }

    const durasi = hitungDurasiBulan(aktif.tanggal_mulai, aktif.tanggal_selesai);

    card.innerHTML =
      '<div class="periode-aktif__main">' +
        '<span class="periode-aktif__badge">' +
          '<i class="bi bi-circle-fill"></i>Periode Aktif' +
        "</span>" +
        '<h3 class="periode-aktif__label">' + escapeHtml(aktif.label) + "</h3>" +
        '<p class="periode-aktif__rentang">' +
          '<i class="bi bi-calendar-event"></i>' +
          escapeHtml(formatTanggal(aktif.tanggal_mulai)) + " \u2014 " +
          escapeHtml(formatTanggal(aktif.tanggal_selesai)) +
        "</p>" +
        (aktif.catatan
          ? '<p class="periode-aktif__rentang mt-2" style="opacity:0.7;">' +
            '<i class="bi bi-info-circle"></i>' + escapeHtml(aktif.catatan) + "</p>"
          : "") +
      "</div>" +
      '<div class="periode-aktif__stats">' +
        '<div class="periode-aktif__stat">' +
          '<p class="periode-aktif__stat-value">' + aktif.jumlah_proker + "</p>" +
          '<p class="periode-aktif__stat-label">Proker</p>' +
        "</div>" +
        '<div class="periode-aktif__stat">' +
          '<p class="periode-aktif__stat-value">' + durasi + "</p>" +
          '<p class="periode-aktif__stat-label">Bulan</p>' +
        "</div>" +
        '<div class="periode-aktif__stat">' +
          '<p class="periode-aktif__stat-value">' +
            new Date().getFullYear() +
          "</p>" +
          '<p class="periode-aktif__stat-label">Tahun Berjalan</p>' +
        "</div>" +
      "</div>";
  }

  /* ============================================
     Filter
     ============================================ */
  function getFiltered() {
    const q = state.search.toLowerCase();

    let list = dummyPeriode.filter(function (p) {
      if (state.status && p.status !== state.status) return false;
      if (q && p.label.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    list = list.slice();
    list.sort(function (a, b) {
      const da = new Date(a.tanggal_mulai);
      const db = new Date(b.tanggal_mulai);
      return state.sortBy === "terbaru" ? db - da : da - db;
    });

    return list;
  }

  /* ============================================
     Render tabel
     ============================================ */
  function renderTabel(data) {
    const tbody = document.getElementById("periodeTableBody");
    const emptyState = document.getElementById("emptyState");
    const totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " periode";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (p) {
      const isAktif = p.status === "aktif";
      const durasi = hitungDurasiBulan(p.tanggal_mulai, p.tanggal_selesai);

      const tr = document.createElement("tr");
      if (isAktif) tr.classList.add("is-aktif");

      const labelIcon = isAktif ? "bi-calendar-check-fill" : "bi-calendar3";
      const labelClass = isAktif ? "periode-label--aktif" : "";

      const statusCell = isAktif
        ? '<span class="status-badge status-badge--aktif">' +
            '<i class="bi bi-circle-fill"></i>Aktif</span>'
        : '<span class="status-badge status-badge--arsip">' +
            '<i class="bi bi-archive"></i>Arsip</span>';

      // Aksi dropdown
      let aksiItems = "";
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
        "</td>" +
        '<td class="periode-rentang">' +
          '<i class="bi bi-calendar-event"></i>' +
          escapeHtml(formatTanggalSingkat(p.tanggal_mulai)) + " \u2014 " +
          escapeHtml(formatTanggalSingkat(p.tanggal_selesai)) +
        "</td>" +
        '<td class="periode-durasi">' +
          durasi + " bulan" +
          "<small>~" + Math.round(durasi / 12) + " tahun ajaran</small>" +
        "</td>" +
        '<td class="periode-proker">' +
          '<i class="bi bi-clipboard-data"></i>' +
          p.jumlah_proker +
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
        const aksi = btn.getAttribute("data-action");
        const id = parseInt(btn.getAttribute("data-id"), 10);
        handleAction(aksi, id);
      });
    });
  }

  /* ============================================
     Handle action
     ============================================ */
  function handleAction(aksi, id) {
    const periode = dummyPeriode.find(function (p) { return p.id === id; });
    if (!periode) return;

    if (aksi === "detail") {
      openDetailModal(periode);
    } else if (aksi === "arsip") {
      openConfirmModal(
        "Arsipkan Periode?",
        "Periode " + periode.label +
        " akan diubah statusnya menjadi arsip. Data proker & LPJ tetap tersimpan.",
        function () {
          periode.status = "arsip";
          showAlert("Periode " + periode.label + " berhasil diarsipkan.", "warning");
          console.log("[ProkerIn] Periode diarsipkan:", periode);
          refresh();
        }
      );
    }
  }

  /* ============================================
     Modal: Buka Periode Baru
     ============================================ */
  function openAddModal() {
    state.editMode = false;
    document.getElementById("periodeModalLabel").textContent = "Buka Periode Baru";
    document.getElementById("periodeForm").reset();
    document.getElementById("simpanText").textContent = "Buka Periode";

    // Set tanggal default
    const aktif = getPeriodeAktif();
    if (aktif) {
      const warn = document.getElementById("warningPeriodeAktif");
      warn.classList.remove("d-none");
      document.getElementById("warningText").textContent =
        "Periode " + aktif.label + " akan otomatis diarsipkan ketika Anda " +
        "membuka periode baru dengan status Aktif.";

      // Default tanggal mulai: sehari setelah periode aktif selesai
      const tglSetelah = new Date(aktif.tanggal_selesai);
      tglSetelah.setDate(tglSetelah.getDate() + 1);
      const isoMulai = tglSetelah.toISOString().slice(0, 10);
      document.getElementById("tanggalMulai").value = isoMulai;

      // Default tanggal selesai: +1 tahun -1 hari
      const tglSelesai = new Date(tglSetelah);
      tglSelesai.setFullYear(tglSelesai.getFullYear() + 1);
      tglSelesai.setDate(tglSelesai.getDate() - 1);
      document.getElementById("tanggalSelesai").value =
        tglSelesai.toISOString().slice(0, 10);

      // Default label
      const tahunAwal = tglSetelah.getFullYear();
      document.getElementById("labelPeriode").value =
        tahunAwal + "/" + (tahunAwal + 1);
    } else {
      document.getElementById("warningPeriodeAktif").classList.add("d-none");
    }

    clearInvalid();
    const modal = new bootstrap.Modal(document.getElementById("periodeModal"));
    modal.show();
  }

  function clearInvalid() {
    document.querySelectorAll("#periodeForm .is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  /* ============================================
     Setup form
     ============================================ */
  function setupForm() {
    const form = document.getElementById("periodeForm");
    const labelInput = document.getElementById("labelPeriode");
    const tanggalMulai = document.getElementById("tanggalMulai");
    const tanggalSelesai = document.getElementById("tanggalSelesai");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearInvalid();

      const label = labelInput.value.trim();
      const mulai = tanggalMulai.value;
      const selesai = tanggalSelesai.value;
      const status = document.getElementById("statusPeriode").value;
      const catatan = document.getElementById("catatanPeriode").value.trim();

      let ok = true;

      // Validasi label
      const labelRegex = /^\d{4}\/\d{4}$/;
      if (!labelRegex.test(label)) {
        labelInput.classList.add("is-invalid");
        ok = false;
      } else {
        // Cek duplikat label
        const dup = dummyPeriode.find(function (p) { return p.label === label; });
        if (dup) {
          labelInput.classList.add("is-invalid");
          document.getElementById("labelFeedback").textContent =
            "Label periode sudah digunakan.";
          ok = false;
        }
      }

      // Validasi tanggal
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

      // Loading
      const btn = document.getElementById("simpanPeriodeBtn");
      const spinner = document.getElementById("simpanSpinner");
      const icon = document.getElementById("simpanIcon");
      const text = document.getElementById("simpanText");

      btn.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Menyimpan...";

      setTimeout(function () {
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Buka Periode";
        btn.disabled = false;

        // Kalau status = aktif → arsipkan periode aktif lama
        if (status === "aktif") {
          const aktifLama = getPeriodeAktif();
          if (aktifLama) {
            aktifLama.status = "arsip";
            console.log("[ProkerIn] Periode lama diarsipkan otomatis:", aktifLama.label);
          }
        }

        const newPeriode = {
          id: nextId++,
          label: label,
          tanggal_mulai: mulai,
          tanggal_selesai: selesai,
          status: status,
          jumlah_proker: 0,
          catatan: catatan,
        };
        dummyPeriode.unshift(newPeriode);

        console.log("[ProkerIn] Periode baru dibuat:", newPeriode);
        showAlert(
          "Periode " + label + " berhasil dibuka dengan status " + status + ".",
          "success"
        );

        const modalEl = document.getElementById("periodeModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        refresh();
      }, 1000);
    });
  }

  /* ============================================
     Modal: Detail Periode
     ============================================ */
  function openDetailModal(periode) {
    const body = document.getElementById("detailModalBody");
    document.getElementById("detailModalLabel").textContent =
      "Detail Periode " + periode.label;

    const durasi = hitungDurasiBulan(periode.tanggal_mulai, periode.tanggal_selesai);
    const statusBadge = periode.status === "aktif"
      ? '<span class="status-badge status-badge--aktif">' +
        '<i class="bi bi-circle-fill"></i>Aktif</span>'
      : '<span class="status-badge status-badge--arsip">' +
        '<i class="bi bi-archive"></i>Arsip</span>';

    body.innerHTML =
      '<dl class="detail-grid">' +
        "<div>" +
          "<dt>Label</dt>" +
          '<dd class="label-besar">' + escapeHtml(periode.label) + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Status</dt>" +
          "<dd>" + statusBadge + "</dd>" +
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
          "<dt>Durasi</dt>" +
          "<dd>" + durasi + " bulan</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Jumlah Proker</dt>" +
          "<dd>" + periode.jumlah_proker + " proker</dd>" +
        "</div>" +
        (periode.catatan
          ? '<div style="grid-column: 1 / -1;">' +
            "<dt>Catatan</dt>" +
            "<dd>" + escapeHtml(periode.catatan) + "</dd>" +
            "</div>"
          : "") +
      "</dl>";

    const modal = new bootstrap.Modal(document.getElementById("detailModal"));
    modal.show();
  }

  /* ============================================
     Modal: Konfirmasi
     ============================================ */
  function openConfirmModal(title, message, onOk) {
    document.getElementById("konfirmasiModalLabel").textContent = title;
    document.getElementById("konfirmasiPesan").textContent = message;
    state.confirmAction = onOk;

    const modal = new bootstrap.Modal(document.getElementById("konfirmasiModal"));
    modal.show();
  }

  function setupConfirmModal() {
    document.getElementById("konfirmasiOkBtn").addEventListener("click", function () {
      if (typeof state.confirmAction === "function") {
        state.confirmAction();
      }
      const modalEl = document.getElementById("konfirmasiModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      state.confirmAction = null;
    });
  }

  /* ============================================
     Filter events
     ============================================ */
  function setupFilters() {
    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");
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
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    setupFilters();
    setupForm();
    setupConfirmModal();

    const btnBuka = document.getElementById("btnBukaPeriode");
    if (btnBuka) btnBuka.addEventListener("click", openAddModal);

    refresh();
  });
})();