import { useEffect, useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, Receipt, 
  User, BookOpen, AlertCircle, ExternalLink, ShieldCheck 
} from 'lucide-react';
import api from '../../config/axios';
import toast from '../../utils/toast';

const TransactionsLecturer = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk animasi tombol (biar nggak di-klik 2x)
  const [processingId, setProcessingId] = useState(null);
  
  // State untuk modal gambar
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/pending');
      setTransactions(response.data.data || []);
    } catch (error) {
      toast.error('Gagal mengambil data transaksi pending');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (transactionId, action) => {
    try {
      setProcessingId(transactionId);
      await api.put(`/transactions/${transactionId}/validate`, { action });
      
      toast.success(action === 'APPROVE' ? 'Pembayaran di-ACC! Mahasiswa kini bisa akses kelas.' : 'Pembayaran ditolak.');
      
      // Hapus transaksi dari daftar secara instan (Optimistic UI Update)
      setTransactions((prev) => prev.filter(t => t.id !== transactionId));
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memvalidasi transaksi');
    } finally {
      setProcessingId(null);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) return <div className="min-h-[70vh] flex justify-center items-center"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>;

  return (
    <div className="max-w-7xl mx-auto font-sans pb-20 pt-8 px-4 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </span>
            Validasi Pembayaran
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-base">
            Periksa bukti transfer mahasiswa dan berikan akses untuk kelas premium Anda.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <Clock size={20} className="text-slate-400" />
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Antrean</p>
            <p className="text-lg font-black text-slate-800">{transactions.length} Request</p>
          </div>
        </div>
      </div>

      {/* Jika Kosong */}
      {transactions.length === 0 ? (
        <div className="bg-white border border-slate-200 p-20 rounded-[2rem] text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Semua Bersih!</h2>
          <p className="text-slate-500 font-medium">Belum ada permintaan validasi pembayaran yang baru masuk.</p>
        </div>
      ) : (
        /* Grid Antrean */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transactions.map((trx) => (
            <div key={trx.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{trx.student?.name}</h3>
                    <p className="text-sm text-slate-500">{trx.student?.email}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      {formatDate(trx.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nominal</p>
                  <p className="text-xl font-black text-amber-600">{formatRupiah(trx.amount)}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 flex gap-3 border border-slate-100">
                  <BookOpen size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Membeli Kelas</p>
                    <p className="font-bold text-slate-700 leading-tight">{trx.course?.title}</p>
                  </div>
                </div>

                <div 
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 border-dashed rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors group"
                  onClick={() => {
                    setSelectedReceipt(trx.payment_url);
                    document.getElementById('modal_receipt').showModal();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Receipt size={20} className="text-amber-600" />
                    <span className="font-bold text-amber-800">Cek Bukti Transfer</span>
                  </div>
                  <ExternalLink size={18} className="text-amber-500 group-hover:text-amber-700 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => handleValidate(trx.id, 'REJECT')}
                  disabled={processingId === trx.id}
                  className="btn bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl"
                >
                  {processingId === trx.id ? <span className="loading loading-spinner"></span> : <><XCircle size={18}/> Tolak</>}
                </button>
                <button 
                  onClick={() => handleValidate(trx.id, 'APPROVE')}
                  disabled={processingId === trx.id}
                  className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl shadow-sm shadow-emerald-200"
                >
                  {processingId === trx.id ? <span className="loading loading-spinner"></span> : <><CheckCircle size={18}/> ACC Kelas</>}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal View Receipt */}
      <dialog id="modal_receipt" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-slate-900 rounded-[2rem] p-4 max-w-2xl relative">
          <form method="dialog">
            <button className="btn btn-sm btn-circle bg-slate-800 text-white border-none absolute right-4 top-4 hover:bg-rose-500 z-50">✕</button>
          </form>
          <div className="pt-8 pb-4">
            {selectedReceipt ? (
              <img src={selectedReceipt} alt="Bukti Transfer" className="w-full rounded-xl object-contain max-h-[70vh]" />
            ) : (
              <div className="text-center text-slate-400 py-10">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Gambar tidak tersedia atau URL rusak.</p>
              </div>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

    </div>
  );
};

export default TransactionsLecturer;