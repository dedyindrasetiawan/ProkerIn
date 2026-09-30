/* eslint-env browser */
/* global console, ProkerIn, sb, bootstrap, alert, confirm */

/* ============================================
   ProkerIn — Super Admin Akun Script
   Kelola akun dari tabel profiles (Supabase).
   - Fetch daftar user + ormawa
   - Edit nama/role/ormawa/aktif → UPDATE profiles
   - Nonaktifkan / Aktifkan → UPDATE profiles.aktif
   - Tambah akun → arahkan ke Supabase Auth Dashboard
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Konstanta
     ============================================ */
  var SUPABASE_AUTH_USERS_URL =
    "https://supabase.com/dashboard/project/qbrbuhvhtlzmhitergew/auth/users";

  /* ============================================
     State
     ============================================ */
  var semuaUser = [];
  var semuaOrmawa = [];
  var ormawaMap = {};
  var state = {
    search: "",
    role: "",
    ormawa: "",
    editMode: false,
    confirmAction: null,
  };

  // Simpan HTML asli modal (form + footer) supaya bisa di-restore
  // setelah dipakai menampilkan panduan Tambah Akun / Reset Password.
  var _originalBodyHTML = null;
  var _originalFooterHTML = null;

  /* ============================================
     Mapping role
     ============================================ */
  var roleLabel = {
    ketua_pengurus: "Ketua/Pengurus",
    admin_kemahasiswaan: "Admin Kemahasiswaan",
    super_admin: "Super Admin",
  };
  var roleBadgeClass = {
    ketua_pengurus: "role-badge--ketua",
    admin_kemahasiswaan: "role-badge--admin",
    super_admin: "role-badge--super",
  };
  var roleIcon = {
    ketua_pengurus: "bi-people",
    admin_kemahasiswaan: "bi-shield-check",
    super_admin: "bi-key",
  };

  /* ============================================
     Helper umum
     ============================================ */
  function getOrmawaById(id) {
    return ormawaMap[id] || null;
  }

  function getInitials(nama) {
    if (!nama) return "?";
    var parts = nama.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDatetime(dateStr) {
    if (!dateStr) return "Belum pernah";
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
     Simpan & restore HTML form modal
     ============================================ */
  function saveOriginalModalOnce() {
    if (_originalBodyHTML) return;
    var body = document.querySelector("#akunModal .modal-body");
    var footer = document.querySelector("#akunModal .modal-footer");
    if (!body || !footer) return;
    _originalBodyHTML = body.innerHTML;
    _originalFooterHTML = footer.innerHTML;
  }

  function restoreOriginalModal() {
    if (!_originalBodyHTML) return;
    var body = document.querySelector("#akunModal .modal-body");
    var footer = document.querySelector("#akunModal .modal-footer");
    if (!body || !footer) return;
    body.innerHTML = _originalBodyHTML;
    footer.innerHTML = _originalFooterHTML;

    // Re-attach event listener form (innerHTML menghapus listener lama)
    setupAkunForm();
  }

  /* ============================================
     Populate dropdown ormawa
     ============================================ */
  function populateOrmawa() {
    var selFilter = document.getElementById("filterOrmawa");
    var selForm = document.getElementById("akunOrmawa");

    if (selFilter) {
      while (selFilter.options.length > 1) selFilter.remove(1);
    }
    if (selForm) {
      while (selForm.options.length > 1) selForm.remove(1);
    }

    semuaOrmawa.forEach(function (o) {
      if (selFilter) {
        var opt1 = document.createElement("option");
        opt1.value = String(o.id);
        opt1.textContent = o.nama;
        selFilter.appendChild(opt1);
      }
      if (selForm) {
        var opt2 = document.createElement("option");
        opt2.value = String(o.id);
        opt2.textContent = o.nama;
        selForm.appendChild(opt2);
      }
    });
  }

  /* ============================================
     Filter
     ============================================ */
  function getFiltered() {
    var q = state.search.toLowerCase();
    return semuaUser.filter(function (u) {
      if (state.role && u.role !== state.role) return false;
      if (state.ormawa && String(u.ormawa_id) !== state.ormawa) return false;
      if (q) {
        var hay = ((u.nama || "") + " " + (u.email || "")).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ============================================
     Render tabel
     ============================================ */
  function renderTabel(data) {
    var tbody = document.getElementById("userTableBody");
    var emptyState = document.getElementById("emptyState");
    var totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " akun";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (u) {
      var ormawa = u.ormawa_id ? getOrmawaById(u.ormawa_id) : null;
      var tr = document.createElement("tr");
      if (!u.aktif) tr.classList.add("inactive");

      var roleClass = roleBadgeClass[u.role] || "";
      var roleIc = roleIcon[u.role] || "bi-person";

      var ormawaCell = ormawa
        ? '<span class="user-table__ormawa">' + escapeHtml(ormawa.nama) + "</span>"
        : '<span class="user-table__ormawa-empty">\u2014</span>';

      var statusCell = u.aktif
        ? '<span class="status-badge status-badge--aktif">' +
            '<i class="bi bi-check-circle-fill"></i>Aktif</span>'
        : '<span class="status-badge status-badge--nonaktif">' +
            '<i class="bi bi-slash-circle"></i>Nonaktif</span>';

      tr.innerHTML =
        "<td>" +
          '<div class="user-cell">' +
            '<div class="user-cell__avatar">' + escapeHtml(getInitials(u.nama)) + "</div>" +
            '<div class="user-cell__info">' +
              '<span class="user-cell__name">' + escapeHtml(u.nama || "\u2014") + "</span>" +
              '<span class="user-cell__email">' + escapeHtml(u.email || "") + "</span>" +
            "</div>" +
          "</div>" +
        "</td>" +
        "<td>" +
          '<span class="role-badge ' + roleClass + '">' +
            '<i class="bi ' + roleIc + '"></i>' +
            escapeHtml(roleLabel[u.role] || u.role) +
          "</span>" +
        "</td>" +
        "<td>" + ormawaCell + "</td>" +
        "<td>" + statusCell + "</td>" +
        '<td class="user-table__login">' + escapeHtml(formatDatetime(u.last_login)) + "</td>" +
        '<td class="text-end">' +
          '<div class="dropdown">' +
            '<button class="btn-action dropdown-toggle" type="button" ' +
              'data-bs-toggle="dropdown" aria-expanded="false" ' +
              'aria-label="Aksi untuk ' + escapeHtml(u.nama || u.email) + '">' +
              '<i class="bi bi-three-dots-vertical"></i>' +
            "</button>" +
            '<ul class="dropdown-menu dropdown-menu-end">' +
              '<li><button class="dropdown-item" data-action="edit" data-id="' + u.id + '">' +
                '<i class="bi bi-pencil"></i> Edit Akun</button></li>' +
              '<li><button class="dropdown-item" data-action="reset-pw" data-id="' + u.id + '">' +
                '<i class="bi bi-key"></i> Reset Password</button></li>' +
              '<li><hr class="dropdown-divider"></li>' +
              (u.aktif
                ? '<li><button class="dropdown-item dropdown-item--danger" data-action="nonaktif" data-id="' + u.id + '">' +
                  '<i class="bi bi-slash-circle"></i> Nonaktifkan</button></li>'
                : '<li><button class="dropdown-item" data-action="aktifkan" data-id="' + u.id + '">' +
                  '<i class="bi bi-check-circle"></i> Aktifkan</button></li>') +
            "</ul>" +
          "</div>" +
        "</td>";

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var aksi = btn.getAttribute("data-action");
        var id = btn.getAttribute("data-id");
        handleAction(aksi, id);
      });
    });
  }

  /* ============================================
     Handle action dari dropdown
     ============================================ */
  function handleAction(aksi, id) {
    var user = semuaUser.find(function (u) { return String(u.id) === String(id); });
    if (!user) return;

    if (aksi === "edit") {
      openEditModal(user);
    } else if (aksi === "reset-pw") {
      openResetPwInfo(user);
    } else if (aksi === "nonaktif") {
      openConfirmModal(
        "Nonaktifkan Akun?",
        "Akun " + (user.nama || user.email) +
        " tidak akan bisa login sampai diaktifkan kembali.",
        function () {
          sb
            .from("profiles")
            .update({ aktif: false })
            .eq("id", user.id)
            .then(function (res) {
              if (res.error) {
                console.error("[ProkerIn] Gagal nonaktifkan:", res.error);
                showAlert("Gagal menonaktifkan akun: " + res.error.message, "danger");
                return;
              }
              user.aktif = false;
              showAlert("Akun " + (user.nama || user.email) + " dinonaktifkan.", "warning");
              console.log("[ProkerIn] Akun dinonaktifkan:", user.id);
              refresh();
            });
        }
      );
    } else if (aksi === "aktifkan") {
      sb
        .from("profiles")
        .update({ aktif: true })
        .eq("id", user.id)
        .then(function (res) {
          if (res.error) {
            console.error("[ProkerIn] Gagal aktifkan:", res.error);
            showAlert("Gagal mengaktifkan akun: " + res.error.message, "danger");
            return;
          }
          user.aktif = true;
          showAlert("Akun " + (user.nama || user.email) + " diaktifkan kembali.", "success");
          console.log("[ProkerIn] Akun diaktifkan:", user.id);
          refresh();
        });
    }
  }

  /* ============================================
     Modal: Tambah Akun (panduan ke Dashboard Supabase)
     ============================================ */
  function openAddInfoModal() {
    saveOriginalModalOnce();

    var modalEl = document.getElementById("akunModal");
    var label = document.getElementById("akunModalLabel");
    var body = modalEl.querySelector(".modal-body");
    var footer = modalEl.querySelector(".modal-footer");

    label.textContent = "Tambah Akun Baru";

    body.innerHTML =
      '<div class="alert alert-info mb-3">' +
        '<i class="bi bi-info-circle-fill me-1"></i>' +
        "<strong>Akun baru dibuat di Dashboard Supabase.</strong> " +
        "Ini karena Supabase Auth butuh <em>service_role key</em> yang " +
        "tidak boleh ada di browser." +
      "</div>" +
      '<h6 class="mb-2">Langkah-langkah:</h6>' +
      '<ol class="mb-3 ps-3" style="font-size:0.9rem;line-height:1.7;">' +
        "<li>Buka Dashboard Supabase → <strong>Authentication → Users</strong>.</li>" +
        "<li>Klik <strong>Add user → Create new user</strong>.</li>" +
        "<li>Isi email &amp; password, centang <strong>Auto Confirm User</strong>.</li>" +
        "<li>Di bagian <strong>User Metadata</strong>, isi JSON berikut:<br>" +
          '<code style="display:inline-block;margin-top:6px;padding:6px 10px;' +
          'background:#f0f5ff;border-radius:6px;font-size:0.8rem;">' +
          '{ "nama": "Nama Lengkap", "role": "ketua_pengurus" }' +
          "</code></li>" +
        "<li>Klik <strong>Create user</strong>.</li>" +
        "<li>Kembali ke halaman ini, klik <strong>Muat Ulang Data</strong>.</li>" +
      "</ol>" +
      '<p class="mb-0 text-muted" style="font-size:0.82rem;">' +
        "Role yang tersedia: " +
        "<code>ketua_pengurus</code>, " +
        "<code>admin_kemahasiswaan</code>, " +
        "<code>super_admin</code>." +
      "</p>";

    footer.innerHTML =
      '<a href="' + SUPABASE_AUTH_USERS_URL + '" target="_blank" rel="noopener" ' +
        'class="btn btn-outline-secondary">' +
        '<i class="bi bi-box-arrow-up-right me-1"></i>Buka Dashboard Supabase' +
      "</a>" +
      '<button type="button" class="btn btn-prokerin" id="reloadAkunBtn">' +
        '<i class="bi bi-arrow-clockwise me-1"></i>Muat Ulang Data' +
      "</button>";

    var reloadBtn = document.getElementById("reloadAkunBtn");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", function () {
        reloadBtn.disabled = true;
        reloadBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Memuat...';
        muatData().then(function () {
          populateOrmawa();
          refresh();
          var modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          showAlert("Data akun berhasil dimuat ulang.", "success");
        });
      });
    }

    var modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  /* ============================================
     Modal: Reset Password (panduan)
     ============================================ */
  function openResetPwInfo(user) {
    saveOriginalModalOnce();

    var modalEl = document.getElementById("akunModal");
    var label = document.getElementById("akunModalLabel");
    var body = modalEl.querySelector(".modal-body");
    var footer = modalEl.querySelector(".modal-footer");

    label.textContent = "Reset Password";

    body.innerHTML =
      '<div class="alert alert-warning mb-3">' +
        '<i class="bi bi-exclamation-triangle-fill me-1"></i>' +
        "Reset password <strong>" + escapeHtml(user.nama || user.email) + "</strong> " +
        "harus dilakukan di Dashboard Supabase." +
      "</div>" +
      '<p style="font-size:0.9rem;line-height:1.7;">Langkah-langkah:</p>' +
      '<ol class="mb-0 ps-3" style="font-size:0.9rem;line-height:1.7;">' +
        "<li>Buka <strong>Authentication → Users</strong>.</li>" +
        "<li>Cari email <code>" + escapeHtml(user.email) + "</code>.</li>" +
        "<li>Klik menu <strong>⋯ → Reset password</strong> (atau Edit user).</li>" +
        "<li>Isi password baru, lalu simpan.</li>" +
        "<li>Sampaikan password baru ke pengguna.</li>" +
      "</ol>";

    footer.innerHTML =
      '<button type="button" class="btn btn-outline-secondary" ' +
        'data-bs-dismiss="modal">Tutup</button>' +
      '<a href="' + SUPABASE_AUTH_USERS_URL + '" target="_blank" rel="noopener" ' +
        'class="btn btn-prokerin">' +
        '<i class="bi bi-box-arrow-up-right me-1"></i>Buka Dashboard' +
      "</a>";

    var modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  /* ============================================
     Modal: Edit Akun
     ============================================ */
  function openEditModal(user) {
    // Restore form asli kalau sebelumnya tertimpa panduan
    restoreOriginalModal();

    state.editMode = true;

    var modalEl = document.getElementById("akunModal");
    var label = document.getElementById("akunModalLabel");
    var form = document.getElementById("akunForm");

    if (!form) {
      console.error("[ProkerIn] Form akun tidak ditemukan.");
      return;
    }

    form.classList.remove("d-none");
    label.textContent = "Edit Akun";

    var idEl = document.getElementById("akunId");
    var namaEl = document.getElementById("akunNama");
    var emailEl = document.getElementById("akunEmail");
    var roleEl = document.getElementById("akunRole");
    var ormawaEl = document.getElementById("akunOrmawa");
    var aktifEl = document.getElementById("akunAktif");
    var pwField = document.getElementById("passwordField");
    var pwInput = document.getElementById("akunPassword");

    if (idEl) idEl.value = user.id;
    if (namaEl) namaEl.value = user.nama || "";
    if (emailEl) emailEl.value = user.email || "";
    if (roleEl) roleEl.value = user.role || "";
    if (ormawaEl) ormawaEl.value = user.ormawa_id || "";
    if (aktifEl) aktifEl.checked = user.aktif;

    if (pwField) pwField.classList.add("d-none");
    if (pwInput) {
      pwInput.removeAttribute("required");
      pwInput.value = "";
    }

    updateRoleFields();
    clearInvalid();

    var modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  /* ============================================
     Update visibility field ormawa berdasarkan role
     ============================================ */
  function updateRoleFields() {
    var roleEl = document.getElementById("akunRole");
    var ormawaField = document.getElementById("ormawaField");
    var akunOrmawa = document.getElementById("akunOrmawa");
    var ormawaHint = document.getElementById("ormawaHint");
    if (!roleEl || !ormawaField || !akunOrmawa) return;

    if (roleEl.value === "ketua_pengurus") {
      ormawaField.classList.remove("d-none");
      akunOrmawa.setAttribute("required", "required");
      if (ormawaHint) ormawaHint.textContent = "Wajib dipilih untuk role Ketua/Pengurus.";
    } else {
      ormawaField.classList.add("d-none");
      akunOrmawa.removeAttribute("required");
      akunOrmawa.value = "";
    }
  }

  function clearInvalid() {
    document.querySelectorAll("#akunForm .is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  /* ============================================
     Form submit (Edit Akun)
     ============================================ */
  function setupAkunForm() {
    var form = document.getElementById("akunForm");
    if (!form) return;

    var roleSelect = document.getElementById("akunRole");
    var togglePw = document.getElementById("togglePw");
    var pwIcon = document.getElementById("togglePwIcon");
    var pwInput = document.getElementById("akunPassword");

    if (roleSelect) {
      // hindari listener dobel: kloning? Tidak—cukup set onchange
      roleSelect.onchange = updateRoleFields;
    }

    if (togglePw && pwInput) {
      togglePw.onclick = function () {
        var isPw = pwInput.type === "password";
        pwInput.type = isPw ? "text" : "password";
        if (pwIcon) pwIcon.className = isPw ? "bi bi-eye-slash" : "bi bi-eye";
      };
    }

    form.onsubmit = function (e) {
      e.preventDefault();
      clearInvalid();

      var id = document.getElementById("akunId").value;
      var nama = document.getElementById("akunNama").value.trim();
      var role = document.getElementById("akunRole").value;
      var ormawaId = document.getElementById("akunOrmawa").value;
      var aktif = document.getElementById("akunAktif").checked;

      var ok = true;

      if (nama.length < 3) {
        document.getElementById("akunNama").classList.add("is-invalid");
        ok = false;
      }
      if (!role) {
        document.getElementById("akunRole").classList.add("is-invalid");
        ok = false;
      }
      if (role === "ketua_pengurus" && !ormawaId) {
        document.getElementById("akunOrmawa").classList.add("is-invalid");
        ok = false;
      }
      if (!ok) return;

      var btn = document.getElementById("simpanAkunBtn");
      var spinner = document.getElementById("simpanSpinner");
      var icon = document.getElementById("simpanIcon");
      var text = document.getElementById("simpanText");

      if (btn) btn.disabled = true;
      if (spinner) spinner.classList.remove("d-none");
      if (icon) icon.classList.add("d-none");
      if (text) text.textContent = "Menyimpan...";

      var payload = {
        nama: nama,
        role: role,
        ormawa_id: role === "ketua_pengurus" ? parseInt(ormawaId, 10) : null,
        aktif: aktif,
      };

      sb
        .from("profiles")
        .update(payload)
        .eq("id", id)
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (spinner) spinner.classList.add("d-none");
          if (icon) icon.classList.remove("d-none");
          if (text) text.textContent = "Simpan";

          if (res.error) {
            console.error("[ProkerIn] Gagal update profil:", res.error);
            showAlert("Gagal menyimpan: " + res.error.message, "danger");
            return;
          }

          var user = semuaUser.find(function (u) { return String(u.id) === String(id); });
          if (user) {
            user.nama = nama;
            user.role = role;
            user.ormawa_id = payload.ormawa_id;
            user.aktif = aktif;
          }

          console.log("[ProkerIn] Profil diupdate:", id);
          showAlert("Akun " + nama + " berhasil diperbarui.", "success");

          var modalEl = document.getElementById("akunModal");
          var modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          refresh();
        });
    };
  }

  /* ============================================
     Modal konfirmasi
     ============================================ */
  function openConfirmModal(title, message, onOk) {
    document.getElementById("konfirmasiModalLabel").textContent = title;
    document.getElementById("konfirmasiPesan").textContent = message;
    var icon = document.getElementById("konfirmasiIcon");
    if (icon) icon.className = "konfirmasi-icon";

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
    var filterRole = document.getElementById("filterRole");
    var filterOrmawa = document.getElementById("filterOrmawa");
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

    if (filterRole) {
      filterRole.addEventListener("change", function () {
        state.role = filterRole.value;
        refresh();
      });
    }

    if (filterOrmawa) {
      filterOrmawa.addEventListener("change", function () {
        state.ormawa = filterOrmawa.value;
        refresh();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.search = "";
        state.role = "";
        state.ormawa = "";
        if (searchInput) searchInput.value = "";
        if (filterRole) filterRole.value = "";
        if (filterOrmawa) filterOrmawa.value = "";
        refresh();
      });
    }
  }

  /* ============================================
     Refresh
     ============================================ */
  function refresh() {
    renderTabel(getFiltered());
  }

  /* ============================================
     Fetch dari Supabase
     ============================================ */
  async function muatData() {
    var results = await Promise.all([
      sb.from("profiles").select("*").order("nama"),
      sb.from("ormawa").select("id, nama, jenis").order("nama"),
    ]);

    var profilRes = results[0];
    var ormawaRes = results[1];

    if (profilRes.error) {
      console.error("[ProkerIn] Gagal memuat profil:", profilRes.error);
      alert("Gagal memuat data akun.");
      return;
    }
    if (ormawaRes.error) {
      console.warn("[ProkerIn] Gagal memuat ormawa:", ormawaRes.error);
    }

    semuaUser = profilRes.data || [];
    semuaOrmawa = ormawaRes.data || [];

    ormawaMap = {};
    semuaOrmawa.forEach(function (o) {
      ormawaMap[o.id] = o;
    });
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", async function () {
    await ProkerIn.ready; // WAJIB

    await muatData();

    // Simpan HTML form asli SEBELUM modal apapun dibuka
    saveOriginalModalOnce();

    populateOrmawa();
    setupFilters();
    setupAkunForm();
    setupConfirmModal();

    var btnTambah = document.getElementById("btnTambahAkun");
    if (btnTambah) btnTambah.addEventListener("click", openAddInfoModal);

    refresh();
  });
})();