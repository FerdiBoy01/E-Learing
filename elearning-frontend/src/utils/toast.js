/**
 * Toast Notification - Apple iOS Glass Style
 */

const showToast = (message, type = "info", duration = 3000) => {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className =
      "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toastEl = document.createElement("div");

  // Warna solid tapi elegan
  const config = {
    success: {
      text: "text-emerald-700",
      bg: "bg-emerald-50/80",
      border: "border-emerald-200/50",
      icon: "✓",
    },
    error: {
      text: "text-rose-700",
      bg: "bg-rose-50/80",
      border: "border-rose-200/50",
      icon: "✕",
    },
    warning: {
      text: "text-amber-700",
      bg: "bg-amber-50/80",
      border: "border-amber-200/50",
      icon: "!",
    },
    info: {
      text: "text-indigo-700",
      bg: "bg-indigo-50/80",
      border: "border-indigo-200/50",
      icon: "i",
    },
  };

  const { text, bg, border, icon } = config[type] || config.info;

  // Efek Glass: backdrop-blur-md
  toastEl.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm border ${border} ${bg} backdrop-blur-md ${text} text-sm font-semibold transform -translate-y-4 opacity-0 transition-all duration-300 ease-out`;

  toastEl.innerHTML = `<span class="flex items-center justify-center w-5 h-5 rounded-md bg-white shadow-sm text-xs font-bold">${icon}</span> <span>${message}</span>`;

  toastContainer.appendChild(toastEl);

  // Animasi Pop-down perlahan
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toastEl.classList.remove("-translate-y-4", "opacity-0");
      toastEl.classList.add("translate-y-0", "opacity-100");
    });
  });

  setTimeout(() => {
    toastEl.classList.remove("translate-y-0", "opacity-100");
    toastEl.classList.add("-translate-y-4", "opacity-0");
    setTimeout(() => {
      if (toastContainer.contains(toastEl)) toastContainer.removeChild(toastEl);
    }, 300);
  }, duration);
};

export const toast = {
  success: (message, duration) => showToast(message, "success", duration),
  error: (message, duration) => showToast(message, "error", duration),
  warning: (message, duration) => showToast(message, "warning", duration),
  info: (message, duration) => showToast(message, "info", duration),
};

export default toast;
