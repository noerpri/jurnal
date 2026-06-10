/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { User, Role } from '../types';
import { 
  Building, Calendar, Save, Trash2, Edit2, UserPlus, 
  Upload, Image as ImageIcon, Sparkles, Check, HelpCircle, X, CheckSquare, Plus
} from 'lucide-react';

interface PengaturanProps {
  institutionName: string;
  institutionLogo: string;
  tapel: string;
  users: User[];
  onSaveInstitution: (name: string, logo: string, tapel: string) => void;
  onAddTeacher: (teacher: User) => void;
  onUpdateTeacher: (teacher: User) => void;
  onDeleteTeacher: (id: string) => void;
}

const PRESET_LOGOS = [
  { name: 'Tut Wuri Handayani Blue', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Kementerian_Pendidikan_dan_Kebudayaan.png' },
  { name: 'Modern Academy Crest', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150' },
  { name: 'Science & Physics Crest', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=150' },
  { name: 'Eco/Green Campus Badges', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=150' }
];

export default function Pengaturan({
  institutionName,
  institutionLogo,
  tapel,
  users,
  onSaveInstitution,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}: PengaturanProps) {
  // Institution states
  const [tempName, setTempName] = useState(institutionName);
  const [tempLogo, setTempLogo] = useState(institutionLogo);
  const [tempTapel, setTempTapel] = useState(tapel);
  const [showInstitutionSuccess, setShowInstitutionSuccess] = useState(false);

  // File Upload reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Add/Edit Teacher states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for Teacher
  const [teacherName, setTeacherName] = useState('');
  const [teacherNip, setTeacherNip] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherRole, setTeacherRole] = useState<Role>('GURU');
  const [teacherAvatar, setTeacherAvatar] = useState('');

  // Custom alert and delete confirmation states
  const [teacherToDelete, setTeacherToDelete] = useState<User | null>(null);
  const [logoAlert, setLogoAlert] = useState<string | null>(null);

  // Handle Drag & Drop for Logo
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLogoAlert('Mohon unggah file gambar yang valid (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTempLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSaveInstitutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInstitution(tempName.trim() || 'SMA Negeri 1 Jakarta', tempLogo, tempTapel.trim() || '2025/2026 - Genap');
    setShowInstitutionSuccess(true);
    setTimeout(() => {
      setShowInstitutionSuccess(false);
    }, 3000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTeacherName('');
    setTeacherNip('');
    setTeacherEmail('');
    setTeacherSubject('');
    setTeacherRole('GURU');
    setTeacherAvatar('');
    setIsAdding(true);
  };

  const handleOpenEdit = (t: User) => {
    setEditingId(t.id);
    setTeacherName(t.name);
    setTeacherNip(t.nip);
    setTeacherEmail(t.email);
    setTeacherSubject(t.subject || '');
    setTeacherRole(t.role);
    setTeacherAvatar(t.avatarUrl || '');
    setIsAdding(true);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      alert('Nama guru wajib diisi!');
      return;
    }

    const defaultAvatar = teacherRole === 'KEPALA_SEKOLAH' 
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' 
      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200';

    const cleanEmail = teacherEmail.trim() || `${teacherName.toLowerCase().replace(/\s+/g, '')}@sekolah.sch.id`;

    if (editingId) {
      // Edit mode
      const updatedUser: User = {
        id: editingId,
        name: teacherName.trim(),
        role: teacherRole,
        email: cleanEmail,
        nip: teacherNip.trim() || '19900101XXXXXXXXXX',
        subject: teacherRole === 'GURU' ? teacherSubject.trim() || 'Pelajaran Umum' : undefined,
        avatarUrl: teacherAvatar.trim() || defaultAvatar
      };
      onUpdateTeacher(updatedUser);
    } else {
      // Create mode
      const newTeacher: User = {
        id: `u-${Date.now()}`,
        name: teacherName.trim(),
        role: teacherRole,
        email: cleanEmail,
        nip: teacherNip.trim() || '19900101XXXXXXXXXX',
        subject: teacherRole === 'GURU' ? teacherSubject.trim() || 'Pelajaran Umum' : undefined,
        avatarUrl: teacherAvatar.trim() || defaultAvatar
      };
      onAddTeacher(newTeacher);
    }

    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Grid: Left column for Institution settings, Right column for Teacher lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INSTITUTION (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-teal-50 rounded-xl text-teal-700">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Profil Lembaga Pendidikan</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Identitas Resmi & Tapel</p>
              </div>
            </div>

            <form onSubmit={handleSaveInstitutionSubmit} className="space-y-5">
              
              {/* Institution Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Nama Lembaga (Sekolah)</label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="SMA Negeri 1 Jakarta"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Tahun Pelajaran (Tapel) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">Tahun Pelajaran (Tapel)</label>
                <input
                  type="text"
                  required
                  value={tempTapel}
                  onChange={(e) => setTempTapel(e.target.value)}
                  placeholder="2025/2026 - Genap"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Logo Manager */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 block">Logo Lembaga Resmi</label>
                
                {/* Visual Preview */}
                <div className="flex gap-4 items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-2.5 shrink-0">
                    {tempLogo ? (
                      <img src={tempLogo} alt="Logo Sekolah" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Building className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="text-left space-y-1 min-w-0">
                    <span className="text-xs font-bold text-slate-700 block truncate">Pratinjau Logo</span>
                    <span className="text-[10px] text-slate-400 block line-clamp-2">Logo akan disematkan pada cetak Raport PDF serta Header Dashboard.</span>
                  </div>
                </div>

                {/* Drag and Drop Zone / Manual Upload */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-slate-200 hover:border-slate-350 bg-slate-50/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700 block">Unggah Gambar Logo Baru</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Tarik & Lepas gambar di sini atau klik untuk memilih file</span>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Atau Pilih dari Preset Lambang:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_LOGOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTempLogo(preset.url)}
                        title={preset.name}
                        className={`p-1.5 border rounded-xl overflow-hidden bg-white hover:border-teal-500 flex items-center justify-center h-12 transition-all ${
                          tempLogo === preset.url ? 'border-teal-600 ring-2 ring-teal-100' : 'border-slate-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct image URL input */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tautan Gambar Logo (URL):</span>
                  <input
                    type="text"
                    value={tempLogo.startsWith('data:') ? '' : tempLogo}
                    onChange={(e) => setTempLogo(e.target.value)}
                    placeholder="Masukkan URL gambar logo luar..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-teal-500 bg-slate-50/50"
                  />
                </div>

              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  id="btn-save-agency-settings"
                  className="w-full bg-teal-700 hover:bg-teal-850 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Lembaga
                </button>
              </div>

              {showInstitutionSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sistem berhasil memperbarui Identitas Sekolah & Tahun Ajaran!</span>
                </div>
              )}

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: MANAGE TEACHERS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main User List Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Daftar Akun Guru & Staf</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Manajemen Akses Simulasi</p>
                </div>
              </div>

              {!isAdding && (
                <button
                  onClick={handleOpenAdd}
                  id="btn-add-teacher-trigger"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Akun Guru
                </button>
              )}
            </div>

            {/* EXPANDABLE FORM: Add / Edit Teacher */}
            {isAdding && (
              <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-2xl space-y-4 animate-slideDown">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    {editingId ? 'Amandemen Profil Guru' : 'Registrasi Guru / Tenaga Pengajar Baru'}
                  </span>
                  <button
                    onClick={handleCancelForm}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        required
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="Contoh: Dra. Aminah Az-Zahra, M.Pd."
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
                      />
                    </div>

                    {/* NIP */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">NIP (Nomor Induk Pegawai)</label>
                      <input
                        type="text"
                        required
                        value={teacherNip}
                        onChange={(e) => setTeacherNip(e.target.value)}
                        placeholder="18 digit angka"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Alamat Surat Elektronik (Email)</label>
                      <input
                        type="email"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="nama@sekolah.sch.id"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
                      />
                    </div>

                    {/* Role select */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">Peran Sistem / Struktur</label>
                      <select
                        value={teacherRole}
                        onChange={(e) => setTeacherRole(e.target.value as Role)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
                      >
                        <option value="GURU">Guru Pengampu / Wali Kelas</option>
                        <option value="KEPALA_SEKOLAH">Kepala Sekolah (Mampu Verifikasi)</option>
                      </select>
                    </div>

                    {/* Subject (Only if role is GURU) */}
                    {teacherRole === 'GURU' && (
                      <div className="space-y-1 md:col-span-2 animate-fadeIn">
                        <label className="text-[11px] font-bold text-slate-500">Mata Pelajaran Utama</label>
                        <input
                          type="text"
                          required
                          value={teacherSubject}
                          onChange={(e) => setTeacherSubject(e.target.value)}
                          placeholder="Fisika, Biologi, Matematika, PKn"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
                        />
                      </div>
                    )}

                    {/* Custom Avatar (Optional) */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500">Tautan Foto Profil / Avatar URL (Opsional)</label>
                      <input
                        type="text"
                        value={teacherAvatar}
                        onChange={(e) => setTeacherAvatar(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-white"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      id="btn-save-teacher-submit"
                      className="bg-teal-700 hover:bg-teal-850 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {editingId ? 'Simpan Amandemen' : 'Registrasikan Akun'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of accounts inside custom cards */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {users.map((t) => (
                <div 
                  key={t.id} 
                  className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={t.name}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block">{t.name}</span>
                        <span 
                          className={`text-[8px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${
                            t.role === 'KEPALA_SEKOLAH' 
                              ? 'bg-amber-100 text-amber-850 border border-amber-200' 
                              : 'bg-emerald-100 text-emerald-850 border border-emerald-250'
                          }`}
                        >
                          {t.role === 'KEPALA_SEKOLAH' ? 'Kepsek' : 'Guru'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate">
                        NIP: {t.nip} • {t.subject ? `Mapel: ${t.subject}` : 'Manajemen Akademik'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate font-medium">{t.email}</span>
                    </div>
                  </div>

                  {/* Operational controls for accounts */}
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      title="Edit Akun"
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Exclude currently logged in system user from being self-deleted for safety */}
                    <button
                      onClick={() => setTeacherToDelete(t)}
                      title="Hapus Akun"
                      className="p-1.5 rounded-lg hover:bg-rose-100/60 text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/60 flex items-start gap-2.5 text-slate-600 text-[11px] leading-relaxed">
              <HelpCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 block">Bagaimana Cara Guru Baru Masuk?</span>
                Setelah didaftarkan di atas, guru baru dapat langsung beralih ke halaman Login (Keluar Sesi terlebih dahulu) dan nama atau akun mereka akan secara instan terdaftar sebagai pilihan di menu portal utama untuk segera memulai simulasi!
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal for Deletion */}
      {teacherToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-650 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-rose-650" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-base">Hapus Akun Pengajar?</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Apakah Anda yakin ingin menghapus akun guru <span className="text-slate-700 font-bold">{teacherToDelete.name}</span>?
              </p>
              <div className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 p-2 rounded-xl mt-1">
                Seluruh hak akses simulasi serta afiliasi guru akan dicabut secara permanen.
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal for Logo */}
      {logoAlert && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Peringatan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{logoAlert}</p>
            <button
              onClick={() => setLogoAlert(null)}
              className="w-full bg-teal-700 hover:bg-teal-850 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
