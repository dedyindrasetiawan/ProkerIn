/* eslint-env browser */
/* global console, ProkerIn */

/* ============================================
   ProkerIn — Proker Detail Script
   Baca ?id= dari URL, render data dummy,
   update progress & upload LPJ (simulasi)
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy — mirror dari dashboard
     ============================================ */
  const dummyProker = [
    {
      id: 1,
      nama: "Pelatihan Public Speaking Anggota Baru",
      tujuan:
        "Meningkatkan kemampuan public speaking anggota baru HMP PTI agar mampu menyampaikan gagasan secara terstruktur dan percaya diri dalam forum akademik maupun organisasi.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-05",
      jadwal_selesai: "2025-11-07",
      anggaran: 2500000,
      pj_nama: "Ahmad Fauzi",
      pj_jabatan: "Ketua Divisi Pengembangan SDM",
      status_pengajuan: "disetujui",
      status_progress: "berjalan",
      diajukan_pada: "2025-10-15T09:30:00",
      lpj: null,
    },
    {
      id: 2,
      nama: "Seminar Nasional Teknologi Pendidikan",
      tujuan:
        "Menghadirkan pakar teknologi pendidikan untuk membahas tren pembelajaran digital dan memberikan wawasan kepada mahasiswa tentang peluang karier di bidang edtech.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-01",
      jadwal_selesai: "2025-12-01",
      anggaran: 7500000,
      pj_nama: "Siti Nurhaliza",
      pj_jabatan: "Sekretaris Umum",
      status_pengajuan: "diajukan",
      status_progress: "belum_mulai",
      diajukan_pada: "2025-10-20T14:15:00",
      lpj: null,
    },
    {
      id: 3,
      nama: "Bakti Sosial Desa Binaan",
      tujuan:
        "Mengimplementasikan nilai pengabdian masyarakat melalui kegiatan bakti sosial di desa binaan, sekaligus mempererat hubungan antara kampus dan masyarakat sekitar.",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-20",
      jadwal_selesai: "2025-10-21",
      anggaran: 0,
      pj_nama: "Budi Santoso",
      pj_jabatan: "Ketua Divisi Sosial Masyarakat",
      status_pengajuan: "disetujui",
      status_progress: "selesai",
      diajukan_pada: "2025-10-01T10:00:00",
      lpj: {
        nama: "LPJ-Baksos-Desa-Binaan.pdf",
        tanggal_upload: "2025-10-25T16:30:00",
        status_verifikasi: "terverifikasi",
      },
    },
    {
      id: 4,
      nama: "Workshop Desain Grafis untuk Anggota",
      tujuan:
        "Membekali anggota dengan keterampilan desain grafis dasar menggunakan tools populer untuk menunjang publikasi kegiatan ormawa.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-15",
      jadwal_selesai: "2025-11-16",
      anggaran: 3000000,
      pj_nama: "Rina Marlina",
      pj_jabatan: "Ketua Divisi Media",
      status_pengajuan: "direvisi",
      status_progress: "belum_mulai",
      diajukan_pada: "2025-10-12T11:20:00",
      lpj: null,
    },
    {
      id: 5,
      nama: "Lomba Cerdas Cermat Antar Kelas",
      tujuan:
        "Meningkatkan semangat kompetisi akademik dan mempererat tali persaudaraan antar kelas di lingkungan program studi.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-10",
      jadwal_selesai: "2025-12-12",
      anggaran: 4500000,
      pj_nama: "Dedi Kurniawan",
      pj_jabatan: "Wakil Ketua",
      status_pengajuan: "ditolak",
      status_progress: "belum_mulai",
      diajukan_pada: "2025-10-18T13:45:00",
      lpj: null,
    },
    {
      id: 6,
      nama: "Pelatihan Kepemimpinan Dasar",
      tujuan:
        "Membentuk karakter kepemimpinan anggota melalui pelatihan manajemen organisasi, komunikasi, dan pengambilan keputusan.",
      kategori: "pendanaan",
      jadwal_mulai: "2026-01-08",
      jadwal_selesai: "2026-01-10",
      anggaran: 5000000,
      pj_nama: "Ahmad Fauzi",
      pj_jabatan: "Ketua Divisi Pengembangan SDM",
      status_pengajuan: "disetujui",
      status_progress: "ditunda",
      diajukan_pada: "2025-10-05T08:00:00",
      lpj: null,
    },
  ];

  /* ============================================
     Data dummy log persetujuan (per proker_id)
     ============================================ */
  const dummyLog = {
    1: [
      {
        aksi: "diajukan",
        oleh: "Ahmad Fauzi",
        tanggal: "2025-10-15T09:30:00",
        catatan: "Pengajuan proker baru untuk periode 2025/2026.",
      },
      {
        aksi: "disetujui",
        oleh: "Admin Kemahasiswaan",
        tanggal: "2025-10-17T14:00:00",
        catatan: "Proposal lengkap, silakan dilaksanakan sesuai jadwal.",
      },
    ],
    2: [
      {
        aksi: "diajukan",
        oleh: "Ahmad Fauzi",
        tanggal: "2025-10-20T14:15:00",
        catatan: "Pengajuan proker baru.",
      },
    ],
    3: [
      {
        aksi: "diajukan",
        oleh: "Ahmad Fauzi",
        tanggal: "2025-10-01T10:00:00",
        catatan: "Pengajuan proker non-pendanaan.",
      },
      {
        aksi: "disetujui",
        oleh: "Admin Kemahasiswaan",
        tanggal: "2025-10-03T09:15:00",
        catatan: "Disetujui, kegiatan bermanfaat bagi masyarakat.",
      },
    ],
    4: [
      {
        aksi: "diajukan",
        oleh: "Ahmad Fauzi",
        tanggal: "2025-10-12T11:20:00",
        catatan: "Pengajuan proker baru.",
      },
      {
        aksi: "revisi",
        oleh: "Admin Kemahasiswaan",
        tanggal: "2025-10-14T10:30:00",
        catatan:
          "Rincian anggaran konsumsi dan honor pemateri belum dilampirkan. Mohon dilengkapi dan diajukan ulang.",
      },
    ],
    5: [
      {
        aksi: "diajukan",
        oleh: "Ahmad Fauzi",
        tanggal: "2025-10-18T13:45:00",
        catatan: "Pengajuan proker baru.",
      },
      {
        aksi: "ditolak",
        oleh: "Admin Kemahasiswaan",
        tanggal: "2025-10-19T15:20:00",
        catatan:
          "Anggaran melebihi pagu periode ini dan jadwal berbenturan dengan kegiatan fakultas.",
      },
    ],
    6: [
      {
        aksi: "diajukan",
        oleh: "Ahmad Fauzi",
        tanggal: "2025-10-05T08:00:00",
        catatan: "Pengajuan proker baru.",
      },
      {
        aksi: "disetujui",
        oleh: "Admin Kemahasiswaan",
        tanggal: "2025-10-07T11:00:00",
        catatan: "Disetujui, harap koordinasi dengan pihak terkait.",
      },
    ],
  };

  /* ============================================
     Mapping label & badge
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

  const labelVerifikasi = {
    menunggu: "Menunggu Verifikasi",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
  };
  const badgeVerifikasi = {
    menunggu: "badge bg-warning text-dark",
    terverifikasi: "badge bg-success",
    ditolak: "badge bg-danger",
  };

  /* ============================================
     Helper
     ============================================ */
  function formatRupiah(angka) {
    if (!angka || angka === 0) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  }

  function formatTanggal(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatRentangTanggal(mulai, selesai) {
    if (mulai === selesai) return formatTanggal(mulai);
    return formatTanggal(mulai) + " — " + formatTanggal(selesai);
  }

  function formatDatetime(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
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
     Ambil id dari query string
     ============================================ */
  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"), 10);
    return isNaN(id) ? null : id;
  }

  /* ============================================
     Tampilkan alert
     ============================================ */
  function showAlert(message, type) {
    const el = document.getElementById("pageAlert");
    if (!el) return;
    type = type || "success";
    el.className = "alert alert-" + type;
    el.textContent = message;
    el.classList.remove("d-none");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(function () {
      el.classList.add("d-none");
    }, 4000);
  }

  /* ============================================
     Render hero
     ============================================ */
  function renderHero(p) {
    document.getElementById("breadcrumbNama").textContent = p.nama;

    const elSp = document.getElementById("heroStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    const elSPr = document.getElementById("heroStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    const elKat = document.getElementById("heroKategori");
    elKat.textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";

    document.getElementById("heroNama").textContent = p.nama;
    document.getElementById("heroTujuan").textContent = p.tujuan;
    document.getElementById("heroJadwal").textContent = formatRentangTanggal(
      p.jadwal_mulai,
      p.jadwal_selesai
    );
    document.getElementById("heroAnggaran").textContent = formatRupiah(
      p.anggaran
    );
    document.getElementById("heroPj").textContent =
      p.pj_nama + (p.pj_jabatan ? " (" + p.pj_jabatan + ")" : "");
    document.getElementById("heroDiajukan").textContent = formatDatetime(
      p.diajukan_pada
    );
  }

  /* ============================================
     Render sidebar kanan
     ============================================ */
  function renderSidebar(p) {
    const elSp = document.getElementById("sideStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    const elSPr = document.getElementById("sideStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    document.getElementById("sideKategori").textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";

    // Catatan revisi terakhir
    const logList = dummyLog[p.id] || [];
    const lastCatatan = [...logList]
      .reverse()
      .find(function (l) {
        return l.catatan;
      });

    const box = document.getElementById("catatanRevisiBox");
    if (lastCatatan) {
      box.classList.remove("catatan-box--empty");
      box.innerHTML =
        "<strong>" +
        escapeHtml(labelPengajuan[lastCatatan.aksi] || lastCatatan.aksi) +
        "</strong><br />" +
        escapeHtml(lastCatatan.catatan);
    } else {
      box.classList.add("catatan-box--empty");
      box.textContent = "Tidak ada catatan revisi.";
    }
  }

  /* ============================================
     Render timeline
     ============================================ */
  function renderTimeline(p) {
    const list = document.getElementById("timelineList");
    const logs = dummyLog[p.id] || [];

    if (!logs.length) {
      list.innerHTML =
        '<li class="timeline__item"><p class="text-muted mb-0">Belum ada riwayat.</p></li>';
      return;
    }

    const iconMap = {
      diajukan: "bi-send",
      disetujui: "bi-check2",
      revisi: "bi-pencil",
      ditolak: "bi-x-lg",
    };

    const dotClassMap = {
      diajukan: "timeline__dot--diajukan",
      disetujui: "timeline__dot--disetujui",
      revisi: "timeline__dot--revisi",
      ditolak: "timeline__dot--ditolak",
    };

    list.innerHTML = logs
      .map(function (l) {
        return (
          '<li class="timeline__item">' +
            '<span class="timeline__dot ' +
              (dotClassMap[l.aksi] || "") +
            '">' +
              '<i class="bi ' + (iconMap[l.aksi] || "bi-circle") + '"></i>' +
            "</span>" +
            '<div class="timeline__header">' +
              '<h4 class="timeline__title">' +
                escapeHtml(labelPengajuan[l.aksi] || l.aksi) +
              "</h4>" +
              '<span class="timeline__time">' +
                escapeHtml(formatDatetime(l.tanggal)) +
              "</span>" +
            "</div>" +
            '<p class="timeline__actor">oleh ' + escapeHtml(l.oleh) + "</p>" +
            (l.catatan
              ? '<p class="timeline__catatan">' + escapeHtml(l.catatan) + "</p>"
              : "") +
          "</li>"
        );
      })
      .join("");
  }

  /* ============================================
     Progress options
     ============================================ */
  function setupProgress(p) {
    const isLocked = p.status_pengajuan !== "disetujui";

    const lockNotice = document.getElementById("progressLocked");
    if (isLocked) lockNotice.classList.remove("d-none");

    const radios = document.querySelectorAll('input[name="progress"]');
    radios.forEach(function (r) {
      if (r.value === p.status_progress) r.checked = true;
      if (isLocked) r.disabled = true;
    });

    if (isLocked) {
      const saveBtn = document.getElementById("saveProgressBtn");
      saveBtn.disabled = true;
      saveBtn.title = "Proker belum disetujui.";
    }
  }

  /* ============================================
     Setup LPJ
     ============================================ */
  function setupLpj(p) {
    const existing = document.getElementById("lpjExisting");
    const upload = document.getElementById("lpjUpload");

    if (p.lpj) {
      existing.classList.remove("d-none");
      upload.classList.add("d-none");
      document.getElementById("lpjNama").textContent = p.lpj.nama;
      document.getElementById("lpjMeta").textContent =
        "Diunggah: " + formatDatetime(p.lpj.tanggal_upload);

      const badge = document.getElementById("lpjStatus");
      badge.className =
        "badge-status " +
        (badgeVerifikasi[p.lpj.status_verifikasi] || "badge bg-secondary");
      badge.textContent =
        labelVerifikasi[p.lpj.status_verifikasi] || p.lpj.status_verifikasi;
      return;
    }

    existing.classList.add("d-none");
    upload.classList.remove("d-none");

    // Lock upload kalau belum disetujui / belum berjalan
    const allowed =
      p.status_pengajuan === "disetujui" &&
      (p.status_progress === "berjalan" || p.status_progress === "selesai");

    const fileInput = document.getElementById("lpjFile");
    const deskripsi = document.getElementById("lpjDeskripsi");
    const uploadBtn = document.getElementById("uploadLpjBtn");

    if (!allowed) {
      fileInput.disabled = true;
      deskripsi.disabled = true;
      uploadBtn.disabled = true;
      uploadBtn.title = "Unggah LPJ hanya tersedia setelah proker berjalan/selesai.";
      return;
    }

    setupLpjInteractions();
  }

  function setupLpjInteractions() {
    const fileInput = document.getElementById("lpjFile");
    const dropzone = document.getElementById("lpjDropzone");
    const selected = document.getElementById("lpjSelected");
    const selectedName = document.getElementById("lpjSelectedName");
    const clearBtn = document.getElementById("lpjClearBtn");
    const deskripsi = document.getElementById("lpjDeskripsi");
    const uploadBtn = document.getElementById("uploadLpjBtn");

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_EXT = ["pdf", "docx", "jpg", "jpeg", "png"];

    let currentFile = null;

    function refresh() {
      const deskOk = deskripsi.value.trim().length >= 20;
      uploadBtn.disabled = !currentFile || !deskOk;
    }

    function setFile(file) {
      if (!file) return;
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ALLOWED_EXT.indexOf(ext) === -1) {
        showAlert(
          "Format berkas tidak didukung. Gunakan PDF, DOCX, JPG, atau PNG.",
          "danger"
        );
        return;
      }
      if (file.size > MAX_SIZE) {
        showAlert("Ukuran berkas melebihi 5 MB.", "danger");
        return;
      }
      currentFile = file;
      selectedName.textContent =
        file.name + " · " + (file.size / 1024).toFixed(1) + " KB";
      selected.classList.remove("d-none");
      dropzone.classList.add("d-none");
      refresh();
    }

    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) {
        setFile(fileInput.files[0]);
      }
    });

    // Drag & drop
    ["dragenter", "dragover"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dropzone.addEventListener(ev, function (e) {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });
    dropzone.addEventListener("drop", function (e) {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) setFile(f);
    });

    clearBtn.addEventListener("click", function () {
      currentFile = null;
      fileInput.value = "";
      selected.classList.add("d-none");
      dropzone.classList.remove("d-none");
      refresh();
    });

    deskripsi.addEventListener("input", function () {
      const ok = deskripsi.value.trim().length >= 20;
      deskripsi.classList.toggle("is-invalid", deskripsi.value.length > 0 && !ok);
      refresh();
    });

    // Submit upload (simulasi)
    uploadBtn.addEventListener("click", function () {
      if (!currentFile) return;
      if (deskripsi.value.trim().length < 20) {
        deskripsi.classList.add("is-invalid");
        return;
      }

      const spinner = document.getElementById("uploadLpjSpinner");
      const icon = document.getElementById("uploadLpjIcon");
      const text = document.getElementById("uploadLpjText");

      uploadBtn.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Mengunggah...";

      setTimeout(function () {
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Unggah LPJ";

        console.log("[ProkerIn] LPJ diunggah:", {
          file: currentFile.name,
          deskripsi: deskripsi.value.trim(),
        });

        showAlert(
          "LPJ berhasil diunggah. Menunggu verifikasi Admin Kemahasiswaan.",
          "success"
        );

        // Simulasi tampilkan kartu existing
        document.getElementById("lpjExisting").classList.remove("d-none");
        document.getElementById("lpjUpload").classList.add("d-none");
        document.getElementById("lpjNama").textContent = currentFile.name;
        document.getElementById("lpjMeta").textContent =
          "Diunggah: baru saja";

        const badge = document.getElementById("lpjStatus");
        badge.className = "badge-status " + badgeVerifikasi.menunggu;
        badge.textContent = labelVerifikasi.menunggu;
      }, 1300);
    });
  }

  /* ============================================
     Simpan progress (simulasi)
     ============================================ */
  function setupSaveProgress(p) {
    const btn = document.getElementById("saveProgressBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const checked = document.querySelector('input[name="progress"]:checked');
      if (!checked) {
        showAlert("Pilih status progress terlebih dahulu.", "danger");
        return;
      }
      if (checked.value === p.status_progress) {
        showAlert("Status progress tidak berubah.", "warning");
        return;
      }

      const spinner = document.getElementById("saveProgressSpinner");
      const icon = document.getElementById("saveProgressIcon");
      const text = document.getElementById("saveProgressText");

      btn.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Menyimpan...";

      setTimeout(function () {
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Simpan Progress";
        btn.disabled = false;

        p.status_progress = checked.value;

        // Update semua badge di halaman
        const badge = badgeProgress[p.status_progress];
        const label = labelProgress[p.status_progress];

        const heroPr = document.getElementById("heroStatusProgress");
        heroPr.className = "badge-status " + badge;
        heroPr.textContent = label;

        const sidePr = document.getElementById("sideStatusProgress");
        sidePr.className = "badge-status " + badge;
        sidePr.textContent = label;

        console.log("[ProkerIn] Progress diupdate:", p.status_progress);
        showAlert("Status progress berhasil diperbarui.", "success");
      }, 900);
    });
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    const id = getIdFromUrl();
    const loading = document.getElementById("loadingState");
    const content = document.getElementById("detailContent");

    // Simulasi loading singkat
    setTimeout(function () {
      loading.classList.add("d-none");

      if (!id) {
        showAlert(
          "ID proker tidak ditemukan di URL. Menampilkan proker contoh (ID 1).",
          "warning"
        );
      }

      const proker = dummyProker.find(function (x) {
        return x.id === (id || 1);
      });

      if (!proker) {
        showAlert("Proker dengan ID tersebut tidak ditemukan.", "danger");
        return;
      }

      content.classList.remove("d-none");

      renderHero(proker);
      renderSidebar(proker);
      renderTimeline(proker);
      setupProgress(proker);
      setupLpj(proker);
      setupSaveProgress(proker);
    }, 350);
  });
})();