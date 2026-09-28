/* eslint-env browser */
/* global console, bootstrap */

/* ============================================
   ProkerIn — Super Admin Akun Script
   CRUD akun: tabel, filter, tambah, edit,
   aktif/nonaktif, reset password
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy
     ============================================ */
  const dummyOrmawa = [
    { id: 1, nama: "HMP UEC" },
    { id: 2, nama: "HMP PBSI" },
    { id: 3, nama: "HMP PPKN" },
    { id: 4, nama: "HMP Ekonomi" },
    { id: 5, nama: "HMP PTI" },
    { id: 6, nama: "HMP Matematika" },
    { id: 7, nama: "UKM Taekwondo" },
    { id: 8, nama: "UKM LPM Sinergi dan Kepenyiaran" },
    { id: 9, nama: "UKM KSR" },
    { id: 10, nama: "UKM Pramuka dan Pecinta Alam" },
    { id: 11, nama: "UKM UKKI" },
    { id: 12, nama: "UKM PR" },
    { id: 13, nama: "UKM Kesenian" },
    { id: 14, nama: "UKM KOMI" },
    { id: 15, nama: "UKM Multimedia" },
    { id: 16, nama: "UKM SAF Musik" },
  ];

  let dummyUsers = [
    { id: 1, nama: "Dewi Anggraini", email: "admin@prokerin.test",
      role: "admin_kemahasiswaan", ormawa_id: null, aktif: true,
      last_login: "2025-10-26T08:15:00" },
    { id: 2, nama: "Rizky Pratama", email: "super@prokerin.test",
      role: "super_admin", ormawa_id: null, aktif: true,
      last_login: "2025-10-26T07:30:00" },
    { id: 3, nama: "Ahmad Fauzi", email: "ketua@prokerin.test",
      role: "ketua_pengurus", ormawa_id: 5, aktif: true,
      last_login: "2025-10-25T20:10:00" },
    { id: 4, nama: "Siti Nurhaliza", email: "siti@hmp-pti.test",
      role: "ketua_pengurus", ormawa_id: 5, aktif: true,
      last_login: "2025-10-24T15:45:00" },
    { id: 5, nama: "Rani Puspita", email: "rani@hmp-pbsi.test",
      role: "ketua_pengurus", ormawa_id: 2, aktif: true,
      last_login: "2025-10-23T11:20:00" },
    { id: 6, nama: "Yoga Pratama", email: "yoga@hmp-ppkn.test",
      role: "ketua_pengurus", ormawa_id: 3, aktif: true,
      last_login: "2025-10-22T09:00:00" },
    { id: 7, nama: "Maya Sari", email: "maya@hmp-ekonomi.test",
      role: "ketua_pengurus", ormawa_id: 4, aktif: true,
      last_login: "2025-10-21T13:50:00" },
    { id: 8, nama: "Hendra Wijaya", email: "hendra@hmp-mat.test",
      role: "ketua_pengurus", ormawa_id: 6, aktif: true,
      last_login: "2025-10-20T10:30:00" },
    { id: 9, nama: "Bayu Setiawan", email: "bayu@taekwondo.test",
      role: "ketua_pengurus", ormawa_id: 7, aktif: true,
      last_login: "2025-10-19T14:00:00" },
    { id: 10, nama: "Citra Lestari", email: "citra@ksr.test",
      role: "ketua_pengurus", ormawa_id: 9, aktif: true,
      last_login: "2025-10-18T09:45:00" },
    { id: 11, nama: "Fajar Nugroho", email: "fajar@pramuka.test",
      role: "ketua_pengurus", ormawa_id: 10, aktif: true,
      last_login: "2025-10-17T16:20:00" },
    { id: 12, nama: "Aulia Rahman", email: "aulia@ukki.test",
      role: "ketua_pengurus", ormawa_id: 11, aktif: true,
      last_login: "2025-10-16T07:10:00" },
    { id: 13, nama: "Lala Karmela", email: "lala@kesenian.test",
      role: "ketua_pengurus", ormawa_id: 13, aktif: true,
      last_login: "2025-10-15T19:30:00" },
    { id: 14, nama: "Rizal Aditya", email: "rizal@multimedia.test",
      role: "ketua_pengurus", ormawa_id: 15, aktif: false,
      last_login: "2025-09-30T12:00:00" },
    { id: 15, nama: "Melody Anjani", email: "melody@safmusik.test",
      role: "ketua_pengurus", ormawa_id: 16, aktif: true,
      last_login: "2025-10-14T17:25:00" },
  ];

  /* ============================================
     Mapping role
     ============================================ */
  const roleLabel = {
    ketua_pengurus: "Ketua/Pengurus",
    admin_kemahasiswaan: "Admin Kemahasiswaan",
    super_admin: "Super Admin",
  };
  const roleBadgeClass = {
    ketua_pengurus: "role-badge--ketua",
    admin_kemahasiswaan: "role-badge--admin",
    super_admin: "role-badge--super",
  };
  const roleIcon = {
    ketua_pengurus: "bi-people",
    admin_kemahasiswaan: "bi-shield-check",
    super_admin: "bi-key",
  };

  /* ============================================
     State
     ============================================ */
  const state = {
    search: "",
    role: "",
    ormawa: "",
    editMode: false,
    confirmTarget: null,
    confirmAction: null,
  };

  /* ============================================
     Helper
     ============================================ */
  let nextId = 100;

  function getOrmawaById(id) {
    return dummyOrmawa.find(function (o) { return o.id === id; }) || null;
  }

  function getInitials(nama) {
    if (!nama) return "?";
    const parts = nama.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDatetime(dateStr) {
    if (!dateStr) return "Belum pernah";
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
    setTimeout(function () { el.classList.add("d-none"); }, 4000);
  }

  /* ============================================
     Populate dropdown ormawa
     ============================================ */
  function populateOrmawa() {
    const selFilter = document.getElementById("filterOrmawa");
    const selForm = document.getElementById("akunOrmawa");

    dummyOrmawa.forEach(function (o) {
      if (selFilter) {
        const opt = document.createElement("option");
        opt.value = String(o.id);
        opt.textContent = o.nama;
        selFilter.appendChild(opt);
      }
      if (selForm) {
        const opt = document.createElement("option");
        opt.value = String(o.id);
        opt.textContent = o.nama;
        selForm.appendChild(opt);
      }
    });
  }

  /* ============================================
     Filter
     ============================================ */
  function getFiltered() {
    const q = state.search.toLowerCase();
    return dummyUsers.filter(function (u) {
      if (state.role && u.role !== state.role) return false;
      if (state.ormawa && String(u.ormawa_id) !== state.ormawa) return false;
      if (q) {
        const hay = (u.nama + " " + u.email).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* ============================================
     Render tabel
     ============================================ */
  function renderTabel(data) {
    const tbody = document.getElementById("userTableBody");
    const emptyState = document.getElementById("emptyState");
    const totalCount = document.getElementById("totalCount");
    if (!tbody) return;

    if (totalCount) totalCount.textContent = data.length + " akun";
    tbody.innerHTML = "";

    if (!data.length) {
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");

    data.forEach(function (u) {
      const ormawa = u.ormawa_id ? getOrmawaById(u.ormawa_id) : null;
      const tr = document.createElement("tr");
      if (!u.aktif) tr.classList.add("inactive");

      const roleClass = roleBadgeClass[u.role] || "";
      const roleIc = roleIcon[u.role] || "bi-person";

      const ormawaCell = ormawa
        ? '<span class="user-table__ormawa">' + escapeHtml(ormawa.nama) + "</span>"
        : '<span class="user-table__ormawa-empty">\u2014</span>';

      const statusCell = u.aktif
        ? '<span class="status-badge status-badge--aktif">' +
            '<i class="bi bi-check-circle-fill"></i>Aktif</span>'
        : '<span class="status-badge status-badge--nonaktif">' +
            '<i class="bi bi-slash-circle"></i>Nonaktif</span>';

      tr.innerHTML =
        "<td>" +
          '<div class="user-cell">' +
            '<div class="user-cell__avatar">' + escapeHtml(getInitials(u.nama)) + "</div>" +
            '<div class="user-cell__info">' +
              '<span class="user-cell__name">' + escapeHtml(u.nama) + "</span>" +
              '<span class="user-cell__email">' + escapeHtml(u.email) + "</span>" +
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
              'aria-label="Aksi untuk ' + escapeHtml(u.nama) + '">' +
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

    // Attach event untuk dropdown actions
    tbody.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const aksi = btn.getAttribute("data-action");
        const id = parseInt(btn.getAttribute("data-id"), 10);
        handleAction(aksi, id);
      });
    });
  }

  /* ============================================
     Handle action dari dropdown
     ============================================ */
  function handleAction(aksi, id) {
    const user = dummyUsers.find(function (u) { return u.id === id; });
    if (!user) return;

    if (aksi === "edit") {
      openEditModal(user);
    } else if (aksi === "reset-pw") {
      if (confirm("Reset password untuk " + user.nama + "?\nPassword baru akan dibuat secara otomatis.")) {
        const pwBaru = "prokerin" + Math.floor(1000 + Math.random() * 9000);
        console.log("[ProkerIn] Reset password:", { user_id: id, pw_baru: pwBaru });
        showAlert(
          "Password baru untuk " + user.nama + ": " + pwBaru +
          " (catat & sampaikan ke pengguna)",
          "info"
        );
      }
    } else if (aksi === "nonaktif") {
      openConfirmModal(
        "Nonaktifkan Akun?",
        "Akun " + user.nama + " tidak akan bisa login sampai diaktifkan kembali.",
        function () {
          user.aktif = false;
          showAlert("Akun " + user.nama + " dinonaktifkan.", "warning");
          console.log("[ProkerIn] Akun dinonaktifkan:", id);
          refresh();
        }
      );
    } else if (aksi === "aktifkan") {
      user.aktif = true;
      showAlert("Akun " + user.nama + " diaktifkan kembali.", "success");
      console.log("[ProkerIn] Akun diaktifkan:", id);
      refresh();
    }
  }

  /* ============================================
     Modal Akun (Tambah/Edit)
     ============================================ */
  function openAddModal() {
    state.editMode = false;
    document.getElementById("akunModalLabel").textContent = "Tambah Akun";
    document.getElementById("akunForm").reset();
    document.getElementById("akunId").value = "";
    document.getElementById("akunAktif").checked = true;
    document.getElementById("passwordField").classList.remove("d-none");
    document.getElementById("akunPassword").setAttribute("required", "required");
    updateRoleFields();
    clearInvalid();

    const modal = new bootstrap.Modal(document.getElementById("akunModal"));
    modal.show();
  }

  function openEditModal(user) {
    state.editMode = true;
    document.getElementById("akunModalLabel").textContent = "Edit Akun";
    document.getElementById("akunId").value = user.id;
    document.getElementById("akunNama").value = user.nama;
    document.getElementById("akunEmail").value = user.email;
    document.getElementById("akunRole").value = user.role;
    document.getElementById("akunOrmawa").value = user.ormawa_id || "";
    document.getElementById("akunAktif").checked = user.aktif;
    document.getElementById("akunPassword").value = "";
    document.getElementById("passwordField").classList.add("d-none");
    document.getElementById("akunPassword").removeAttribute("required");
    updateRoleFields();
    clearInvalid();

    const modal = new bootstrap.Modal(document.getElementById("akunModal"));
    modal.show();
  }

  function updateRoleFields() {
    const role = document.getElementById("akunRole").value;
    const ormawaField = document.getElementById("ormawaField");
    const akunOrmawa = document.getElementById("akunOrmawa");
    const ormawaHint = document.getElementById("ormawaHint");

    if (role === "ketua_pengurus") {
      ormawaField.classList.remove("d-none");
      akunOrmawa.setAttribute("required", "required");
      ormawaHint.textContent = "Wajib dipilih untuk role Ketua/Pengurus.";
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

  function setupAkunForm() {
    const form = document.getElementById("akunForm");
    const roleSelect = document.getElementById("akunRole");
    const togglePw = document.getElementById("togglePw");
    const pwIcon = document.getElementById("togglePwIcon");
    const pwInput = document.getElementById("akunPassword");

    roleSelect.addEventListener("change", updateRoleFields);

    if (togglePw) {
      togglePw.addEventListener("click", function () {
        const isPw = pwInput.type === "password";
        pwInput.type = isPw ? "text" : "password";
        pwIcon.className = isPw ? "bi bi-eye-slash" : "bi bi-eye";
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearInvalid();

      const id = document.getElementById("akunId").value;
      const nama = document.getElementById("akunNama").value.trim();
      const email = document.getElementById("akunEmail").value.trim();
      const role = document.getElementById("akunRole").value;
      const ormawaId = document.getElementById("akunOrmawa").value;
      const aktif = document.getElementById("akunAktif").checked;
      const password = pwInput.value;

      // Validasi
      let ok = true;

      if (nama.length < 3) {
        document.getElementById("akunNama").classList.add("is-invalid");
        ok = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        document.getElementById("akunEmail").classList.add("is-invalid");
        document.getElementById("emailFeedback").textContent =
          "Format email tidak valid.";
        ok = false;
      } else {
        // Cek duplikat email (kecuali dirinya sendiri)
        const dup = dummyUsers.find(function (u) {
          return u.email.toLowerCase() === email.toLowerCase() &&
            String(u.id) !== String(id);
        });
        if (dup) {
          document.getElementById("akunEmail").classList.add("is-invalid");
          document.getElementById("emailFeedback").textContent =
            "Email sudah digunakan akun lain.";
          ok = false;
        }
      }

      if (!role) {
        document.getElementById("akunRole").classList.add("is-invalid");
        ok = false;
      }

      if (role === "ketua_pengurus" && !ormawaId) {
        document.getElementById("akunOrmawa").classList.add("is-invalid");
        ok = false;
      }

      if (!state.editMode && password.length < 6) {
        document.getElementById("akunPassword").classList.add("is-invalid");
        ok = false;
      }

      if (!ok) return;

      // Simulasi loading
      const btn = document.getElementById("simpanAkunBtn");
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
          // Update
          const user = dummyUsers.find(function (u) { return String(u.id) === String(id); });
          if (user) {
            user.nama = nama;
            user.email = email;
            user.role = role;
            user.ormawa_id = role === "ketua_pengurus" ? parseInt(ormawaId, 10) : null;
            user.aktif = aktif;
            console.log("[ProkerIn] Akun diupdate:", user);
            showAlert("Akun " + nama + " berhasil diperbarui.", "success");
          }
        } else {
          // Tambah baru
          const newUser = {
            id: nextId++,
            nama: nama,
            email: email,
            role: role,
            ormawa_id: role === "ketua_pengurus" ? parseInt(ormawaId, 10) : null,
            aktif: aktif,
            last_login: null,
          };
          dummyUsers.unshift(newUser);
          console.log("[ProkerIn] Akun baru ditambahkan:", newUser);
          showAlert("Akun " + nama + " berhasil ditambahkan.", "success");
        }

        const modalEl = document.getElementById("akunModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        refresh();
      }, 900);
    });
  }

  /* ============================================
     Modal konfirmasi
     ============================================ */
  function openConfirmModal(title, message, onOk) {
    document.getElementById("konfirmasiModalLabel").textContent = title;
    document.getElementById("konfirmasiPesan").textContent = message;
    const icon = document.getElementById("konfirmasiIcon");
    icon.className = "konfirmasi-icon";

    state.confirmAction = onOk;

    const modal = new bootstrap.Modal(document.getElementById("konfirmasiModal"));
    modal.show();
  }

  function setupConfirmModal() {
    const okBtn = document.getElementById("konfirmasiOkBtn");
    okBtn.addEventListener("click", function () {
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
    const filterRole = document.getElementById("filterRole");
    const filterOrmawa = document.getElementById("filterOrmawa");
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
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    populateOrmawa();
    setupFilters();
    setupAkunForm();
    setupConfirmModal();

    const btnTambah = document.getElementById("btnTambahAkun");
    if (btnTambah) {
      btnTambah.addEventListener("click", openAddModal);
    }

    refresh();
  });
})();