const firebaseConfig = {
  apiKey: "AIzaSyA144TCCBAuHns...",
  authDomain: "labbook-d2976.firebaseapp.com",
  databaseURL: "https://labbook-d2976-default-rtdb.asia-southeast1.firebasebasedatabase.app",
  projectId: "labbook-d2976",
  storageBucket: "labbook-d2976.firebasestorage.app",
  messagingSenderId: "413503015903",
  appId: "1:413503015903:web:2..."
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Master Data Laboratoriumgit add .
const masterLabs = [
  { name: 'Lab Komputer 1', capacity: 30 },
  { name: 'Lab Komputer 2', capacity: 25 },
  { name: 'Lab Jaringan', capacity: 20 },
  { name: 'Lab Multimedia', capacity: 40 }
];

// Array Riwayat Peminjaman (Disinkronkan otomatis secara real-time dari database online)
let riwayatPeminjaman = [];

// SINKRONISASI REAL-TIME DARI DATABASE ONLINE KE SEMUA HP
database.ref('riwayat_peminjaman').on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    riwayatPeminjaman = Object.values(data);
  } else {
    riwayatPeminjaman = [];
  }
  
  if (typeof renderJadwal === 'function') renderJadwal();
  if (typeof renderStatus === 'function') renderStatus();
});

// ==========================================
// 1. SISTEM LOGIN & LOCALSTORAGE PERMANEN
// ==========================================
function applyUserData(username, email) {
  const displayUsername = document.getElementById('display-username');
  const displayEmail = document.getElementById('display-email');
  const profileName = document.getElementById('profile-name-label');
  const profileEmail = document.getElementById('profile-email-label');
  const profileBigInit = document.getElementById('profile-big-initial');
  const profileInit = document.getElementById('profile-initial');

  if (displayUsername) displayUsername.innerText = username;
  if (displayEmail) displayEmail.innerText = email;
  if (profileName) profileName.innerText = username;
  if (profileEmail) profileEmail.innerText = email;
  
  const initial = username ? username.charAt(0).toUpperCase() : 'Z';
  if (profileBigInit) profileBigInit.innerText = initial;
  if (profileInit) profileInit.innerText = initial;
}

function checkAndApplyLogin() {
  const savedName = localStorage.getItem('user_name');
  const savedEmail = localStorage.getItem('user_email');

  if (savedName && savedEmail) {
    applyUserData(savedName, savedEmail);
  } else {
    applyUserData('', 'Belum login');
  }
}

function handleLogin(event) {
  if (event) event.preventDefault();

  const usernameInput = document.getElementById('input-username');
  const emailInput = document.getElementById('input-email');

  if (!usernameInput || !emailInput) return;

  const username = usernameInput.value;
  const email = emailInput.value;

  // Simpan permanen di browser
  localStorage.setItem('user_name', username);
  localStorage.setItem('user_email', email);

  // Terapkan ke tampilan
  applyUserData(username, email);

  alert('Login berhasil! Selamat datang, ' + username);
  navigateTo('home');
}

// ==========================================
// 2. FUNGSI VALIDASI: WAJIB LOGIN SEBELUM PINJAM
// ==========================================
function submitBooking() {
  const savedName = localStorage.getItem('user_name');
  const savedEmail = localStorage.getItem('user_email');
  const displayEmail = document.getElementById('display-email');

  const isLoggedOut = !savedName || !savedEmail || (displayEmail && displayEmail.innerText === 'Belum login');

  if (isLoggedOut) {
    alert('Anda harus login terlebih dahulu sebelum meminjam ruangan laboratorium!');
    navigateTo('profil'); 
    return;
  }

  navigateTo('pinjam');
}

// ==========================================
// 3. INISIALISASI SAAT HALAMAN DIMUAT / REFRESH
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkAndApplyLogin();

  const today = new Date().toISOString().split('T')[0]; 

  const dateInput = document.getElementById('form-date');
  if (dateInput) dateInput.value = today;

  const scheduleDateInput = document.getElementById('filter-schedule-date');
  if (scheduleDateInput) scheduleDateInput.value = today;

  renderJadwal();
  renderStatus();
});

// ==========================================
// 4. NAVIGASI HALAMAN
// ==========================================
function navigateTo(pageId) {
  const pages = ['home', 'jadwal', 'pinjam', 'status', 'profil', 'success'];
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.add('hidden');
  });

  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    if (pageId === 'success') {
      targetPage.classList.remove('hidden');
      targetPage.classList.add('flex');
    } else {
      targetPage.classList.remove('hidden');
    }
  }

  if (pageId === 'jadwal') renderJadwal();
  if (pageId === 'status') renderStatus();

  const navItems = ['home', 'jadwal', 'pinjam', 'status'];
  navItems.forEach(item => {
    const btn = document.getElementById('nav-' + item);
    if (btn) {
      if (item === pageId) {
        btn.className = 'nav-btn flex flex-col items-center text-teal-600';
      } else {
        btn.className = 'nav-btn flex flex-col items-center text-gray-400 hover:text-teal-600';
      }
    }
  });

  const appContent = document.getElementById('app-content');
  if (appContent) appContent.scrollTop = 0;
}

