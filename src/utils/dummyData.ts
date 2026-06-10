/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Kelas, Student, Jurnal, AttendanceRecord } from '../types';

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Noer Prijantono, S.Pd., M.Si.',
    role: 'GURU',
    email: 'noerprijantono@gmail.com',
    nip: '198004122005011003',
    subject: 'Fisika & IPA Terpadu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'u2',
    name: 'Ibu Ratna Wijaya, M.Pd.',
    role: 'GURU',
    email: 'ratnawijaya@sekolah.sch.id',
    nip: '198511232009022002',
    subject: 'Matematika Peminatan',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'u3',
    name: 'Drs. H. Supriyanto, M.Pd.',
    role: 'KEPALA_SEKOLAH',
    email: 'supriyanto@gmail.com',
    nip: '197108151996031002',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  },
];

// Helper to generate students
export const MOCK_STUDENTS_X_IPA1: Student[] = [
  { id: 's101', name: 'Aditya Pratama', gender: 'L', nisn: '0085432101' },
  { id: 's102', name: 'Aisyah Putri Azzahra', gender: 'P', nisn: '0085432102' },
  { id: 's103', name: 'Bagus Setyawan', gender: 'L', nisn: '0085432103' },
  { id: 's104', name: 'Citra Amelia', gender: 'P', nisn: '0085432104' },
  { id: 's105', name: 'Daniel Christian', gender: 'L', nisn: '0085432105' },
  { id: 's106', name: 'Dwi Lestari', gender: 'P', nisn: '0085432106' },
  { id: 's107', name: 'Fajar Nugroho', gender: 'L', nisn: '0085432107' },
  { id: 's108', name: 'Gita Saraswati', gender: 'P', nisn: '0085432108' },
  { id: 's109', name: 'Hafiz Al-Fatih', gender: 'L', nisn: '0085432109' },
  { id: 's110', name: 'Indah Cahyani', gender: 'P', nisn: '0085432110' },
];

export const MOCK_STUDENTS_XI_IPS2: Student[] = [
  { id: 's201', name: 'Bayu Pamungkas', gender: 'L', nisn: '0076219801' },
  { id: 's202', name: 'Dian Sastro', gender: 'P', nisn: '0076219802' },
  { id: 's203', name: 'Eko Sulistyo', gender: 'L', nisn: '0076219803' },
  { id: 's204', name: 'Farah Salsabila', gender: 'P', nisn: '0076219804' },
  { id: 's205', name: 'Galih Wicaksono', gender: 'L', nisn: '0076219805' },
  { id: 's206', name: 'Hani Susanti', gender: 'P', nisn: '0076219806' },
  { id: 's207', name: 'Irfan Bachdim', gender: 'L', nisn: '0076219807' },
  { id: 's208', name: 'Jasmine Olivia', gender: 'P', nisn: '0076219808' },
];

export const MOCK_STUDENTS_XII_IPA3: Student[] = [
  { id: 's301', name: 'Kevin Sanjaya', gender: 'L', nisn: '0069384701' },
  { id: 's302', name: 'Lia Ananta', gender: 'P', nisn: '0069384702' },
  { id: 's303', name: 'Muhammad Rizky', gender: 'L', nisn: '0069384703' },
  { id: 's304', name: 'Nadia Rahma', gender: 'P', nisn: '0069384704' },
  { id: 's305', name: 'Pratama Arhan', gender: 'L', nisn: '0069384705' },
  { id: 's306', name: 'Rara Sekar', gender: 'P', nisn: '0069384706' },
];

export const DEFAULT_CLASSES: Kelas[] = [
  {
    id: 'k1',
    name: 'Kelas X - IPA 1',
    grade: 'X',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    students: MOCK_STUDENTS_X_IPA1,
    room: 'Ruang Lab Fisika',
  },
  {
    id: 'k2',
    name: 'Kelas XI - IPS 2',
    grade: 'XI',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    students: MOCK_STUDENTS_XI_IPS2,
    room: 'Gedung Kartini R-14',
  },
  {
    id: 'k3',
    name: 'Kelas XII - IPA 3',
    grade: 'XII',
    teacherId: 'u2',
    teacherName: 'Ibu Ratna Wijaya, M.Pd.',
    students: MOCK_STUDENTS_XII_IPA3,
    room: 'Ruang Teori 3',
  },
];

