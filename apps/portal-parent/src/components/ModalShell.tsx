import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

interface ModalShellProps {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "lg";
}

export function ModalShell({ titleId, onClose, children, size = "lg" }: ModalShellProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog) return;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.focus();

    return () => {
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 z-50 m-0 grid h-full max-h-none w-full max-w-none place-items-center overflow-y-auto bg-midnight-harbor/70 p-4 backdrop-blur-md"
    >
      <section className={`animate-scaleUp relative my-auto w-full overflow-hidden bg-white shadow-2xl ${size === "sm" ? "max-w-sm rounded-3xl" : "max-w-2xl rounded-[32px]"}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-sea-fog bg-white text-midnight-harbor transition hover:bg-ice-tint"
          aria-label="Close modal"
        >
          <X aria-hidden="true" size={19} />
        </button>
        {children}
      </section>
    </dialog>
  );
}
