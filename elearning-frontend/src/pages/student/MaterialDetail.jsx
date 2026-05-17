// import { useEffect, useState, useRef } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import {
//   ChevronLeft,
//   ChevronRight,
//   CheckCircle,
//   Code as CodeIcon,
//   HelpCircle,
//   FileText,
//   Image as ImageIcon,
//   X,
//   Clock,
//   BookOpen,
//   Share2,
//   Sparkles,
// } from "lucide-react";
// import confetti from "canvas-confetti";
// import api from "../../config/axios";
// import toast from "../../utils/toast";

// const MaterialDetail = () => {
//   const { materialId } = useParams();
//   const navigate = useNavigate();

//   const [material, setMaterial] = useState(null);
//   const [courseDetails, setCourseDetails] = useState(null);
//   const [courseIdStr, setCourseIdStr] = useState("");
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [submissionLink, setSubmissionLink] = useState("");
//   const [submissionImage, setSubmissionImage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isUploadingImage, setIsUploadingImage] = useState(false);

//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [materialId]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const resMat = await api.get(`/content/materials/${materialId}`);
//         const matData = resMat.data.data.material;
//         setMaterial(matData);

//         const cId =
//           matData.chapter?.courseId ||
//           matData.chapter?.course_id ||
//           matData.course_id ||
//           localStorage.getItem("activeCourseId");
//         setCourseIdStr(cId);

//         if (cId) {
//           const resCourse = await api.get(`/courses/${cId}`);
//           setCourseDetails(resCourse.data.data.course);
//         }

//         const resProg = await api.get("/progress/me");
//         const myProgress = resProg.data.data.progress;
//         const isDone = myProgress.some(
//           (p) => p.material_id === materialId || p.materialId === materialId,
//         );
//         setIsCompleted(isDone);
//       } catch (error) {
//         console.error("Gagal mengambil data", error);
//         toast.error(
//           "Gagal memuat materi. Pastikan kamu sudah mendaftar kelas ini.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [materialId]);

//   // LOGIKA NAVIGASI PREV / NEXT
//   let prevMaterialId = null;
//   let nextMaterialId = null;
//   let currentIndex = 0;
//   let totalMaterials = 0;

//   if (courseDetails) {
//     const allMaterials = courseDetails.chapters.flatMap((ch) => ch.materials);
//     totalMaterials = allMaterials.length;
//     currentIndex = allMaterials.findIndex((m) => m.id === materialId);

//     if (currentIndex > 0) prevMaterialId = allMaterials[currentIndex - 1].id;
//     if (currentIndex !== -1 && currentIndex < allMaterials.length - 1)
//       nextMaterialId = allMaterials[currentIndex + 1].id;
//   }

//   const handleMarkComplete = async () => {
//     try {
//       await api.post(`/progress/materials/${materialId}/complete`);
//       setIsCompleted(true);
//       toast.success("Mantap! Materi selesai dipelajari.");
//     } catch (error) {
//       toast.error("Gagal menandai selesai. Coba lagi.");
//     }
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (file.size > 2 * 1024 * 1024)
//       return toast.error("Ukuran gambar maksimal 2MB ya coy!");

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       setIsUploadingImage(true);
//       const res = await api.post("/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setSubmissionImage(res.data.url);
//       toast.success("Bukti screenshot berhasil diunggah!");
//     } catch (error) {
//       toast.error("Gagal mengunggah gambar bukti. Pastikan server nyala.");
//     } finally {
//       setIsUploadingImage(false);
//       e.target.value = null;
//     }
//   };

//   const handleSubmitChallenge = async () => {
//     if (!submissionLink)
//       return toast.error("Tautan repository/drive wajib diisi!");
//     setIsSubmitting(true);
//     try {
//       await api.post(`/submissions/materials/${materialId}`, {
//         submission_url: submissionLink,
//         image_url: submissionImage,
//       });
//       await api.post(`/progress/materials/${materialId}/complete`);
//       setIsCompleted(true);
//       toast.success("Misi berhasil diselesaikan! Tugas sudah dikirim.");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Gagal mengirim tugas.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const getMaterialIcon = (type) => {
//     switch (type) {
//       case "LESSON":
//         return <FileText size={16} className="text-blue-500" />;
//       case "QUIZ":
//         return <HelpCircle size={16} className="text-amber-500" />;
//       case "CHALLENGE":
//         return <CodeIcon size={16} className="text-indigo-500" />;
//       default:
//         return <FileText size={16} className="text-slate-500" />;
//     }
//   };

