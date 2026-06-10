/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Kelas, Jurnal, AttendanceRecord } from './types';
import { DEFAULT_CLASSES, SEEDED_JOURNALS, generateHistoricalAttendance, USERS } from './utils/dummyData';
import Login from './components/Login';
import DashboardGuru from './components/DashboardGuru';
import DashboardKepsek from './components/DashboardKepsek';
import { ClipboardList, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [journals, setJournals] = useState<Jurnal[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [institutionName, setInstitutionName] = useState('SMA Negeri 1 Jakarta');
  const [institutionLogo, setInstitutionLogo] = useState('https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Kementerian_Pendidikan_dan_Kebudayaan.png');
  const [tapel, setTapel] = useState('2025/2026 - Genap');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 1. Initial State Hydration from LocalStorage with fallback seed files
  useEffect(() => {
    try {
      const cachedUser = localStorage.getItem('sitj_current_user');
      if (cachedUser) {
        setCurrentUser(JSON.parse(cachedUser));
      }

      const cachedClasses = localStorage.getItem('sitj_classes');
      if (cachedClasses) {
        setClasses(JSON.parse(cachedClasses));
      } else {
        setClasses(DEFAULT_CLASSES);
        localStorage.setItem('sitj_classes', JSON.stringify(DEFAULT_CLASSES));
      }

      const cachedJournals = localStorage.getItem('sitj_journals');
      if (cachedJournals) {
        setJournals(JSON.parse(cachedJournals));
      } else {
        setJournals(SEEDED_JOURNALS);
        localStorage.setItem('sitj_journals', JSON.stringify(SEEDED_JOURNALS));
      }

      const cachedRecords = localStorage.getItem('sitj_attendance_records');
      if (cachedRecords) {
        setAttendanceRecords(JSON.parse(cachedRecords));
      } else {
        const seededRecords = generateHistoricalAttendance();
        setAttendanceRecords(seededRecords);
        localStorage.setItem('sitj_attendance_records', JSON.stringify(seededRecords));
      }

      const cachedUsers = localStorage.getItem('sitj_users');
      if (cachedUsers) {
        setUsers(JSON.parse(cachedUsers));
      } else {
        setUsers(USERS);
        localStorage.setItem('sitj_users', JSON.stringify(USERS));
      }

      const cachedInstName = localStorage.getItem('sitj_institution_name');
      if (cachedInstName) {
        setInstitutionName(cachedInstName);
      } else {
        localStorage.setItem('sitj_institution_name', 'SMA Negeri 1 Jakarta');
      }

      const cachedInstLogo = localStorage.getItem('sitj_institution_logo');
      if (cachedInstLogo) {
        setInstitutionLogo(cachedInstLogo);
      } else {
        localStorage.setItem('sitj_institution_logo', 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Kementerian_Pendidikan_dan_Kebudayaan.png');
      }

      const cachedTapel = localStorage.getItem('sitj_tapel');
      if (cachedTapel) {
        setTapel(cachedTapel);
      } else {
        localStorage.setItem('sitj_tapel', '2025/2026 - Genap');
      }
    } catch (e) {
      console.error('Error loading localStorage variables, falling back to offline defaults', e);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  // 2. Global state synchronizers with localStorage
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sitj_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sitj_current_user');
  };

  const handleAddClass = (newClass: Kelas) => {
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem('sitj_classes', JSON.stringify(updated));
  };

  const handleDeleteClass = (classId: string) => {
    const updated = classes.filter(c => c.id !== classId);
    setClasses(updated);
    localStorage.setItem('sitj_classes', JSON.stringify(updated));

    // Cleanup related attendance
    const filteredRecords = attendanceRecords.filter(r => r.kelasId !== classId);
    setAttendanceRecords(filteredRecords);
    localStorage.setItem('sitj_attendance_records', JSON.stringify(filteredRecords));

    // Cleanup related journals
    const filteredJournals = journals.filter(j => j.kelasId !== classId);
    setJournals(filteredJournals);
    localStorage.setItem('sitj_journals', JSON.stringify(filteredJournals));
  };

  const handleSaveAttendance = (
    date: string, 
    classId: string, 
    records: Omit<AttendanceRecord, 'id' | 'recordedByTeacherId'>[]
  ) => {
    // Remove existing ones on that date & class first (to avoid double entry)
    const filtered = attendanceRecords.filter(
      r => !(r.date === date && r.kelasId === classId)
    );

    const mapped = records.map((r, idx) => ({
      ...r,
      id: `att-${classId}-${r.studentId}-${date}-${Date.now()}`,
      recordedByTeacherId: currentUser?.id || 'u1'
    }));

    const finalRecords = [...filtered, ...mapped];
    setAttendanceRecords(finalRecords);
    localStorage.setItem('sitj_attendance_records', JSON.stringify(finalRecords));
  };

  const handleAddJournal = (newJurnal: Jurnal) => {
    const updated = [newJurnal, ...journals];
    setJournals(updated);
    localStorage.setItem('sitj_journals', JSON.stringify(updated));
  };

  const handleUpdateJournal = (updatedJurnal: Jurnal) => {
    const updated = journals.map(j => j.id === updatedJurnal.id ? updatedJurnal : j);
    setJournals(updated);
    localStorage.setItem('sitj_journals', JSON.stringify(updated));
  };

  const handleDeleteJournal = (journalId: string) => {
    const updated = journals.filter(j => j.id !== journalId);
    setJournals(updated);
    localStorage.setItem('sitj_journals', JSON.stringify(updated));
  };

  const handleSaveInstitution = (name: string, logo: string, year: string) => {
    setInstitutionName(name);
    setInstitutionLogo(logo);
    setTapel(year);
    localStorage.setItem('sitj_institution_name', name);
    localStorage.setItem('sitj_institution_logo', logo);
    localStorage.setItem('sitj_tapel', year);
  };

  const handleAddTeacher = (newTeacher: User) => {
    const updated = [...users, newTeacher];
    setUsers(updated);
    localStorage.setItem('sitj_users', JSON.stringify(updated));
  };

  const handleUpdateTeacher = (updatedTeacher: User) => {
    const updated = users.map(u => u.id === updatedTeacher.id ? updatedTeacher : u);
    setUsers(updated);
    localStorage.setItem('sitj_users', JSON.stringify(updated));

    // Also sync the current logged in profile if matches
    if (currentUser && currentUser.id === updatedTeacher.id) {
      setCurrentUser(updatedTeacher);
      localStorage.setItem('sitj_current_user', JSON.stringify(updatedTeacher));
    }
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const updated = users.filter(u => u.id !== teacherId);
    setUsers(updated);
    localStorage.setItem('sitj_users', JSON.stringify(updated));

    if (currentUser && currentUser.id === teacherId) {
      handleLogout();
    }
  };

  // Reset helper for easy sandbox play
  const handleResetSimulator = () => {
    if (confirm('Apakah Anda ingin memulihkan seluruh data simulasi sekolah ke keadaan awal semula?')) {
      localStorage.clear();
      setClasses(DEFAULT_CLASSES);
      setJournals(SEEDED_JOURNALS);
      setAttendanceRecords(generateHistoricalAttendance());
      setUsers(USERS);
      setInstitutionName('SMA Negeri 1 Jakarta');
      setInstitutionLogo('https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Kementerian_Pendidikan_dan_Kebudayaan.png');
      setTapel('2025/2026 - Genap');
      setCurrentUser(null);
      alert('Sistem berhasil dipulihkan!');
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Menyelesaikan loading data sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-teal-100 bg-slate-50/50 print:bg-white text-slate-800">
      
      {/* Simulation Reset Banner - Hidden on print */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[10px] sm:text-xs font-semibold flex flex-col sm:flex-row justify-between items-center border-b border-slate-800 gap-2 print:hidden shrink-0 select-none">
        <span className="flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          <span>PORTAL AKADEMIK GURU — Live Sandbox Simulator</span>
        </span>
        <div className="flex gap-4 items-center">
          <span className="text-slate-400 hidden sm:inline">Penyimpanan: Layanan LocalDisk Perangkat (Aktif)</span>
          <button
            onClick={handleResetSimulator}
            className="bg-slate-850 hover:bg-slate-800 text-teal-400 font-bold px-3 py-0.5 rounded-md text-[10px] border border-slate-700 cursor-pointer"
          >
            Pulihkan Database Awal
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {!currentUser ? (
          <Login onLogin={handleLogin} users={users} />
        ) : currentUser.role === 'GURU' ? (
          <DashboardGuru
            user={currentUser}
            classes={classes}
            journals={journals}
            attendanceRecords={attendanceRecords}
            institutionName={institutionName}
            institutionLogo={institutionLogo}
            tapel={tapel}
            users={users}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onSaveAttendance={handleSaveAttendance}
            onAddJournal={handleAddJournal}
            onUpdateJournal={handleUpdateJournal}
            onDeleteJournal={handleDeleteJournal}
            onSaveInstitution={handleSaveInstitution}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onLogout={handleLogout}
          />
        ) : (
          <DashboardKepsek
            user={currentUser}
            classes={classes}
            journals={journals}
            attendanceRecords={attendanceRecords}
            institutionName={institutionName}
            institutionLogo={institutionLogo}
            tapel={tapel}
            users={users}
            onSaveInstitution={handleSaveInstitution}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onLogout={handleLogout}
          />
        )}
      </div>

    </div>
  );
}
