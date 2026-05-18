import { useState, useEffect } from "react";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  CodeXml,
  Edit,
  AlertTriangle,
  UserPlus,
  Users,
  Layers,
  Lock,
  Unlock,
  BookOpen,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Segmentasi Tab Navigasi Terpusat
  const [activeTab, setActiveTab] = useState("ALL");

  // State Modal Edit Role
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State Modal Inspeksi Detail Akun
  const [viewUser, setViewUser] = useState(null);

  // State Modal Bikin Akun Baru
  const [isCreating, setIsCreating] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error("Gagal menarik entitas data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newRole) return;

    setIsUpdating(true);
    try {
      await api.put(`/users/admin-mutate/${selectedUser.id}`, {
        role: newRole,
      });
      toast.success(`Akses otoritas ${selectedUser.name} berhasil dimutasi!`);
      document.getElementById("modal_edit_role").close();
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memproses mutasi role",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (userItem) => {
    const isCurrentlyBanned = userItem.role === "BANNED";

    const aksiMsg = !isCurrentlyBanned
      ? `🚨 PERINGATAN PEMBEKUAN AKUN!\n\nApakah Anda yakin ingin MENONAKTIFKAN akun milik "${userItem.name}"?\nRole pengguna ini akan diubah menjadi BANNED dan otomatis tertendang dari hak akses sistem.`
      : `🔓 KONFIRMASI AKTIVASI!\n\nBuka blokir akun milik "${userItem.name}" sekarang?\nAkun akan dikembalikan ke status Siswa (STUDENT).`;

    if (window.confirm(aksiMsg)) {
      try {
        await api.put(`/users/admin-mutate/${userItem.id}`, {
          role: !isCurrentlyBanned ? "BANNED" : "STUDENT",
        });

        toast.success(
          !isCurrentlyBanned
            ? "Akun resmi dibekukan ke status BANNED!"
            : "Blokir dibuka! Status kembali ke Student.",
        );
        fetchUsers();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Gagal memproses perubahan status akun",
        );
      }
    }
  };

  // 🔥 FITUR BARU: Hapus Akun Permanen (Root Hard Delete)
  const handleDeleteSingleUser = async (userItem) => {
    if (
      window.confirm(
        `⚠️ PERINGATAN ROOT DESTROY!\n\nYakin ingin menghapus akun "${userItem.name}" secara PERMANEN?\nSeluruh data transaksi dan progres kelasnya akan ikut musnah tak tersisa.`,
      )
    ) {
      try {
        // 🔥 UBAH BARIS INI COY! Tembak ke rute admin-mutate yang valid!
        await api.delete(`/users/admin-mutate/${userItem.id}`);

        toast.success("Entitas akun berhasil dimusnahkan secara permanen!");
        fetchUsers();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Gagal menghapus data user dari basis data.",
        );
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    document.getElementById("modal_edit_role").showModal();
  };

  const openViewModal = (user) => {
    setViewUser(user);
    document.getElementById("modal_view_user").showModal();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await api.post("/admin/users", newUserForm);
      toast.success(
        response.data.message || "Entitas akun baru berhasil diinjeksi!",
      );
      setNewUserForm({ name: "", email: "", password: "", role: "STUDENT" });
      document.getElementById("modal_create_user").close();
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menginjeksi akun baru",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Logic Filter & Search
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "ALL" || u.role === activeTab;
    return matchSearch && matchTab;
  });

  const counts = {
    ALL: users.length,
    STUDENT: users.filter((u) => u.role === "STUDENT").length,
    LECTURER: users.filter((u) => u.role === "LECTURER").length,
    CREATOR: users.filter((u) => u.role === "CREATOR").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-900 border border-slate-900 px-2 py-0.5 rounded bg-slate-50 shadow-sm">
            <ShieldAlert size={10} strokeWidth={2.5} /> Admin Core
          </span>
        );
      case "LECTURER":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-700 border border-slate-300 px-2 py-0.5 rounded bg-slate-50 shadow-sm">
            <Briefcase size={10} strokeWidth={2.5} /> Lecturer
          </span>
        );
      case "CREATOR":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-700 border border-slate-300 px-2 py-0.5 rounded bg-slate-50 shadow-sm">
            <CodeXml size={10} strokeWidth={2.5} /> Creator
          </span>
        );
      case "BANNED":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-700 border border-rose-300 px-2 py-0.5 rounded bg-rose-50/50 shadow-sm">
            <Lock size={10} strokeWidth={2.5} /> Banned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 px-2 py-0.5 rounded bg-slate-50 shadow-sm">
            <GraduationCap size={10} strokeWidth={2.5} /> Student
          </span>
        );
    }
  };

  return (
    // 🔥 ZERO AMBIENT GLOW: Bersih, Flat, Monochrome Pro Layout
    <div className="max-w-[1500px] mx-auto font-sans pb-24 pt-2 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* HEADER SECTION (Apple Glassmorphism Firm Layout)                          */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-6 bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <Users size={16} strokeWidth={2.5} />
            </span>
            Otoritas Manajemen Pengguna
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Konsol pengawasan terpusat untuk mengelola database akun, segmentasi
            kelompok data, pembekuan, hingga pemusnahan entitas.
          </p>
        </div>

        <button
          onClick={() =>
            document.getElementById("modal_create_user").showModal()
          }
          className="mt-4 sm:mt-0 bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
        >
          <UserPlus size={14} strokeWidth={2.5} /> Daftarkan Akun Baru
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & TAB BAR INTERFACE (Strict Layout)                                */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-5 p-3 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-sm">
        {/* Segmented Tab Menu Controller */}
        <div className="flex flex-wrap p-1 bg-slate-100/80 rounded-lg gap-1 border border-slate-200/50">
          {[
            { id: "ALL", label: "Semua Akun" },
            { id: "STUDENT", label: "Student" },
            { id: "LECTURER", label: "Lecturer" },
            { id: "CREATOR", label: "Creator" },
            { id: "ADMIN", label: "Admin" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white text-slate-950 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-900 bg-transparent border border-transparent"
              }`}
            >
              {tab.label}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Input Searching */}
        <div className="relative z-10 w-full lg:w-80">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DATAGRID TABEL PENGGUNA (Clean Enterprise Framework)                      */}
      {/* ========================================================================= */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60 text-slate-400 text-[9px] uppercase tracking-widest font-black">
                <th className="pl-6 py-4">Profil Pengguna</th>
                <th className="py-4">Otoritas Akses</th>
                <th className="py-4">Konten / Status RPG</th>
                <th className="py-4">Tanggal Bergabung</th>
                <th className="text-center py-4 pr-6">Eksekusi Root</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-700 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin inline-block"></span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]"
                  >
                    Entitas pengguna tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isBannedAccount = u.role === "BANNED";
                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${isBannedAccount ? "bg-rose-50/40 opacity-75" : "hover:bg-slate-50/40"}`}
                    >
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 shadow-xs relative">
                            <img
                              src={
                                u.avatar_url ||
                                `https://ui-avatars.com/api/?name=${u.name || "User"}&background=f1f5f9&color=334155&size=100`
                              }
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                            {isBannedAccount && (
                              <div className="absolute inset-0 bg-rose-600/20 flex items-center justify-center text-white font-bold backdrop-blur-[1px]">
                                ✕
                              </div>
                            )}
                          </div>
                          <div className="max-w-[200px] sm:max-w-none truncate">
                            <div className="font-bold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                              {u.name || "No Name"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{getRoleBadge(u.role)}</td>
                      <td className="py-4">
                        {u.role === "LECTURER" || u.role === "CREATOR" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-900 bg-slate-100/80 border border-slate-300 px-2 py-0.5 rounded shadow-sm">
                              <BookOpen size={10} strokeWidth={2.5} />{" "}
                              {u._count?.courses || u.courses?.length || 0}{" "}
                              Kelas Publik
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black text-slate-900 text-[11px]">
                              Level {u.level || 1}
                            </span>
                            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                              {new Intl.NumberFormat("id-ID").format(
                                u.points || 0,
                              )}{" "}
                              Pts
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {new Date(
                            u.created_at || u.createdAt,
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* ACTION ROOT CONTROL */}
                      <td className="text-center py-4 pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Inspeksi Detail */}
                          <button
                            onClick={() => openViewModal(u)}
                            className="bg-white border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Inspeksi Dossier"
                          >
                            <Eye size={13} strokeWidth={2.5} />
                          </button>

                          {/* Edit Role */}
                          <button
                            onClick={() => openEditModal(u)}
                            className="bg-white border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Mutasi Hak Akses"
                          >
                            <Edit size={13} strokeWidth={2.5} />
                          </button>

                          {/* Toggle Suspend (Gembok) */}
                          {u.role !== "ADMIN" && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border shadow-sm transition-colors cursor-pointer ${
                                !isBannedAccount
                                  ? "bg-white border-slate-200 hover:bg-amber-50 text-slate-500 hover:text-amber-600"
                                  : "bg-amber-600 border-amber-700 text-white hover:bg-amber-700"
                              }`}
                              title={
                                !isBannedAccount
                                  ? "Bekukan Akun"
                                  : "Buka Blokir"
                              }
                            >
                              {!isBannedAccount ? (
                                <Lock size={13} strokeWidth={2.5} />
                              ) : (
                                <Unlock size={13} strokeWidth={2.5} />
                              )}
                            </button>
                          )}

                          {/* Destroy Record (Trash) */}
                          {u.role !== "ADMIN" && (
                            <button
                              onClick={() => handleDeleteSingleUser(u)}
                              className="bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                              title="Musnahkan Permanen"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔥 MODAL INSPEKSI DETAIL AKUN (VIEW USER - GLASSMORPHISM)               */}
      {/* ========================================================================= */}
      <dialog
        id="modal_view_user"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl p-0 max-w-lg border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in zoom-in-95 duration-200">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Eye size={14} strokeWidth={2.5} /> Inspeksi Rinci Dossier
            </h3>
            <form method="dialog">
              <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors cursor-pointer">
                <X size={14} strokeWidth={2.5} />
              </button>
            </form>
          </div>

          {viewUser && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Info Utama */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-slate-200/80 bg-slate-100 overflow-hidden shrink-0 shadow-sm relative">
                  <img
                    src={
                      viewUser.avatar_url ||
                      `https://ui-avatars.com/api/?name=${viewUser.name}&background=f1f5f9&color=334155&size=150`
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                  {viewUser.role === "BANNED" && (
                    <div className="absolute inset-0 bg-rose-600/20 backdrop-blur-[1px]"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight flex items-center gap-2">
                    {viewUser.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mb-1.5">
                    {viewUser.email}
                  </p>
                  <div>{getRoleBadge(viewUser.role)}</div>
                </div>
              </div>

              {/* Grid Atribut */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 border border-slate-200/60 p-5 rounded-xl shadow-inner">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Tanggal Registrasi
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {new Date(
                      viewUser.created_at || viewUser.createdAt,
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Identitas (NIM/NIP)
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {viewUser.nim_nip || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Bidang / Profesi
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {viewUser.profession || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {viewUser.role === "LECTURER" || viewUser.role === "CREATOR"
                      ? "Kelas Dipublikasi"
                      : "Combat EXP (Level)"}
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {viewUser.role === "LECTURER" || viewUser.role === "CREATOR"
                      ? `${viewUser._count?.courses || viewUser.courses?.length || 0} Kelas`
                      : `${viewUser.exp || 0} XP (Lv. ${viewUser.level || 1})`}
                  </p>
                </div>
              </div>

              {/* Deskripsi Bio */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Biografi Pengguna
                </p>
                <div className="p-4 bg-white/80 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-medium min-h-[80px] shadow-sm">
                  {viewUser.bio || (
                    <span className="italic text-slate-400">
                      Entitas ini belum menambahkan deskripsi biografi...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/30 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>

      {/* ========================================================================= */}
      {/* MODAL EDIT ROLE (GLASSMORPHISM)                                           */}
      {/* ========================================================================= */}
      <dialog
        id="modal_edit_role"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl p-0 max-w-sm border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in zoom-in-95 duration-200">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={14} strokeWidth={2.5} /> Mutasi Otoritas Akses
            </h3>
            <form method="dialog">
              <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors cursor-pointer">
                ✕
              </button>
            </form>
          </div>

          <form onSubmit={handleUpdateRole} className="p-6 space-y-5">
            <div className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl text-center shadow-inner">
              <div className="w-14 h-14 rounded-full border border-slate-200/80 bg-white overflow-hidden mx-auto mb-2 shadow-sm">
                {selectedUser && (
                  <img
                    src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=f1f5f9&color=334155&size=100`}
                    alt="avatar"
                  />
                )}
              </div>
              <h4 className="font-black text-slate-900 text-sm">
                {selectedUser?.name}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                {selectedUser?.email}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Tetapkan Otoritas Akses Baru
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200/80 focus:border-slate-900 rounded-xl text-xs font-bold outline-none transition-colors shadow-sm"
              >
                <option value="STUDENT">Siswa (STUDENT / PEMBELAJAR)</option>
                <option value="LECTURER">Dosen (LECTURER / PRIVATE)</option>
                <option value="CREATOR">Kreator (CREATOR / COMMERCIAL)</option>
                <option value="ADMIN">Super Admin (ADMIN CORE)</option>
              </select>
            </div>

            {newRole === "ADMIN" && (
              <div className="bg-slate-900 text-white p-4 rounded-xl text-[10px] font-bold tracking-wide flex items-start gap-2 shadow-md">
                <AlertTriangle
                  size={16}
                  className="shrink-0 text-amber-400 mt-0.5"
                  strokeWidth={2.5}
                />
                <p leading-relaxed>
                  Peringatan Konsekuensi! Role Admin core memiliki kendali root
                  absolut atas seluruh web data.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer mt-2"
            >
              {isUpdating ? "Mengeksekusi..." : "Finalisasi Mutasi"}
            </button>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/30 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>

      {/* ========================================================================= */}
      {/* MODAL INJEKSI AKUN BARU (GLASSMORPHISM)                                   */}
      {/* ========================================================================= */}
      <dialog
        id="modal_create_user"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white/95 backdrop-blur-2xl rounded-2xl p-0 max-w-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in zoom-in-95 duration-200">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <UserPlus size={14} strokeWidth={2.5} /> Injeksi Entitas Baru
            </h3>
            <form method="dialog">
              <button className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors cursor-pointer">
                ✕
              </button>
            </form>
          </div>

          <form onSubmit={handleCreateUser} className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Nama Otentik Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Admin Baru"
                value={newUserForm.name}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200/80 focus:border-slate-900 rounded-xl text-xs font-semibold outline-none transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Alamat Surat Elektronik (Email)
              </label>
              <input
                type="email"
                required
                placeholder="admin@nusalearn.com"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200/80 focus:border-slate-900 rounded-xl text-xs font-semibold outline-none transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Kombinasi Kata Sandi Dasar
              </label>
              <input
                type="text"
                required
                minLength="6"
                placeholder="Minimal 6 digit kombinasi sandi"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200/80 focus:border-slate-900 rounded-xl text-xs font-semibold outline-none transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Skema Tingkat Otoritas (Role)
              </label>
              <select
                value={newUserForm.role}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, role: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200/80 focus:border-slate-900 rounded-xl text-xs font-bold outline-none transition-colors shadow-sm text-slate-900"
              >
                <option value="STUDENT">Siswa (STUDENT / PEMBELAJAR)</option>
                <option value="LECTURER">Dosen (LECTURER / PRIVATE)</option>
                <option value="CREATOR">Kreator (CREATOR / COMMERCIAL)</option>
                <option value="ADMIN">Super Admin (ADMIN CORE)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer mt-4"
            >
              {isCreating ? "Menyuntikkan Data..." : "Eksekusi Registrasi"}
            </button>
          </form>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/30 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UsersAdmin;
