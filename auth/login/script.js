/* eslint-env browser */
/* global console, sb */

/* ============================================
   ProkerIn — Login Page Script (Supabase Auth)
   ============================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("inputEmail");
    const passwordInput = document.getElementById("inputPassword");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const togglePasswordIcon = document.getElementById("togglePasswordIcon");
    const alertBox = document.getElementById("loginAlert");
    const submitBtn = document.getElementById("submitBtn");
    const submitSpinner = document.getElementById("submitSpinner");
    const submitText = document.getElementById("submitText");

    if (!form) return;

    const redirectMap = {
      ketua_pengurus: "../../ormawa/dashboard/index.html",
      admin_kemahasiswaan: "../../admin/dashboard/index.html",
      super_admin: "../../superadmin/akun/index.html",
    };

    function showAlert(message, type) {
      type = type || "danger";
      alertBox.className = "alert alert-" + type;
      alertBox.textContent = message;
      alertBox.classList.remove("d-none");
      alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideAlert() {
      alertBox.classList.add("d-none");
      alertBox.textContent = "";
    }

    function setInvalid(input, isInvalid) {
      input.classList.toggle("is-invalid", isInvalid);
    }

    function setLoading(loading) {
      submitBtn.disabled = loading;
      submitSpinner.classList.toggle("d-none", !loading);
      submitText.textContent = loading ? "Memproses..." : "Masuk";
    }

    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
      });
    }

    function validateEmail() {
      const value = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const fb = document.getElementById("emailFeedback");

      if (value === "") {
        setInvalid(emailInput, true);
        fb.textContent = "Email tidak boleh kosong.";
        return false;
      }
      if (!emailRegex.test(value)) {
        setInvalid(emailInput, true);
        fb.textContent = "Format email tidak valid.";
        return false;
      }
      setInvalid(emailInput, false);
      return true;
    }

    function validatePassword() {
      const value = passwordInput.value;
      const fb = document.getElementById("passwordFeedback");

      if (value === "") {
        setInvalid(passwordInput, true);
        fb.textContent = "Password tidak boleh kosong.";
        return false;
      }
      if (value.length < 6) {
        setInvalid(passwordInput, true);
        fb.textContent = "Password minimal 6 karakter.";
        return false;
      }
      setInvalid(passwordInput, false);
      return true;
    }

    emailInput.addEventListener("blur", validateEmail);
    passwordInput.addEventListener("blur", validatePassword);
    emailInput.addEventListener("input", hideAlert);
    passwordInput.addEventListener("input", hideAlert);

    /* Jika sudah punya sesi valid, langsung arahkan ke dashboard */
    (async function autoRedirect() {
      if (!window.sb) return;
      const { data } = await sb.auth.getSession();
      if (!data.session) return;
      const { data: prof } = await sb
        .from("profiles")
        .select("role, aktif")
        .eq("id", data.session.user.id)
        .single();
      if (prof && prof.aktif && redirectMap[prof.role]) {
        window.location.replace(redirectMap[prof.role]);
      }
    })();

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      hideAlert();

      if (!validateEmail() | !validatePassword()) {
        showAlert("Mohon perbaiki data yang belum sesuai.", "danger");
        return;
      }

      if (!window.sb) {
        showAlert("Koneksi ke server belum siap. Muat ulang halaman.", "danger");
        return;
      }

      setLoading(true);

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      // 1) Login ke Supabase Auth
      const { data, error } = await sb.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        console.warn("[ProkerIn] Login gagal:", error && error.message);
        setLoading(false);
        showAlert("Email atau password salah.", "danger");
        passwordInput.value = "";
        passwordInput.focus();
        return;
      }

      // 2) Ambil profil (role, ormawa, status aktif)
      const { data: profile, error: profErr } = await sb
        .from("profiles")
        .select("nama, role, ormawa_id, aktif")
        .eq("id", data.user.id)
        .single();

      if (profErr || !profile) {
        console.warn("[ProkerIn] Profil tidak ditemukan:", profErr);
        await sb.auth.signOut();
        setLoading(false);
        showAlert("Akun belum terdaftar di sistem. Hubungi Admin Kemahasiswaan.", "warning");
        return;
      }

      // 3) Cek akun nonaktif
      if (!profile.aktif) {
        await sb.auth.signOut();
        setLoading(false);
        showAlert("Akun Anda dinonaktifkan. Hubungi Admin Kemahasiswaan.", "warning");
        passwordInput.value = "";
        return;
      }

      // 4) Berhasil
      const target = redirectMap[profile.role];
      if (!target) {
        await sb.auth.signOut();
        setLoading(false);
        showAlert("Role akun tidak dikenali.", "danger");
        return;
      }

      setLoading(false);
      showAlert(
        "Login berhasil! Mengarahkan ke dashboard " + profile.role.replace(/_/g, " ") + "...",
        "success"
      );
      setTimeout(function () {
        window.location.href = target;
      }, 700);
    });
  });
})();