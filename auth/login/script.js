/* eslint-env browser */
/* global console, sessionStorage */

/* ============================================
   ProkerIn — Login Page Script
   Validasi form client-side & simulasi submit
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

    /* ============================================
       Daftar akun (harus sinkron dengan
       superadmin/akun/script.js)
       ============================================ */
    const dummyUsers = {
      // === Admin & Super Admin ===
      "admin@prokerin.test": {
        nama: "Dewi Anggraini",
        role: "admin_kemahasiswaan",
        ormawa_id: null,
      },
      "super@prokerin.test": {
        nama: "Rizky Pratama",
        role: "super_admin",
        ormawa_id: null,
      },

      // === Ketua/Pengurus Ormawa ===
      "ketua@prokerin.test": {
        nama: "Ahmad Fauzi",
        role: "ketua_pengurus",
        ormawa_id: 5,
      },
      "siti@hmp-pti.test": {
        nama: "Siti Nurhaliza",
        role: "ketua_pengurus",
        ormawa_id: 5,
      },
      "rani@hmp-pbsi.test": {
        nama: "Rani Puspita",
        role: "ketua_pengurus",
        ormawa_id: 2,
      },
      "yoga@hmp-ppkn.test": {
        nama: "Yoga Pratama",
        role: "ketua_pengurus",
        ormawa_id: 3,
      },
      "maya@hmp-ekonomi.test": {
        nama: "Maya Sari",
        role: "ketua_pengurus",
        ormawa_id: 4,
      },
      "hendra@hmp-mat.test": {
        nama: "Hendra Wijaya",
        role: "ketua_pengurus",
        ormawa_id: 6,
      },
      "bayu@taekwondo.test": {
        nama: "Bayu Setiawan",
        role: "ketua_pengurus",
        ormawa_id: 7,
      },
      "citra@ksr.test": {
        nama: "Citra Lestari",
        role: "ketua_pengurus",
        ormawa_id: 9,
      },
      "fajar@pramuka.test": {
        nama: "Fajar Nugroho",
        role: "ketua_pengurus",
        ormawa_id: 10,
      },
      "aulia@ukki.test": {
        nama: "Aulia Rahman",
        role: "ketua_pengurus",
        ormawa_id: 11,
      },
      "lala@kesenian.test": {
        nama: "Lala Karmela",
        role: "ketua_pengurus",
        ormawa_id: 13,
      },
      "rizal@multimedia.test": {
        nama: "Rizal Aditya",
        role: "ketua_pengurus",
        ormawa_id: 15,
        // Akun ini dinonaktifkan di superadmin/akun
        nonaktif: true,
      },
      "melody@safmusik.test": {
        nama: "Melody Anjani",
        role: "ketua_pengurus",
        ormawa_id: 16,
      },
    };

    // Password default untuk semua akun
    const DEFAULT_PASSWORD = "123456";

    /* ============================================
       Helper: tampilkan alert
       ============================================ */
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

    /* ============================================
       Helper: set valid / invalid state
       ============================================ */
    function setInvalid(input, isInvalid) {
      if (isInvalid) {
        input.classList.add("is-invalid");
      } else {
        input.classList.remove("is-invalid");
      }
    }

    /* ============================================
       Toggle visibilitas password
       ============================================ */
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordIcon.className = isPassword
          ? "bi bi-eye-slash"
          : "bi bi-eye";
      });
    }

    /* ============================================
       Validasi field
       ============================================ */
    function validateEmail() {
      const value = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (value === "") {
        setInvalid(emailInput, true);
        document.getElementById("emailFeedback").textContent =
          "Email tidak boleh kosong.";
        return false;
      }
      if (!emailRegex.test(value)) {
        setInvalid(emailInput, true);
        document.getElementById("emailFeedback").textContent =
          "Format email tidak valid.";
        return false;
      }
      setInvalid(emailInput, false);
      return true;
    }

    function validatePassword() {
      const value = passwordInput.value;
      if (value === "") {
        setInvalid(passwordInput, true);
        document.getElementById("passwordFeedback").textContent =
          "Password tidak boleh kosong.";
        return false;
      }
      if (value.length < 6) {
        setInvalid(passwordInput, true);
        document.getElementById("passwordFeedback").textContent =
          "Password minimal 6 karakter.";
        return false;
      }
      setInvalid(passwordInput, false);
      return true;
    }

    /* ============================================
       Event: validasi real-time saat blur
       ============================================ */
    emailInput.addEventListener("blur", validateEmail);
    passwordInput.addEventListener("blur", validatePassword);

    emailInput.addEventListener("input", hideAlert);
    passwordInput.addEventListener("input", hideAlert);

    /* ============================================
       Event: submit form
       ============================================ */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideAlert();

      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();

      if (!isEmailValid || !isPasswordValid) {
        showAlert("Mohon perbaiki data yang belum sesuai.", "danger");
        return;
      }

      // Simulasi loading
      submitBtn.disabled = true;
      submitSpinner.classList.remove("d-none");
      submitText.textContent = "Memproses...";

      const data = {
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value,
      };

      // Simulasi request ke backend (delay 1.2 detik)
      setTimeout(function () {
        const user = dummyUsers[data.email];
        const isPasswordCorrect = data.password === DEFAULT_PASSWORD;

        submitBtn.disabled = false;
        submitSpinner.classList.add("d-none");
        submitText.textContent = "Masuk";

        // === 1) Cek email terdaftar & password benar ===
        if (!user || !isPasswordCorrect) {
          console.log("[ProkerIn] Login GAGAL:", data);
          showAlert("Email atau password salah.", "danger");
          passwordInput.value = "";
          passwordInput.focus();
          return;
        }

        // === 2) Cek akun nonaktif ===
        if (user.nonaktif) {
          console.log("[ProkerIn] Login DITOLAK (akun nonaktif):", data);
          showAlert(
            "Akun Anda dinonaktifkan. Hubungi Admin Kemahasiswaan.",
            "warning"
          );
          passwordInput.value = "";
          passwordInput.focus();
          return;
        }

        // === 3) Login berhasil ===
        console.log("[ProkerIn] Login BERHASIL:", {
          email: data.email,
          nama: user.nama,
          role: user.role,
          ormawa_id: user.ormawa_id,
        });

        showAlert(
          "Login berhasil! Mengarahkan ke dashboard " +
            user.role.replace(/_/g, " ") +
            "...",
          "success"
        );

        // Simpan sesi
        try {
          sessionStorage.setItem(
            "prokerin_user",
            JSON.stringify({
              email: data.email,
              nama: user.nama,
              role: user.role,
              ormawa_id: user.ormawa_id,
              login_at: new Date().toISOString(),
            })
          );
        } catch (err) {
          console.warn("[ProkerIn] sessionStorage tidak tersedia:", err);
        }

        // Redirect berdasarkan role
        const redirectMap = {
          ketua_pengurus: "../../ormawa/dashboard/index.html",
          admin_kemahasiswaan: "../../admin/dashboard/index.html",
          super_admin: "../../superadmin/akun/index.html",
        };
        const target = redirectMap[user.role] || "../../auth/login/index.html";

        // Delay singkat biar alert "Login berhasil" sempat terbaca
        setTimeout(function () {
          window.location.href = target;
        }, 700);
      }, 1200);
    });
  });
})();