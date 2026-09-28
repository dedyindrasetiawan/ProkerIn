/* eslint-env browser */
/* global console, bootstrap */

/* ============================================
   ProkerIn — Super Admin Master Ormawa Script
   CRUD master data ormawa + filter + statistik
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy ormawa (16 sesuai dokumen)
     ============================================ */
  let dummyOrmawa = [
    { id: 1, nama: "HMP UEC", jenis: "hmp", singkatan: "UEC", pembina: "Dr. Endang S., M.Pd.", deskripsi: "Himpunan Mahasiswa Universitas Economic Community.", aktif: true, ketua: "Andi Wijaya", jumlah_proker: 2 },
    { id: 2, nama: "HMP PBSI", jenis: "hmp", singkatan: "PBSI", pembina: "Dr. Siti Aminah, M.Pd.", deskripsi: "Himpunan Mahasiswa Pendidikan Bahasa dan Sastra Indonesia.", aktif: true, ketua: "Rani Puspita", jumlah_proker: 2 },
    { id: 3, nama: "HMP PPKN", jenis: "hmp", singkatan: "PPKN", pembina: "Drs. Bambang S., M.Si.", deskripsi: "Himpunan Mahasiswa Pendidikan Pancasila dan Kewarganegaraan.", aktif: true, ketua: "Yoga Pratama", jumlah_proker: 1 },
    { id: 4, nama: "HMP Ekonomi", jenis: "hmp", singkatan: "EKO", pembina: "Dra. Rina W., M.M.", deskripsi: "Himpunan Mahasiswa Program Studi Ekonomi.", aktif: true, ketua: "Maya Sari", jumlah_proker: 1 },
    { id: 5, nama: "HMP PTI", jenis: "hmp", singkatan: "PTI", pembina: "Ir. Hadi S., M.Kom.", deskripsi: "Himpunan Mahasiswa Pendidikan Teknologi Informasi.", aktif: true, ketua: "Ahmad Fauzi", jumlah_proker: 3 },
    { id: 6, nama: "HMP Matematika", jenis: "hmp", singkatan: "MAT", pembina: "Dr. Yusuf A., M.Si.", deskripsi: "Himpunan Mahasiswa Program Studi Matematika.", aktif: true, ketua: "Hendra Wijaya", jumlah_proker: 1 },
    { id: 7, nama: "UKM Taekwondo", jenis: "ukm", singkatan: "TKD", pembina: "Dedi K., S.Pd., M.Or.", deskripsi: "Unit Kegiatan Mahasiswa olahraga beladiri taekwondo.", aktif: true, ketua: "Bayu Setiawan", jumlah_proker: 1 },
    { id: 8, nama: "UKM LPM Sinergi dan Kepenyiaran", jenis: "ukm", singkatan: "LPM", pembina: "Dra. Wati S., M.I.Kom.", deskripsi: "Unit Kegiatan Mahasiswa pers dan kepenyiaran.", aktif: true, ketua: "Aditya Pratama", jumlah_proker: 0 },
    { id: 9, nama: "UKM KSR", jenis: "ukm", singkatan: "KSR", pembina: "Ns. Linda A., M.Kep.", deskripsi: "Unit Kegiatan Mahasiswa Korps Sukarela Palang Merah.", aktif: true, ketua: "Citra Lestari", jumlah_proker: 1 },
    { id: 10, nama: "UKM Pramuka dan Pecinta Alam", jenis: "ukm", singkatan: "PRAMPA", pembina: "Ir. Gunawan H., M.T.", deskripsi: "Unit Kegiatan Mahasiswa kepramukaan dan pecinta alam.", aktif: true, ketua: "Fajar Nugroho", jumlah_proker: 1 },
    { id: 11, nama: "UKM UKKI", jenis: "ukm", singkatan: "UKKI", pembina: "Ust. Ahmad F., Lc., M.A.", deskripsi: "Unit Kegiatan Mahasiswa Kerohanian Islam.", aktif: true, ketua: "Aulia Rahman", jumlah_proker: 1 },
    { id: 12, nama: "UKM PR", jenis: "ukm", singkatan: "PR", pembina: "Drs. Surya D., M.M.", deskripsi: "Unit Kegiatan Mahasiswa Pecinta Rimba.", aktif: true, ketua: "Bagus Setiaji", jumlah_proker: 0 },
    { id: 13, nama: "UKM Kesenian", jenis: "ukm", singkatan: "SENI", pembina: "Dra. Ayu L., M.Pd.", deskripsi: "Unit Kegiatan Mahasiswa bidang seni dan budaya.", aktif: true, ketua: "Lala Karmela", jumlah_proker: 1 },
    { id: 14, nama: "UKM KOMI", jenis: "ukm", singkatan: "KOMI", pembina: "Drs. Rudi H., M.M.", deskripsi: "Unit Kegiatan Mahasiswa Komunikasi dan Informasi.", aktif: true, ketua: "Sarah Amelia", jumlah_proker: 0 },
    { id: 15, nama: "UKM Multimedia", jenis: "ukm", singkatan: "MULTI", pembina: "Ir. Dimas P., M.T.", deskripsi: "Unit Kegiatan Mahasiswa bidang multimedia dan produksi konten.", aktif: true, ketua: "Rizal Aditya", jumlah_proker: 1 },
    { id: 16, nama: "UKM SAF Musik", jenis: "ukm", singkatan: "SAF", pembina: "Drs. Heru S., M.Sn.", deskripsi: "Unit Kegiatan Mahasiswa seni musik.", aktif: true, ketua: "Melody Anjani", jumlah_proker: 1 },
  ];

  /* ============================================
     State
     ============================================ */
  const state = {
    search: "",
    jenis: "",
    aktif: "",
    editMode: false,
    confirmAction: null,
  };

  let nextId = 100;

  /* ============================================
     Helper
     ============================================ */
  function getInitials(nama, singkatan) {
    if (singkatan) return singkatan.substring(0, 4).toUpperCase();
    if (!nama) return "?";
    const parts = nama.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
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
    setTimeout(function () { el.classList.add("d-none"); }, 4000);
  }

  function jenisLabel(j) {
    return j === "hmp"
      ? "HMP (Himpunan Mahasiswa Program Studi)"
      : "UKM (Unit Kegiatan Mahasiswa)";
  }

  /* ============================================
     Render statistik
     ============================================ */
  function renderStatistik() {
    const total = dummyOrmawa.length;
    const hmp = dummyOrmawa.filter(function (o) { return o.jenis === "hmp"; }).length;
    const ukm = dummyOrmawa.filter(function (o) { return o.jenis === "ukm"; }).length;
    const nonaktif = dummyOrmawa.filter(function (o) { return !o.aktif; }).length;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statHmp").textContent = hmp;
    document.getElementById("statUkm").textContent = ukm;
    document.getElementById("statNonaktif").textContent = nonaktif;
  }

  /* ============================================
     Filter
     ============================================ */
  function getFiltered() {
    const q = state.search.toLowerCase();
    return dummyOrmawa.filter(function (o) {
      if (state.jenis && o.jenis !== state.jenis) return false;
      if (state.aktif === "1" && !o.aktif) return false;
      if (state.aktif === "0" && o.aktif) return false;
      if (q) {
        const hay = (o.nama + " " + (o.singkatan || "") + " " + (o.ketua || ""))
          .toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ============================================
     Render tabel
     ============================================ */
  function renderTabel(data) {
    const tbody = document.getElementById("ormawaTableBody");
    const emptyState = document.getElementById("emptyState");
    const totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " ormawa";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (o) {
      const initials = getInitials(o.nama, o.singkatan);
      const iconClass =
        o.jenis === "hmp"
          ? "ormawa-cell__icon--hmp"
          : "ormawa-cell__icon--ukm";

      const ketuaCell = o.ketua
        ? '<span class="ormawa-table__ketua">' + escapeHtml(o.ketua) + "</span>"
        : '<span class="ormawa-table__ketua-empty">\u2014</span>';

      const statusCell = o.aktif
        ? '<span class="status-badge status-badge--aktif">' +
            '<i class="bi bi-check-circle-fill"></i>Aktif</span>'
        : '<span class="status-badge status-badge--nonaktif">' +
            '<i class="bi bi-slash-circle"></i>Nonaktif</span>';

      // Aksi dropdown
      let aksiItems = "";
      aksiItems +=
        '<li><button class="dropdown-item" data-action="detail" data-id="' + o.id + '">' +
          '<i class="bi bi-eye"></i> Lihat Detail</button></li>' +
        '<li><button class="dropdown-item" data-action="edit" data-id="' + o.id + '">' +
          '<i class="bi bi-pencil"></i> Edit Ormawa</button></li>' +
        '<li><hr class="dropdown-divider"></li>';

      if (o.aktif) {
        aksiItems +=
          '<li><button class="dropdown-item dropdown-item--danger" data-action="nonaktif" data-id="' + o.id + '">' +
            '<i class="bi bi-slash-circle"></i> Nonaktifkan</button></li>';
      } else {
        aksiItems +=
          '<li><button class="dropdown-item dropdown-item--success" data-action="aktifkan" data-id="' + o.id + '">' +
            '<i class="bi bi-check-circle"></i> Aktifkan</button></li>';
      }

      const tr = document.createElement("tr");
      if (!o.aktif) tr.classList.add("inactive");

      tr.innerHTML =
        "<td>" +
          '<div class="ormawa-cell">' +
            '<div class="ormawa-cell__icon ' + iconClass + '">' +
              escapeHtml(initials) +
            "</div>" +
            '<div class="ormawa-cell__info">' +
              '<span class="ormawa-cell__name">' + escapeHtml(o.nama) + "</span>" +
              (o.deskripsi
                ? '<span class="ormawa-cell__desc">' + escapeHtml(o.deskripsi) + "</span>"
                : "") +
            "</div>" +
          "</div>" +
        "</td>" +
        "<td>" +
          '<span class="jenis-badge jenis-badge--' + o.jenis + '">' +
            escapeHtml(o.jenis.toUpperCase()) +
          "</span>" +
        "</td>" +
        "<td>" + ketuaCell + "</td>" +
        '<td class="ormawa-table__proker">' +
          '<i class="bi bi-clipboard-data"></i>' +
          o.jumlah_proker +
          " <small>proker</small>" +
        "</td>" +
        "<td>" + statusCell + "</td>" +
        '<td class="text-end">' +
          '<div class="dropdown">' +
            '<button class="btn-action dropdown-toggle" type="button" ' +
              'data-bs-toggle="dropdown" aria-expanded="false" ' +
              'aria-label="Aksi untuk ' + escapeHtml(o.nama) + '">' +
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
    const ormawa = dummyOrmawa.find(function (o) { return o.id === id; });
    if (!ormawa) return;

    if (aksi === "detail") {
      openDetailModal(ormawa);
    } else if (aksi === "edit") {
      openEditModal(ormawa);
    } else if (aksi === "nonaktif") {
      openConfirmModal(
        "Nonaktifkan Ormawa?",
        ormawa.nama + " tidak akan muncul di pilihan pengajuan proker baru. " +
        "Data proker lama tetap tersimpan.",
        function () {
          ormawa.aktif = false;
          showAlert("Ormawa " + ormawa.nama + " dinonaktifkan.", "warning");
          console.log("[ProkerIn] Ormawa dinonaktifkan:", ormawa);
          refresh();
        }
      );
    } else if (aksi === "aktifkan") {
      ormawa.aktif = true;
      showAlert("Ormawa " + ormawa.nama + " diaktifkan kembali.", "success");
      console.log("[ProkerIn] Ormawa diaktifkan:", ormawa);
      refresh();
    }
  }

  /* ============================================
     Modal: Tambah/Edit
     ============================================ */
  function openAddModal() {
    state.editMode = false;
    document.getElementById("ormawaModalLabel").textContent = "Tambah Ormawa";
    document.getElementById("ormawaForm").reset();
    document.getElementById("ormawaId").value = "";
    document.getElementById("ormawaAktif").checked = true;
    clearInvalid();

    const modal = new bootstrap.Modal(document.getElementById("ormawaModal"));
    modal.show();
  }

  function openEditModal(o) {
    state.editMode = true;
    document.getElementById("ormawaModalLabel").textContent = "Edit Ormawa";
    document.getElementById("ormawaId").value = o.id;
    document.getElementById("ormawaNama").value = o.nama;
    document.getElementById("ormawaJenis").value = o.jenis;
    document.getElementById("ormawaSingkatan").value = o.singkatan || "";
    document.getElementById("ormawaPembina").value = o.pembina || "";
    document.getElementById("ormawaDeskripsi").value = o.deskripsi || "";
    document.getElementById("ormawaAktif").checked = o.aktif;
    clearInvalid();

    const modal = new bootstrap.Modal(document.getElementById("ormawaModal"));
    modal.show();
  }

  function clearInvalid() {
    document.querySelectorAll("#ormawaForm .is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  function setupForm() {
    const form = document.getElementById("ormawaForm");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearInvalid();

      const id = document.getElementById("ormawaId").value;
      const nama = document.getElementById("ormawaNama").value.trim();
      const jenis = document.getElementById("ormawaJenis").value;
      const singkatan = document.getElementById("ormawaSingkatan").value.trim();
      const pembina = document.getElementById("ormawaPembina").value.trim();
      const deskripsi = document.getElementById("ormawaDeskripsi").value.trim();
      const aktif = document.getElementById("ormawaAktif").checked;

      let ok = true;

      if (nama.length < 3) {
        document.getElementById("ormawaNama").classList.add("is-invalid");
        ok = false;
      } else {
        // Cek duplikat nama (kecuali dirinya sendiri)
        const dup = dummyOrmawa.find(function (o) {
          return o.nama.toLowerCase() === nama.toLowerCase() &&
            String(o.id) !== String(id);
        });
        if (dup) {
          document.getElementById("ormawaNama").classList.add("is-invalid");
          document.getElementById("namaFeedback").textContent =
            "Nama ormawa sudah digunakan.";
          ok = false;
        }
      }

      if (!jenis) {
        document.getElementById("ormawaJenis").classList.add("is-invalid");
        ok = false;
      }

      if (!ok) return;

      const btn = document.getElementById("simpanOrmawaBtn");
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
        text.textContent = "Simpan";
        btn.disabled = false;

        if (state.editMode) {
          const o = dummyOrmawa.find(function (x) { return String(x.id) === String(id); });
          if (o) {
            o.nama = nama;
            o.jenis = jenis;
            o.singkatan = singkatan;
            o.pembina = pembina;
            o.deskripsi = deskripsi;
            o.aktif = aktif;
            console.log("[ProkerIn] Ormawa diupdate:", o);
            showAlert("Ormawa " + nama + " berhasil diperbarui.", "success");
          }
        } else {
          const newO = {
            id: nextId++,
            nama: nama,
            jenis: jenis,
            singkatan: singkatan,
            pembina: pembina,
            deskripsi: deskripsi,
            aktif: aktif,
            ketua: "",
            jumlah_proker: 0,
          };
          dummyOrmawa.push(newO);
          console.log("[ProkerIn] Ormawa baru ditambahkan:", newO);
          showAlert("Ormawa " + nama + " berhasil ditambahkan.", "success");
        }

        const modalEl = document.getElementById("ormawaModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        refresh();
      }, 900);
    });
  }

  /* ============================================
     Modal: Detail
     ============================================ */
  function openDetailModal(o) {
    const body = document.getElementById("detailModalBody");
    document.getElementById("detailModalLabel").textContent = "Detail " + o.nama;

    const statusBadge = o.aktif
      ? '<span class="status-badge status-badge--aktif">' +
        '<i class="bi bi-check-circle-fill"></i>Aktif</span>'
      : '<span class="status-badge status-badge--nonaktif">' +
        '<i class="bi bi-slash-circle"></i>Nonaktif</span>';

    const jenisBadge =
      '<span class="jenis-badge jenis-badge--' + o.jenis + '">' +
      escapeHtml(o.jenis.toUpperCase()) + "</span>";

    body.innerHTML =
      '<dl class="detail-grid">' +
        "<div>" +
          "<dt>Nama Ormawa</dt>" +
          '<dd class="label-besar">' + escapeHtml(o.nama) + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Singkatan</dt>" +
          "<dd>" + escapeHtml(o.singkatan || "\u2014") + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Jenis</dt>" +
          "<dd>" + jenisBadge + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Status</dt>" +
          "<dd>" + statusBadge + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Ketua Saat Ini</dt>" +
          "<dd>" + escapeHtml(o.ketua || "\u2014") + "</dd>" +
        "</div>" +
        "<div>" +
          "<dt>Jumlah Proker</dt>" +
          "<dd>" + o.jumlah_proker + " proker</dd>" +
        "</div>" +
        "<div style='grid-column: 1 / -1;'>" +
          "<dt>Dosen Pembina</dt>" +
          "<dd>" + escapeHtml(o.pembina || "\u2014") + "</dd>" +
        "</div>" +
        (o.deskripsi
          ? "<div style='grid-column: 1 / -1;'>" +
            "<dt>Deskripsi</dt>" +
            "<dd>" + escapeHtml(o.deskripsi) + "</dd>" +
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
    const filterJenis = document.getElementById("filterJenis");
    const filterAktif = document.getElementById("filterAktif");
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
    if (filterJenis) {
      filterJenis.addEventListener("change", function () {
        state.jenis = filterJenis.value;
        refresh();
      });
    }
    if (filterAktif) {
      filterAktif.addEventListener("change", function () {
        state.aktif = filterAktif.value;
        refresh();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.search = "";
        state.jenis = "";
        state.aktif = "";
        if (searchInput) searchInput.value = "";
        if (filterJenis) filterJenis.value = "";
        if (filterAktif) filterAktif.value = "";
        refresh();
      });
    }
  }

  /* ============================================
     Refresh
     ============================================ */
  function refresh() {
    renderStatistik();
    renderTabel(getFiltered());
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    setupFilters();
    setupForm();
    setupConfirmModal();

    const btnTambah = document.getElementById("btnTambahOrmawa");
    if (btnTambah) btnTambah.addEventListener("click", openAddModal);

    refresh();
  });
})();