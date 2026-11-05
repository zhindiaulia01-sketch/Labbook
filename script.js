// Master Data Laboratorium
const masterLabs = [
  { name: 'Lab Komputer 1', capacity: 30 },
  { name: 'Lab Komputer 2', capacity: 25 },
  { name: 'Lab Jaringan', capacity: 20 },
  { name: 'Lab Multimedia', capacity: 40 }
];

// Array Riwayat Peminjaman
let riwayatPeminjaman = [];

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];

  const dateInput = document.getElementById('form-date');
  if (dateInput) dateInput.value = today;

  const scheduleDateInput = document.getElementById('filter-schedule-date');
  if (scheduleDateInput) scheduleDateInput.value = today;

  renderJadwal();
  renderStatus();
});

// Navigasi Halaman
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

  document.getElementById('app-content').scrollTop = 0;
}

// Render Jadwal Berdasarkan Tanggal Filter (Dilengkapi Jam Terpakai)
function renderJadwal() {
  const scheduleDateInput = document.getElementById('filter-schedule-date');
  const labListContainer = document.getElementById('schedule-lab-list');
  if (!scheduleDateInput || !labListContainer) return;

  const selectedDate = scheduleDateInput.value;

  let htmlContent = '';
  masterLabs.forEach(lab => {
    // Ambil daftar peminjaman pada tanggal dan lab yang sama
    const bookingsOnDate = riwayatPeminjaman.filter(item => item.rawDate === selectedDate && item.lab === lab.name);

    if (bookingsOnDate.length > 0) {
      // Susun teks daftar jam terpakai (contoh: "Terpakai: 08.00-10.00, 13.00-15.00")
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

// Validasi Peminjaman (Batasan Jam 07.00 - 17.00 & Bentrok Jam Tumpang Tindih)
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

  // 1. VALIDASI BATASAN JAM OPERASIONAL (07:00 s/d 17:00)
  if (timeStart < "07:00" || timeEnd > "17:00") {
    alert('Peminjaman laboratorium hanya tersedia antara pukul 07.00 pagi sampai 17.00 sore!');
    return;
  }

  if (timeStart >= timeEnd) {
    alert('Jam selesai harus lebih besar dari jam mulai!');
    return;
  }

  // 2. PENGECEKAN BENTROK JAM TUMPANG TINDIH
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

  const dataPeminjaman = {
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

  riwayatPeminjaman.unshift(dataPeminjaman);

  document.getElementById('res-lab').innerText = lab;
  document.getElementById('res-date').innerText = formattedDate;
  document.getElementById('res-time').innerText = timeString;
  document.getElementById('res-code').innerText = bookingCode;

  document.getElementById('booking-form').reset();

  navigateTo('success');
}

// Render Status Peminjaman
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
        <button onclick="navigateTo('pinjam')" class="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
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

// Simpan Akun
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('input-username').value;
  const email = document.getElementById('input-email').value;

  if (username && email) {
    document.getElementById('display-username').innerText = username;
    document.getElementById('display-email').innerText = email;

    const initial = username.charAt(0).toUpperCase();
    document.getElementById('profile-initial').innerText = initial;
    document.getElementById('profile-big-initial').innerText = initial;
    document.getElementById('profile-name-label').innerText = username;
    document.getElementById('profile-email-label').innerText = email;

    alert('Akun ' + username + ' berhasil disimpan!');
    navigateTo('home');
  }
}

// Fungsi Download Surat Peminjaman Lab Estetik (HTML / PDF-Ready)
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Peminjaman - ${code}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">

  <div class="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
    <!-- Header Surat -->
    <div class="bg-teal-600 p-6 text-white text-center relative overflow-hidden">
      <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-teal-500 rounded-full opacity-30"></div>
      <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
        <i class="fa-solid fa-flask text-2xl text-white"></i>
      </div>
      <h1 class="text-2xl font-bold tracking-wider">LABBOOK</h1>
      <p class="text-xs text-teal-100 mt-1">Bukti Peminjaman Laboratorium Resmi</p>
    </div>

    <!-- Status Badge & QR Fake -->
    <div class="p-6 space-y-5">
      <div class="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div>
          <span class="text-[10px] text-slate-400 font-semibold tracking-wider block">KODE BOOKING</span>
          <span class="text-base font-bold text-slate-800 font-mono">${code}</span>
        </div>
        <span class="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <i class="fa-solid fa-circle-check text-xs"></i> DISETUJUI
        </span>
      </div>

      <!-- Detail Informasi -->
      <div class="space-y-3 text-xs">
        <div class="border-b border-slate-100 pb-2.5">
          <span class="text-slate-400 block text-[10px]">PEMINJAM</span>
          <span class="font-bold text-slate-800 text-sm">${username}</span>
          <span class="text-slate-500 block">${email}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 border-b border-slate-100 pb-2.5">
          <div>
            <span class="text-slate-400 block text-[10px]">LABORATORIUM</span>
            <span class="font-semibold text-slate-800">${lab}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">TANGGAL</span>
            <span class="font-semibold text-slate-800">${date}</span>
          </div>
        </div>

        <div class="border-b border-slate-100 pb-2.5">
          <span class="text-slate-400 block text-[10px]">JAM OPERASIONAL</span>
          <span class="font-semibold text-teal-700">${time}</span>
        </div>
      </div>

      <!-- Tata Tertib / Catatan -->
      <div class="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-100 text-[11px] text-teal-900 space-y-1">
        <p class="font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-circle-info text-teal-600"></i> Ketentuan Penggunaan:
        </p>
        <ul class="list-disc list-inside text-[10px] text-slate-600 space-y-0.5 pl-1">
          <li>Tunjukkan surat ini kepada petugas lab.</li>
          <li>Jaga kebersihan dan peralatan lab.</li>
          <li>Matikan listrik & komputer setelah dipakai.</li>
        </ul>
      </div>

      <!-- Footer Surat -->
      <div class="text-center pt-2">
        <p class="text-[10px] text-slate-400">Diterbitkan otomatis oleh sistem LabBook Vercel</p>
      </div>
    </div>
  </div>

  <script>
    // Otomatis memicu dialog cetak PDF saat file dibuka
    window.onload = function() {
      setTimeout(() => { window.print(); }, 500);
    };
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