//   const getTypeStyle = (type) => {
//     switch (type) {
//       case "LESSON":
//         return "bg-blue-50 text-blue-700 border-blue-200";
//       case "QUIZ":
//         return "bg-amber-50 text-amber-700 border-amber-200";
//       case "CHALLENGE":
//         return "bg-indigo-50 text-indigo-700 border-indigo-200";
//       default:
//         return "bg-slate-50 text-slate-700 border-slate-200";
//     }
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-slate-50">
//         <span className="loading loading-spinner loading-lg text-slate-900"></span>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-blue-200 relative">
//       {/* 1. STICKY TOP NAVBAR (Workspace Premium) */}
//       <nav className="sticky top-0 z-[110] h-16 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8 transition-all">
//         <div className="flex items-center gap-4">
//           <Link
//             to={`/courses/${courseIdStr}`}
//             className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-600"
//           >
//             <ChevronLeft size={18} strokeWidth={2.5} />
//           </Link>
//           <div className="hidden sm:block border-l border-slate-200 h-8 mx-1"></div>
//           <div className="hidden md:block overflow-hidden">
//             <div className="flex items-center gap-2 mb-0.5">
//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
//                 {courseDetails?.title || "Kelas"}
//               </p>
//               <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
//                 Materi {currentIndex + 1} / {totalMaterials}
//               </span>
//             </div>
//             <p className="text-sm font-extrabold text-slate-900 truncate max-w-[300px] leading-tight">
//               {material?.title}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           {isCompleted && (
//             <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 shadow-sm">
//               <CheckCircle size={14} /> Selesai
//             </div>
//           )}
//           <button className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-slate-500 hover:text-slate-900 shadow-sm">
//             <Share2 size={16} />
//           </button>
//         </div>
//       </nav>

//       <div className="max-w-4xl mx-auto pt-10 px-4 sm:px-6 flex flex-col w-full overflow-x-hidden relative z-10">
//         {/* HEADER SECTION */}
//         <header className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <div
//             className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-5 border shadow-sm ${getTypeStyle(material?.type)}`}
//           >
//             {getMaterialIcon(material?.type)}{" "}
//             {material?.type === "LESSON"
//               ? "Materi Bacaan"
//               : material?.type === "CHALLENGE"
//                 ? "Tugas Praktik"
//                 : "Instruksi Kuis"}
//           </div>
//           <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight mb-6 break-words">
//             {material?.title}
//           </h1>
//           <div className="flex items-center gap-5 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">
//             <div className="flex items-center gap-1.5">
//               <Clock size={14} className="text-slate-400" /> Estimasi 15 Menit
//             </div>
//             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
//             <div className="flex items-center gap-1.5">
//               <BookOpen size={14} className="text-slate-400" />{" "}
//               {courseDetails?.chapters?.length || 0} Bab
//             </div>
//           </div>
//         </header>

//         {/* MAIN CONTENT CARD */}
//         <div className="bg-white rounded-[2rem] p-6 sm:p-10 md:p-14 border border-slate-200 shadow-sm relative overflow-hidden w-full max-w-full mb-10">
//           <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

//           <div className="relative z-10 w-full">
//             {/* TAMPILAN JIKA TUGAS PRAKTIK (CHALLENGE) */}
//             {material?.type === "CHALLENGE" ? (
//               <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500 w-full">
//                 <div className="w-20 h-20 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/20 border border-slate-700">
//                   <CodeIcon size={36} strokeWidth={2} />
//                 </div>
//                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
//                   Misi Praktik ⚔️
//                 </h2>
//                 <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto mb-10 font-medium leading-relaxed">
//                   Buktikan kemampuanmu. Kerjakan tantangan yang diberikan dan
//                   kumpulkan bukti *repository* GitHub serta *screenshot*
//                   hasilnya di bawah ini.
//                 </p>

