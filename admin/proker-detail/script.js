/* eslint-env browser */
/* global console, ProkerIn, sb, alert, confirm, prompt */

/* ============================================
   ProkerIn — Admin Proker Detail Script
   Baca ?id= dari URL, render dari Supabase,
   aksi setujui/tolak/revisi + verifikasi LPJ
   ============================================ */

(function () {
  "use strict";

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

  var labelVerifikasi = {
    menunggu: "Menunggu Verifikasi",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
  };
  var badgeVerifikasi = {
    menunggu: "badge bg-warning text-dark",
    terverifikasi: "badge bg-success",
    ditolak: "badge bg-danger",
  };

  // Vocabulary log_proker.aksi (untuk timeline)
  var labelAksi = {
    diajukan: "Diajukan",
    direvisi: "Direvisi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    progress_diperbarui: "Progress Diperbarui",
    lpj_diunggah: "LPJ Diunggah",
    lpj_diverifikasi: "LPJ Terverifikasi",
    lpj_ditolak: "LPJ Ditolak",
  };
  var iconAksi = {
    diajukan: "bi-send",
    direvisi: "bi-pencil",
    disetujui: "bi-check2",
    ditolak: "bi-x-lg",
    progress_diperbarui: "bi-arrow-repeat",
    lpj_diunggah: "bi-upload",
    lpj_diverifikasi: "bi-patch-check",
    lpj_ditolak: "bi-patch-exclamation",
  };
  var dotClassAksi = {
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
     State
     ============================================ */
  var ormawaMap = {};
  var state = {
    proker: null,
    aksi: null,
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

  function formatTanggal(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    var bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  }

  function formatRentangTanggal(mulai, selesai) {
    if (mulai === selesai) return formatTanggal(mulai);
    return formatTanggal(mulai) + " \u2014 " + formatTanggal(selesai);
  }

  function formatDatetime(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    var bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    var jam = String(d.getHours()).padStart(2, "0");
    var menit = String(d.getMinutes()).padStart(2, "0");
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

  function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get("id"), 10);
    return isNaN(id) ? null : id;
  }

  function showAlert(message, type) {
    var el = document.getElementById("pageAlert");
    if (!el) return;
    type = type || "success";
    el.className = "alert alert-" + type;
    el.textContent = message;
    el.classList.remove("d-none");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(function () { el.classList.add("d-none"); }, 4000);
  }

  /* ============================================
     Render hero
     ============================================ */
  function renderHero(p) {
    var ormawa = getOrmawa(p.ormawa_id);
    document.getElementById("breadcrumbNama").textContent = p.nama;

    var elSp = document.getElementById("heroStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    var elSPr = document.getElementById("heroStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    document.getElementById("heroKategori").textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";
    document.getElementById("heroNama").textContent = p.nama;
    document.getElementById("heroTujuan").textContent = p.tujuan;
    document.getElementById("heroOrmawa").textContent =
      ormawa.nama + " (" + (ormawa.jenis || "-").toUpperCase() + ")";
    document.getElementById("heroJadwal").textContent =
      formatRentangTanggal(p.jadwal_mulai, p.jadwal_selesai);
    document.getElementById("heroAnggaran").textContent = formatRupiah(p.anggaran);
    document.getElementById("heroPj").textContent =
      (p.pj_nama || "\u2014") + (p.pj_jabatan ? " (" + p.pj_jabatan + ")" : "");
    document.getElementById("heroDiajukan").textContent =
      formatDatetime(p.created_at);
  }

  /* ============================================
     Render sidebar kanan
     ============================================ */
  function renderSidebar(p, logs) {
    var ormawa = getOrmawa(p.ormawa_id);
    var elSp = document.getElementById("sideStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    var elSPr = document.getElementById("sideStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    document.getElementById("sideKategori").textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";
    document.getElementById("sideOrmawa").textContent = ormawa.nama;

    // Catatan terakhir dari log (prioritas: direvisi/ditolak/disetujui)
    var lastCatatan = logs
      .filter(function (l) {
        return l.catatan && ["direvisi", "ditolak", "disetujui"].indexOf(l.aksi) !== -1;
      })
      .slice(-1)[0];

    var box = document.getElementById("catatanTerakhirBox");
    if (lastCatatan) {
      box.classList.remove("catatan-box--empty");
      box.innerHTML =
        "<strong>" +
        escapeHtml(labelAksi[lastCatatan.aksi] || lastCatatan.aksi) +
        "</strong><br />" +
        escapeHtml(lastCatatan.catatan);
    } else {
      box.classList.add("catatan-box--empty");
      box.textContent = "Belum ada catatan.";
    }
  }

  /* ============================================
     Render timeline
     ============================================ */
  function renderTimeline(logs) {
    var list = document.getElementById("timelineList");

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
     Aksi persetujuan (Setujui / Revisi / Tolak)
     ============================================ */
  function setupAksi(p, muatUlangLog) {
    var actionButtons = document.getElementById("actionButtons");
    var lockedNotice = document.getElementById("aksiLocked");
    var lockedText = document.getElementById("aksiLockedText");
    var catatanForm = document.getElementById("catatanForm");
    var catatanText = document.getElementById("catatanText");
    var catatanFeedback = document.getElementById("catatanFeedback");
    var catatanLabelHint = document.getElementById("catatanLabelHint");
    var btnBatal = document.getElementById("btnBatalCatatan");
    var btnKirim = document.getElementById("btnKirimCatatan");

    var needsAction =
      p.status_pengajuan === "diajukan" || p.status_pengajuan === "direvisi";

    if (!needsAction) {
      actionButtons.classList.add("d-none");
      lockedNotice.classList.remove("d-none");
      if (p.status_pengajuan === "disetujui") {
        lockedText.textContent =
          "Proker ini sudah disetujui dan dapat dijalankan oleh ormawa.";
      } else if (p.status_pengajuan === "ditolak") {
        lockedText.textContent = "Proker ini sudah ditolak.";
      }
      return;
    }

    var buttons = actionButtons.querySelectorAll(".action-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var aksi = btn.getAttribute("data-aksi");
        state.aksi = aksi;

        buttons.forEach(function (b) {
          b.style.borderColor = "";
          b.style.background = "";
        });

        if (aksi === "setuju") {
          btn.style.borderColor = "var(--prokerin-success)";
          btn.style.background = "#e8f5ec";
          catatanLabelHint.textContent = "(opsional)";
          catatanText.placeholder = "Catatan tambahan (opsional)...";
        } else if (aksi === "revisi") {
          btn.style.borderColor = "#0dcaf0";
          btn.style.background = "#e6f8fb";
          catatanLabelHint.textContent = "(wajib)";
          catatanText.placeholder = "Jelaskan bagian apa yang perlu direvisi...";
        } else if (aksi === "tolak") {
          btn.style.borderColor = "var(--prokerin-danger)";
          btn.style.background = "#fdeaea";
          catatanLabelHint.textContent = "(wajib)";
          catatanText.placeholder = "Alasan penolakan...";
        }

        catatanForm.classList.remove("d-none");
        catatanText.classList.remove("is-invalid");
        catatanText.focus();
        catatanForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });

    btnBatal.addEventListener("click", function () {
      state.aksi = null;
      catatanForm.classList.add("d-none");
      catatanText.value = "";
      catatanText.classList.remove("is-invalid");
      buttons.forEach(function (b) {
        b.style.borderColor = "";
        b.style.background = "";
      });
    });

    btnKirim.addEventListener("click", function () {
      if (!state.aksi) return;

      var catatan = catatanText.value.trim();
      var isSetuju = state.aksi === "setuju";
      var minLen = isSetuju ? 0 : 10;

      if (catatan.length < minLen) {
        catatanText.classList.add("is-invalid");
        catatanFeedback.textContent = isSetuju
          ? "Catatan opsional."
          : "Catatan wajib diisi (min. 10 karakter).";
        return;
      }

      var statusBaru = {
        setuju: "disetujui",
        revisi: "direvisi",
        tolak: "ditolak",
      }[state.aksi];

      var spinner = document.getElementById("kirimSpinner");
      var icon = document.getElementById("kirimIcon");
      var text = document.getElementById("kirimText");

      btnKirim.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Mengirim...";

      var updatePayload = { status_pengajuan: statusBaru };
      if (catatan) updatePayload.catatan_admin = catatan;

      sb
        .from("proker")
        .update(updatePayload)
        .eq("id", p.id)
        .then(function (res) {
          if (res.error) {
            spinner.classList.add("d-none");
            icon.classList.remove("d-none");
            text.textContent = "Kirim Keputusan";
            btnKirim.disabled = false;
            console.error("[ProkerIn] Gagal update status:", res.error);
            showAlert("Gagal menyimpan keputusan: " + res.error.message, "danger");
            return null;
          }

          // Insert log manual (kalau trigger belum handle)
          return sb.from("log_proker").insert({
            proker_id: p.id,
            aksi: state.aksi === "setuju" ? "disetujui"
                : state.aksi === "revisi" ? "direvisi" : "ditolak",
            oleh_nama: (ProkerIn.user && ProkerIn.user.nama) || "Admin",
            catatan: catatan || null,
          });
        })
        .then(function (logRes) {
          if (logRes === null) return; // update gagal, sudah di-handle

          spinner.classList.add("d-none");
          icon.classList.remove("d-none");
          text.textContent = "Kirim Keputusan";
          btnKirim.disabled = false;

          if (logRes && logRes.error) {
            console.warn("[ProkerIn] Gagal insert log:", logRes.error);
            // Tidak fatal — status sudah berubah
          }

          var labels = {
            setuju: "disetujui",
            revisi: "diminta revisi",
            tolak: "ditolak",
          };
          console.log("[ProkerIn] Keputusan admin:", {
            proker_id: p.id,
            aksi: state.aksi,
            catatan: catatan,
            status_baru: statusBaru,
          });

          showAlert(
            "Proker berhasil " + labels[state.aksi] + ".",
            state.aksi === "setuju"
              ? "success"
              : state.aksi === "tolak"
              ? "danger"
              : "info"
          );

          p.status_pengajuan = statusBaru;

          var elSp = document.getElementById("heroStatusPengajuan");
          elSp.className = "badge-status " + badgePengajuan[statusBaru];
          elSp.textContent = labelPengajuan[statusBaru];

          var elSideSp = document.getElementById("sideStatusPengajuan");
          elSideSp.className = "badge-status " + badgePengajuan[statusBaru];
          elSideSp.textContent = labelPengajuan[statusBaru];

          catatanForm.classList.add("d-none");
          actionButtons.classList.add("d-none");
          lockedNotice.classList.remove("d-none");
          lockedText.textContent =
            "Proker sudah " + labelPengajuan[statusBaru].toLowerCase() + ".";

          muatUlangLog();
        });
    });
  }

  /* ============================================
     LPJ
     ============================================ */
  function setupLpj(p, lpjRow, muatUlangLog) {
    var kosong = document.getElementById("lpjKosong");
    var ada = document.getElementById("lpjAda");
    var aksi = document.getElementById("lpjAksi");

    if (!lpjRow) {
      kosong.classList.remove("d-none");
      ada.classList.add("d-none");
      return;
    }

    kosong.classList.add("d-none");
    ada.classList.remove("d-none");

    document.getElementById("lpjNama").textContent = lpjRow.file_nama;
    document.getElementById("lpjMeta").textContent =
      "Diunggah: " + formatDatetime(lpjRow.uploaded_at);
    document.getElementById("lpjDeskripsi").textContent =
      lpjRow.deskripsi || "\u2014";

    var badge = document.getElementById("lpjStatus");
    badge.className =
      "badge-status " +
      (badgeVerifikasi[lpjRow.status_verifikasi] || "badge bg-secondary");
    badge.textContent =
      labelVerifikasi[lpjRow.status_verifikasi] || lpjRow.status_verifikasi;

    if (lpjRow.status_verifikasi !== "menunggu") {
      aksi.classList.add("d-none");
      return;
    }

    var btnVerif = document.getElementById("btnVerifikasiLpj");
    var btnTolakLpj = document.getElementById("btnTolakLpj");

    // === Verifikasi ===
    btnVerif.addEventListener("click", function () {
      if (!confirm("Verifikasi LPJ ini sebagai valid?")) return;

      btnVerif.disabled = true;
      var originalHtml = btnVerif.innerHTML;
      btnVerif.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';

      sb
        .from("lpj")
        .update({
          status_verifikasi: "terverifikasi",
          verified_at: new Date().toISOString(),
          catatan_verifikasi: null,
        })
        .eq("id", lpjRow.id)
        .then(function (res) {
          if (res.error) {
            btnVerif.disabled = false;
            btnVerif.innerHTML = originalHtml;
            console.error("[ProkerIn] Gagal verifikasi LPJ:", res.error);
            showAlert("Gagal memverifikasi LPJ: " + res.error.message, "danger");
            return null;
          }

          return sb.from("log_proker").insert({
            proker_id: p.id,
            aksi: "lpj_diverifikasi",
            oleh_nama: (ProkerIn.user && ProkerIn.user.nama) || "Admin",
            catatan: "LPJ diverifikasi oleh Admin Kemahasiswaan.",
          });
        })
        .then(function (logRes) {
          if (logRes === null) return;

          btnVerif.disabled = false;
          btnVerif.innerHTML = originalHtml;

          if (logRes && logRes.error) {
            console.warn("[ProkerIn] Gagal insert log verifikasi:", logRes.error);
          }

          lpjRow.status_verifikasi = "terverifikasi";
          badge.className = "badge-status " + badgeVerifikasi.terverifikasi;
          badge.textContent = labelVerifikasi.terverifikasi;
          aksi.classList.add("d-none");
          showAlert("LPJ berhasil diverifikasi.", "success");
          console.log("[ProkerIn] LPJ terverifikasi:", p.id);
          muatUlangLog();
        });
    });

    // === Tolak ===
    btnTolakLpj.addEventListener("click", function () {
      var alasan = prompt("Alasan penolakan LPJ (min. 10 karakter):");
      if (alasan === null) return;
      alasan = alasan.trim();
      if (alasan.length < 10) {
        showAlert("Alasan penolakan wajib diisi (min. 10 karakter).", "danger");
        return;
      }

      btnTolakLpj.disabled = true;
      var originalHtml = btnTolakLpj.innerHTML;
      btnTolakLpj.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';

      sb
        .from("lpj")
        .update({
          status_verifikasi: "ditolak",
          verified_at: new Date().toISOString(),
          catatan_verifikasi: alasan,
        })
        .eq("id", lpjRow.id)
        .then(function (res) {
          if (res.error) {
            btnTolakLpj.disabled = false;
            btnTolakLpj.innerHTML = originalHtml;
            console.error("[ProkerIn] Gagal tolak LPJ:", res.error);
            showAlert("Gagal menolak LPJ: " + res.error.message, "danger");
            return null;
          }

          return sb.from("log_proker").insert({
            proker_id: p.id,
            aksi: "lpj_ditolak",
            oleh_nama: (ProkerIn.user && ProkerIn.user.nama) || "Admin",
            catatan: alasan,
          });
        })
        .then(function (logRes) {
          if (logRes === null) return;

          btnTolakLpj.disabled = false;
          btnTolakLpj.innerHTML = originalHtml;

          if (logRes && logRes.error) {
            console.warn("[ProkerIn] Gagal insert log tolak LPJ:", logRes.error);
          }

          lpjRow.status_verifikasi = "ditolak";
          badge.className = "badge-status " + badgeVerifikasi.ditolak;
          badge.textContent = labelVerifikasi.ditolak;
          aksi.classList.add("d-none");
          showAlert("LPJ ditolak.", "danger");
          console.log("[ProkerIn] LPJ ditolak:", { proker_id: p.id, alasan: alasan });
          muatUlangLog();
        });
    });
  }

  /* ============================================
     Fetch data
     ============================================ */
  async function muatData(id) {
    var results = await Promise.all([
      sb.from("proker").select("*").eq("id", id).single(),
      sb
        .from("log_proker")
        .select("*")
        .eq("proker_id", id)
        .order("created_at", { ascending: true }),
      sb.from("lpj").select("*").eq("proker_id", id).maybeSingle(),
      sb.from("ormawa").select("id, nama, jenis"),
    ]);
    return {
      proker: results[0],
      logs: results[1],
      lpj: results[2],
      ormawa: results[3],
    };
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready; // WAJIB

    var id = getIdFromUrl();
    var loading = document.getElementById("loadingState");
    var content = document.getElementById("detailContent");

    if (!id) {
      loading.classList.add("d-none");
      showAlert("ID proker tidak ditemukan di URL.", "danger");
      return;
    }

    var hasil = await muatData(id);
    loading.classList.add("d-none");

    if (hasil.proker.error || !hasil.proker.data) {
      console.error("[ProkerIn] Gagal memuat proker:", hasil.proker.error);
      showAlert(
        "Proker dengan ID tersebut tidak ditemukan, atau Anda tidak berhak mengaksesnya.",
        "danger"
      );
      return;
    }

    var proker = hasil.proker.data;
    var logs = hasil.logs.data || [];
    var lpjRow = hasil.lpj.data || null;

    state.proker = proker;

    ormawaMap = {};
    (hasil.ormawa.data || []).forEach(function (o) {
      ormawaMap[o.id] = o;
    });

    // Function declaration — hoisted, tapi tulis di atas biar jelas
    async function muatUlangLog() {
      var res = await sb
        .from("log_proker")
        .select("*")
        .eq("proker_id", id)
        .order("created_at", { ascending: true });
      logs = res.data || [];
      renderSidebar(proker, logs);
      renderTimeline(logs);
    }

    // Render awal
    content.classList.remove("d-none");
    renderHero(proker);
    renderSidebar(proker, logs);
    renderTimeline(logs);

    // Setup handler — kirim muatUlangLog sebagai argumen
    setupAksi(proker, muatUlangLog);
    setupLpj(proker, lpjRow, muatUlangLog);
  });
})();