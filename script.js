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

// Fungsi Download Surat Peminjaman Lab (CSS Terpisah dari JS)
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
  <title>Surat Peminjaman Laboratorium - ${code}</title>
  <!-- Memanggil file CSS eksternal -->
  <link rel="stylesheet" href="style.css">
</head>
<body style="background: #555; margin: 0; padding: 20px;">

  <div class="surat-page">
    <!-- KOP SURAT -->
    <div class="surat-kop">
      <div class="surat-logo">LB</div>
      <div class="surat-kop-text">
        <h3>KEMENTERIAN PENDIDIKAN, TEKNOLOGI, DAN SAINS</h3>
        <h2>UNIT PENGELOLA LABORATORIUM TERPADU</h2>
        <h1>UNIVERSITAS DIGITAL INDONESIA</h1>
        <p>Gedung Lab Terpadu Lantai 3, Jl. Kampus Utama No. 10, Telp. (021) 5558899</p>
      </div>
    </div>

    <!-- NOMOR SURAT -->
    <div class="surat-nomor">
      <table>
        <tr>
          <td style="width: 70px;">Nomor</td>
          <td style="width: 15px;">:</td>
          <td>B / ${Math.floor(100 + Math.random() * 900)} / UPLT / ${new Date().getFullYear()}</td>
          <td style="text-align: right;">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td>Lampiran</td>
          <td>:</td>
          <td colspan="2">1 (Satu) Berkas</td>
        </tr>
        <tr>
          <td>Perihal</td>
          <td>:</td>
          <td colspan="2"><b>Izin Peminjaman Fasilitas Laboratorium</b></td>
        </tr>
      </table>
    </div>

    <!-- TUJUAN -->
    <div class="surat-paragraf">
      Kepada Yth.<br>
      <b>Petugas / Laboran Penanggung Jawab</b><br>
      di Tempat
    </div>

    <!-- PARAGRAF PEMBUKA -->
    <div class="surat-paragraf">
      Dengan hormat,<br>
      Sehubungan dengan adanya kegiatan praktikum, penelitian, dan penggunaan fasilitas akademik mahasiswa, bersama surat ini diberitahukan bahwa mahasiswa berikut telah mengajukan permohonan peminjaman ruangan laboratorium melalui sistem terintegrasi <b>LabBook</b>:
    </div>

    <!-- RINCIAN TABEL -->
    <table class="surat-table">
      <tr>
        <td class="col-label">Nama Peminjam</td>
        <td>: <b>${username}</b></td>
      </tr>
      <tr>
        <td class="col-label">Identitas Akun</td>
        <td>: ${email}</td>
      </tr>
      <tr>
        <td class="col-label">Kode Booking / Reg</td>
        <td>: <b>${code}</b></td>
      </tr>
      <tr>
        <td class="col-label">Laboratorium</td>
        <td>: <b>${lab}</b></td>
      </tr>
      <tr>
        <td class="col-label">Hari / Tanggal</td>
        <td>: ${date}</td>
      </tr>
      <tr>
        <td class="col-label">Waktu Operasional</td>
        <td>: ${time}</td>
      </tr>
      <tr>
        <td class="col-label">Status Pengajuan</td>
        <td>: <span style="color: #047857; font-weight: bold;">DISETUJUI / RESMI</span></td>
      </tr>
    </table>

    <!-- PARAGRAF PENUTUP -->
    <div class="surat-paragraf">
      Demikian surat izin peminjaman ini diterbitkan agar dapat dipergunakan sebagaimana mestinya dengan memperhatikan ketentuan di bawah ini:
    </div>

    <!-- KETENTUAN -->
    <div class="surat-ketentuan">
      <b>Ketentuan & Tata Tertib Penggunaan:</b>
      <ol>
        <li>Peminjam wajib menunjukkan surat bukti dan kode booking ini kepada petugas laboratorium sebelum memasuki ruangan.</li>
        <li>Menjaga kebersihan, ketertiban, serta keutuhan perangkat keras/lunak yang ada di dalam laboratorium.</li>
        <li>Dilarang membawa makanan atau minuman ke dalam area laboratorium.</li>
        <li>Wajib mematikan seluruh perangkat komputer, pendingin ruangan (AC), dan lampu setelah kegiatan berakhir.</li>
      </ol>
    </div>

    <!-- TANDA TANGAN -->
    <div class="surat-ttd">
      <div style="margin-bottom: 2px;">Mengetahui / Mengesahkan,</div>
      <div><b>Kepala Laboratorium Terpadu</b></div>
      <div class="surat-ttd-space"></div>
      <div><b>Dr. Ir. LabBook M.T.</b></div>
      <div style="font-size: 11px;">NIP. 19800202 200501 1 002</div>
    </div>
    <div class="clear-float"></div>

  </div>

  <script>
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
  link.download = `Surat-Resmi-Laboratorium-${code}.html`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