//                 <div className="max-w-md mx-auto bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-200 text-left shadow-sm">
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">
//                         1. Bukti Screenshot Aplikasi
//                       </label>
//                       {submissionImage ? (
//                         <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-white shadow-sm">
//                           <img
//                             src={submissionImage}
//                             alt="Bukti"
//                             className="w-full h-auto object-cover"
//                           />
//                           {!isCompleted && (
//                             <button
//                               onClick={() => setSubmissionImage("")}
//                               className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white p-2 rounded-xl shadow-lg hover:bg-rose-500 transition-colors"
//                             >
//                               <X size={16} strokeWidth={3} />
//                             </button>
//                           )}
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => fileInputRef.current.click()}
//                           disabled={isUploadingImage || isCompleted}
//                           className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-100 transition-colors group"
//                         >
//                           {isUploadingImage ? (
//                             <span className="loading loading-spinner text-slate-900"></span>
//                           ) : (
//                             <ImageIcon
//                               size={32}
//                               className="text-slate-300 group-hover:text-slate-600 transition-colors"
//                             />
//                           )}
//                           <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider">
//                             Unggah Bukti Gambar
//                           </span>
//                         </button>
//                       )}
//                       <input
//                         type="file"
//                         accept="image/*"
//                         ref={fileInputRef}
//                         className="hidden"
//                         onChange={handleImageUpload}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex justify-between">
//                         2. Tautan Repository / Drive{" "}
//                         <span className="text-rose-500">*Wajib</span>
//                       </label>
//                       <input
//                         type="url"
//                         value={submissionLink}
//                         onChange={(e) => setSubmissionLink(e.target.value)}
//                         disabled={isCompleted || isSubmitting}
//                         placeholder="https://github.com/username/project-kamu"
//                         className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-slate-900 outline-none transition-all font-bold text-sm text-slate-800 placeholder-slate-300 shadow-sm"
//                       />
//                     </div>

//                     {!isCompleted ? (
//                       <button
//                         onClick={handleSubmitChallenge}
//                         disabled={isSubmitting || !submissionLink}
//                         className="w-full btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-slate-200 transition-all mt-4"
//                       >
//                         {isSubmitting ? (
//                           <span className="loading loading-spinner"></span>
//                         ) : (
//                           <>
//                             <Send size={16} className="mr-1" /> Kirim Tugas
//                             Sekarang
//                           </>
//                         )}
//                       </button>
//                     ) : (
//                       <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm mt-4 text-xs">
//                         <CheckCircle size={18} strokeWidth={2.5} /> Tugas
//                         Berhasil Dikirim
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               /* TAMPILAN JIKA MATERI TEORI/KUIS (RENDER HTML DARI QUILL) */
//               <div className="material-html-content animate-in fade-in duration-700 w-full overflow-hidden">
//                 <style>{`
//                   .material-html-content p, .material-html-content h1, .material-html-content h2,
//                   .material-html-content h3, .material-html-content span, .material-html-content li {
//                     white-space: normal !important;
//                     word-wrap: break-word !important;
//                     overflow-wrap: break-word !important;
//                     word-break: break-word !important;
//                     max-width: 100% !important;
//                   }

//                   /* Desain Kode macOS Terminal */
//                   .material-html-content .ql-syntax {
//                     background-color: #0f172a !important; /* slate-900 */
//                     color: #f8fafc !important;
//                     padding: 3.5rem 1.5rem 1.5rem 1.5rem !important;
//                     border-radius: 1rem !important;
//                     font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
//                     font-size: 0.85rem !important;
//                     line-height: 1.7 !important;
//                     position: relative !important;
//                     overflow-x: auto !important;
//                     max-width: 100% !important;
//                     margin: 2.5rem 0 !important;
//                     border: 1px solid #1e293b !important;
//                     box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
//                   }

//                   .material-html-content .ql-syntax::before {
//                     content: '';
//                     position: absolute;
//                     top: 1.25rem;
//                     left: 1.5rem;
//                     width: 0.75rem;
//                     height: 0.75rem;
//                     border-radius: 999px;
//                     background-color: #ef4444; /* rose-500 */
//                     box-shadow: 1.25rem 0 0 #f59e0b, 2.5rem 0 0 #10b981; /* amber & emerald */
//                   }

