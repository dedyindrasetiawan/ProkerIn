/* eslint-env browser */
/* global console, bootstrap, ProkerIn */

/* ============================================
   ProkerIn — Proker Baru Script
   Validasi form + format input + simulasi submit
   ============================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("prokerForm");
    const alertBox = document.getElementById("formAlert");

    // Field
    const namaInput = document.getElementById("namaProker");
    const tujuanInput = document.getElementById("tujuanProker");
    const tanggalMulai = document.getElementById("tanggalMulai");
    const tanggalSelesai = document.getElementById("tanggalSelesai");
    const anggaranInput = document.getElementById("anggaran");
    const anggaranWrapper = document.getElementById("anggaranWrapper");
    const anggaranPreview = document.getElementById("anggaranPreview");
    const pjNamaInput = document.getElementById("pjNama");

    const kategoriRadios = document.querySelectorAll(
      'input[name="kategori"]'
    );

    // Submit
    const submitBtn = document.getElementById("submitBtn");
    const submitSpinner = document.getElementById("submitSpinner");
    const submitText = document.getElementById("submitText");
    const submitIcon = document.getElementById("submitIcon");
    const resetBtn = document.getElementById("resetBtn");

    if (!form) return;

    /* ============================================
       Alert helper
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

    function setInvalid(input, isInvalid) {
      if (!input) return;
      if (isInvalid) input.classList.add("is-invalid");
      else input.classList.remove("is-invalid");
    }

    /* ============================================
       Character counter
       ============================================ */
    function bindCounter(input, counterId) {
      const counter = document.getElementById(counterId);
      if (!input || !counter) return;
      const update = function () {
        counter.textContent = input.value.length;
      };
      input.addEventListener("input", update);
      update();
    }
    bindCounter(namaInput, "namaProkerCount");
    bindCounter(tujuanInput, "tujuanProkerCount");

    /* ============================================
       Format input anggaran
       ============================================ */
    function parseAngka(str) {
      return parseInt(String(str).replace(/\D/g, ""), 10) || 0;
    }

    function formatRibuan(angka) {
      if (!angka) return "";
      return angka.toLocaleString("id-ID");
    }

    if (anggaranInput) {
      anggaranInput.addEventListener("input", function () {
        const angka = parseAngka(anggaranInput.value);
        anggaranInput.value = formatRibuan(angka);
        updateAnggaranPreview(angka);
      });

      anggaranInput.addEventListener("blur", function () {
        const angka = parseAngka(anggaranInput.value);
        if (!angka) {
          anggaranInput.value = "";
          updateAnggaranPreview(0);
          return;
        }
        anggaranInput.value = formatRibuan(angka);
        updateAnggaranPreview(angka);
      });
    }

    function updateAnggaranPreview(angka) {
      if (!anggaranPreview) return;
      anggaranPreview.innerHTML =
        "Terbilang: <em>" + terbilangRupiah(angka) + "</em>";
    }

    /* Terbilang rupiah sederhana (maks. miliar) */
    function terbilangRupiah(n) {
      if (!n || n === 0) return "nol rupiah";
      const satuan = [
        "", "satu", "dua", "tiga", "empat", "lima",
        "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas",
      ];

      function toWords(x) {
        x = Math.floor(x);
        if (x < 12) return satuan[x];
        if (x < 20) return toWords(x - 10) + " belas";
        if (x < 100)
          return toWords(Math.floor(x / 10)) + " puluh " + toWords(x % 10);
        if (x < 200) return "seratus " + toWords(x - 100);
        if (x < 1000)
          return toWords(Math.floor(x / 100)) + " ratus " + toWords(x % 100);
        if (x < 2000) return "seribu " + toWords(x - 1000);
        if (x < 1000000)
          return toWords(Math.floor(x / 1000)) + " ribu " + toWords(x % 1000);
        if (x < 1000000000)
          return (
            toWords(Math.floor(x / 1000000)) +
            " juta " +
            toWords(x % 1000000)
          );
        return (
          toWords(Math.floor(x / 1000000000)) +
          " miliar " +
          toWords(x % 1000000000)
        );
      }

      return toWords(n).replace(/\s+/g, " ").trim() + " rupiah";
    }

    /* ============================================
       Toggle kategori → aktif/nonaktif anggaran
       ============================================ */
    function updateAnggaranState() {
      const checked = document.querySelector(
        'input[name="kategori"]:checked'
      );
      const isNonPendanaan = checked && checked.value === "non_pendanaan";

      if (isNonPendanaan) {
        anggaranInput.value = "0";
        anggaranInput.setAttribute("disabled", "disabled");
        anggaranInput.removeAttribute("required");
        updateAnggaranPreview(0);
        if (anggaranWrapper) anggaranWrapper.style.opacity = "0.6";
      } else {
        anggaranInput.removeAttribute("disabled");
        anggaranInput.setAttribute("required", "required");
        if (anggaranWrapper) anggaranWrapper.style.opacity = "1";
        if (!anggaranInput.value || anggaranInput.value === "0") {
          anggaranInput.value = "";
          updateAnggaranPreview(0);
        }
      }
    }

    kategoriRadios.forEach(function (radio) {
      radio.addEventListener("change", updateAnggaranState);
    });
    // Set state awal
    updateAnggaranState();

    /* ============================================
       Validasi per-field
       ============================================ */
    function validateNama() {
      const v = namaInput.value.trim();
      const ok = v.length >= 5;
      setInvalid(namaInput, !ok);
      return ok;
    }

    function validateTujuan() {
      const v = tujuanInput.value.trim();
      const ok = v.length >= 20;
      setInvalid(tujuanInput, !ok);
      return ok;
    }

    function validateTanggalMulai() {
      const ok = !!tanggalMulai.value;
      setInvalid(tanggalMulai, !ok);
      return ok;
    }

    function validateTanggalSelesai() {
      if (!tanggalSelesai.value) {
        setInvalid(tanggalSelesai, true);
        document.getElementById("tanggalSelesaiFeedback").textContent =
          "Tanggal selesai wajib diisi.";
        return false;
      }
      if (
        tanggalMulai.value &&
        new Date(tanggalSelesai.value) < new Date(tanggalMulai.value)
      ) {
        setInvalid(tanggalSelesai, true);
        document.getElementById("tanggalSelesaiFeedback").textContent =
          "Tanggal selesai tidak boleh sebelum tanggal mulai.";
        return false;
      }
      setInvalid(tanggalSelesai, false);
      return true;
    }

    function validateAnggaran() {
      const checked = document.querySelector(
        'input[name="kategori"]:checked'
      );
      if (checked && checked.value === "non_pendanaan") {
        setInvalid(anggaranInput, false);
        return true;
      }
      const angka = parseAngka(anggaranInput.value);
      const ok = angka >= 100000;
      setInvalid(anggaranInput, !ok);
      return ok;
    }

    function validatePjNama() {
      const v = pjNamaInput.value.trim();
      const ok = v.length >= 3;
      setInvalid(pjNamaInput, !ok);
      return ok;
    }

    // Validasi real-time pada blur
    namaInput.addEventListener("blur", validateNama);
    tujuanInput.addEventListener("blur", validateTujuan);
    tanggalMulai.addEventListener("blur", validateTanggalMulai);
    tanggalSelesai.addEventListener("blur", validateTanggalSelesai);
    anggaranInput.addEventListener("blur", validateAnggaran);
    pjNamaInput.addEventListener("blur", validatePjNama);

    // Sembunyikan alert saat user mengetik
    form.addEventListener("input", hideAlert);

    /* ============================================
       Submit form
       ============================================ */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideAlert();

      const checks = [
        validateNama(),
        validateTujuan(),
        validateTanggalMulai(),
        validateTanggalSelesai(),
        validateAnggaran(),
        validatePjNama(),
      ];

      if (checks.indexOf(false) !== -1) {
        showAlert(
          "Mohon periksa kembali data yang belum sesuai.",
          "danger"
        );
        // Fokus ke field invalid pertama
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Kumpulkan data
      const kategoriEl = document.querySelector(
        'input[name="kategori"]:checked'
      );
      const data = {
        nama: namaInput.value.trim(),
        tujuan: tujuanInput.value.trim(),
        kategori: kategoriEl ? kategoriEl.value : "pendanaan",
        jadwal_mulai: tanggalMulai.value,
        jadwal_selesai: tanggalSelesai.value,
        anggaran:
          kategoriEl && kategoriEl.value === "non_pendanaan"
            ? 0
            : parseAngka(anggaranInput.value),
        pj_nama: pjNamaInput.value.trim(),
        pj_jabatan: document.getElementById("pjJabatan").value.trim(),
      };

      // Simulasi loading
      submitBtn.disabled = true;
      submitSpinner.classList.remove("d-none");
      if (submitIcon) submitIcon.classList.add("d-none");
      submitText.textContent = "Mengirim...";

      // Simulasi request (delay 1.2 detik)
      setTimeout(function () {
        submitBtn.disabled = false;
        submitSpinner.classList.add("d-none");
        if (submitIcon) submitIcon.classList.remove("d-none");
        submitText.textContent = "Ajukan Proker";

        console.log("[ProkerIn] Proker baru diajukan:", data);

        // Tampilkan modal sukses
        const modalEl = document.getElementById("suksesModal");
        if (modalEl && window.bootstrap) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();

          // Reset form saat modal ditutup (kecuali tombol "Ke Dashboard")
          modalEl.addEventListener(
            "hidden.bs.modal",
            function () {
              form.reset();
              updateAnggaranState();
              updateAnggaranPreview(0);
              bindCounter(namaInput, "namaProkerCount");
              bindCounter(tujuanInput, "tujuanProkerCount");
            },
            { once: true }
          );
        } else {
          showAlert("Pengajuan berhasil dikirim!", "success");
        }
      }, 1200);
    });

    /* ============================================
       Reset form
       ============================================ */
    if (resetBtn) {
      resetBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (!confirm("Bersihkan semua isi form?")) return;
        form.reset();
        hideAlert();
        form.querySelectorAll(".is-invalid").forEach(function (el) {
          el.classList.remove("is-invalid");
        });
        updateAnggaranState();
        updateAnggaranPreview(0);
        bindCounter(namaInput, "namaProkerCount");
        bindCounter(tujuanInput, "tujuanProkerCount");
      });
    }
  });
})();