// ==========================================
// 5. RENDER JADWAL & STATUS (DENGAN JAM TERPAKAI)
// ==========================================
function renderJadwal() {
  const scheduleDateInput = document.getElementById('filter-schedule-date');
  const labListContainer = document.getElementById('schedule-lab-list');
  if (!scheduleDateInput || !labListContainer) return;

  const selectedDate = scheduleDateInput.value;

  let htmlContent = '';
  masterLabs.forEach(lab => {
    const bookingsOnDate = riwayatPeminjaman.filter(item => item.rawDate === selectedDate && item.lab === lab.name);

    if (bookingsOnDate.length > 0) {
      const timeListText = bookingsOnDate.map(b => `${b.timeStart.replace(':', '.')} - ${b.timeEnd.replace(':', '.')}`).join(', ');

      htmlContent += `
        <div class="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold text-gray-800">${lab.name}</h3>
            <p class="text-xs text-gray-400 mt-0.5">Kapasitas ${lab.capacity} orang</p>
            <p class="text-xs text-red-500 font-medium mt-1">Terpakai jam: ${timeListText}</p>
          </div>
          <span class="text-[11px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium flex items-center space-x-1">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
            <span>Terpakai</span>
          </span>
        </div>
      `;
    } else {
      htmlContent += `
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold text-gray-800">${lab.name}</h3>
            <p class="text-xs text-gray-400 mt-0.5">Kapasitas ${lab.capacity} orang</p>
            <p class="text-xs text-gray-500 mt-1">Siap untuk dipinjam</p>
          </div>
          <span class="text-[11px] bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium flex items-center space-x-1">
            <span class="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block"></span>
            <span>Tersedia</span>
          </span>
        </div>
      `;
    }
  });

  labListContainer.innerHTML = htmlContent;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const lab = document.getElementById('form-lab').value;
  const dateVal = document.getElementById('form-date').value;
  const timeStart = document.getElementById('form-time-start').value;
  const timeEnd = document.getElementById('form-time-end').value;
  const purpose = document.getElementById('form-purpose').value;

  if (!lab || !dateVal || !timeStart || !timeEnd || !purpose) {
    alert('Mohon lengkapi semua kolom form peminjaman!');
    return;
  }

  if (timeStart < "07:00" || timeEnd > "17:00") {
    alert('Peminjaman laboratorium hanya tersedia antara pukul 07.00 pagi sampai 17.00 sore!');
    return;
  }

  if (timeStart >= timeEnd) {
    alert('Jam selesai harus lebih besar dari jam mulai!');
    return;
  }

  const isConflict = riwayatPeminjaman.some(item => {
    if (item.rawDate === dateVal && item.lab === lab) {
      return (timeStart < item.timeEnd && timeEnd > item.timeStart);
    }
    return false;
  });

  if (isConflict) {
    alert('MAAF! Ruangan ' + lab + ' sudah dipinjam pada rentang jam tersebut. Silakan pilih jam lain.');
    return;
  }

  let formattedDate = dateVal;
  if (dateVal) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    formattedDate = new Date(dateVal).toLocaleDateString('id-ID', options);
  }

  const timeString = `${timeStart.replace(':', '.')} sampai ${timeEnd.replace(':', '.')}`;
  const bookingCode = 'LB-' + Math.floor(100000 + Math.random() * 900000);
  const uniqueId = 'booking_' + Date.now(); // ID unik untuk server online

  const dataPeminjaman = {
    id: uniqueId,
    lab: lab,
    rawDate: dateVal,
    date: formattedDate,
    timeStart: timeStart,
    timeEnd: timeEnd,
    time: timeString,
    purpose: purpose,
    code: bookingCode,
    status: 'Disetujui'
  };

  // KIRIM KE FIREBASE DATABASE ONLINE AGAR TERSINKRON KE SEMUA HP
  database.ref('riwayat_peminjaman/' + uniqueId).set(dataPeminjaman)
    .catch((error) => {
      alert('Gagal menyimpan ke server: ' + error.message);
    });

  document.getElementById('res-lab').innerText = lab;
  document.getElementById('res-date').innerText = formattedDate;
  document.getElementById('res-time').innerText = timeString;
  document.getElementById('res-code').innerText = bookingCode;

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) bookingForm.reset();

  navigateTo('success');
}

