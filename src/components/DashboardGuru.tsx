/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Kelas, Jurnal, AttendanceRecord, Student, AttendanceStatus 
} from '../types';
import { 
  AttendanceTrendChart, 
  AttendanceSummaryDonut, 
  MetricCard 
} from './Visuals';
import { 
  BookOpen, Users, ClipboardCheck, Compass, History, Plus, 
  Trash2, Search, Edit2, LogOut, CheckCircle, Info, FileSpreadsheet, 
  UserPlus, MapPin, Calendar, Clock, Sparkles, Settings, FileText, Printer, HelpCircle
} from 'lucide-react';
import Pengaturan from './Pengaturan';
import { exportJurnalAbsensiToExcel, exportJurnalAbsensiToWord } from '../utils/exporter';

interface DashboardGuruProps {
  user: User;
  classes: Kelas[];
  journals: Jurnal[];
  attendanceRecords: AttendanceRecord[];
  institutionName: string;
  institutionLogo: string;
  tapel: string;
  users: User[];
  onAddClass: (cls: Kelas) => void;
  onDeleteClass: (classId: string) => void;
  onSaveAttendance: (date: string, classId: string, records: Omit<AttendanceRecord, 'id' | 'recordedByTeacherId'>[]) => void;
  onAddJournal: (j: Jurnal) => void;
  onUpdateJournal: (j: Jurnal) => void;
  onDeleteJournal: (journalId: string) => void;
  onSaveInstitution: (name: string, logo: string, tapel: string) => void;
  onAddTeacher: (teacher: User) => void;
  onUpdateTeacher: (teacher: User) => void;
  onDeleteTeacher: (id: string) => void;
  onLogout: () => void;
}

type ActiveTab = 'dashboard' | 'jurnal_baru' | 'absensi' | 'kelola_kelas' | 'riwayat' | 'pengaturan';

