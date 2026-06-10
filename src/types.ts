/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'GURU' | 'KEPALA_SEKOLAH';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  nip: string;
  subject?: string;
  avatarUrl?: string;
}

export type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALFA';

export interface Student {
  id: string;
  name: string;
  gender: 'L' | 'P'; // L = Laki-laki, P = Perempuan
  nisn: string;
}

export interface Kelas {
  id: string;
  name: string; // e.g., "Kelas X-IPA 1", "Kelas XI-IPS 2"
  grade: string; // e.g., "X", "XI", "XII"
  teacherId: string; // Wali Kelas / Guru Pengampu
  teacherName: string;
  students: Student[];
  room?: string;
}

export interface Jurnal {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "07:30"
  endTime: string; // e.g., "09:00"
  teacherId: string;
  teacherName: string;
  kelasId: string;
  kelasName: string;
  subject: string; // Mata Pelajaran
  topic: string; // Pembahasan/Materi
  activities: string; // Kegiatan Pembelajaran
  obstacles: string; // Hambatan/Kendala
  followUp: string; // Tindak Lanjut/Solusi
  attendanceSummary: {
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
  };
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  kelasId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
  recordedByTeacherId: string;
}
