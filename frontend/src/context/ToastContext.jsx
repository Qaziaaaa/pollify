// ===== TOAST CONTEXT =====
// Provides a global toast notification system. Toasts auto-dismiss after 3 seconds.
// Usage: toast("message") or toast.success("msg") / toast.error("msg")

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Object.assign lets us call toast("msg") directly or toast.success("msg")
  const toast = Object.assign(
    (msg, type = "success") => addToast(msg, type),
    { success: (msg) => addToast(msg, "success"), error: (msg) => addToast(msg, "error") }
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all ${t.type === "success" ? "bg-zinc-900 border-emerald-500/30 text-emerald-400" : "bg-zinc-900 border-rose-500/30 text-rose-400"}`}>
            {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