// Generator of historical data for beautiful charts
// Current time is simulated as Wednesday, June 10, 2026.
export const SEEDED_JOURNALS: Jurnal[] = [
  {
    id: 'j1',
    date: '2026-06-03',
    startTime: '07:30',
    endTime: '09:00',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    kelasId: 'k1',
    kelasName: 'Kelas X - IPA 1',
    subject: 'Fisika',
    topic: 'Pengenalan Gelombang Elektromagnetik',
    activities: 'Menjelaskan spektrum gelombang elektromagnetik, mendiskusikan pemanfaatan dalam kehidupan sehari-hari (sinar gamma, rontgen, s/d gelombang radio), serta melakukan kuis kecil interaktif.',
    obstacles: 'Beberapa siswa kurang konsentrasi karena baru jam matapelajaran pertama setelah upacara mandiri.',
    followUp: 'Memberikan ice breaking peregangan fisik selama 3 menit di tengah sesi pengajaran.',
    attendanceSummary: { hadir: 8, sakit: 1, izin: 1, alfa: 0 },
    notes: 'Kuis dinilai memuaskan, 80% siswa mencapai batas ketuntasan minimum.',
  },
  {
    id: 'j2',
    date: '2026-06-04',
    startTime: '09:15',
    endTime: '10:45',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    kelasId: 'k2',
    kelasName: 'Kelas XI - IPS 2',
    subject: 'IPA Terpadu',
    topic: 'Pemanasan Global dan Efek Rumah Kaca',
    activities: 'Menonton video dokumenter berdurasi 15 menit tentang kenaikan suhu bumi, dilanjutkan dengan diskusi kelompok tentang rancangan aksi hemat energi di lingkungan sekolah.',
    obstacles: 'Proyektor ruang kelas XI-IPS 2 sedikit berbayang sehingga warna video agak kabur.',
    followUp: 'Berkoordinasi dengan bagian Sarpras untuk pengecekan kabel VGA proyektor.',
    attendanceSummary: { hadir: 7, sakit: 0, izin: 1, alfa: 0 },
    notes: 'Siswa sangat antusias merancang ide daur ulang sampah kertas.',
  },
  {
    id: 'j3',
    date: '2026-06-05',
    startTime: '07:30',
    endTime: '09:00',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    kelasId: 'k1',
    kelasName: 'Kelas X - IPA 1',
    subject: 'Fisika',
    topic: 'Praktikum Sederhana Cermin Cembung & Cekung',
    activities: 'Siswa bekerja berpasangan menggunakan kit optika untuk menggambar pembentukan bayangan pada cermin. Menyusun laporan sementara.',
    obstacles: 'Satu set alat praktikum cermin cembung retak halus di bagian penyangga.',
    followUp: 'Mengganti dengan cadangan dari gudang lab dan melabeli alat yang rusak untuk direparasi.',
    attendanceSummary: { hadir: 9, sakit: 0, izin: 0, alfa: 1 },
    notes: 'Bayu tidak hadir tanpa keterangan (alfa). Mengingatkan ketua kelas untuk mengabari wali siswa.',
  },
  {
    id: 'j4',
    date: '2026-06-08',
    startTime: '07:30',
    endTime: '09:00',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    kelasId: 'k1',
    kelasName: 'Kelas X - IPA 1',
    subject: 'Fisika',
    topic: 'Pembiasan Cahaya pada Lensa Tipis',
    activities: 'Penyampaian rumus kekuatan lensa, latihan soal pembiasan lensa ganda, diskusi persiapan ulangan harian bab Optika.',
    obstacles: 'Siswa agak bingung membedakan tanda positif negatif pada jarak fokus lensa cekung/cembung.',
    followUp: 'Membuat jembatan keledai visual "Cembung Positif, Cekung Negatif (BungSif CungNeg)" di papan tulis.',
    attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alfa: 0 },
    notes: 'Hari ini kehadiran penuh 100%. Pembelajaran sangat kondusif.',
  },
  {
    id: 'j5',
    date: '2026-06-09',
    startTime: '09:15',
    endTime: '10:45',
    teacherId: 'u1',
    teacherName: 'Noer Prijantono, S.Pd., M.Si.',
    kelasId: 'k2',
    kelasName: 'Kelas XI - IPS 2',
    subject: 'IPA Terpadu',
    topic: 'Keseimbangan Ekosistem dan Keragaman Hayati',
    activities: 'Studi luar kelas di taman sekolah untuk mengamati rantai makanan makro. Siswa mencatat produsen, konsumen tingkat I, II, dan pengurai yang terlihat.',
    obstacles: 'Cuaca agak gerimis ringan di akhir jam pelajaran sehingga kegiatan ditarik kembali ke kelas lebih cepat.',
    followUp: 'Menyelesaikan laporan hasil observasi di dalam kelas dengan panduan lembar kerja.',
    attendanceSummary: { hadir: 6, sakit: 1, izin: 0, alfa: 1 },
    notes: 'Aditya tidak hadir karena sakit demam (ada surat dokter). Jasmine tidak hadir tanpa keterangan.',
  },
  {
    id: 'j6',
    date: '2026-06-08',
    startTime: '10:45',
    endTime: '12:15',
    teacherId: 'u2',
    teacherName: 'Ibu Ratna Wijaya, M.Pd.',
    kelasId: 'k3',
    kelasName: 'Kelas XII - IPA 3',
    subject: 'Matematika Peminatan',
    topic: 'Limit Fungsi Trigonometri',
    activities: 'Menjelaskan teorema rumus dasar limit trigonometri x mendekati 0. Latihan soal manipulasi aljabar pecahan limit.',
    obstacles: 'Konsep dasar rumus jumlah selisih trigonometri kelas XI banyak dilupakan siswa.',
    followUp: 'Menuliskan review ringkas 5 rumus penting trigonometri di sudut kanan papan tulis.',
    attendanceSummary: { hadir: 5, sakit: 1, izin: 0, alfa: 0 },
    notes: 'Perlu memberikan tugas mandiri agar pemahaman rumus dasar lebih matang.',
  },
  {
    id: 'j7',
    date: '2026-06-09',
    startTime: '07:30',
    endTime: '09:00',
    teacherId: 'u2',
    teacherName: 'Ibu Ratna Wijaya, M.Pd.',
    kelasId: 'k3',
    kelasName: 'Kelas XII - IPA 3',
    subject: 'Matematika Peminatan',
    topic: 'Turunan Fungsi Trigonometri',
    activities: 'Menurunkan rumus turunan sin x, cos x, dan tan x menggunakan definisi limit fungsi. Latihan turunan berantai sederhana.',
    obstacles: 'Satu siswa sering memainkan ponsel di laci meja.',
    followUp: 'Menegur secara personal dan meminta siswa tersebut menaruh ponsel di keranjang meja guru selama pelajaran.',
    attendanceSummary: { hadir: 6, sakit: 0, izin: 0, alfa: 0 },
    notes: 'Siswa yang ditegur kooperatif dan kembali fokus belajar.',
  }
];

