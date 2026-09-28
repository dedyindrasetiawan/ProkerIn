/* eslint-env browser */
/* global console */

/* ============================================
   ProkerIn — Admin Proker Detail Script
   Baca ?id= dari URL, tampilkan detail,
   aksi setujui/tolak/revisi, verifikasi LPJ
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Data dummy ormawa
     ============================================ */
  const dummyOrmawa = [
    { id: 1, nama: "HMP UEC", jenis: "hmp" },
    { id: 2, nama: "HMP PBSI", jenis: "hmp" },
    { id: 3, nama: "HMP PPKN", jenis: "hmp" },
    { id: 4, nama: "HMP Ekonomi", jenis: "hmp" },
    { id: 5, nama: "HMP PTI", jenis: "hmp" },
    { id: 6, nama: "HMP Matematika", jenis: "hmp" },
    { id: 7, nama: "UKM Taekwondo", jenis: "ukm" },
    { id: 8, nama: "UKM LPM Sinergi dan Kepenyiaran", jenis: "ukm" },
    { id: 9, nama: "UKM KSR", jenis: "ukm" },
    { id: 10, nama: "UKM Pramuka dan Pecinta Alam", jenis: "ukm" },
    { id: 11, nama: "UKM UKKI", jenis: "ukm" },
    { id: 12, nama: "UKM PR", jenis: "ukm" },
    { id: 13, nama: "UKM Kesenian", jenis: "ukm" },
    { id: 14, nama: "UKM KOMI", jenis: "ukm" },
    { id: 15, nama: "UKM Multimedia", jenis: "ukm" },
    { id: 16, nama: "UKM SAF Musik", jenis: "ukm" },
  ];

  /* ============================================
     Data dummy proker (sinkron dengan admin/dashboard)
     ============================================ */
  const dummyProker = [
    {
      id: 1, ormawa_id: 5,
      nama: "Pelatihan Public Speaking Anggota Baru",
      tujuan:
        "Meningkatkan kemampuan public speaking anggota baru HMP PTI agar mampu menyampaikan gagasan secara terstruktur dan percaya diri dalam forum akademik maupun organisasi.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-05", jadwal_selesai: "2025-11-07",
      anggaran: 2500000,
      pj_nama: "Ahmad Fauzi", pj_jabatan: "Ketua Divisi Pengembangan SDM",
      status_pengajuan: "disetujui", status_progress: "berjalan",
      diajukan_pada: "2025-10-15T09:30:00",
      lpj: null,
    },
    {
      id: 2, ormawa_id: 5,
      nama: "Seminar Nasional Teknologi Pendidikan",
      tujuan:
        "Menghadirkan pakar teknologi pendidikan untuk membahas tren pembelajaran digital dan memberikan wawasan kepada mahasiswa tentang peluang karier di bidang edtech.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-01", jadwal_selesai: "2025-12-01",
      anggaran: 7500000,
      pj_nama: "Siti Nurhaliza", pj_jabatan: "Sekretaris Umum",
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-20T14:15:00",
      lpj: null,
    },
    {
      id: 3, ormawa_id: 5,
      nama: "Bakti Sosial Desa Binaan",
      tujuan:
        "Mengimplementasikan nilai pengabdian masyarakat melalui kegiatan bakti sosial di desa binaan, sekaligus mempererat hubungan antara kampus dan masyarakat.",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-20", jadwal_selesai: "2025-10-21",
      anggaran: 0,
      pj_nama: "Budi Santoso", pj_jabatan: "Ketua Divisi Sosial Masyarakat",
      status_pengajuan: "disetujui", status_progress: "selesai",
      diajukan_pada: "2025-10-01T10:00:00",
      lpj: {
        nama: "LPJ-Baksos-Desa-Binaan.pdf",
        deskripsi:
          "Kegiatan bakti sosial berjalan lancar diikuti 45 anggota. Total 120 paket sembako tersalurkan, ditambah penyuluhan kesehatan bekerja sama dengan puskesmas setempat.",
        tanggal_upload: "2025-10-25T16:30:00",
        status_verifikasi: "menunggu",
      },
    },
    {
      id: 4, ormawa_id: 2,
      nama: "Festival Sastra Bulan Bahasa",
      tujuan:
        "Merayakan Bulan Bahasa dengan rangkaian lomba dan pentas sastra untuk menumbuhkan kecintaan mahasiswa terhadap bahasa dan sastra Indonesia.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-10-28", jadwal_selesai: "2025-10-30",
      anggaran: 4200000,
      pj_nama: "Rani Puspita", pj_jabatan: "Ketua Divisi Seni",
      status_pengajuan: "disetujui", status_progress: "berjalan",
      diajukan_pada: "2025-10-05T11:00:00",
      lpj: null,
    },
    {
      id: 5, ormawa_id: 2,
      nama: "Workshop Penulisan Puisi",
      tujuan:
        "Melatih anggota menulis puisi dengan teknik dasar dan apresiasi karya sastra.",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-11-12", jadwal_selesai: "2025-11-12",
      anggaran: 0,
      pj_nama: "Dian Sastro", pj_jabatan: "Anggota Divisi Seni",
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-22T08:45:00",
      lpj: null,
    },
    {
      id: 6, ormawa_id: 3,
      nama: "Seminar Kebangsaan dan Pancasila",
      tujuan:
        "Menumbuhkan kembali semangat kebangsaan dan pemahaman Pancasila di kalangan mahasiswa melalui seminar bersama tokoh nasional.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-18", jadwal_selesai: "2025-11-18",
      anggaran: 5500000,
      pj_nama: "Yoga Pratama", pj_jabatan: "Ketua Umum",
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-12T13:30:00",
      lpj: null,
    },
    {
      id: 7, ormawa_id: 4,
      nama: "Pelatihan Akuntansi Dasar",
      tujuan:
        "Membekali anggota dengan keterampilan akuntansi dasar untuk mendukung kompetensi akademik dan kesiapan dunia kerja.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-22", jadwal_selesai: "2025-11-23",
      anggaran: 3200000,
      pj_nama: "Maya Sari", pj_jabatan: "Sekretaris",
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-08T10:15:00",
      lpj: null,
    },
    {
      id: 8, ormawa_id: 6,
      nama: "Olimpiade Matematika Internal",
      tujuan:
        "Mengasah kemampuan analitis dan kompetitif mahasiswa di bidang matematika melalui olimpiade internal.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-05", jadwal_selesai: "2025-12-05",
      anggaran: 2800000,
      pj_nama: "Hendra Wijaya", pj_jabatan: "Ketua Divisi Akademik",
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-24T15:00:00",
      lpj: null,
    },
    {
      id: 9, ormawa_id: 7,
      nama: "Kejuaraan Taekwondo Antar Sabuk",
      tujuan:
        "Mengukur kemampuan anggota UKM Taekwondo melalui kejuaraan internal sekaligus menjaring atlet potensial untuk kompetisi tingkat regional.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-30", jadwal_selesai: "2025-12-01",
      anggaran: 6000000,
      pj_nama: "Bayu Setiawan", pj_jabatan: "Ketua Umum",
      status_pengajuan: "disetujui", status_progress: "berjalan",
      diajukan_pada: "2025-10-10T09:00:00",
      lpj: null,
    },
    {
      id: 10, ormawa_id: 9,
      nama: "Donor Darah Bersama PMI",
      tujuan:
        "Menyelenggarakan kegiatan donor darah bekerja sama dengan PMI untuk membantu kebutuhan darah di wilayah sekitar kampus.",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-10-15", jadwal_selesai: "2025-10-15",
      anggaran: 0,
      pj_nama: "Citra Lestari", pj_jabatan: "Ketua Divisi Sosial",
      status_pengajuan: "disetujui", status_progress: "selesai",
      diajukan_pada: "2025-09-28T14:00:00",
      lpj: {
        nama: "LPJ-Donor-Darah-2025.pdf",
        deskripsi:
          "Terkumpul 87 kantong darah dari mahasiswa dan dosen. Kegiatan berjalan tertib dengan protokol kesehatan yang ketat.",
        tanggal_upload: "2025-10-18T10:00:00",
        status_verifikasi: "terverifikasi",
      },
    },
    {
      id: 11, ormawa_id: 10,
      nama: "Kemah Bakti Pramuka",
      tujuan:
        "Melatih kemandirian, kepemimpinan, dan kepedulian lingkungan anggota melalui kegiatan kemah bakti di kawasan konservasi.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-20", jadwal_selesai: "2025-12-22",
      anggaran: 8000000,
      pj_nama: "Fajar Nugroho", pj_jabatan: "Ketua Umum",
      status_pengajuan: "diajukan", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-26T16:20:00",
      lpj: null,
    },
    {
      id: 12, ormawa_id: 11,
      nama: "Kajian Rutin Keislaman",
      tujuan:
        "Meningkatkan pemahaman keislaman anggota dan civitas akademika melalui kajian rutin bersama pemateri kompeten.",
      kategori: "non_pendanaan",
      jadwal_mulai: "2025-11-08", jadwal_selesai: "2025-11-08",
      anggaran: 0,
      pj_nama: "Aulia Rahman", pj_jabatan: "Ketua Divisi Dakwah",
      status_pengajuan: "disetujui", status_progress: "selesai",
      diajukan_pada: "2025-10-02T11:00:00",
      lpj: {
        nama: "LPJ-Kajian-Rutin-Nov.pdf",
        deskripsi:
          "Kajian dihadiri 60 peserta. Tema: Peran Pemuda dalam Membangun Peradaban. Berjalan lancar.",
        tanggal_upload: "2025-11-09T21:00:00",
        status_verifikasi: "terverifikasi",
      },
    },
    {
      id: 13, ormawa_id: 13,
      nama: "Pentas Seni Akhir Tahun",
      tujuan:
        "Menampilkan karya seni anggota sekaligus menjadi ajang apresiasi seni di lingkungan kampus.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-15", jadwal_selesai: "2025-12-15",
      anggaran: 9000000,
      pj_nama: "Lala Karmela", pj_jabatan: "Ketua Divisi Acara",
      status_pengajuan: "direvisi", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-16T10:30:00",
      lpj: null,
    },
    {
      id: 14, ormawa_id: 15,
      nama: "Workshop Videografi dan Editing",
      tujuan:
        "Meningkatkan keterampilan anggota dalam produksi video kreatif untuk kebutuhan publikasi ormawa.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-11-25", jadwal_selesai: "2025-11-26",
      anggaran: 3500000,
      pj_nama: "Rizal Aditya", pj_jabatan: "Ketua Divisi Media",
      status_pengajuan: "ditolak", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-14T09:00:00",
      lpj: null,
    },
    {
      id: 15, ormawa_id: 16,
      nama: "Konser Mini SAF Musik",
      tujuan:
        "Menggelar konser mini sebagai wadah ekspresi musisi kampus dan mempererat komunitas pecinta musik.",
      kategori: "pendanaan",
      jadwal_mulai: "2025-12-08", jadwal_selesai: "2025-12-08",
      anggaran: 4000000,
      pj_nama: "Melody Anjani", pj_jabatan: "Ketua Umum",
      status_pengajuan: "disetujui", status_progress: "belum_mulai",
      diajukan_pada: "2025-10-06T14:45:00",
      lpj: null,
    },
  ];

  /* ============================================
     Data dummy log persetujuan
     ============================================ */
  const dummyLog = {
    1: [
      { aksi: "diajukan", oleh: "Ahmad Fauzi", tanggal: "2025-10-15T09:30:00",
        catatan: "Pengajuan proker baru untuk periode 2025/2026." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-17T14:00:00",
        catatan: "Proposal lengkap, silakan dilaksanakan sesuai jadwal." },
    ],
    2: [
      { aksi: "diajukan", oleh: "Ahmad Fauzi", tanggal: "2025-10-20T14:15:00",
        catatan: "Pengajuan proker baru." },
    ],
    3: [
      { aksi: "diajukan", oleh: "Ahmad Fauzi", tanggal: "2025-10-01T10:00:00",
        catatan: "Pengajuan proker non-pendanaan." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-03T09:15:00",
        catatan: "Disetujui, kegiatan bermanfaat bagi masyarakat." },
    ],
    4: [
      { aksi: "diajukan", oleh: "Rani Puspita", tanggal: "2025-10-05T11:00:00",
        catatan: "Pengajuan proker." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-07T09:30:00", catatan: "Disetujui, semoga sukses." },
    ],
    5: [
      { aksi: "diajukan", oleh: "Dian Sastro", tanggal: "2025-10-22T08:45:00",
        catatan: "Pengajuan proker non-pendanaan." },
    ],
    6: [
      { aksi: "diajukan", oleh: "Yoga Pratama", tanggal: "2025-10-12T13:30:00",
        catatan: "Pengajuan proker." },
      { aksi: "revisi", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-14T10:30:00",
        catatan: "Rincian honor pemateri dan rundown acara belum dilampirkan. Mohon dilengkapi dan diajukan ulang." },
    ],
    7: [
      { aksi: "diajukan", oleh: "Maya Sari", tanggal: "2025-10-08T10:15:00",
        catatan: "Pengajuan proker." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-10T14:00:00", catatan: "Disetujui." },
    ],
    8: [
      { aksi: "diajukan", oleh: "Hendra Wijaya", tanggal: "2025-10-24T15:00:00",
        catatan: "Pengajuan proker." },
    ],
    9: [
      { aksi: "diajukan", oleh: "Bayu Setiawan", tanggal: "2025-10-10T09:00:00",
        catatan: "Pengajuan proker." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-12T11:30:00", catatan: "Disetujui." },
    ],
    10: [
      { aksi: "diajukan", oleh: "Citra Lestari", tanggal: "2025-09-28T14:00:00",
        catatan: "Pengajuan proker non-pendanaan." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-09-30T10:00:00", catatan: "Disetujui." },
    ],
    11: [
      { aksi: "diajukan", oleh: "Fajar Nugroho", tanggal: "2025-10-26T16:20:00",
        catatan: "Pengajuan proker." },
    ],
    12: [
      { aksi: "diajukan", oleh: "Aulia Rahman", tanggal: "2025-10-02T11:00:00",
        catatan: "Pengajuan proker non-pendanaan." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-04T09:00:00", catatan: "Disetujui." },
    ],
    13: [
      { aksi: "diajukan", oleh: "Lala Karmela", tanggal: "2025-10-16T10:30:00",
        catatan: "Pengajuan proker." },
      { aksi: "revisi", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-18T13:00:00",
        catatan: "RAB belum mencantumkan biaya sewa panggung dan lighting. Mohon direvisi." },
    ],
    14: [
      { aksi: "diajukan", oleh: "Rizal Aditya", tanggal: "2025-10-14T09:00:00",
        catatan: "Pengajuan proker." },
      { aksi: "ditolak", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-15T15:20:00",
        catatan: "Anggaran melebihi pagu periode ini dan jadwal berbenturan dengan kegiatan fakultas." },
    ],
    15: [
      { aksi: "diajukan", oleh: "Melody Anjani", tanggal: "2025-10-06T14:45:00",
        catatan: "Pengajuan proker." },
      { aksi: "disetujui", oleh: "Dewi Anggraini (Admin Kemahasiswaan)",
        tanggal: "2025-10-08T10:15:00", catatan: "Disetujui." },
    ],
  };

  /* ============================================
     Mapping label & badge
     ============================================ */
  const labelPengajuan = {
    diajukan: "Diajukan", direvisi: "Direvisi",
    disetujui: "Disetujui", ditolak: "Ditolak",
  };
  const badgePengajuan = {
    diajukan: "badge bg-warning text-dark",
    direvisi: "badge bg-info text-dark",
    disetujui: "badge bg-primary",
    ditolak: "badge bg-danger",
  };
  const labelProgress = {
    belum_mulai: "Belum Mulai", berjalan: "Berjalan",
    selesai: "Selesai", ditunda: "Ditunda",
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
     State
     ============================================ */
  const state = {
    proker: null,
    aksi: null,
  };

  /* ============================================
     Helper
     ============================================ */
  function getOrmawaById(id) {
    return (
      dummyOrmawa.find(function (o) { return o.id === id; }) ||
      { id: id, nama: "Ormawa #" + id, jenis: "-" }
    );
  }

  function formatRupiah(angka) {
    if (!angka || angka === 0) return "Rp0";
    return "Rp" + angka.toLocaleString("id-ID");
  }

  function formatTanggal(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "\u2014";
    const bulan = [
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
    setTimeout(function () { el.classList.add("d-none"); }, 4000);
  }

  /* ============================================
     Render hero
     ============================================ */
  function renderHero(p) {
    const ormawa = getOrmawaById(p.ormawa_id);
    document.getElementById("breadcrumbNama").textContent = p.nama;

    const elSp = document.getElementById("heroStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    const elSPr = document.getElementById("heroStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    document.getElementById("heroKategori").textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";
    document.getElementById("heroNama").textContent = p.nama;
    document.getElementById("heroTujuan").textContent = p.tujuan;
    document.getElementById("heroOrmawa").textContent =
      ormawa.nama + " (" + ormawa.jenis.toUpperCase() + ")";
    document.getElementById("heroJadwal").textContent =
      formatRentangTanggal(p.jadwal_mulai, p.jadwal_selesai);
    document.getElementById("heroAnggaran").textContent = formatRupiah(p.anggaran);
    document.getElementById("heroPj").textContent =
      p.pj_nama + (p.pj_jabatan ? " (" + p.pj_jabatan + ")" : "");
    document.getElementById("heroDiajukan").textContent =
      formatDatetime(p.diajukan_pada);
  }

  /* ============================================
     Render sidebar kanan
     ============================================ */
  function renderSidebar(p) {
    const ormawa = getOrmawaById(p.ormawa_id);
    const elSp = document.getElementById("sideStatusPengajuan");
    elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
    elSp.textContent = labelPengajuan[p.status_pengajuan];

    const elSPr = document.getElementById("sideStatusProgress");
    elSPr.className = "badge-status " + badgeProgress[p.status_progress];
    elSPr.textContent = labelProgress[p.status_progress];

    document.getElementById("sideKategori").textContent =
      p.kategori === "pendanaan" ? "Pendanaan" : "Non-pendanaan";
    document.getElementById("sideOrmawa").textContent = ormawa.nama;

    const logs = dummyLog[p.id] || [];
    const lastCatatan = logs.slice().reverse().find(function (l) { return l.catatan; });
    const box = document.getElementById("catatanTerakhirBox");
    if (lastCatatan) {
      box.classList.remove("catatan-box--empty");
      box.innerHTML =
        "<strong>" + escapeHtml(labelPengajuan[lastCatatan.aksi] || lastCatatan.aksi) +
        "</strong><br />" + escapeHtml(lastCatatan.catatan);
    } else {
      box.classList.add("catatan-box--empty");
      box.textContent = "Belum ada catatan.";
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
      diajukan: "bi-send", disetujui: "bi-check2",
      revisi: "bi-pencil", ditolak: "bi-x-lg",
    };
    const dotClassMap = {
      diajukan: "timeline__dot--diajukan",
      disetujui: "timeline__dot--disetujui",
      revisi: "timeline__dot--revisi",
      ditolak: "timeline__dot--ditolak",
    };

    list.innerHTML = logs.map(function (l) {
      return (
        '<li class="timeline__item">' +
          '<span class="timeline__dot ' + (dotClassMap[l.aksi] || "") + '">' +
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
    }).join("");
  }

  /* ============================================
     Aksi persetujuan
     ============================================ */
  function setupAksi(p) {
    const actionButtons = document.getElementById("actionButtons");
    const lockedNotice = document.getElementById("aksiLocked");
    const lockedText = document.getElementById("aksiLockedText");
    const catatanForm = document.getElementById("catatanForm");
    const catatanText = document.getElementById("catatanText");
    const catatanFeedback = document.getElementById("catatanFeedback");
    const catatanLabelHint = document.getElementById("catatanLabelHint");
    const btnBatal = document.getElementById("btnBatalCatatan");
    const btnKirim = document.getElementById("btnKirimCatatan");

    const needsAction =
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

    const buttons = actionButtons.querySelectorAll(".action-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const aksi = btn.getAttribute("data-aksi");
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

      const catatan = catatanText.value.trim();
      const isSetuju = state.aksi === "setuju";
      const minLen = isSetuju ? 0 : 10;

      if (catatan.length < minLen) {
        catatanText.classList.add("is-invalid");
        catatanFeedback.textContent = isSetuju
          ? "Catatan opsional."
          : "Catatan wajib diisi (min. 10 karakter).";
        return;
      }

      const spinner = document.getElementById("kirimSpinner");
      const icon = document.getElementById("kirimIcon");
      const text = document.getElementById("kirimText");

      btnKirim.disabled = true;
      spinner.classList.remove("d-none");
      icon.classList.add("d-none");
      text.textContent = "Mengirim...";

      setTimeout(function () {
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        text.textContent = "Kirim Keputusan";
        btnKirim.disabled = false;

        const labels = { setuju: "disetujui", revisi: "diminta revisi", tolak: "ditolak" };
        console.log("[ProkerIn] Keputusan admin:", {
          proker_id: p.id,
          aksi: state.aksi,
          catatan: catatan,
        });

        showAlert(
          "Proker berhasil " + labels[state.aksi] + ". Notifikasi dikirim ke ormawa.",
          state.aksi === "setuju" ? "success" : (state.aksi === "tolak" ? "danger" : "info")
        );

        p.status_pengajuan =
          state.aksi === "setuju" ? "disetujui" :
          state.aksi === "revisi" ? "direvisi" : "ditolak";

        const elSp = document.getElementById("heroStatusPengajuan");
        elSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
        elSp.textContent = labelPengajuan[p.status_pengajuan];

        const elSideSp = document.getElementById("sideStatusPengajuan");
        elSideSp.className = "badge-status " + badgePengajuan[p.status_pengajuan];
        elSideSp.textContent = labelPengajuan[p.status_pengajuan];

        catatanForm.classList.add("d-none");
        actionButtons.classList.add("d-none");
        lockedNotice.classList.remove("d-none");
        lockedText.textContent =
          "Proker sudah " + labelPengajuan[p.status_pengajuan].toLowerCase() + ".";
      }, 1100);
    });
  }

  /* ============================================
     LPJ
     ============================================ */
  function setupLpj(p) {
    const kosong = document.getElementById("lpjKosong");
    const ada = document.getElementById("lpjAda");
    const aksi = document.getElementById("lpjAksi");

    if (!p.lpj) {
      kosong.classList.remove("d-none");
      ada.classList.add("d-none");
      return;
    }

    kosong.classList.add("d-none");
    ada.classList.remove("d-none");

    document.getElementById("lpjNama").textContent = p.lpj.nama;
    document.getElementById("lpjMeta").textContent =
      "Diunggah: " + formatDatetime(p.lpj.tanggal_upload);
    document.getElementById("lpjDeskripsi").textContent = p.lpj.deskripsi;

    const badge = document.getElementById("lpjStatus");
    badge.className =
      "badge-status " + (badgeVerifikasi[p.lpj.status_verifikasi] || "badge bg-secondary");
    badge.textContent =
      labelVerifikasi[p.lpj.status_verifikasi] || p.lpj.status_verifikasi;

    if (p.lpj.status_verifikasi !== "menunggu") {
      aksi.classList.add("d-none");
      return;
    }

    const btnVerif = document.getElementById("btnVerifikasiLpj");
    const btnTolakLpj = document.getElementById("btnTolakLpj");

    btnVerif.addEventListener("click", function () {
      if (!confirm("Verifikasi LPJ ini sebagai valid?")) return;

      p.lpj.status_verifikasi = "terverifikasi";
      badge.className = "badge-status " + badgeVerifikasi.terverifikasi;
      badge.textContent = labelVerifikasi.terverifikasi;
      aksi.classList.add("d-none");
      showAlert("LPJ berhasil diverifikasi.", "success");
      console.log("[ProkerIn] LPJ terverifikasi:", p.id);
    });

    btnTolakLpj.addEventListener("click", function () {
      const alasan = prompt("Alasan penolakan LPJ (min. 10 karakter):");
      if (alasan === null) return;
      if (alasan.trim().length < 10) {
        showAlert("Alasan penolakan wajib diisi (min. 10 karakter).", "danger");
        return;
      }

      p.lpj.status_verifikasi = "ditolak";
      badge.className = "badge-status " + badgeVerifikasi.ditolak;
      badge.textContent = labelVerifikasi.ditolak;
      aksi.classList.add("d-none");
      showAlert("LPJ ditolak. Notifikasi dikirim ke ormawa.", "danger");
      console.log("[ProkerIn] LPJ ditolak:", { proker_id: p.id, alasan: alasan });
    });
  }

  /* ============================================
     Inisialisasi
     ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    const id = getIdFromUrl();
    const loading = document.getElementById("loadingState");
    const content = document.getElementById("detailContent");

    setTimeout(function () {
      loading.classList.add("d-none");

      if (!id) {
        showAlert(
          "ID proker tidak ditemukan di URL. Menampilkan proker contoh (ID 2).",
          "warning"
        );
      }

      const proker = dummyProker.find(function (x) {
        return x.id === (id || 2);
      });

      if (!proker) {
        showAlert("Proker dengan ID tersebut tidak ditemukan.", "danger");
        return;
      }

      state.proker = proker;
      content.classList.remove("d-none");

      renderHero(proker);
      renderSidebar(proker);
      renderTimeline(proker);
      setupAksi(proker);
      setupLpj(proker);
    }, 350);
  });
})();