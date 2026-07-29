import { LockKeyhole, PenLine } from "lucide-react";

import type { ReviewIdentity } from "../lib/types";

interface NavbarProps {
  identity: ReviewIdentity | null;
  onSignIn: () => void;
  onWriteReview: () => void;
}

export function Navbar({ identity, onSignIn, onWriteReview }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-sea-fog bg-white/95 backdrop-blur-md" aria-label="Primary navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 text-midnight-harbor" aria-label="INPOLOR home">
          <span className="grid size-8 place-items-center bg-mint-signal font-display text-sm">IP</span>
          <span className="font-display text-lg tracking-tight">INPOLOR</span>
        </a>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onSignIn} className="hidden items-center gap-2 px-3 py-2 text-sm font-bold text-deep-current hover:text-tidal-teal sm:flex">
            <LockKeyhole size={16} aria-hidden="true" />
            {identity ? "Signed in" : "Sign in"}
          </button>
          <button type="button" onClick={onWriteReview} className="flex items-center gap-2 rounded-full bg-midnight-harbor px-4 py-2.5 text-sm font-bold text-white transition hover:bg-deep-current">
            <PenLine size={16} aria-hidden="true" />
            Write a review
          </button>
        </div>
      </div>
    </nav>
  );
}