// Generate Attendance database for class X-IPA-1 & XI-IPS-2 to feed the graphs
const datesWithHistoricalAttendance = [
  '2026-06-03',
  '2026-06-04',
  '2026-06-05',
  '2026-06-08',
  '2026-06-09',
];

export const generateHistoricalAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];

  // Seed for Class X-IPA 1 (k1)
  // Students: s101 to s110
  MOCK_STUDENTS_X_IPA1.forEach((st) => {
    // 2026-06-03
    let status: any = 'HADIR';
    if (st.id === 's102') status = 'SAKIT'; // Aisyah sakit
    if (st.id === 's108') status = 'IZIN';  // Gita izin
    records.push({
      id: `att-k1-${st.id}-2026-06-03`,
      date: '2026-06-03',
      kelasId: 'k1',
      studentId: st.id,
      studentName: st.name,
      status,
      recordedByTeacherId: 'u1',
    });

    // 2026-06-05 (Daniel alfa)
    status = 'HADIR';
    if (st.id === 's105') status = 'ALFA';
    records.push({
      id: `att-k1-${st.id}-2026-06-05`,
      date: '2026-06-05',
      kelasId: 'k1',
      studentId: st.id,
      studentName: st.name,
      status,
      recordedByTeacherId: 'u1',
    });

    // 2026-06-08 (Kehadiran penuh 100%)
    records.push({
      id: `att-k1-${st.id}-2026-06-08`,
      date: '2026-06-08',
      kelasId: 'k1',
      studentId: st.id,
      studentName: st.name,
      status: 'HADIR',
      recordedByTeacherId: 'u1',
    });
  });

  // Seed for Class XI-IPS 2 (k2)
  // Students: s201 to s208
  MOCK_STUDENTS_XI_IPS2.forEach((st) => {
    // 2026-06-04 (Farah izin)
    let status: any = 'HADIR';
    if (st.id === 's204') status = 'IZIN';
    records.push({
      id: `att-k2-${st.id}-2026-06-04`,
      date: '2026-06-04',
      kelasId: 'k2',
      studentId: st.id,
      studentName: st.name,
      status,
      recordedByTeacherId: 'u1',
    });

    // 2026-06-09 (Bayu sakit, Jasmine alfa)
    status = 'HADIR';
    if (st.id === 's201') status = 'SAKIT';
    if (st.id === 's208') status = 'ALFA';
    records.push({
      id: `att-k2-${st.id}-2026-06-09`,
      date: '2026-06-09',
      kelasId: 'k2',
      studentId: st.id,
      studentName: st.name,
      status,
      recordedByTeacherId: 'u1',
    });
  });

  // Seed for Class XII-IPA 3 (k3)
  MOCK_STUDENTS_XII_IPA3.forEach((st) => {
    // 2026-06-08 (Pratama sakit)
    let status: any = 'HADIR';
    if (st.id === 's305') status = 'SAKIT';
    records.push({
      id: `att-k3-${st.id}-2026-06-08`,
      date: '2026-06-08',
      kelasId: 'k3',
      studentId: st.id,
      studentName: st.name,
      status,
      recordedByTeacherId: 'u2',
    });

    // 2026-06-09 (100% hadir)
    records.push({
      id: `att-k3-${st.id}-2026-06-09`,
      date: '2026-06-09',
      kelasId: 'k3',
      studentId: st.id,
      studentName: st.name,
      status: 'HADIR',
      recordedByTeacherId: 'u2',
    });
  });

  return records;
};