function renderStatus() {
  const container = document.getElementById('status-container');
  if (!container) return;

  if (riwayatPeminjaman.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center space-y-3 mt-6">
        <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto text-lg">
          <i class="fa-regular fa-folder-open"></i>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-800">Belum Ada Pengajuan</h3>
          <p class="text-xs text-gray-400 mt-1">Anda belum pernah mengajukan peminjaman ruangan laboratorium.</p>
        </div>
        <button onclick="submitBooking()" class="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
          Pinjam Ruangan Sekarang
        </button>
      </div>
    `;
  } else {
    let htmlContent = '<div class="space-y-3 mt-4">';
    riwayatPeminjaman.forEach(item => {
      htmlContent += `
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-sm font-bold text-gray-800">${item.lab}</h3>
              <p class="text-xs text-gray-500 mt-0.5">${item.date} • ${item.time}</p>
            </div>
            <span class="text-[11px] bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-semibold">
              ${item.status}
            </span>
          </div>
          <div class="pt-2 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
            <span>Keperluan: ${item.purpose}</span>
            <span class="font-mono text-gray-600 font-medium">${item.code}</span>
          </div>
        </div>
      `;
    });
    htmlContent += '</div>';
    container.innerHTML = htmlContent;
  }
}

// ==========================================
// 6. DOWNLOAD SURAT DOKUMEN HTML
// ==========================================
function downloadSurat() {
  const lab = document.getElementById('res-lab').innerText;
  const date = document.getElementById('res-date').innerText;
  const time = document.getElementById('res-time').innerText;
  const code = document.getElementById('res-code').innerText;
  const username = document.getElementById('display-username').innerText;
  const email = document.getElementById('display-email').innerText;

  const htmlSurat = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat-Peminjaman-${code}</title>
  <style>
    @page { size: 210mm 297mm; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 24px 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .page { width: 210mm; height: 297mm; margin: 0 auto; padding: 20mm 20mm 15mm 20mm; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }
    .header-card { border: 2px solid #0f766e; border-radius: 12px; padding: 16px 20px; text-align: center; background-color: #f0fdf4; }
    .header-card h1 { margin: 0; font-size: 15pt; font-weight: 800; color: #0f766e; text-transform: uppercase; }
    .header-card p { margin: 4px 0 0 0; font-size: 11pt; font-weight: 700; color: #115e59; }
    .booking-bar { display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; font-size: 10.5pt; margin-top: 16px; }
    .status-badge { background-color: #dcfce7; color: #15803d; font-weight: 700; padding: 3px 10px; border-radius: 20px; font-size: 9.5pt; border: 1px solid #bbf7d0; }
    .section-block { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-top: 16px; }
    .section-title { font-size: 10.5pt; font-weight: 800; color: #0f766e; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .data-grid { display: grid; grid-template-columns: 140px 1fr; row-gap: 8px; font-size: 10.5pt; }
    .data-label { color: #64748b; font-weight: 500; }
    .data-value { color: #0f172a; font-weight: 600; }
    .rules-list { margin: 0; padding-left: 20px; font-size: 10pt; color: #334155; line-height: 1.6; }
    .footer-note { text-align: center; font-size: 9.5pt; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 24px; }
    .page-footer { padding-top: 4mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <section class="page">
    <div>
      <div class="header-card">
        <h1>Surat Bukti Peminjaman Laboratorium</h1>
        <p>LABBOOK</p>
      </div>
      <div class="booking-bar">
        <div><span class="data-label">KODE BOOKING: </span> <strong>${code}</strong></div>
        <div><span class="status-badge">STATUS: DISETUJUI / RESMI</span></div>
      </div>
      <div class="section-block">
        <div class="section-title">Identitas Peminjam</div>
        <div class="data-grid">
          <div class="data-label">Nama Lengkap</div><div class="data-value">: ${username}</div>
          <div class="data-label">Email Akun</div><div class="data-value">: ${email}</div>
        </div>
      </div>
      <div class="section-block">
        <div class="section-title">Detail Ruangan</div>
        <div class="data-grid">
          <div class="data-label">Laboratorium</div><div class="data-value">: ${lab}</div>
          <div class="data-label">Tanggal</div><div class="data-value">: ${date}</div>
          <div class="data-label">Waktu</div><div class="data-value">: ${time}</div>
        </div>
      </div>
      <div class="section-block">
        <div class="section-title">Ketentuan Penggunaan</div>
        <ol class="rules-list">
          <li>Harap tunjukkan surat/kode booking ini kepada petugas lab sebelum memasuki ruangan.</li>
          <li>Jaga kebersihan dan ketertiban selama menggunakan fasilitas laboratorium.</li>
          <li>Matikan seluruh perangkat komputer dan lampu setelah selesai digunakan.</li>
        </ol>
      </div>
      <div class="footer-note">
        Dicetak otomatis melalui sistem <strong>LabBook Vercel</strong>
      </div>
    </div>
    <footer class="page-footer">
      <span>Surat Bukti Peminjaman Laboratorium — LabBook</span>
      <span>Halaman 1 dari 1</span>
    </footer>
  </section>
  <script>
    window.onload = function() { setTimeout(() => { window.print(); }, 400); };
  </script>
</body>
</html>`;

  const blob = new Blob([htmlSurat], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Surat-Peminjaman-${code}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