export default function DashboardGuru({
  user,
  classes,
  journals,
  attendanceRecords,
  institutionName,
  institutionLogo,
  tapel,
  users,
  onAddClass,
  onDeleteClass,
  onSaveAttendance,
  onAddJournal,
  onUpdateJournal,
  onDeleteJournal,
  onSaveInstitution,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onLogout,
}: DashboardGuruProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Local State for Class Builder
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('X');
  const [newClassRoom, setNewClassRoom] = useState('');
  const [rawStudentList, setRawStudentList] = useState('');
  const [bulkMode, setBulkMode] = useState(true);
  const [individualStudents, setIndividualStudents] = useState<Omit<Student, 'id'>[]>([]);
  const [indivName, setIndivName] = useState('');
  const [indivGender, setIndivGender] = useState<'L' | 'P'>('L');
  const [indivNisn, setIndivNisn] = useState('');

  // Local State for Attendance Taker
  const [selectedAbsenClassId, setSelectedAbsenClassId] = useState('');
  const [selectedAbsenDate, setSelectedAbsenDate] = useState('2026-06-10');
  const [attendanceTakerForm, setAttendanceTakerForm] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});
  const [showAbsenSuccess, setShowAbsenSuccess] = useState(false);

  // Local State for Journal Form
  const [jurnalClassId, setJurnalClassId] = useState('');
  const [jurnalDate, setJurnalDate] = useState('2026-06-10');
  const [jurnalStartTime, setJurnalStartTime] = useState('07:30');
  const [jurnalEndTime, setJurnalEndTime] = useState('09:00');
  const [jurnalSubject, setJurnalSubject] = useState(user.subject || '');
  const [jurnalTopic, setJurnalTopic] = useState('');
  const [jurnalActivities, setJurnalActivities] = useState('');
  const [jurnalObstacles, setJurnalObstacles] = useState('');
  const [jurnalFollowUp, setJurnalFollowUp] = useState('');
  const [jurnalNotes, setJurnalNotes] = useState('');
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [showJurnalSuccess, setShowJurnalSuccess] = useState(false);

  // Search & Filter state for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyClassFilter, setHistoryClassFilter] = useState('ALL');

  // Filter classes belonging to this teacher
  const teacherClasses = useMemo(() => {
    return classes.filter(c => c.teacherId === user.id);
  }, [classes, user.id]);

  // Filter journals belonging to this teacher
  const teacherJournals = useMemo(() => {
    return journals
      .filter(j => j.teacherId === user.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journals, user.id]);

  // Printable Report Generation for Teacher
  const teacherPrintReport = useMemo(() => {
    const targetClassId = historyClassFilter === 'ALL' ? (teacherClasses[0]?.id || '') : historyClassFilter;
    const cls = classes.find(c => c.id === targetClassId);
    if (!cls) return null;

    const matchedJournals = teacherJournals.filter(j => historyClassFilter === 'ALL' ? true : j.kelasId === targetClassId);
    const matchedRecords = attendanceRecords.filter(r => historyClassFilter === 'ALL' ? r.recordedByTeacherId === user.id : r.kelasId === targetClassId);

    const stats = {
      hadir: matchedRecords.filter(r => r.status === 'HADIR').length,
      sakit: matchedRecords.filter(r => r.status === 'SAKIT').length,
      izin: matchedRecords.filter(r => r.status === 'IZIN').length,
      alfa: matchedRecords.filter(r => r.status === 'ALFA').length,
    };

    return {
      className: cls.name,
      roomName: cls.room,
      teacherName: user.name,
      studentCount: cls.students.length,
      totalLogs: matchedRecords.length,
      stats,
      students: cls.students,
      journals: matchedJournals,
    };
  }, [historyClassFilter, teacherClasses, classes, teacherJournals, attendanceRecords, user.name]);

  // 1. Dashboard Metrics Calculations
  const metrics = useMemo(() => {
    const totalKelas = teacherClasses.length;
    const totalSiswa = teacherClasses.reduce((sum, c) => sum + c.students.length, 0);
    const totalJurnal = teacherJournals.length;

    // Calculate Average Attendance Rate for this teacher's attendance sessions
    const myAttendanceLogs = attendanceRecords.filter(r => r.recordedByTeacherId === user.id);
    const totalRecords = myAttendanceLogs.length;
    const totalHadir = myAttendanceLogs.filter(r => r.status === 'HADIR').length;

    const avgAttendance = totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 92; // Fallback to a healthy seeded percent

    return {
      totalKelas,
      totalSiswa,
      totalJurnal,
      avgAttendance,
    };
  }, [teacherClasses, teacherJournals, attendanceRecords, user.id]);

  // Daily attendance rates for trend chart (simulating 5 days back)
  const trendChartData = useMemo(() => {
    const days = ['03/06', '04/06', '05/06', '08/06', '09/06', '10/06'];
    const myAttendanceLogs = attendanceRecords.filter(r => r.recordedByTeacherId === user.id);

    // Calculate real data if we have logs, otherwise return realistic seeded visual
    const results = days.map((dayLabel) => {
      const dateString = dayLabel === '03/06' ? '2026-06-03' :
                          dayLabel === '04/06' ? '2026-06-04' :
                          dayLabel === '05/06' ? '2026-06-05' :
                          dayLabel === '08/06' ? '2026-06-08' :
                          dayLabel === '09/06' ? '2026-06-09' : '2026-06-10';
      
      const logsOnDay = myAttendanceLogs.filter(l => l.date === dateString);
      if (logsOnDay.length > 0) {
        const hadirCount = logsOnDay.filter(l => l.status === 'HADIR').length;
        return { label: dayLabel, value: Math.round((hadirCount / logsOnDay.length) * 100) };
      }
      
      // Seeded trend averages for Pak Noer if empty
      const defaultTrend: Record<string, number> = {
        '03/06': 88,
        '04/06': 94,
        '05/06': 87,
        '08/06': 100,
        '09/06': 91,
        '10/06': 95
      };
      return { label: dayLabel, value: defaultTrend[dayLabel] || 90 };
    });

    return results;
  }, [attendanceRecords, user.id]);

  // Aggregate global status logs for teacher's student sessions
  const cumulativeStatusCounts = useMemo(() => {
    const logs = attendanceRecords.filter(r => r.recordedByTeacherId === user.id);
    if (logs.length === 0) {
      // Seed values matched with typical database logs
      return { hadir: 40, sakit: 3, izin: 2, alfa: 2 };
    }
    return {
      hadir: logs.filter(l => l.status === 'HADIR').length,
      sakit: logs.filter(l => l.status === 'SAKIT').length,
      izin: logs.filter(l => l.status === 'IZIN').length,
      alfa: logs.filter(l => l.status === 'ALFA').length,
    };
  }, [attendanceRecords, user.id]);

  // 2. Class Builder Logic
  const handleAddIndividualStudent = () => {
    if (!indivName.trim()) return;
    const finalNisn = indivNisn.trim() || `008${Math.floor(1000000 + Math.random() * 9000000)}`;
    setIndividualStudents([...individualStudents, {
      name: indivName.trim(),
      gender: indivGender,
      nisn: finalNisn
    }]);
    setIndivName('');
    setIndivNisn('');
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    let studentsToInsert: Student[] = [];

    if (bulkMode) {
      // Extract student names line-by-line
      const lines = rawStudentList.split('\n');
      lines.forEach((line, idx) => {
        const cleanName = line.trim();
        if (cleanName) {
          // Attempt to scan NISN/Gender tokens or generate default
          studentsToInsert.push({
            id: `st-${Date.now()}-${idx}`,
            name: cleanName,
            gender: Math.random() > 0.5 ? 'L' : 'P',
            nisn: `008${Math.floor(10000000 + Math.random() * 90000000)}`
          });
        }
      });
    } else {
      if (individualStudents.length === 0) {
        alert('Silakan tambahkan setidaknya satu siswa!');
        return;
      }
      studentsToInsert = individualStudents.map((st, sidx) => ({
        id: `st-${Date.now()}-${sidx}`,
        ...st
      }));
    }

    const newClass: Kelas = {
      id: `k-${Date.now()}`,
      name: `${newClassName}`,
      grade: newClassGrade,
      teacherId: user.id,
      teacherName: user.name,
      students: studentsToInsert,
      room: newClassRoom.trim() || 'Ruangan Belajar Umum'
    };

    onAddClass(newClass);

    // Reset fields
    setNewClassName('');
    setNewClassRoom('');
    setRawStudentList('');
    setIndividualStudents([]);
    setActiveTab('kelola_kelas');
  };

  // 3. Selection change for attendance taking
  const handleSelectAbsenClass = (classId: string) => {
    setSelectedAbsenClassId(classId);
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    // Load existing records if any, otherwise prefill as 'HADIR'
    const prefill: Record<string, { status: AttendanceStatus; notes: string }> = {};
    
    cls.students.forEach(st => {
      const match = attendanceRecords.find(
        r => r.kelasId === classId && r.studentId === st.id && r.date === selectedAbsenDate
      );
      prefill[st.id] = {
        status: match ? match.status : 'HADIR',
        notes: match?.notes || ''
      };
    });

    setAttendanceTakerForm(prefill);
  };

  // Trigger loading when date changes in the attendance taker
  const handleAbsenDateChange = (date: string) => {
    setSelectedAbsenDate(date);
    if (selectedAbsenClassId) {
      const cls = classes.find(c => c.id === selectedAbsenClassId);
      if (!cls) return;
      const prefill: Record<string, { status: AttendanceStatus; notes: string }> = {};
      cls.students.forEach(st => {
        const match = attendanceRecords.find(
          r => r.kelasId === selectedAbsenClassId && r.studentId === st.id && r.date === date
        );
        prefill[st.id] = {
          status: match ? match.status : 'HADIR',
          notes: match?.notes || ''
        };
      });
      setAttendanceTakerForm(prefill);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceTakerForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceTakerForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsenClassId) return;

    const recordsToSave = Object.entries(attendanceTakerForm).map(([studentId, item]) => {
      const data = item as { status: AttendanceStatus; notes: string };
      const studentName = classes.find(c => c.id === selectedAbsenClassId)?.students.find(s => s.id === studentId)?.name || 'Siswa';
      return {
        date: selectedAbsenDate,
        kelasId: selectedAbsenClassId,
        studentId,
        studentName,
        status: data.status,
        notes: data.notes
      };
    });

    onSaveAttendance(selectedAbsenDate, selectedAbsenClassId, recordsToSave);
    setShowAbsenSuccess(true);
    setTimeout(() => {
      setShowAbsenSuccess(false);
      setActiveTab('dashboard');
    }, 2000);
  };

  // 4. Smart absolute Jurnal Helper: Auto-Import from Today's Attendance logs!
  const handleAutoImportAttendance = () => {
    if (!jurnalClassId) {
      alert("Harap pilih Kelas terlebih dahulu untuk mengimpor data absensi!");
      return;
    }

    const matchedRecords = attendanceRecords.filter(
      r => r.kelasId === jurnalClassId && r.date === jurnalDate
    );

    if (matchedRecords.length === 0) {
      alert(`Tidak ada rekaman absensi yang ditemukan untuk kelas ini pada tanggal ${jurnalDate}. Silakan catat presensi di tab 'Catat Absensi' terlebih dahulu.`);
      return;
    }

    const absentList: string[] = [];
    const sickList: string[] = [];
    const permitList: string[] = [];

    matchedRecords.forEach(r => {
      if (r.status === 'SAKIT') sickList.push(r.studentName);
      if (r.status === 'IZIN') permitList.push(r.studentName);
      if (r.status === 'ALFA') absentList.push(r.studentName);
    });

    const totalStudents = matchedRecords.length;
    const hadir = totalStudents - absentList.length - sickList.length - permitList.length;

    let systemNoteLines = `Status Absensi Siswa Tanggal ${jurnalDate}:\n`;
    if (sickList.length > 0) systemNoteLines += `- Sakit: ${sickList.join(', ')}\n`;
    if (permitList.length > 0) systemNoteLines += `- Izin: ${permitList.join(', ')}\n`;
    if (absentList.length > 0) systemNoteLines += `- Alfa: ${absentList.join(', ')}\n`;
    if (sickList.length === 0 && permitList.length === 0 && absentList.length === 0) {
      systemNoteLines += `- Kehadiran penuh 100% (Semua hadir)\n`;
    }

    setJurnalNotes(prev => (prev ? prev + '\n' + systemNoteLines : systemNoteLines));
    alert(`Berhasil mengimpor! \nJumlah Hadir: ${hadir}, Sakit: ${sickList.length}, Izin: ${permitList.length}, Alfa: ${absentList.length}. Laporan dimasukkan ke kolom Catatan.`);
  };

  // Write/Update Jurnal
  const handleJurnalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jurnalClassId) return;

    const matchedClass = classes.find(c => c.id === jurnalClassId);
    if (!matchedClass) return;

    // Fetch values for summary
    const matchedRecordsOnDay = attendanceRecords.filter(
      r => r.kelasId === jurnalClassId && r.date === jurnalDate
    );

    const counts = { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
    if (matchedRecordsOnDay.length > 0) {
      matchedRecordsOnDay.forEach(r => {
        if (r.status === 'HADIR') counts.hadir++;
        else if (r.status === 'SAKIT') counts.sakit++;
        else if (r.status === 'IZIN') counts.izin++;
        else counts.alfa++;
      });
    } else {
      counts.hadir = matchedClass.students.length; // Assume clean 100% attendance if not recorded
    }

    const journalPayload: Jurnal = {
      id: editingJournalId || `j-${Date.now()}`,
      date: jurnalDate,
      startTime: jurnalStartTime,
      endTime: jurnalEndTime,
      teacherId: user.id,
      teacherName: user.name,
      kelasId: jurnalClassId,
      kelasName: matchedClass.name,
      subject: jurnalSubject,
      topic: jurnalTopic,
      activities: jurnalActivities,
      obstacles: jurnalObstacles,
      followUp: jurnalFollowUp,
      attendanceSummary: counts,
      notes: jurnalNotes,
    };

    if (editingJournalId) {
      onUpdateJournal(journalPayload);
      setEditingJournalId(null);
    } else {
      onAddJournal(journalPayload);
    }

    // Reset Form
    setJurnalTopic('');
    setJurnalActivities('');
    setJurnalObstacles('');
    setJurnalFollowUp('');
    setJurnalNotes('');
    setShowJurnalSuccess(true);

    setTimeout(() => {
      setShowJurnalSuccess(false);
      setActiveTab('riwayat');
    }, 1500);
  };

  // Load journal for editing
  const handleEditJournalTrigger = (journal: Jurnal) => {
    setEditingJournalId(journal.id);
    setJurnalClassId(journal.kelasId);
    setJurnalDate(journal.date);
    setJurnalStartTime(journal.startTime);
    setJurnalEndTime(journal.endTime);
    setJurnalSubject(journal.subject);
    setJurnalTopic(journal.topic);
    setJurnalActivities(journal.activities);
    setJurnalObstacles(journal.obstacles);
    setJurnalFollowUp(journal.followUp);
    setJurnalNotes(journal.notes || '');
    setActiveTab('jurnal_baru');
  };

  // Filtered Teacher history listing
  const filteredTeacherJournals = useMemo(() => {
    return teacherJournals.filter(j => {
      const matchesSearch = 
        j.topic.toLowerCase().includes(historySearch.toLowerCase()) || 
        j.subject.toLowerCase().includes(historySearch.toLowerCase()) ||
        j.activities.toLowerCase().includes(historySearch.toLowerCase());
      const matchesClass = historyClassFilter === 'ALL' || j.kelasId === historyClassFilter;
      return matchesSearch && matchesClass;
    });
  }, [teacherJournals, historySearch, historyClassFilter]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-slate-800 print:bg-white print:text-black print:block">
      
      {/* 1. Elegant Left Rail Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 print:hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            {institutionLogo ? (
              <img src={institutionLogo} className="w-9 h-9 object-contain bg-white rounded-xl p-1 shrink-0" alt="Logo" referrerPolicy="no-referrer" />
            ) : (
              <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-900/30">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold tracking-tight text-white text-xs block truncate uppercase" title={institutionName}>{institutionName}</span>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Wali Kelas • Portal</span>
            </div>
          </div>

          {/* Quick Profile Pill */}
          <div className="mt-6 p-3 bg-slate-800/40 rounded-xl flex items-center gap-3 border border-slate-800">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-10 h-10 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white text-xs block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 block truncate font-mono">NIP: {user.nip}</span>
            </div>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Monitor Dashboard', icon: Compass },
            { id: 'jurnal_baru', label: 'Tulis Jurnal Harian', icon: BookOpen },
            { id: 'absensi', label: 'Catat Absensi Siswa', icon: ClipboardCheck },
            { id: 'kelola_kelas', label: 'Kelas Kustom Saya', icon: Users },
            { id: 'riwayat', label: 'Arsip Buku Jurnal', icon: History },
            { id: 'pengaturan', label: 'Pengaturan Alat & Lembaga', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-link-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as ActiveTab);
                  if (tab.id !== 'jurnal_baru') setEditingJournalId(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Logout Trigger at the bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button
            onClick={onLogout}
            id="btn-logout"
            className="w-full flex items-center justify-between text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Keluar Sesi
            </span>
            <span className="text-[9px] font-mono opacity-60">ESC</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0 print:block">
        
        {/* Header toolbar */}
        <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 sm:px-8 shrink-0 print:hidden">
          <div>
            <h3 className="text-sm font-black text-slate-800">
              {activeTab === 'dashboard' && 'Dashboard Analitis Guru'}
              {activeTab === 'jurnal_baru' && (editingJournalId ? 'Edit Jurnal Pembelajaran' : 'Formulir Jurnal Baru')}
              {activeTab === 'absensi' && 'Input Absensi Siswa Kelas'}
              {activeTab === 'kelola_kelas' && 'Pusat Manajemen Kelas Kustom'}
              {activeTab === 'riwayat' && 'Galeri Histori Penjurnalan'}
              {activeTab === 'pengaturan' && 'Pengaturan Lembaga & Guru'}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {user.subject ? `${user.subject} • Wali Sesi Akademik` : 'Manajemen Akademik'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tahun Pelajaran: {tapel}
            </span>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible print:block">
          
          {/* Printable Report Layout - Visible ONLY on browser print */}
          {teacherPrintReport && (
            <div className="hidden print:block space-y-6 text-black bg-white">
              <div className="text-center pb-4 border-b-2 border-double border-slate-900">
                <h2 className="text-xl font-bold uppercase tracking-tight">KEMENTERIAN PENDIDIKAN DAN KEBUDAYAAN</h2>
                <h1 className="text-2xl font-black uppercase text-slate-900">{institutionName}</h1>
                <p className="text-xs">Ulasan Penilaian Kelas Kustom &amp; Jurnal Mengajar • Tahun Pelajaran {tapel}</p>
                <p className="text-[10px] font-mono mt-1 font-semibold">Gedung Utama Pembelajaran • Dicetak Mandiri oleh Wali Kelas</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 text-xs border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <span><strong>KELAS TARGET:</strong> {teacherPrintReport.className}</span><br />
                    <span><strong>MATA PELAJARAN:</strong> Umum &amp; Kejuruan</span><br />
                    <span><strong>RUANG BELAJAR:</strong> {teacherPrintReport.roomName}</span>
                  </div>
                  <div className="text-right">
                    <span><strong>WALI KELAS / GURU:</strong> {teacherPrintReport.teacherName}</span><br />
                    <span><strong>PERIODE LAPORAN:</strong> Sesi Akademik Berjalan ({tapel})</span><br />
                    <span><strong>SAMPEL SISWA:</strong> {teacherPrintReport.studentCount} Siswa</span>
                  </div>
                </div>

                {/* High level stats block */}
                <div className="grid grid-cols-4 border border-slate-800 p-2.5 rounded-xs text-xs text-center font-bold">
                  <div className="border-r border-slate-300">
                    <span className="text-[9px] text-slate-500 uppercase block">Rasio Kehadiran</span>
                    <span className="text-sm font-black font-mono">
                      {teacherPrintReport.stats.hadir + teacherPrintReport.stats.sakit > 0 
                        ? Math.round((teacherPrintReport.stats.hadir / (teacherPrintReport.totalLogs || 1)) * 100)
                        : 100}%
                    </span>
                  </div>
                  <div className="border-r border-slate-300">
                    <span className="text-[9px] text-emerald-600 uppercase block">Siswa Hadir</span>
                    <span className="text-sm font-mono text-emerald-800">{teacherPrintReport.stats.hadir} Log</span>
                  </div>
                  <div className="border-r border-slate-300">
                    <span className="text-[9px] text-amber-600 uppercase block">Sakit / Izin</span>
                    <span className="text-sm font-mono text-amber-800">{teacherPrintReport.stats.sakit + teacherPrintReport.stats.izin} Log</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-rose-600 uppercase block">Alasan Alfa</span>
                    <span className="text-sm font-mono text-rose-800">{teacherPrintReport.stats.alfa} Sesi</span>
                  </div>
                </div>

                {/* Printed Student lists */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider block">Daftar Rekapitulasi Siswa</span>
                  <table className="w-full text-left text-[10px] border border-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 font-bold">
                        <th className="p-1 px-2 border-r border-slate-200 w-12">No</th>
                        <th className="p-1 px-2 border-r border-slate-200">Nama Siswa</th>
                        <th className="p-1 px-2 border-r border-slate-200">NISN</th>
                        <th className="p-1 px-2">Kelamin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherPrintReport.students.map((st, sidx) => (
                        <tr key={st.id} className="border-b border-slate-200">
                          <td className="p-1 px-2 border-r border-slate-200 font-mono">{sidx + 1}</td>
                          <td className="p-1 px-2 border-r border-slate-200 font-bold">{st.name}</td>
                          <td className="p-1 px-2 border-r border-slate-200 font-mono">{st.nisn}</td>
                          <td className="p-1 px-2">{st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Printed Journal lines */}
                <div className="space-y-2 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider block">Lembar Rekap Buku Jurnal Mengajar</span>
                  <table className="w-full text-left text-[9px] border border-slate-300 border-collapse leading-normal">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                        <th className="p-1.5 px-2 border-r border-slate-200 w-16">Tanggal</th>
                        <th className="p-1.5 px-2 border-r border-slate-200 w-28">Pendidik / Mapel</th>
                        <th className="p-1.5 px-2 border-r border-slate-200">Pokok Bahasan / Topik</th>
                        <th className="p-1.5 px-2 border-r border-slate-200">Alur Aktivitas KBM</th>
                        <th className="p-1.5 px-2">Hambatan &amp; Tindak Lanjut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherPrintReport.journals.map((j) => (
                        <tr key={j.id} className="border-b border-slate-200 align-top">
                          <td className="p-1.5 px-2 border-r border-slate-200 font-mono font-bold whitespace-nowrap">{j.date}</td>
                          <td className="p-1.5 px-2 border-r border-slate-200">
                            <span className="font-bold block">{j.teacherName}</span>
                            <span className="text-slate-500 font-semibold">{j.subject}</span>
                          </td>
                          <td className="p-1.5 px-2 border-r border-slate-200 font-bold">{j.topic}</td>
                          <td className="p-1.5 px-2 border-r border-slate-200 text-slate-700">{j.activities}</td>
                          <td className="p-1.5 px-2">
                            {j.obstacles && <div className="text-rose-900"><strong>Kendala:</strong> {j.obstacles}</div>}
                            {j.followUp && <div className="text-teal-900"><strong>Tindak Lanjut:</strong> {j.followUp}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Stamp of signatures */}
                <div className="pt-12 grid grid-cols-2 text-xs text-center gap-12 pt-16">
                  <div>
                    <span>Mengetahui Wali Kelas</span>
                    <div className="h-16" />
                    <span className="font-bold underline block">{teacherPrintReport.teacherName}</span>
                    <span>NIP. 198004122005011003</span>
                  </div>
                  <div>
                    <span>Kepala Sekolah Hebat,</span>
                    <div className="h-16" />
                    <span className="font-bold underline block">Dr. H. Ahmad Dahlan, M.Pd.</span>
                    <span>NIP. 197405232001121002</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular sidebar/screen content wrapped for print omission */}
          <div className="print:hidden space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* TAB 1: TEACHER DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Banner/Welcome widget */}
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative z-10 space-y-1.5">
                      <div className="text-[10px] font-bold text-teal-300 uppercase tracking-widest bg-emerald-950/40 w-fit px-2.5 py-1 rounded-md">
                        IKHTISAR TERUPDATE
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Halo, {user.name}
                      </h2>
                      <p className="text-xs text-teal-100 leading-relaxed max-w-xl">
                        Hari ini adalah tanggal 10 Juni 2026. Anda telah mengunggah sejumlah {metrics.totalJurnal} jurnal di kelas Anda minggu ini. Kehadiran siswa rata-rata sangat baik.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('jurnal_baru')}
                      className="relative z-10 shrink-0 bg-white hover:bg-teal-50 text-teal-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-teal-700" />
                      Tulis Jurnal Baru
                    </button>
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-teal-600/20 rounded-full filter blur-xl translate-x-10 translate-y-10" />
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard 
                      title="Kelas Pengampu" 
                      value={metrics.totalKelas} 
                      sub="Kelas Kustom Anda" 
                      icon={Users} 
                      iconColor="bg-teal-50 text-teal-700" 
                    />
                    <MetricCard 
                      title="Siswa Terdaftar" 
                      value={metrics.totalSiswa} 
                      sub="Siswa di semua kelas Anda" 
                      icon={Plus} 
                      iconColor="bg-sky-50 text-sky-700" 
                    />
                    <MetricCard 
                      title="Jurnal Terbit" 
                      value={metrics.totalJurnal} 
                      sub="Buku jurnal terisi" 
                      icon={BookOpen} 
                      iconColor="bg-emerald-50 text-emerald-700" 
                    />
                    <MetricCard 
                      title="Rata Rerata Absen" 
                      value={`${metrics.avgAttendance}%`} 
                      sub="Tingkat kehadiran kumulatif" 
                      icon={ClipboardCheck} 
                      iconColor="bg-amber-50 text-amber-700" 
                    />
                  </div>

                  {/* Graphs section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                      <AttendanceTrendChart data={trendChartData} title="Statistik Presensi Belajar" />
                    </div>
                    <div className="lg:col-span-4">
                      <AttendanceSummaryDonut
                        hadir={cumulativeStatusCounts.hadir}
                        sakit={cumulativeStatusCounts.sakit}
                        izin={cumulativeStatusCounts.izin}
                        alfa={cumulativeStatusCounts.alfa}
                      />
                    </div>
                  </div>

                  {/* Classroom Quick Lists */}
                  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Daftar Kelas Kustom Saya</h4>
                        <p className="text-xs text-slate-500">Kelas yang Anda ampu dan wali kelas</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('kelola_kelas')}
                        className="text-xs text-teal-600 hover:text-teal-800 font-bold"
                      >
                        Kelola Kelas →
                      </button>
                    </div>

                    {teacherClasses.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-xs text-slate-500 font-medium">Belum ada kelas kustom. Mulai buat kelas baru!</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {teacherClasses.map((cls) => (
                          <div 
                            key={cls.id} 
                            className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 hover:shadow-xs transition-all relative flex flex-col justify-between h-32"
                          >
                            <span className="absolute top-4 right-4 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {cls.room || 'R-Umum'}
                            </span>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Grade {cls.grade}</span>
                              <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{cls.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span className="text-slate-500 font-medium">{cls.students.length} Siswa Terdaftar</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAbsenClassId(cls.id);
                                    handleAbsenDateChange(selectedAbsenDate);
                                    setActiveTab('absensi');
                                  }}
                                  className="text-[10px] bg-teal-600 hover:bg-teal-750 text-white font-bold px-2 py-1 rounded-sm"
                                >
                                  Absen
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setJurnalClassId(cls.id);
                                    setActiveTab('jurnal_baru');
                                  }}
                                  className="text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-2 py-1 rounded-sm"
                                >
                                  Jurnal
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: WRITE NEW DAILY LESSON JOURNAL */}
              {activeTab === 'jurnal_baru' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800">
                        {editingJournalId ? 'Ubah Rincian Jurnal Pembelajaran' : 'Tulis Jurnal Mengajar Harian'}
                      </h4>
                      <p className="text-xs text-slate-500">Catat isi materi, jam ajar, dan status absensi kelas saat kBM berlangsung.</p>
                    </div>
                    {editingJournalId && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Sesi Edit Jurnal
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleJurnalSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Class Selection & Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Pilih Kelas Sasaran</label>
                        <select
                          required
                          value={jurnalClassId}
                          onChange={(e) => setJurnalClassId(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
                        >
                          <option value="">-- Hubungkan dengan Kelas --</option>
                          {teacherClasses.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Tanggal KBM</label>
                        <input
                          type="date"
                          required
                          value={jurnalDate}
                          onChange={(e) => setJurnalDate(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* Lesson duration */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Jam Mulai Kelas</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 07:30"
                          value={jurnalStartTime}
                          onChange={(e) => setJurnalStartTime(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Jam Selesai Kelas</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 09:00"
                          value={jurnalEndTime}
                          onChange={(e) => setJurnalEndTime(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Mata Pelajaran</label>
                        <input
                          type="text"
                          required
                          value={jurnalSubject}
                          onChange={(e) => setJurnalSubject(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Pokok Pembahasan / Topik Pembelajaran</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Pembiasan cahaya pada optika, Integral parsial dan trigonometri"
                          value={jurnalTopic}
                          onChange={(e) => setJurnalTopic(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* Detailed Fields */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Proses Kegiatan KBM</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Jelaskan alur, tugas, metode pembelajaran kelompok, dan pencapaian indikator hari ini..."
                          value={jurnalActivities}
                          onChange={(e) => setJurnalActivities(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Hambatan / Kendala Kelas</label>
                          <textarea
                            rows={2}
                            placeholder="Tulis kendala (koneksi jaringan, proyektor mati, ada siswa yang gaduh, dsb)..."
                            value={jurnalObstacles}
                            onChange={(e) => setJurnalObstacles(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.2 text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Solusi / Tindak Lanjut</label>
                          <textarea
                            rows={2}
                            placeholder="Solusi penanganan instan atau PR rujukan..."
                            value={jurnalFollowUp}
                            onChange={(e) => setJurnalFollowUp(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.2 text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Absen smart connection */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-2.5">
                          <Sparkles className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Sambungkan Data Presensi Hari Ini</span>
                            <span className="text-[11px] text-slate-500 block">Impor data ketidakhadiran siswa dari log absensi harian secara instan.</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoImportAttendance}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-teal-700 font-bold px-3 py-2 rounded-xl text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          Sinkron Mandiri Absensi
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">Catatan Tambahan & Absensi</label>
                        <textarea
                          rows={3}
                          placeholder="Penyakit khusus siswa atau masukan pimpinan kelas..."
                          value={jurnalNotes}
                          onChange={(e) => setJurnalNotes(e.target.value)}
                          className="w-full font-mono text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-500 bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Progress Success Indicators */}
                    {showJurnalSuccess && (
                      <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Jurnal berhasil disimpan dan diarsip! Mengalihkan ke Buku Jurnal...
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
                      {editingJournalId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingJournalId(null);
                            setActiveTab('riwayat');
                          }}
                          className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                        >
                          Batal Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        id="btn-save-journal"
                        name="submit"
                        className="bg-teal-700 hover:bg-teal-850 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        {editingJournalId ? 'Perbarui Jurnal' : 'Simpan Jurnal KBM'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ATTENDANCE STUDENT MANAGER */}
              {activeTab === 'absensi' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800">Papan Presensi Siswa Harian</h4>
                    <p className="text-xs text-slate-500">Pilih kelas pengampu kustom Anda dan catat status kehadiran siswa.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Pilih Kelas</label>
                      <select
                        value={selectedAbsenClassId}
                        onChange={(e) => handleSelectAbsenClass(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {teacherClasses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Tanggal Sesi</label>
                      <input
                        type="date"
                        value={selectedAbsenDate}
                        onChange={(e) => handleAbsenDateChange(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {selectedAbsenClassId ? (
                    <form onSubmit={handleSaveAttendanceSubmit} className="space-y-6">
                      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                              <th className="py-3.5 px-4 w-12">No</th>
                              <th className="py-3.5 px-4">Siswa</th>
                              <th className="py-3.5 px-4 w-40">NISN / Kelamin</th>
                              <th className="py-3.5 px-4 w-60">Status Absen</th>
                              <th className="py-3.5 px-4">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classes.find(c => c.id === selectedAbsenClassId)?.students.map((st, sidx) => {
                              const curr = attendanceTakerForm[st.id] || { status: 'HADIR', notes: '' };
                              return (
                                <tr key={st.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                                  <td className="py-3 px-4 font-mono font-bold text-slate-400">{sidx + 1}</td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-slate-800 block text-sm">{st.name}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-mono text-[10px] block font-semibold text-slate-400">NISN: {st.nisn}</span>
                                    <span className="text-[10px] text-slate-500 font-semibold">{st.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex gap-1">
                                      {(['HADIR', 'SAKIT', 'IZIN', 'ALFA'] as AttendanceStatus[]).map((stt) => {
                                        const isSelected = curr.status === stt;
                                        return (
                                          <button
                                            key={stt}
                                            type="button"
                                            onClick={() => handleStatusChange(st.id, stt)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                                              isSelected
                                                ? stt === 'HADIR' ? 'bg-emerald-600 text-white shadow-xs' :
                                                  stt === 'SAKIT' ? 'bg-amber-500 text-white' :
                                                  stt === 'IZIN' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                          >
                                            {stt === 'HADIR' && 'H'}
                                            {stt === 'SAKIT' && 'S'}
                                            {stt === 'IZIN' && 'I'}
                                            {stt === 'ALFA' && 'A'}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <input
                                      type="text"
                                      placeholder="Catat keterangan..."
                                      value={curr.notes}
                                      onChange={(e) => handleNotesChange(st.id, e.target.value)}
                                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-teal-500 text-xs text-slate-700 bg-white"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {showAbsenSuccess && (
                        <div className="p-4 bg-emerald-50 text-emerald-850 rounded-xl text-xs font-bold">
                          ✓ Sesi presensi berhasil direkam! Menyinkronkan ke piringan database lokal sekolah...
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-slate-400" />
                          <span>Pilih inisial huruf untuk mengubah kehadiran siswa harian.</span>
                        </div>
                        <button
                          type="submit"
                          id="btn-save-attendance"
                          className="bg-teal-700 hover:bg-teal-850 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Simpan Lembar Presensi
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <h5 className="font-bold text-slate-700 text-sm">Pilih Kelas di Atas</h5>
                      <p className="text-xs text-slate-400 mt-1">Gunakan drop-down kelas untuk memuat daftar nama siswa pengampu Anda.</p>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: CUSTOM CLASSROOM MANAGER */}
              {activeTab === 'kelola_kelas' && (
                <div className="space-y-6">
                  
                  {/* Create New Class Section Accordion Toggle Header */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider block">Registrasi Kelas Baru (Kustom)</h4>
                      <p className="text-xs text-slate-500">Mulai buat kelas baru dan daftarkan siswanya secara mandiri.</p>
                    </div>

                    <form onSubmit={handleCreateClass} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Nama Identitas Kelas</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Kelas X - IPA 1, Kelas XI - IPS 2"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Tingkat Grade</label>
                          <select
                            value={newClassGrade}
                            onChange={(e) => setNewClassGrade(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
                          >
                            <option value="X">Tingkat X (Sepuluh)</option>
                            <option value="XI">Tingkat XI (Sebelas)</option>
                            <option value="XII">Tingkat XII (Duabelas)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Ruangan Belajar / Lab</label>
                          <input
                            type="text"
                            placeholder="Contoh: Lab Fisika Utama"
                            value={newClassRoom}
                            onChange={(e) => setNewClassRoom(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">Metode Input Anggota Siswa</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setBulkMode(true)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                                bulkMode ? 'bg-teal-700 text-white shadow-xs' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Salin-Tempel Massal (Rekomendasi)
                            </button>
                            <button
                              type="button"
                              onClick={() => setBulkMode(false)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                                !bulkMode ? 'bg-teal-700 text-white shadow-xs' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Satu per Satu
                            </button>
                          </div>
                        </div>

                        {bulkMode ? (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 block">Daftar Nama Siswa (Satu nama per baris)</label>
                            <textarea
                              rows={4}
                              required={bulkMode}
                              placeholder="Fajar Nugroho&#10;Citra Amelia&#10;Bagus Setyawan&#10;Indah Cahyani"
                              value={rawStudentList}
                              onChange={(e) => setRawStudentList(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-teal-500 bg-white leading-relaxed font-sans"
                            />
                            <p className="text-[10px] text-slate-400">Gender dan NISN fiktif siswa akan diatur otomatis demi kemudahan pendaftaran.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <input
                                type="text"
                                placeholder="Nama Lengkap Siswa"
                                value={indivName}
                                onChange={(e) => setIndivName(e.target.value)}
                                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-teal-500"
                              />
                              <select
                                value={indivGender}
                                onChange={(e) => setIndivGender(e.target.value as 'L' | 'P')}
                                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                              >
                                <option value="L">Laki-laki (L)</option>
                                <option value="P">Perempuan (P)</option>
                              </select>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="NISN (Opsional)"
                                  value={indivNisn}
                                  onChange={(e) => setIndivNisn(e.target.value)}
                                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddIndividualStudent}
                                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold p-1 px-3 rounded-lg text-xs"
                                >
                                  Tambah
                                </button>
                              </div>
                            </div>

                            {/* Added student list */}
                            {individualStudents.length > 0 && (
                              <div className="bg-white border border-slate-200 p-3 rounded-xl max-h-36 overflow-y-auto space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Siswa dalam Daftar Tunggu ({individualStudents.length})</span>
                                {individualStudents.map((st, iidx) => (
                                  <div key={iidx} className="flex justify-between items-center text-xs text-slate-700 py-1 border-b border-slate-100 last:border-0 font-medium">
                                    <span>{iidx + 1}. {st.name} • <span className="text-[10px] text-slate-400 font-mono">{st.nisn} ({st.gender})</span></span>
                                    <button
                                      type="button"
                                      onClick={() => setIndividualStudents(individualStudents.filter((_, i) => i !== iidx))}
                                      className="text-rose-500 text-[10px] font-bold"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          id="submit-class-builder"
                          className="bg-teal-700 hover:bg-teal-850 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Daftarkan Kelas & Siswa
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Classes Card Grid */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Database Kelas Anda</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teacherClasses.map((cls) => (
                        <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
                          <header className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Tingkat {cls.grade} • Ruangan: {cls.room || 'X'}</span>
                              <h5 className="font-extrabold text-slate-800 text-sm">{cls.name}</h5>
                            </div>
                            <button
                              type="button"
                              id={`btn-delete-class-${cls.id}`}
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus ${cls.name}? Kontak absensi dan relasi jurnal kelas ini akan dihapus permanen.`)) {
                                  onDeleteClass(cls.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </header>
                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Siswa Terdaftar ({cls.students.length})</span>
                            <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50/50 space-y-1">
                              {cls.students.map((st, sidx) => (
                                <div key={st.id} className="flex justify-between text-xs text-slate-600 font-medium py-0.5">
                                  <span className="truncate">{sidx + 1}. {st.name}</span>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">NISN: {st.nisn} ({st.gender})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: HISTORICAL JOURNALS (SEARCH & EDIT) */}
              {activeTab === 'riwayat' && (
                <div className="space-y-4">
                  {/* Search/Header bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center print:hidden">
                    <div className="w-full sm:w-80 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Cari topik pembelajaran, mapel..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 bg-white"
                      />
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2.5 items-center">
                      <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">Filter Kelas</span>
                      <select
                        value={historyClassFilter}
                        onChange={(e) => setHistoryClassFilter(e.target.value)}
                        className="w-full sm:w-48 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none bg-white"
                      >
                        <option value="ALL">Semua Kelas</option>
                        {teacherClasses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cetak & Ekspor Jurnal Absensi panel card */}
                  <div className="bg-gradient-to-r from-teal-50/50 to-emerald-50/30 border border-teal-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-teal-700 font-bold" />
                        <h4 className="text-sm font-extrabold text-slate-800">Ekspor Laporan Cetak Pembelajaran &amp; Presensi</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Unduh kelengkapan berkas jurnal mengajar harian dan rekapitulasi data presensi siswa untuk kelas <span className="text-teal-800 font-bold">
                          {historyClassFilter === 'ALL' ? 'Semua Kelas Pengampu' : (classes.find(c => c.id === historyClassFilter)?.name || 'Kelas')}
                        </span>.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => {
                          const targetClassId = historyClassFilter === 'ALL' ? (teacherClasses[0]?.id || '') : historyClassFilter;
                          const cls = classes.find(c => c.id === targetClassId);
                          const matchedJournals = teacherJournals.filter(j => historyClassFilter === 'ALL' ? true : j.kelasId === targetClassId);
                          const matchedRecords = attendanceRecords.filter(r => historyClassFilter === 'ALL' ? r.recordedByTeacherId === user.id : r.kelasId === targetClassId);
                          const targetStudents = cls ? cls.students : teacherClasses.flatMap(c => c.students);
                          
                          exportJurnalAbsensiToExcel({
                            className: cls ? cls.name : 'Semua_Kelas',
                            teacherName: user.name,
                            tapel,
                            journals: matchedJournals,
                            students: targetStudents,
                            attendanceRecords: matchedRecords,
                            institutionName,
                          });
                        }}
                        className="bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors flex-1 md:flex-initial justify-center"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Excel (.xls)
                      </button>
                      <button
                        onClick={() => {
                          const targetClassId = historyClassFilter === 'ALL' ? (teacherClasses[0]?.id || '') : historyClassFilter;
                          const cls = classes.find(c => c.id === targetClassId);
                          const matchedJournals = teacherJournals.filter(j => historyClassFilter === 'ALL' ? true : j.kelasId === targetClassId);
                          const matchedRecords = attendanceRecords.filter(r => historyClassFilter === 'ALL' ? r.recordedByTeacherId === user.id : r.kelasId === targetClassId);
                          const targetStudents = cls ? cls.students : teacherClasses.flatMap(c => c.students);
                          
                          exportJurnalAbsensiToWord({
                            className: cls ? cls.name : 'Semua_Kelas',
                            teacherName: user.name,
                            tapel,
                            journals: matchedJournals,
                            students: targetStudents,
                            attendanceRecords: matchedRecords,
                            institutionName,
                          });
                        }}
                        className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors flex-1 md:flex-initial justify-center"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        Word (.doc)
                      </button>
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="bg-teal-700 hover:bg-teal-850 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors flex-1 md:flex-initial justify-center"
                      >
                        <Printer className="w-4 h-4" />
                        Cetak PDF / Laporan
                      </button>
                    </div>
                  </div>

                  {/* History List */}
                  {filteredTeacherJournals.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                      <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <h5 className="font-bold text-slate-700 text-sm">Arsip Jurnal Kosong</h5>
                      <p className="text-xs text-slate-400 mt-1">Tidak ditemukan jurnal mengajar yang sesuai dengan filter pencarian.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTeacherJournals.map((j) => (
                        <div key={j.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 hover:shadow-xs transition-shadow space-y-4 relative">
                          
                          {/* Top row */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-50 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border border-emerald-100">
                                  {j.kelasName}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {j.date}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                                  <Clock className="w-3.5 h-3.5" />
                                  {j.startTime}-{j.endTime}
                                </span>
                              </div>
                              <h4 className="text-base font-extrabold text-slate-800 mt-1">{j.topic}</h4>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{j.subject}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                id={`btn-edit-journal-${j.id}`}
                                onClick={() => handleEditJournalTrigger(j)}
                                className="text-slate-500 hover:text-teal-600 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100 cursor-pointer text-xs flex items-center gap-1 font-bold"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                id={`btn-delete-journal-${j.id}`}
                                onClick={() => {
                                  if (confirm('Apakah Anda benar-benar ingin menghapus jurnal harian mengajar ini secara absolut?')) {
                                    onDeleteJournal(j.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors border border-slate-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Body details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Alur Kegiatan KBM</span>
                              <p className="text-slate-700 leading-relaxed font-medium">{j.activities}</p>
                            </div>
                            <div className="space-y-3.5">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl space-y-0.5">
                                  <span className="font-bold text-rose-800 text-[10px] uppercase block">Kendala / Rintangan</span>
                                  <p className="text-rose-950 font-semibold leading-relaxed">{j.obstacles || '-'}</p>
                                </div>
                                <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl space-y-0.5">
                                  <span className="font-bold text-teal-800 text-[10px] uppercase block">Tindak Lanjut</span>
                                  <p className="text-teal-950 font-semibold leading-relaxed">{j.followUp || '-'}</p>
                                </div>
                              </div>

                              {/* Student summary attendance */}
                              <div className="flex gap-3 justify-between items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-500 text-[10px] uppercase">Rangkuman Sesi</span>
                                <div className="flex gap-2 font-mono text-[10px] font-bold">
                                  <span className="text-emerald-700">HADIR: {j.attendanceSummary?.hadir || 0}</span>
                                  <span className="text-amber-700">SAKIT: {j.attendanceSummary?.sakit || 0}</span>
                                  <span className="text-blue-700">IZIN: {j.attendanceSummary?.izin || 0}</span>
                                  <span className="text-rose-700">ALFA: {j.attendanceSummary?.alfa || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {j.notes && (
                            <div className="p-3 bg-slate-100/40 rounded-xl text-[11px] font-mono text-slate-600 border border-slate-150 leading-relaxed white-space-pre-wrap">
                              <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 block mb-1">Catatan Tambahan Presensi</span>
                              {j.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pengaturan' && (
                <Pengaturan
                  institutionName={institutionName}
                  institutionLogo={institutionLogo}
                  tapel={tapel}
                  users={users}
                  onSaveInstitution={onSaveInstitution}
                  onAddTeacher={onAddTeacher}
                  onUpdateTeacher={onUpdateTeacher}
                  onDeleteTeacher={onDeleteTeacher}
                />
              )}

            </motion.div>
          </AnimatePresence>
          </div>
        </main>
      </div>

    </div>
  );
}
