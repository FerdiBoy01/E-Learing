import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  BookOpen,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  BarChart3,
  Zap,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowRightLeft,
} from "lucide-react";
import api from "../../config/axios";
import toast from "../../utils/toast";

const TransactionsLecturer = () => {
  const [activeTab, setActiveTab] = useState("VALIDATION"); // Tab Navigasi: VALIDATION | WALLET

  // STATE VALIDASI TRANSAKSI
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // STATE ANALITIK
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    salesCount: 0,
    verifiedStudents: 0,
    coursePerformance: [],
  });

  // 🔥 STATE BARU UNTUK DOMPET (WALLET)
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  useEffect(() => {
    fetchTransactionsAndHistory();
    fetchWalletData();
  }, []);

  const fetchTransactionsAndHistory = async () => {
    try {
      setLoading(true);
      const responsePending = await api.get("/transactions/pending");
      const pendingData = responsePending.data.data || [];
      setTransactions(pendingData);

      const responseAll = await api.get("/dashboard/lecturer");
      const dataLecturer = responseAll.data?.data || {};

      setAnalytics({
        totalRevenue: dataLecturer.totalRevenue || 0,
        salesCount: dataLecturer.totalStudents || 0,
        verifiedStudents: dataLecturer.totalStudents || 0,
        coursePerformance: dataLecturer.coursePerformance || [],
      });
    } catch (error) {
      toast.error("Gagal memuat rangkuman finansial studio.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await api.get("/withdrawals/me");
      setWalletBalance(response.data.data.balance || 0);
      setWithdrawHistory(response.data.data.withdrawals || []);
    } catch (error) {
      console.error("Gagal memuat data dompet.");
    }
  };

  const handleValidate = async (transactionId, action) => {
    const targetTrx = transactions.find((t) => t.id === transactionId);
    if (!targetTrx) return;

    try {
      setProcessingId(transactionId);
      await api.put(`/transactions/${transactionId}/validate`, { action });

      toast.success(
        action === "APPROVE"
          ? "Pembayaran Disetujui! Akses otomatis terbuka."
          : "Pembayaran ditolak.",
      );

      if (action === "APPROVE") {
        setAnalytics((prev) => {
          const currentAmount = targetTrx.amount || 0;
          const courseTitle = targetTrx.course?.title || "Kelas Premium";
          const isExist = prev.coursePerformance.some(
            (c) => c.title === courseTitle,
          );

          let updatedPerformance = [];
          if (isExist) {
            updatedPerformance = prev.coursePerformance.map((c) =>
              c.title === courseTitle
                ? {
                    ...c,
                    sales_count: (c.sales_count || 0) + 1,
                    revenue: (c.revenue || 0) + currentAmount,
                  }
                : c,
            );
          } else {
            updatedPerformance = [
              ...prev.coursePerformance,
              { title: courseTitle, sales_count: 1, revenue: currentAmount },
            ];
          }

          return {
            ...prev,
            totalRevenue: prev.totalRevenue + currentAmount,
            salesCount: prev.salesCount + 1,
            verifiedStudents: prev.verifiedStudents + 1,
            coursePerformance: updatedPerformance,
          };
        });
        fetchWalletData();
      }
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memvalidasi transaksi",
      );
      fetchTransactionsAndHistory();
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    // 🔥 BATAS MINIMAL DITURUNKAN KE 10RB BIAR BISA TEST NARIK SALDO 20K LU
    if (Number(withdrawForm.amount) < 10000)
      return toast.error("Minimal penarikan adalah Rp 10.000");
    if (Number(withdrawForm.amount) > walletBalance)
      return toast.error("Saldo tidak mencukupi!");

    setIsWithdrawing(true);
    try {
      await api.post("/withdrawals", {
        amount: Number(withdrawForm.amount),
        bank_name: withdrawForm.bank_name,
        account_number: withdrawForm.account_number,
        account_name: withdrawForm.account_name,
      });

      toast.success("Permintaan pencairan berhasil dikirim ke Admin!");
      document.getElementById("modal_withdraw").close();
      setWithdrawForm({
        amount: "",
        bank_name: "",
        account_number: "",
        account_name: "",
      });
      fetchWalletData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal mengajukan penarikan",
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // FALLBACK PERHITUNGAN JIKA BACKEND DASHBOARD KOSONG (0)
  const displayTotalRevenue =
    analytics.totalRevenue > 0
      ? analytics.totalRevenue
      : transactions.length > 0
        ? 0
        : 0; // Menjaga agar logic tetap aman
  const displaySalesCount =
    analytics.salesCount > 0
      ? analytics.salesCount
      : transactions.length > 0
        ? 0
        : 0;

  if (loading)
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin mb-4"></span>
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Menyiapkan workspace keuangan...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1500px] mx-auto font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300 h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* HEADER & METRICS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-6 bg-white border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] rounded-xl shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2.5 tracking-tight mb-1">
            <span className="p-2 bg-slate-900 text-white rounded-lg">
              <ShieldCheck size={16} strokeWidth={2.5} />
            </span>
            Validasi & Keuangan Studio
          </h1>
          <p className="text-slate-500 font-medium text-xs max-w-xl">
            Pantau pertumbuhan omzet kelas premium, kelola performa penjualan
            kurikulum, dan tarik saldo pendapatan Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Total Pendapatan Kotor
            </span>
            <div className="p-1.5 bg-slate-50 rounded-md text-slate-900 border border-slate-200">
              <DollarSign size={14} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(displayTotalRevenue)}
          </h2>
          <div className="text-[10px] font-bold text-slate-900 mt-2 flex items-center gap-1 uppercase tracking-wider">
            <TrendingUp size={12} /> Omzet Sebelum Potongan Admin
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Volume Kelas Terjual
            </span>
            <div className="p-1.5 bg-slate-50 rounded-md text-slate-900 border border-slate-200">
              <ShoppingBag size={14} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {displaySalesCount}{" "}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Transaksi
            </span>
          </h2>
          <div className="text-[10px] font-semibold text-slate-500 mt-2 uppercase tracking-wider">
            Akumulasi seluruh program premium
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Menunggu Konfirmasi
            </span>
            <div className="p-1.5 bg-slate-50 rounded-md text-slate-900 border border-slate-200">
              <Clock size={14} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className={`text-2xl font-black tracking-tight text-slate-900`}>
            {transactions.length}{" "}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Berkas
            </span>
          </h2>
          <div className="text-[10px] font-semibold text-slate-500 mt-2 uppercase tracking-wider">
            {transactions.length > 0
              ? "Wajib segera divalidasi"
              : "Semua antrean bersih"}
          </div>
        </div>
      </div>

      {/* 🔥 TAB MENU NAVIGATOR */}
      <div className="flex bg-slate-200/50 backdrop-blur-md p-1 rounded-xl w-full sm:w-fit mb-6 border border-slate-300/40 shrink-0">
        <button
          onClick={() => setActiveTab("VALIDATION")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "VALIDATION" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 border border-transparent"}`}
        >
          <ShieldCheck size={14} /> Antrean Validasi
        </button>
        <button
          onClick={() => setActiveTab("WALLET")}
          className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "WALLET" ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 border border-transparent"}`}
        >
          <Wallet size={14} /> Dompet & Penarikan
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "VALIDATION" ? (
          /* ========================================================================= */
          /* TAMPILAN TAB 1: VALIDASI ANTREAN (ASLI)                                   */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* PANEL KIRI */}
            <div className="w-full lg:w-2/3 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 px-1 shrink-0">
                <Clock size={14} className="text-slate-900" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
                  Antrean Validasi Mahasiswa
                </h3>
              </div>

              {transactions.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 rounded-xl text-center flex-1 flex flex-col items-center justify-center shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-3 border border-slate-200 text-slate-300">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-wider">
                    Tidak Ada Permintaan
                  </h4>
                  <p className="text-slate-400 text-[11px] font-medium max-w-xs">
                    Seluruh mahasiswa pendaftar kelas premium Anda sudah
                    divalidasi.
                  </p>
                </div>
              ) : (
                <div
                  className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar min-h-0 pb-6 scroll-smooth"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {transactions.map((trx) => (
                    <div
                      key={trx.id}
                      className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.01)] flex flex-col overflow-hidden shrink-0"
                    >
                      <div className="flex justify-between items-start p-4 border-b border-slate-100 bg-white">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-slate-50 border border-slate-200 text-slate-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                            {trx.student?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                              {trx.student?.name}
                            </h3>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                              {trx.student?.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">
                            Setoran
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {formatRupiah(trx.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3 bg-slate-50/30">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                          <div className="flex gap-2.5">
                            <BookOpen
                              size={14}
                              className="text-slate-800 shrink-0 mt-0.5"
                              strokeWidth={2.5}
                            />
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Akses Program Kelas
                              </p>
                              <p className="font-bold text-slate-800 text-xs leading-snug line-clamp-1">
                                {trx.course?.title}
                              </p>
                            </div>
                          </div>
                          {trx.gateway_reference === "MIDTRANS_SNAP" ? (
                            <span className="text-[9px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                              <Zap size={10} /> Auto-System
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                              <Clock size={10} /> Manual Review
                            </span>
                          )}
                        </div>

                        {trx.gateway_reference === "MIDTRANS_SNAP" ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center shadow-sm">
                            <p className="font-bold text-amber-700 text-xs tracking-wide flex items-center justify-center gap-1.5">
                              <Clock size={14} /> Menunggu Pembayaran dari
                              Mahasiswa
                            </p>
                            <p className="text-[10px] font-semibold text-amber-600 mt-1">
                              Sistem kami akan memverifikasi dan menyetujui
                              kelas secara otomatis saat mahasiswa melunasi
                              tagihan (Webhook).
                            </p>
                          </div>
                        ) : (
                          <div
                            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors group shadow-sm"
                            onClick={() => {
                              setSelectedReceipt(trx.payment_url);
                              document
                                .getElementById("modal_receipt")
                                .showModal();
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <Receipt
                                size={14}
                                className="text-slate-600"
                                strokeWidth={2.5}
                              />
                              <span className="font-bold text-slate-800 text-xs tracking-wide">
                                Lihat Slip Bukti Transfer
                              </span>
                            </div>
                            <ExternalLink
                              size={14}
                              className="text-slate-300 group-hover:text-slate-900 transition-colors"
                            />
                          </div>
                        )}
                      </div>

                      {trx.gateway_reference !== "MIDTRANS_SNAP" && (
                        <div className="grid grid-cols-2 gap-2.5 p-4 pt-0 bg-slate-50/30 mt-auto">
                          <button
                            onClick={() => handleValidate(trx.id, "REJECT")}
                            disabled={processingId === trx.id}
                            className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {processingId === trx.id ? (
                              <span className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <>
                                <XCircle size={12} strokeWidth={2.5} /> Tolak
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleValidate(trx.id, "APPROVE")}
                            disabled={processingId === trx.id}
                            className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-lg py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            {processingId === trx.id ? (
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <>
                                <CheckCircle size={12} strokeWidth={2.5} />{" "}
                                Validasi ACC
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PANEL KANAN */}
            <div className="w-full lg:w-1/3 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-3 px-1 shrink-0">
                <BarChart3 size={14} className="text-slate-900" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
                  Performa Produk Studio
                </h3>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 flex flex-col flex-1 min-h-0 overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 shrink-0">
                  Rincian Per Judul Kelas
                </p>
                {analytics.coursePerformance.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-medium text-xs flex-1 flex flex-col items-center justify-center">
                    <Award size={20} className="text-slate-300 mb-2" /> Belum
                    ada produk terjual.
                  </div>
                ) : (
                  <div
                    className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 mt-3 space-y-2.5 pb-2"
                    style={{ scrollbarGutter: "stable" }}
                  >
                    {analytics.coursePerformance.map((courseItem, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors shrink-0"
                      >
                        <div className="overflow-hidden mr-3">
                          <span
                            className="font-bold text-xs text-slate-900 block truncate max-w-[160px]"
                            title={courseItem.title}
                          >
                            {courseItem.title}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mt-0.5">
                            {courseItem.sales_count || 0} Terjual
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-xs text-slate-900">
                            {formatRupiah(courseItem.revenue || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* TAMPILAN TAB 2: DOMPET & PENARIKAN (FLAT PRO STYLE)                       */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 animate-in fade-in zoom-in-95 duration-300">
            {/* PANEL KIRI: KARTU SALDO & FORM TARIK */}
            <div className="w-full lg:w-1/3 flex flex-col gap-5 min-h-0 shrink-0">
              {/* Kartu Saldo Flat Pro */}
              <div className="bg-slate-900 rounded-xl p-6 relative overflow-hidden shadow-md">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Wallet size={14} /> Saldo Bersih Studio
                    </span>
                    <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded border border-white/10">
                      IDR
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                    {formatRupiah(walletBalance)}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Dana siap ditarik ke rekening bank Anda.
                  </p>

                  <button
                    onClick={() =>
                      document.getElementById("modal_withdraw").showModal()
                    }
                    disabled={walletBalance < 10000} // 🔥 SUDAH DITURUNKAN KE 10 RIBU
                    className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight size={14} strokeWidth={3} /> Cairkan
                    Pendapatan
                  </button>
                  {walletBalance < 10000 && (
                    <p className="text-[9px] text-center text-slate-500 mt-2">
                      *Minimal pencairan Rp 10.000
                    </p>
                  )}
                </div>
              </div>

              {/* Info Potongan Komisi */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-sm">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ArrowRightLeft size={14} className="text-slate-400" /> Skema
                  Bagi Hasil
                </h3>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span>Pendapatan Dosen (Net)</span>
                    <span className="text-emerald-600 font-black">80%</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span>Platform Fee (Admin)</span>
                    <span className="text-slate-900 font-black">20%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Setiap transaksi otomatis dipotong 20% untuk biaya
                    operasional server. Saldo dompet adalah 100% hak bersih
                    Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* PANEL KANAN: RIWAYAT PENARIKAN */}
            <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Landmark size={16} className="text-slate-500" /> Riwayat
                  Pencairan Dana
                </h3>
                <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded shadow-xs">
                  {withdrawHistory.length} Transaksi
                </span>
              </div>

              {withdrawHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
                  <Receipt
                    size={32}
                    className="mb-2 opacity-30 text-slate-400"
                  />
                  <p className="text-xs font-bold text-slate-900 mb-1 uppercase tracking-wider">
                    Belum Ada Riwayat
                  </p>
                  <p className="text-[11px] font-medium max-w-xs">
                    Anda belum pernah melakukan penarikan saldo pendapatan ke
                    rekening bank.
                  </p>
                </div>
              ) : (
                <div
                  className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {withdrawHistory.map((wd) => (
                    <div
                      key={wd.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${wd.status === "APPROVED" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : wd.status === "REJECTED" ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-amber-50 border-amber-100 text-amber-600"}`}
                        >
                          {wd.status === "APPROVED" ? (
                            <CheckCircle size={16} strokeWidth={3} />
                          ) : wd.status === "REJECTED" ? (
                            <XCircle size={16} strokeWidth={3} />
                          ) : (
                            <Clock size={16} strokeWidth={3} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs mb-0.5">
                            {wd.bank_name} -{" "}
                            <span className="font-mono">
                              {wd.account_number}
                            </span>
                          </h4>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                            {wd.account_name}
                          </p>
                          <p className="text-[9px] font-medium text-slate-400 mt-1">
                            {formatDate(wd.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-sm">
                          {formatRupiah(wd.amount)}
                        </p>
                        {wd.status === "APPROVED" ? (
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mt-1">
                            Ditransfer
                          </span>
                        ) : wd.status === "REJECTED" ? (
                          <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block mt-1">
                            Ditolak Admin
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block mt-1 animate-pulse">
                            Diproses
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL BUKTI TRANSFER */}
      <dialog id="modal_receipt" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-xl p-5 border border-slate-200 max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-slate-900" /> Slip Transfer
              Pembayaran
            </h3>
            <form method="dialog">
              <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors text-xs font-bold">
                ✕
              </button>
            </form>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex justify-center items-center min-h-[300px]">
            {selectedReceipt ? (
              <img
                src={selectedReceipt}
                alt="Bukti"
                className="w-full h-auto object-contain max-h-[55vh] rounded"
              />
            ) : (
              <div className="text-center text-slate-400 py-10">
                <AlertCircle size={32} className="mb-2 opacity-40 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  Gambar Gagal Dimuat
                </p>
              </div>
            )}
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop bg-slate-900/20 backdrop-blur-sm"
        >
          <button>close</button>
        </form>
      </dialog>

      {/* MODAL FORMULIR TARIK SALDO */}
      <dialog
        id="modal_withdraw"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box bg-white rounded-xl p-0 max-w-md border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Landmark size={14} className="text-slate-500" /> Form Pencairan
              Saldo
            </h3>
            <form method="dialog">
              <button className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-300 font-bold">
                ✕
              </button>
            </form>
          </div>
          <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4">
            <div className="bg-slate-900 rounded-xl p-4 flex justify-between items-center text-white shadow-inner mb-2">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Saldo Tersedia
                </p>
                <p className="text-xl font-black tracking-tight text-white">
                  {formatRupiah(walletBalance)}
                </p>
              </div>
              <Wallet size={20} className="text-slate-700 opacity-50" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Nominal Pencairan (Rp)
              </label>
              <input
                type="number"
                required
                min="10000"
                max={walletBalance}
                value={withdrawForm.amount}
                onChange={(e) =>
                  setWithdrawForm({ ...withdrawForm, amount: e.target.value })
                }
                placeholder="Cth: 150000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Nama Bank / E-Wallet
                </label>
                <input
                  type="text"
                  required
                  value={withdrawForm.bank_name}
                  onChange={(e) =>
                    setWithdrawForm({
                      ...withdrawForm,
                      bank_name: e.target.value,
                    })
                  }
                  placeholder="Cth: BCA / GoPay"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Nomor Rekening
                </label>
                <input
                  type="number"
                  required
                  value={withdrawForm.account_number}
                  onChange={(e) =>
                    setWithdrawForm({
                      ...withdrawForm,
                      account_number: e.target.value,
                    })
                  }
                  placeholder="Cth: 12345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                required
                value={withdrawForm.account_name}
                onChange={(e) =>
                  setWithdrawForm({
                    ...withdrawForm,
                    account_name: e.target.value,
                  })
                }
                placeholder="Cth: Ferdi Pratama Setia"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isWithdrawing}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-lg text-xs uppercase tracking-wider shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isWithdrawing ? (
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Ajukan Pencairan Sekarang"
              )}
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

export default TransactionsLecturer;
