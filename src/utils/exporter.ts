/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Jurnal, AttendanceRecord, Student } from '../types';

/**
 * Helper to trigger document download on browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * EXCEL EXPORT (using MS Excel-compatible HTML/XML Spreadsheet format)
 * This generates a beautifully styled multi-table workbook inside Excel.
 */
export function exportJurnalAbsensiToExcel({
  className,
  teacherName,
  tapel,
  journals,
  students = [],
  attendanceRecords = [],
  institutionName = "Sekolah",
}: {
  className: string;
  teacherName: string;
  tapel: string;
  journals: Jurnal[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  institutionName: string;
}) {
  const filename = `REKAP_BELAJAR_${className.replace(/\s+/g, '_')}_${tapel.replace(/\//g, '-')}.xls`;

  // Calculate student logs
  const studentStats = students.map((st) => {
    const logs = attendanceRecords.filter((r) => r.studentId === st.id);
    const hadir = logs.filter((l) => l.status === 'HADIR').length;
    const sakit = logs.filter((l) => l.status === 'SAKIT').length;
    const izin = logs.filter((l) => l.status === 'IZIN').length;
    const alfa = logs.filter((l) => l.status === 'ALFA').length;
    const total = logs.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;
    return { ...st, hadir, sakit, izin, alfa, percentage };
  });

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; color: #111827; }
        .subtitle { font-size: 11pt; text-align: center; color: #4B5563; }
        .header-meta { font-size: 10pt; font-weight: bold; color: #374151; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #064E3B; color: #FFFFFF; font-weight: bold; border: 1px solid #D1D5DB; padding: 10px; text-align: center; font-size: 10pt; }
        td { border: 1px solid #E5E7EB; padding: 8px; font-size: 9.5pt; color: #111827; }
        .text-center { text-align: center; }
        .bg-gray { background-color: #F9FAFB; }
        .font-bold { font-weight: bold; }
        .section-header { font-size: 13pt; font-weight: bold; color: #111827; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #059669; pb: 4px; }
        .badge-hadir { color: #047857; font-weight: bold; }
        .badge-sakit { color: #B45309; font-weight: bold; }
        .badge-izin { color: #1D4ED8; font-weight: bold; }
        .badge-alfa { color: #B91C1C; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="title">${institutionName.toUpperCase()}</div>
      <div class="subtitle">REKAPITULASI JURNAL MENGAJAR & PRESENSI BELAJAR</div>
      <div class="subtitle">Tahun Pelajaran: ${tapel}</div>
      <br/>

      <table style="width: 50%; width: auto;">
        <tr>
          <td class="header-meta bg-gray" style="width: 150px;">Kelas</td>
          <td class="font-bold">: ${className}</td>
        </tr>
        <tr>
          <td class="header-meta bg-gray">Pendidik / Guru</td>
          <td class="font-bold">: ${teacherName}</td>
        </tr>
        <tr>
          <td class="header-meta bg-gray">Tanggal Ekspor</td>
          <td>: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
      </table>

      <!-- JURNAL SECTION -->
      <div class="section-header">I. Jurnal Harian Belajar Mengajar (KBM)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">No</th>
            <th style="width: 100px;">Tanggal</th>
            <th style="width: 100px;">Waktu</th>
            <th style="width: 150px;">Mata Pelajaran</th>
            <th style="width: 200px;">Pokok Bahasan / Topik</th>
            <th style="width: 300px;">Kegiatan Pembelajaran</th>
            <th style="width: 180px;">Kendala / Hambatan</th>
            <th style="width: 180px;">Tindak Lanjut Solusi</th>
            <th style="width: 120px;">Rerata Kehadiran</th>
            <th style="width: 250px;">Catatan Guru / Absensi</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (journals.length === 0) {
    html += `
      <tr>
        <td colspan="10" class="text-center" style="color: #6B7280; padding: 20px;">Belum ada arsip jurnal ajar pekanan.</td>
      </tr>
    `;
  } else {
    journals.forEach((j, index) => {
      const sh = j.attendanceSummary || { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
      const totalStudents = sh.hadir + sh.sakit + sh.izin + sh.alfa;
      const pct = totalStudents > 0 ? Math.round((sh.hadir / totalStudents) * 100) : 100;

      html += `
        <tr>
          <td class="text-center bg-gray">${index + 1}</td>
          <td class="text-center font-bold">${j.date}</td>
          <td class="text-center">${j.startTime} - ${j.endTime}</td>
          <td>${j.subject}</td>
          <td class="font-bold">${j.topic}</td>
          <td>${j.activities}</td>
          <td>${j.obstacles || '-'}</td>
          <td>${j.followUp || '-'}</td>
          <td class="text-center font-bold" style="color: ${pct >= 90 ? '#047857' : '#B45309'}">${pct}% (${sh.hadir}/${totalStudents} Siswa)</td>
          <td style="font-family: monospace; font-size: 8.5pt;">${j.notes || '-'}</td>
        </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>

      <!-- ABSENSI SECTION -->
      <div class="section-header" style="margin-top: 40px;">II. Lembar Rekapitulasi Presensi Kumulatif Siswa</div>
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">No</th>
            <th style="width: 150px;">NISN</th>
            <th style="width: 250px;">Nama Lengkap Siswa</th>
            <th style="width: 80px;">Gender</th>
            <th style="width: 85px;">Hadir (H)</th>
            <th style="width: 85px;">Sakit (S)</th>
            <th style="width: 85px;">Izin (I)</th>
            <th style="width: 85px;">Alfa (A)</th>
            <th style="width: 120px;">% Kehadiran</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (studentStats.length === 0) {
    html += `
      <tr>
        <td colspan="9" class="text-center" style="color: #6B7280; padding: 20px;">Belum ada data siswa teregistrasi pada kelas ini.</td>
      </tr>
    `;
  } else {
    studentStats.forEach((st, idx) => {
      html += `
        <tr>
          <td class="text-center bg-gray">${idx + 1}</td>
          <td class="text-center font-bold">${st.nisn}</td>
          <td class="font-bold">${st.name}</td>
          <td class="text-center">${st.gender}</td>
          <td class="text-center badge-hadir">${st.hadir}</td>
          <td class="text-center badge-sakit">${st.sakit}</td>
          <td class="text-center badge-izin">${st.izin}</td>
          <td class="text-center badge-alfa">${st.alfa}</td>
          <td class="text-center font-bold" style="background-color: ${st.percentage >= 90 ? '#ECFDF5' : '#FEF2F2'}; color: ${st.percentage >= 90 ? '#047857' : '#B91C1C'}">
            ${st.percentage}%
          </td>
        </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>

      <br/><br/>
      <table style="width: 100%; margin-top: 30px; border: none !important;">
        <tr style="border: none !important;">
          <td style="width: 50%; text-align: center; border: none !important; color: #4B5563;">
            Mengetahui,<br/>Wali Kelas Pendidik
            <br/><br/><br/><br/>
            <span class="font-bold" style="text-decoration: underline;">${teacherName}</span><br/>
            <span>NIP. ${journals[0]?.teacherId === 'usr-1' ? '198004122005011003' : 'Pegawai Terdaftar'}</span>
          </td>
          <td style="width: 50%; text-align: center; border: none !important; color: #4B5563;">
            Mengesahkan,<br/>Kepala Sekolah / Pimpinan Urusan Kurikulum
            <br/><br/><br/><br/>
            <span class="font-bold" style="text-decoration: underline;">Dr. H. Ahmad Dahlan, M.Pd.</span><br/>
            <span>NIP. 197405232001121002</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  downloadFile(html, filename, 'application/vnd.ms-excel;charset=utf-8');
}


/**
 * WORD EXPORT (using beautifully padded MS Word HTML layout)
 * Renders high-quality administrative documentation format.
 */
export function exportJurnalAbsensiToWord({
  className,
  teacherName,
  tapel,
  journals,
  students = [],
  attendanceRecords = [],
  institutionName = "Sekolah",
}: {
  className: string;
  teacherName: string;
  tapel: string;
  journals: Jurnal[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  institutionName: string;
}) {
  const filename = `REKAP_BELAJAR_${className.replace(/\s+/g, '_')}_${tapel.replace(/\//g, '-')}.doc`;

  // Calculate student logs
  const studentStats = students.map((st) => {
    const logs = attendanceRecords.filter((r) => r.studentId === st.id);
    const hadir = logs.filter((l) => l.status === 'HADIR').length;
    const sakit = logs.filter((l) => l.status === 'SAKIT').length;
    const izin = logs.filter((l) => l.status === 'IZIN').length;
    const alfa = logs.filter((l) => l.status === 'ALFA').length;
    const total = logs.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;
    return { ...st, hadir, sakit, izin, alfa, percentage };
  });

  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8" />
      <title>REKAP JURNAL ABSENSI</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1.0in 1.0in 1.0in 1.0in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #000000;
        }
        .header {
          text-align: center;
          border-bottom: 3px double #000000;
          padding-bottom: 10px;
          margin-bottom: 25px;
        }
        .header h1 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0 0 5px 0;
          letter-spacing: 0.5px;
        }
        .header h2 {
          font-size: 16pt;
          font-weight: bold;
          margin: 0;
          color: #000000;
        }
        .header p {
          font-size: 10pt;
          margin: 5px 0 0 0;
          italic: true;
        }
        .doc-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        .meta-table {
          width: 100%;
          border: none;
          margin-bottom: 25px;
        }
        .meta-table td {
          border: none;
          padding: 3px;
          font-size: 11pt;
        }
        .section-title {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 25px;
          margin-bottom: 10px;
          border-bottom: 1px solid #000000;
          padding-bottom: 3px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table.data-table th {
          border: 1px solid #000000;
          background-color: #F3F4F6;
          padding: 8px;
          font-size: 10pt;
          font-weight: bold;
          text-align: center;
        }
        table.data-table td {
          border: 1px solid #000000;
          padding: 7px;
          font-size: 9.5pt;
          vertical-align: top;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .signature-section {
          margin-top: 40px;
          width: 100%;
        }
        .signature-section td {
          border: none;
          text-align: center;
          font-size: 11pt;
          width: 50%;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MAJELIS PENDIDIKAN DASAR DAN MENENGAH</h1>
        <h2>${institutionName.toUpperCase()}</h2>
        <p>Gedung Utama Pembelajaran • Tahun Sesi Pelajaran: ${tapel} • Email: admin@${institutionName.toLowerCase().replace(/\s+/g, '')}.sch.id</p>
      </div>

      <div class="doc-title">REKAPITULASI PEMBELAJARAN JURNAL & PRESENSI KBM</div>

      <table class="meta-table">
        <tr>
          <td style="width: 15%;"><strong>Kelas / Sesi</strong></td>
          <td style="width: 40%;">: ${className}</td>
          <td style="width: 20%;"><strong>Tahun Pelajaran</strong></td>
          <td style="width: 25%;">: ${tapel}</td>
        </tr>
        <tr>
          <td><strong>Nama Guru</strong></td>
          <td>: ${teacherName}</td>
          <td><strong>Tanggal Ekspor</strong></td>
          <td>: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
      </table>

      <!-- PART 1: JURNAL -->
      <div class="section-title">A. Catatan Jurnal Pelaksanaan Belajar Mengajar (KBM)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 15%;">Tanggal & Jam</th>
            <th style="width: 15%;">Mata Pelajaran</th>
            <th style="width: 25%;">Topik Pokok Bahasan</th>
            <th style="width: 40%;">Uraian Alur Kegiatan & Hambatan Kelas</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (journals.length === 0) {
    html += `
      <tr>
        <td colspan="5" class="text-center" style="padding: 15px; color: #555;">Belum ada arsip jurnal.</td>
      </tr>
    `;
  } else {
    journals.forEach((j, idx) => {
      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${j.date}</strong><br/>
            <span style="font-size: 8.5pt; color: #555;">${j.startTime} - ${j.endTime}</span>
          </td>
          <td>${j.subject}</td>
          <td><strong>${j.topic}</strong></td>
          <td>
            <strong>Kegiatan:</strong> ${j.activities}
            ${j.obstacles ? `<br/><strong>Hambatan:</strong> ${j.obstacles}` : ''}
            ${j.followUp ? `<br/><strong>Tindak Lanjut:</strong> ${j.followUp}` : ''}
            ${j.notes ? `<br/><span style="font-family: monospace; font-size: 8pt; color: #444;">[Catatan: ${j.notes}]</span>` : ''}
          </td>
        </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>

      <!-- PART 2: SUMMARY ATTENDANCE -->
      <div class="section-title" style="page-break-before: always;">B. Lembar Rekapitulasi Presensi Kehadiran Siswa</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 15%;">NISN</th>
            <th style="width: 45%;">Nama Lengkap Siswa</th>
            <th style="width: 10%;">L/P</th>
            <th style="width: 5%;">H</th>
            <th style="width: 5%;">S</th>
            <th style="width: 5%;">I</th>
            <th style="width: 5%;">A</th>
            <th style="width: 10%;">% Hadir</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (studentStats.length === 0) {
    html += `
      <tr>
        <td colspan="9" class="text-center" style="padding: 15px; color: #555;">Belum ada data siswa.</td>
      </tr>
    `;
  } else {
    studentStats.forEach((st, idx) => {
      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center">${st.nisn}</td>
          <td><strong>${st.name}</strong></td>
          <td class="text-center">${st.gender}</td>
          <td class="text-center">${st.hadir}</td>
          <td class="text-center">${st.sakit}</td>
          <td class="text-center">${st.izin}</td>
          <td class="text-center">${st.alfa}</td>
          <td class="text-center font-bold">${st.percentage}%</td>
        </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>

      <div style="margin-top: 15px; font-size: 9pt; font-style: italic;">
        Keterangan singkatan: H = Hadir; S = Sakit; I = Izin; A = Tanpa Keterangan (Alfa).
      </div>

      <!-- PART 3: SIGNATURES -->
      <table class="signature-section">
        <tr>
          <td>
            Mengetahui,<br/>
            Wali Kelas Guru Pengampu
            <br/><br/><br/><br/>
            <span class="font-bold" style="text-decoration: underline;">${teacherName}</span><br/>
            <span>NIP. ${journals[0]?.teacherId === 'usr-1' ? '198004122005011003' : 'Pendidik Terdaftar'}</span>
          </td>
          <td>
            Disahkan oleh,<br/>
            Pimpinan Kepala Sekolah
            <br/><br/><br/><br/>
            <span class="font-bold" style="text-decoration: underline;">Dr. H. Ahmad Dahlan, M.Pd.</span><br/>
            <span>NIP. 197405232001121002</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  downloadFile(html, filename, 'application/msword;charset=utf-8');
}
