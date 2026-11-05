// 1. Letakkan di BAGIAN ATAS script.js
function submitBooking() {
  const usernameElement = document.getElementById('display-username');
  const isLoggedOut = !usernameElement || usernameElement.innerText === 'Belum login' || usernameElement.innerText === '';

  if (isLoggedOut) {
    alert('Anda harus login terlebih dahulu sebelum meminjam ruangan laboratorium!');
    return; // Berhenti di sini jika belum login
  }

  // Lanjutkan proses peminjaman jika sudah login
  console.log('Peminjaman diproses...');
}


// 2. Letakkan di BAGIAN PALING BAWAH script.js
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