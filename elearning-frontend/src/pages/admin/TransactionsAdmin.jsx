import { useState, useEffect } from "react";
import {
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coins,
  Calendar,
  DollarSign,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const TransactionsAdmin = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/transactions");
      setTransactions(res.data.data);
    } catch (error) {
      toast.error("Gagal menarik data log transaksi global");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Logika Filter & Search data transaksi
  const filteredTransactions = transactions.filter((tx) => {
    const studentName = tx.student?.name || "";
    const courseTitle = tx.course?.title || "";
    const matchSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      courseTitle.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || tx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 text-[9px] font-black uppercase tracking-wider py-2.5">
            <CheckCircle size={10} /> Success
          </span>
        );
      case "FAILED":
        return (
          <span className="badge border-rose-200 bg-rose-50 text-rose-600 gap-1 text-[9px] font-black uppercase tracking-wider py-2.5">
            <XCircle size={10} /> Failed
          </span>
        );
      case "EXPIRED":
        return (
          <span className="badge border-slate-200 bg-slate-100 text-slate-500 gap-1 text-[9px] font-black uppercase tracking-wider py-2.5">
            <AlertCircle size={10} /> Expired
          </span>
        );
      default:
        return (
          <span className="badge border-amber-200 bg-amber-50 text-amber-600 gap-1 text-[9px] font-black uppercase tracking-wider py-2.5">
            <AlertCircle size={10} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard size={32} className="text-blue-600" /> Arus Kas &
            Transaksi
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Audit seluruh catatan transaksi, baik via Rupiah maupun sistem Point
            RPG.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-sm text-slate-700">
          Total Log:{" "}
          <span className="text-slate-900 font-black">
            {filteredTransactions.length}
          </span>{" "}
          Entri
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama pembeli atau judul materi/kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-11 bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select select-bordered bg-slate-50 focus:bg-white focus:border-slate-800 rounded-xl font-bold sm:w-48"
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* TABEL AUDIT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest border-b-slate-200">
                <th className="pl-6">ID / Waktu</th>
                <th>Mahasiswa (Pembeli)</th>
                <th>Item Kelas</th>
                <th>Nominal Metode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <span className="loading loading-spinner text-slate-800"></span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 font-bold text-slate-400"
                  >
                    Riwayat transaksi tidak ditemukan coy.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  // Cek apakah belinya pakai Poin atau IDR asli
                  const isPointPayment =
                    tx.course?.type === "REGULAR" || tx.amount <= 10000; // Logika backup nominal poin

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/50 transition-colors border-b-slate-100"
                    >
                      <td className="pl-6">
                        <div className="font-mono text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                          #{tx.id.substring(0, 8)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {new Date(tx.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-sm text-slate-800">
                          {tx.student?.name || "User Terhapus"}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {tx.student?.email || "-"}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-sm text-slate-800 line-clamp-1">
                          {tx.course?.title || "Item Terhapus"}
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block border">
                          {tx.course?.type}
                        </span>
                      </td>
                      <td>
                        {isPointPayment ? (
                          <div className="font-black text-amber-600 flex items-center gap-1 text-sm">
                            <Coins size={14} />{" "}
                            {new Intl.NumberFormat("id-ID").format(tx.amount)}{" "}
                            <span className="text-[10px] font-bold text-slate-400">
                              Pts
                            </span>
                          </div>
                        ) : (
                          <div className="font-black text-slate-800 flex items-center gap-0.5 text-sm">
                            <span className="text-xs text-slate-400 font-bold">
                              Rp
                            </span>{" "}
                            {new Intl.NumberFormat("id-ID", {
                              maximumFractionDigits: 0,
                            }).format(tx.amount)}
                          </div>
                        )}
                      </td>
                      <td>{getStatusBadge(tx.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsAdmin;