//                   /* Desain Kotak Info / Peringatan dari Magic Tools Dosen */
//                   .material-html-content blockquote {
//                     border-left: 4px solid #f59e0b !important; /* amber-500 */
//                     background: #fffbeb !important; /* amber-50 */
//                     padding: 1.5rem 1.5rem 1.5rem 2rem !important;
//                     border-radius: 0 1rem 1rem 0 !important;
//                     font-style: normal !important;
//                     color: #475569 !important;
//                     margin: 2.5rem 0 !important;
//                     position: relative;
//                   }

//                   .material-html-content table {
//                      width: 100% !important;
//                      overflow-x: auto !important;
//                      display: block !important;
//                      border-collapse: collapse !important;
//                      margin: 2rem 0 !important;
//                      border-radius: 0.5rem;
//                      overflow: hidden;
//                   }
//                   .material-html-content th {
//                     background-color: #f8fafc !important;
//                     font-weight: 900 !important;
//                     color: #0f172a !important;
//                   }
//                   .material-html-content th, .material-html-content td {
//                     border: 1px solid #e2e8f0 !important;
//                     padding: 14px 16px !important;
//                   }
//                 `}</style>

//                 <div
//                   className="prose prose-slate max-w-full w-full break-words font-sans
//                              prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
//                              prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:font-medium prose-p:text-base sm:prose-p:text-[1.05rem]
//                              prose-img:rounded-2xl prose-img:shadow-xl prose-img:w-full prose-img:border border-slate-100 prose-img:my-10
//                              prose-strong:text-slate-900 prose-strong:font-bold prose-li:text-slate-600 prose-li:font-medium"
//                   dangerouslySetInnerHTML={{ __html: material?.content || "" }}
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* FOOTER NAVIGATION */}
//         <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2 w-full">
//           <div className="w-full sm:w-auto">
//             {prevMaterialId && (
//               <Link
//                 to={`/materials/${prevMaterialId}`}
//                 className="flex items-center gap-3.5 group text-slate-500 hover:text-slate-900 transition-all bg-white sm:bg-transparent p-3 sm:p-0 border border-slate-200 sm:border-transparent rounded-2xl"
//               >
//                 <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm group-hover:-translate-x-1 transition-all">
//                   <ChevronLeft size={20} strokeWidth={3} />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-[9px] uppercase tracking-widest font-black opacity-50 mb-0.5">
//                     Kembali
//                   </p>
//                   <p className="text-xs font-extrabold">Materi Sebelumnya</p>
//                 </div>
//               </Link>
//             )}
//           </div>

//           <div className="w-full sm:w-auto">
//             {!isCompleted ? (
//               material?.type !== "CHALLENGE" && (
//                 <button
//                   onClick={handleMarkComplete}
//                   className="w-full sm:w-auto btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] text-xs"
//                 >
//                   <CheckCircle size={18} className="mr-2" /> Tandai Selesai &
//                   Lanjut
//                 </button>
//               )
//             ) : (
//               <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
//                 {nextMaterialId ? (
//                   <Link
//                     to={`/materials/${nextMaterialId}`}
//                     className="w-full sm:w-auto btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all flex items-center gap-2 group text-xs"
//                   >
//                     Materi Berikutnya{" "}
//                     <ChevronRight
//                       size={18}
//                       className="group-hover:translate-x-1 transition-transform"
//                     />
//                   </Link>
//                 ) : (
//                   <button
//                     onClick={() => {
//                       confetti({
//                         particleCount: 150,
//                         spread: 70,
//                         origin: { y: 0.6 },
//                         colors: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"],
//                       });
//                       toast.success(
//                         "BOM! Keren banget lo udah nyelesaiin semuanya! Jangan lupa klaim sertifikat & poin lo ya.",
//                       );
//                       setTimeout(() => {
//                         navigate(`/courses/${courseIdStr}`);
//                       }, 2500);
//                     }}
//                     className="w-full sm:w-auto btn bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl px-10 h-14 font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 text-xs"
//                   >
//                     <Sparkles size={16} className="mr-1.5 text-yellow-200" />{" "}
//                     Selesai Belajar
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default MaterialDetail;
