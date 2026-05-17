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
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // State untuk Modal Edit Role
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔥 State untuk Modal Bikin Akun Baru
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
      setUsers(res.data.data);
    } catch (error) {
      toast.error("Gagal menarik data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler Edit Role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newRole) return;

    setIsUpdating(true);
    try {
      await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
      toast.success(`Role ${selectedUser.name} berhasil diperbarui!`);
      document.getElementById("modal_edit_role").close();
      fetchUsers(); // Refresh tabel
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah role");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    document.getElementById("modal_edit_role").showModal();
  };

  // 🔥 Handler Bikin Akun Baru
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await api.post("/admin/users", newUserForm);
      toast.success(response.data.message || "Akun baru berhasil dibuat!");

      // Reset form & Tutup modal
      setNewUserForm({ name: "", email: "", password: "", role: "STUDENT" });
      document.getElementById("modal_create_user").close();

      fetchUsers(); // Refresh tabel biar akun barunya nongol
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal membuat akun baru coy!",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Logika Filter & Search
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="badge border-rose-200 bg-rose-50 text-rose-600 gap-1 text-[10px] font-black uppercase tracking-widest py-3">
            <ShieldAlert size={12} /> Admin
          </span>
        );
      case "LECTURER":
        return (
          <span className="badge border-amber-200 bg-amber-50 text-amber-600 gap-1 text-[10px] font-black uppercase tracking-widest py-3">
            <Briefcase size={12} /> Dosen
          </span>
        );
      case "CREATOR":
        return (
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-600 gap-1 text-[10px] font-black uppercase tracking-widest py-3">
            <CodeXml size={12} /> Kreator
          </span>
        );
      default:
        return (
          <span className="badge border-slate-200 bg-slate-100 text-slate-600 gap-1 text-[10px] font-black uppercase tracking-widest py-3">
            <GraduationCap size={12} /> Siswa
          </span>
        );
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Kelola data, role, dan akses seluruh akun terdaftar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-sm text-slate-700">
            Total:{" "}
            <span className="text-slate-900 font-black">
              {filteredUsers.length}
            </span>{" "}
            Akun
          </div>
          {/* 🔥 TOMBOL BIKIN AKUN BARU */}
          <button
            onClick={() =>
              document.getElementById("modal_create_user").showModal()
            }
            className="btn bg-slate-900 hover:bg-slate-800 text-white border-none shadow-md rounded-xl h-10 font-bold px-4"
          >
            <UserPlus size={16} /> Buat Akun
          </button>
        </div>
      </div>

      {/* TOOLBAR (SEARCH & FILTER) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-11 bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-medium"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="select select-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold sm:w-48"
        >
          <option value="ALL">Semua Role</option>
          <option value="STUDENT">Siswa</option>
          <option value="LECTURER">Dosen</option>
          <option value="CREATOR">Kreator</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest border-b-slate-200">
                <th className="pl-6">Pengguna</th>
                <th>Role Akses</th>
                <th>Status RPG</th>
                <th>Bergabung</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <span className="loading loading-spinner text-slate-800"></span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 font-bold text-slate-400"
                  >
                    Pencarian tidak ditemukan coy!
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition-colors border-b-slate-100"
                  >
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                          <img
                            src={`https://ui-avatars.com/api/?name=${u.name}&background=random`}
                            alt="avatar"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">
                            {u.name}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold text-amber-600">
                          Level {u.level}
                        </span>
                        <span className="font-medium text-slate-500">
                          {new Intl.NumberFormat("id-ID").format(u.points)} Pts
                        </span>
                      </div>
                    </td>
                    <td className="text-xs font-bold text-slate-500">
                      {new Date(u.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => openEditModal(u)}
                        className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UBAH ROLE */}
      <dialog
        id="modal_edit_role"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white rounded-3xl p-0 max-w-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} /> Ubah Hak Akses
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-slate-400">
                ✕
              </button>
            </form>
          </div>

          <form onSubmit={handleUpdateRole} className="p-6">
            <div className="mb-5 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden mx-auto mb-3">
                {selectedUser && (
                  <img
                    src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=random`}
                    alt="avatar"
                  />
                )}
              </div>
              <h4 className="font-black text-slate-900">
                {selectedUser?.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {selectedUser?.email}
              </p>
            </div>

            <div className="form-control w-full mb-6">
              <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400 px-0 mb-1">
                Pilih Role Baru
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="select select-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold"
              >
                <option value="STUDENT">Siswa (Pembelajar)</option>
                <option value="LECTURER">Dosen (Kelas Privat)</option>
                <option value="CREATOR">Kreator (Kelas Berbayar)</option>
                <option value="ADMIN">Super Admin</option>
              </select>
            </div>

            {newRole === "ADMIN" && (
              <div className="alert alert-warning rounded-xl text-xs font-bold py-2 mb-4">
                <AlertTriangle size={16} /> Hati-hati! Role ini punya akses
                penuh ke sistem.
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full btn bg-slate-900 hover:bg-slate-800 text-white rounded-xl border-none font-bold uppercase tracking-wider text-xs shadow-md"
            >
              {isUpdating ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 🔥 MODAL BIKIN AKUN BARU */}
      <dialog
        id="modal_create_user"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white rounded-3xl p-0 max-w-md">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
              <UserPlus size={18} /> Buat Akun Baru
            </h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-slate-400">
                ✕
              </button>
            </form>
          </div>

          <form onSubmit={handleCreateUser} className="p-6 space-y-4">
            <div>
              <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400 px-0 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama..."
                value={newUserForm.name}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, name: e.target.value })
                }
                className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400 px-0 mb-1">
                Email Aktif
              </label>
              <input
                type="email"
                required
                placeholder="email@kampus.ac.id"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400 px-0 mb-1">
                Kata Sandi Awal
              </label>
              <input
                type="text"
                required
                minLength="6"
                placeholder="Minimal 6 karakter"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                className="input input-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="label text-[10px] font-black uppercase tracking-widest text-slate-400 px-0 mb-1">
                Hak Akses (Role)
              </label>
              <select
                value={newUserForm.role}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, role: e.target.value })
                }
                className="select select-bordered w-full bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold text-blue-600"
              >
                <option value="STUDENT">Siswa (STUDENT)</option>
                <option value="LECTURER">Dosen (LECTURER)</option>
                <option value="CREATOR">Kreator (CREATOR)</option>
                <option value="ADMIN">Super Admin (ADMIN)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl border-none font-bold uppercase tracking-wider text-xs shadow-md mt-6"
            >
              {isCreating ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Proses Bikin Akun"
              )}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop bg-slate-900/40">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UsersAdmin;
