import { useEffect, useRef, useState } from "react";
import { X, AlertTriangle, LogOut } from "lucide-react";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: "default" | "danger" | "success";
  icon?: "logout" | "warning" | "none";
  imageSrc?: string;
};

export function ConfirmDialog({
  open,
  title = "Confirm",
  description = "Do you want to logout?",
  confirmText = "Logout",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  variant = "default",
  icon = "none",
  imageSrc,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);


  useEffect(() => {
    if (open) {
      setMounted(true);
      lastFocusedRef.current = document.activeElement as HTMLElement;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      const t = setTimeout(() => setMounted(false), 160);
      lastFocusedRef.current?.focus?.();
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const focusable =
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open && !mounted) return null;

  const v = {
    ring:
      variant === "danger"
        ? "ring-red-500/30"
        : variant === "success"
          ? "ring-emerald-500/25"
          : "ring-blue-500/25",
    btn:
      variant === "danger"
        ? "bg-red-600 hover:bg-red-600/90"
        : variant === "success"
          ? "bg-emerald-600 hover:bg-emerald-600/90"
          : "bg-blue-600 hover:bg-blue-600/90",
    iconBg:
      variant === "danger"
        ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
        : variant === "success"
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  };

  const IconEl =
    icon === "logout" ? (
      <LogOut size={18} />
    ) : icon === "warning" ? (
      <AlertTriangle size={18} />
    ) : null;

  return (
    <div
      className={`fixed inset-0 z-[10000] grid place-items-center
        ${open ? "opacity-100" : "opacity-0"} transition-opacity duration-150`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={`relative w-[92%] max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 
          bg-white dark:bg-neutral-950 shadow-2xl
          ring-2 ${v.ring}
          transition-all duration-150
          ${open ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-1 opacity-0"}
        `}
      >
        {/* Header */}
        <div className="px-5 pt-5 flex items-start gap-3">
          {IconEl && (
            <div
              className={`mt-0.5 shrink-0 h-8 w-8 grid place-items-center rounded-xl ${v.iconBg}`}
              aria-hidden
            >
              {IconEl}
            </div>
          )}
          <div className="flex-1 pr-8">
            <h2
              id="dialog-title"
              className="text-lg font-semibold leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="dialog-desc"
                className="mt-1 text-sm text-neutral-600 dark:text-neutral-400"
              >
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {imageSrc && (
          <div className="px-5 mt-4">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <img
                src={imageSrc}
                alt=""
                className="w-full h-36 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 mt-4 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-2 rounded-xl text-white ${v.btn}`}
          >
            {confirmText}
          </button>
        </div>

        <div
          className={`pointer-events-none absolute -inset-[1px] rounded-[22px] 
          bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5`}
          aria-hidden
        />
      </div>
    </div>
  );
}
