import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coins,
  Calendar,
  Receipt,
  User,
  BookOpen,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  ShieldCheck,
  Clock,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const TransactionsAdmin = () => {
  const [activeTab, setActiveTab] = useState("TRANSACTIONS"); // 'TRANSACTIONS' | 'WITHDRAWALS'

  // STATE TRANSAKSI
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // STATE WITHDRAWAL
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWd, setLoadingWd] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchWithdrawals();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoadingTx(true);
      const res = await api.get("/admin/transactions");
      setTransactions(res.data.data || []);
    } catch (error) {
      toast.error("Gagal menarik data log transaksi global");
    } finally {
      setLoadingTx(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoadingWd(true);
      const res = await api.get("/admin/withdrawals");
      setWithdrawals(res.data.data || []);
    } catch (error) {
      toast.error("Gagal menarik data antrean pencairan dana");
    } finally {
      setLoadingWd(false);
    }
  };

  // ACTION: PROSES WITHDRAWAL
  const handleProcessWithdrawal = async (id, action) => {
    if (action === "APPROVE") {
      const confirmTransfer = window.confirm(
        "PERHATIAN: Pastikan Anda SUDAH MENTRANSFER uang tersebut ke rekening dosen sebelum menekan OK. Lanjutkan?",
      );
      if (!confirmTransfer) return;
    } else {
      const confirmReject = window.confirm(
        "Tolak pencairan ini? Saldo akan dikembalikan utuh ke dompet Dosen.",
      );
      if (!confirmReject) return;
    }

    try {
      setProcessingId(id);
      await api.put(`/admin/withdrawals/${id}/process`, { action });
      toast.success(
        action === "APPROVE"
          ? "Pencairan berhasil ditandai Lunas!"
          : "Pencairan ditolak, saldo dikembalikan.",
      );
      fetchWithdrawals(); // Refresh tabel
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memproses pencairan");
    } finally {
      setProcessingId(null);
    }
  };

  // LOGIKA FILTER TRANSAKSI
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
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded shadow-sm">
            <CheckCircle size={10} strokeWidth={2.5} /> Success
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-1 rounded shadow-sm">
            <XCircle size={10} strokeWidth={2.5} /> Failed
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-300/60 px-2 py-1 rounded shadow-sm">
            <AlertCircle size={10} strokeWidth={2.5} /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded shadow-sm">
            <Clock size={10} strokeWidth={2.5} /> Pending
          </span>
        );
    }
  };

  const getGatewayBadge = (gateway) => {
    switch (gateway) {
      case "MIDTRANS_SNAP":
        return (
          <span className="text-[8px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
            Midtrans Auto
          </span>
        );
      case "REDEEM_POINT_SYSTEM":
        return (
          <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
            Poin Sistem
          </span>
        );
      case "MANUAL_TRANSFER":
        return (
          <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
            Manual Transfer
          </span>
        );
      default:
        return (
          <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto font-sans pb-24 pt-2 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 relative overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-6 bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <ShieldCheck size={16} strokeWidth={2.5} />
            </span>
            Pusat Keuangan Superadmin
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Pantau arus kas masuk (Revenue Sharing 20%) dan kelola antrean
            pencairan dana Dosen (Withdrawal).
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50 shadow-sm shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Log Entri
            </span>
            <span className="text-slate-900 font-black text-sm">
              {transactions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/50 shadow-sm shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Antrean Cair
            </span>
            <span className="text-amber-900 font-black text-sm">
              {withdrawals.filter((w) => w.status === "PENDING").length}
            </span>
          </div>
        </div>
      </div>

      {/* 🔥 TAB MENU NAVIGATOR */}
      <div className="relative z-10 flex bg-white/50 backdrop-blur-md p-1 rounded-xl w-full sm:w-fit mb-5 border border-slate-200/60 shadow-sm">
        <button
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "TRANSACTIONS" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 border border-transparent"}`}
        >
          <Receipt size={14} /> Audit Transaksi
        </button>
        <button
          onClick={() => setActiveTab("WITHDRAWALS")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "WITHDRAWALS" ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 border border-transparent"}`}
        >
          <Landmark size={14} /> Antrean Pencairan Dana
        </button>
      </div>

      {/* ========================================================================= */}
      {/* KONDISI RENDER: TAB TRANSAKSI vs TAB WITHDRAWAL                           */}
      {/* ========================================================================= */}
      {activeTab === "TRANSACTIONS" ? (
        <>
          {/* TOOLBAR FILTER TRANSAKSI */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-5 p-3 bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-sm">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari pengguna atau kurikulum..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-semibold outline-none transition-colors shadow-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 bg-white/80 border border-slate-200/80 focus:bg-white focus:border-slate-900 rounded-lg text-xs font-bold outline-none transition-colors shadow-sm text-slate-700 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Status: Pending</option>
              <option value="SUCCESS">Status: Success</option>
              <option value="FAILED">Status: Failed</option>
            </select>
          </div>

          {/* DATAGRID TABEL AUDIT TRANSAKSI */}
          <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200/60 text-slate-400 text-[9px] uppercase tracking-widest font-black">
                    <th className="pl-6 py-4">ID Transaksi / Waktu</th>
                    <th className="py-4">Otentikasi Pengguna</th>
                    <th className="py-4">Unit Kurikulum & Jalur</th>
                    <th className="py-4">Distribusi Finansial</th>
                    <th className="py-4 pr-6">Status Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-slate-700 text-xs">
                  {loadingTx ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16">
                        <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin inline-block"></span>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]"
                      >
                        Log transaksi nihil
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="pl-6 py-4">
                          <div className="font-mono text-[10px] text-slate-900 font-bold uppercase tracking-widest">
                            #{tx.id.substring(0, 8)}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                            <Calendar size={10} />
                            {new Date(tx.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" />
                            {tx.student?.name || "Entitas Terhapus"}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 ml-4">
                            {tx.student?.email || "-"}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-bold text-xs text-slate-800 line-clamp-1 leading-snug flex items-start gap-1.5">
                            <BookOpen
                              size={12}
                              className="text-slate-400 mt-0.5 shrink-0"
                            />
                            <span className="line-clamp-2">
                              {tx.course?.title || "Item Tidak Diketahui"}
                            </span>
                          </div>
                          <div className="mt-1.5 ml-4">
                            {getGatewayBadge(tx.gateway_reference)}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          {tx.gateway_reference === "REDEEM_POINT_SYSTEM" ? (
                            <div className="font-black text-slate-800 flex items-center gap-1 text-sm tracking-tight">
                              <Coins size={14} className="text-slate-500" />
                              {new Intl.NumberFormat("id-ID").format(
                                tx.amount || 0,
                              )}{" "}
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Pts
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  Gross
                                </span>
                                <span className="font-bold text-slate-900 text-xs">
                                  Rp{" "}
                                  {new Intl.NumberFormat("id-ID").format(
                                    tx.amount || 0,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-4 border-t border-slate-100 pt-1">
                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                                  Fee (20%)
                                </span>
                                <span className="font-black text-indigo-600 text-xs">
                                  + Rp{" "}
                                  {new Intl.NumberFormat("id-ID").format(
                                    tx.platform_fee || 0,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                  Dosen (80%)
                                </span>
                                <span className="font-bold text-slate-600 text-[10px]">
                                  Rp{" "}
                                  {new Intl.NumberFormat("id-ID").format(
                                    tx.net_revenue || 0,
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-6">
                          {getStatusBadge(tx.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* TAMPILAN TAB 2: ANTREAN PENCAIRAN DANA (WITHDRAWAL)                       */
        /* ========================================================================= */
        <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200/60 text-slate-400 text-[9px] uppercase tracking-widest font-black">
                  <th className="pl-6 py-4">Waktu Pengajuan</th>
                  <th className="py-4">Data Kreator / Dosen</th>
                  <th className="py-4">Informasi Rekening Tujuan</th>
                  <th className="py-4">Nominal Tarik</th>
                  <th className="py-4 pr-6 text-center">Aksi / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-slate-700 text-xs">
                {loadingWd ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16">
                      <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin inline-block"></span>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]"
                    >
                      Belum ada antrean pencairan dana
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((wd) => (
                    <tr
                      key={wd.id}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="pl-6 py-4">
                        <div className="font-mono text-[10px] text-slate-900 font-bold uppercase tracking-widest">
                          #{wd.id.substring(0, 8)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                          <Calendar size={10} />
                          {new Date(wd.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" />
                          {wd.lecturer?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 ml-4">
                          {wd.lecturer?.email}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="bg-slate-100/80 border border-slate-200/60 p-2 rounded-lg">
                          <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Landmark size={12} className="text-indigo-600" />{" "}
                            {wd.bank_name}
                          </div>
                          <div className="font-mono text-sm font-black text-slate-800 mt-0.5">
                            {wd.account_number}
                          </div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            A/N: {wd.account_name}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-black text-slate-900 text-base tracking-tight">
                          Rp {new Intl.NumberFormat("id-ID").format(wd.amount)}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        {wd.status === "PENDING" ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() =>
                                handleProcessWithdrawal(wd.id, "APPROVE")
                              }
                              disabled={processingId === wd.id}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-1 transition-colors"
                            >
                              {processingId === wd.id ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <>
                                  <CheckCircle size={12} /> Sudah Ditransfer
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleProcessWithdrawal(wd.id, "REJECT")
                              }
                              disabled={processingId === wd.id}
                              className="w-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                              {processingId === wd.id ? (
                                <span className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <>
                                  <ArrowRightLeft size={12} /> Tolak & Refund
                                </>
                              )}
                            </button>
                          </div>
                        ) : wd.status === "APPROVED" ? (
                          <div className="text-center">
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle
                                size={12}
                                className="inline mr-1 mb-0.5"
                              />{" "}
                              Lunas / Selesai
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest">
                              <XCircle
                                size={12}
                                className="inline mr-1 mb-0.5"
                              />{" "}
                              Ditolak (Refund)
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsAdmin;
