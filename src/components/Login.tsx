/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Role } from '../types';
import { USERS } from '../utils/dummyData';
import { LogIn, Landmark, Star, Eye } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users?: User[];
}

export default function Login({ onLogin, users = USERS }: LoginProps) {
  const [selectedUser, setSelectedUser] = useState<User>(users[0] || USERS[0]);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<Role>('GURU');
  const [customNip, setCustomNip] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  React.useEffect(() => {
    if (users.length > 0 && !users.find(u => u.id === selectedUser?.id)) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  const handlePresetSelect = (user: User) => {
    setSelectedUser(user);
    setShowCustomForm(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newUser: User = {
      id: `u-custom-${Date.now()}`,
      name: customName,
      role: customRole,
      email: `${customName.toLowerCase().replace(/\s+/g, '')}@sekolah.sch.id`,
      nip: customNip || '19900101XXXXXXXXXX',
      subject: customRole === 'GURU' ? customSubject || 'Pelajaran Umum' : undefined,
      avatarUrl: customRole === 'GURU' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    };

    onLogin(newUser);
  };

  const executeLogin = () => {
    onLogin(selectedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-teal-100">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-12 border border-slate-100">
        
        {/* Left Aspect: Branding Card Decorative Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background mesh circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 -translate-x-20 translate-y-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
              <Landmark className="w-5 h-5 text-teal-300" />
              <span className="text-xs font-bold tracking-wider uppercase">Sistem Portal Pendidikan</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight leading-tight">
                Jurnal & Absensi <br />
                <span className="text-teal-300">Guru Digital</span>
              </h1>
              <p className="text-sm text-teal-100/90 leading-relaxed font-medium">
                Solusi satu pintu bagi Guru untuk pencatatan Jurnal Mengajar dan Absensi kelas kustom, serta Laporan Insight bagi Kepala Sekolah.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 bg-teal-900/40 p-4 rounded-2xl border border-white/15 backdrop-blur-xs text-xs space-y-2.5">
            <div className="flex gap-2 items-start">
              <Star className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Full Role Simulation</span>
                <span className="text-teal-200">Beralihlah secara real-time antara Guru dan Kepala Sekolah untuk melihat laporan detail.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aspect: Authentication Form controls */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 text-sm mt-1">
              Pilih akun simulasi di bawah ini atau buat akun kustom baru Anda sendiri.
            </p>
          </div>

          {!showCustomForm ? (
            <div className="space-y-6">
              {/* Predefined Simulator Users Grid */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pilih Profil Pengguna
                </label>
                <div className="grid gap-3">
                  {users.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        id={`btn-user-${user.id}`}
                        onClick={() => handlePresetSelect(user)}
                        className={`text-left p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                            : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border-2 border-white shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm block truncate">{user.name}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                user.role === 'KEPALA_SEKOLAH'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-teal-100 text-teal-800 border border-teal-200'
                              }`}
                            >
                              {user.role === 'KEPALA_SEKOLAH' ? 'KEPSEK' : 'GURU'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block truncate">
                            NIP: {user.nip} {user.subject ? `• ${user.subject}` : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enter Button & Custom link */}
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  id="btn-login-preset"
                  onClick={executeLogin}
                  className="w-full bg-teal-700 hover:bg-teal-850 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  Masuk Portal Utama ({selectedUser.role === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' : 'Guru'})
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    className="text-xs text-teal-600 hover:text-teal-800 font-bold underline cursor-pointer"
                  >
                    Bukan akun Anda? Buat Akun & Kelas Kustom baru
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
                <span className="text-sm font-bold text-slate-700">Registrasi Akun Kustom</span>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Kembali ke preset
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Noer Prijantono, S.Pd."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Nomor Induk Pegawai (NIP)</label>
                  <input
                    type="text"
                    required
                    placeholder="18 digit angka"
                    value={customNip}
                    onChange={(e) => setCustomNip(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Pilih Hak Akses / Role</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as Role)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="GURU">Guru</option>
                    <option value="KEPALA_SEKOLAH">Kepala Sekolah (Kepsek)</option>
                  </select>
                </div>
              </div>

              {customRole === 'GURU' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Mata Pelajaran yang Diampu</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fisika, Matematika, IPA"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  id="btn-submit-custom-login"
                  className="w-full bg-teal-700 hover:bg-teal-850 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Buat Profil & Masuk
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>PROYEK AKADEMIK v1.2</span>
            <span>PEMBARUAN: JUNI 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
}
