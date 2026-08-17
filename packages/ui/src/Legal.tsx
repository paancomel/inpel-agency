import { Link } from "react-router-dom";

export const LEGAL_PATHS = {
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  privacyMs: "/legal/privacy-ms",
} as const;

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Legal" className={className}>
      <Link to={LEGAL_PATHS.terms}>Terms &amp; Conditions</Link>
      <Link to={LEGAL_PATHS.privacy}>Privacy Policy (English)</Link>
      <Link lang="ms" to={LEGAL_PATHS.privacyMs}>Dasar Privasi (Bahasa Malaysia)</Link>
    </nav>
  );
}

export function LegalDocument({ content }: { content: string }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-7">{content}</pre>
      </article>
      <LegalLinks className="mx-auto mt-8 flex max-w-4xl flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-emerald-900 underline underline-offset-4" />
    </main>
  );
}
