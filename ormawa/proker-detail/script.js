/* eslint-env browser */
/* global console, ProkerIn, sb, URLSearchParams, confirm */

/* ============================================
   ProkerIn — Proker Detail Script
   Baca ?id= dari URL, render data dari Supabase,
   update progress & upload LPJ (Supabase Storage)
   ============================================ */

(function () {
  "use strict";

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

  // Vocabulary log_proker.aksi (lebih lengkap dari status_pengajuan)
  const labelAksi = {
    diajukan: "Diajukan",
    direvisi: "Direvisi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    progress_diperbarui: "Progress Diperbarui",
    lpj_diunggah: "LPJ Diunggah",
    lpj_diverifikasi: "LPJ Terverifikasi",
    lpj_ditolak: "LPJ Ditolak",
  };
  const iconAksi = {
    diajukan: "bi-send",
    direvisi: "bi-pencil",
    disetujui: "bi-check2",
    ditolak: "bi-x-lg",
    progress_diperbarui: "bi-arrow-repeat",
    lpj_diunggah: "bi-upload",
    lpj_diverifikasi: "bi-patch-check",
    lpj_ditolak: "bi-patch-exclamation",
  };
  const dotClassAksi = {
    diajukan: "timeline__dot--diajukan",
    direvisi: "timeline__dot--revisi",
    disetujui: "timeline__dot--disetujui",
    ditolak: "timeline__dot--ditolak",
    progress_diperbarui: "timeline__dot--diajukan",
    lpj_diunggah: "timeline__dot--diajukan",
    lpj_diverifikasi: "timeline__dot--disetujui",
    lpj_ditolak: "timeline__dot--ditolak",
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

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"), 10);
    return isNaN(id) ? null : id;
  }

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
      p.created_at
    );
  }

  /* ============================================
     Render sidebar kanan
     ============================================ */
  function renderSidebar(p, logs) {
    const elSp = document.getElementById("sideStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    const elSPr = document.getElementById("sideStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    document.getElementById("sideKategori").textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";

    // Catatan revisi terakhir (aksi diajukan/direvisi/disetujui/ditolak yang punya catatan)
    const lastCatatan = logs
      .filter(function (l) {
        return l.catatan && ["direvisi", "ditolak", "disetujui"].indexOf(l.aksi) !== -1;
      })
      .slice(-1)[0];

    const box = document.getElementById("catatanRevisiBox");
    if (lastCatatan) {
      box.classList.remove("catatan-box--empty");
      box.innerHTML =
        "<strong>" +
        escapeHtml(labelAksi[lastCatatan.aksi] || lastCatatan.aksi) +
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
  function renderTimeline(logs) {
    const list = document.getElementById("timelineList");

    if (!logs.length) {
      list.innerHTML =
        '<li class="timeline__item"><p class="text-muted mb-0">Belum ada riwayat.</p></li>';
      return;
    }

    list.innerHTML = logs
      .map(function (l) {
        return (
          '<li class="timeline__item">' +
            '<span class="timeline__dot ' +
              (dotClassAksi[l.aksi] || "") +
            '">' +
              '<i class="bi ' + (iconAksi[l.aksi] || "bi-circle") + '"></i>' +
            "</span>" +
            '<div class="timeline__header">' +
              '<h4 class="timeline__title">' +
                escapeHtml(labelAksi[l.aksi] || l.aksi) +
              "</h4>" +
              '<span class="timeline__time">' +
                escapeHtml(formatDatetime(l.created_at)) +
              "</span>" +
            "</div>" +
            '<p class="timeline__actor">oleh ' + escapeHtml(l.oleh_nama) + "</p>" +
            (l.catatan
              ? '<p class="timeline__catatan">' + escapeHtml(l.catatan) + "</p>"
              : "") +
          "</li>"
        );
      })
      .join("");
  }

  /* ============================================
     Progress
     ============================================ */
  function setupProgress(p) {
    const isLocked = p.status_pengajuan !== "disetujui";

    const lockNotice = document.getElementById("progressLocked");
    if (isLocked) lockNotice.classList.remove("d-none");
    else lockNotice.classList.add("d-none");

    const radios = document.querySelectorAll('input[name="progress"]');
    radios.forEach(function (r) {
      r.checked = r.value === p.status_progress;
      r.disabled = isLocked;
    });

    const saveBtn = document.getElementById("saveProgressBtn");
    saveBtn.disabled = isLocked;
    saveBtn.title = isLocked ? "Proker belum disetujui." : "";
  }

  function setupSaveProgress(p, onChanged) {
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

      sb
        .from("proker")
        .update({ status_progress: checked.value })
        .eq("id", p.id)
        .then(function (res) {
          spinner.classList.add("d-none");
          icon.classList.remove("d-none");
          text.textContent = "Simpan Progress";
          btn.disabled = false;

          if (res.error) {
            console.error("[ProkerIn] Gagal update progress:", res.error);
            showAlert("Gagal menyimpan progress: " + res.error.message, "danger");
            return;
          }

          p.status_progress = checked.value;

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

          if (onChanged) onChanged();
        });
    });
  }

  /* ============================================
     LPJ
     ============================================ */
  async function muatLpj(prokerId) {
    const { data, error } = await sb
      .from("lpj")
      .select("*")
      .eq("proker_id", prokerId)
      .maybeSingle();
    if (error) {
      console.error("[ProkerIn] Gagal memuat LPJ:", error);
      return null;
    }
    return data;
  }

  function tampilkanLpjExisting(lpjRow) {
    document.getElementById("lpjExisting").classList.remove("d-none");
    document.getElementById("lpjUpload").classList.add("d-none");
    document.getElementById("lpjNama").textContent = lpjRow.file_nama;
    document.getElementById("lpjMeta").textContent =
      "Diunggah: " + formatDatetime(lpjRow.uploaded_at);

    const badge = document.getElementById("lpjStatus");
    badge.className =
      "badge-status " +
      (badgeVerifikasi[lpjRow.status_verifikasi] || "badge bg-secondary");
    badge.textContent =
      labelVerifikasi[lpjRow.status_verifikasi] || lpjRow.status_verifikasi;
  }

  function setupLpj(p, lpjRow, onChanged) {
    const existing = document.getElementById("lpjExisting");
    const upload = document.getElementById("lpjUpload");

    const bolehUnggahUlang = lpjRow && lpjRow.status_verifikasi === "ditolak";

    if (lpjRow && !bolehUnggahUlang) {
      tampilkanLpjExisting(lpjRow);
      return;
    }

    existing.classList.add("d-none");
    upload.classList.remove("d-none");

    if (bolehUnggahUlang) {
      showAlert(
        "LPJ sebelumnya ditolak" +
          (lpjRow.catatan_verifikasi ? ": " + lpjRow.catatan_verifikasi : "") +
          ". Silakan unggah ulang.",
        "warning"
      );
    }

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

    setupLpjInteractions(p, onChanged);
  }

  async function unggahLpj(p, file, deskripsi) {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = p.id + "/lpj." + ext;

    const upRes = await sb.storage
      .from("lpj")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upRes.error) return { error: upRes.error };

    const payload = {
      proker_id: p.id,
      file_path: path,
      file_nama: file.name,
      deskripsi: deskripsi,
    };

    return sb
      .from("lpj")
      .upsert(payload, { onConflict: "proker_id" })
      .select()
      .single();
  }

  function setupLpjInteractions(p, onChanged) {
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

      unggahLpj(p, currentFile, deskripsi.value.trim()).then(function (res) {
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Unggah LPJ";
        uploadBtn.disabled = false;

        if (res.error) {
          console.error("[ProkerIn] Gagal unggah LPJ:", res.error);
          showAlert("Gagal mengunggah LPJ: " + res.error.message, "danger");
          return;
        }

        console.log("[ProkerIn] LPJ diunggah:", res.data);
        showAlert(
          "LPJ berhasil diunggah. Menunggu verifikasi Admin Kemahasiswaan.",
          "success"
        );

        tampilkanLpjExisting(res.data);
        if (onChanged) onChanged();
      });
    });
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready;

    const id = getIdFromUrl();
    const loading = document.getElementById("loadingState");
    const content = document.getElementById("detailContent");

    if (!id) {
      loading.classList.add("d-none");
      showAlert("ID proker tidak ditemukan di URL.", "danger");
      return;
    }

    const [prokerRes, logRes, lpjRow] = await Promise.all([
      sb.from("proker").select("*").eq("id", id).single(),
      sb
        .from("log_proker")
        .select("*")
        .eq("proker_id", id)
        .order("created_at", { ascending: true }),
      muatLpj(id),
    ]);

    loading.classList.add("d-none");

    if (prokerRes.error || !prokerRes.data) {
      console.error("[ProkerIn] Gagal memuat proker:", prokerRes.error);
      showAlert(
        "Proker dengan ID tersebut tidak ditemukan, atau Anda tidak berhak mengaksesnya.",
        "danger"
      );
      return;
    }

    const proker = prokerRes.data;
    let logs = logRes.data || [];

    content.classList.remove("d-none");

    renderHero(proker);
    renderSidebar(proker, logs);
    renderTimeline(logs);
    setupProgress(proker);

    async function muatUlangLog() {
      const { data } = await sb
        .from("log_proker")
        .select("*")
        .eq("proker_id", id)
        .order("created_at", { ascending: true });
      logs = data || [];
      renderSidebar(proker, logs);
      renderTimeline(logs);
    }

    setupSaveProgress(proker, muatUlangLog);
    setupLpj(proker, lpjRow, muatUlangLog);
  });
})();