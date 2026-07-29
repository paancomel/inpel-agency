import { CheckCircle2, CircleAlert, X } from "lucide-react";

interface ToastNotificationProps {
  message: string;
  tone?: "success" | "error";
  onDismiss?: () => void;
}

export function ToastNotification({
  message,
  tone = "success",
  onDismiss,
}: ToastNotificationProps) {
  const Icon = tone === "success" ? CheckCircle2 : CircleAlert;

  return (
    <div
      className="fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 border border-slate-200 bg-white px-4 py-3 shadow-lg"
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon
        aria-hidden="true"
        className={tone === "success" ? "mt-0.5 text-emerald-600" : "mt-0.5 text-rose-600"}
        size={20}
      />
      <p className="flex-1 text-sm font-medium text-slate-800">{message}</p>
      {onDismiss ? (
        <button
          aria-label="Dismiss notification"
          className="text-slate-400 transition hover:text-slate-700"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      ) : null}
    </div>
  );
}
