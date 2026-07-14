import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clipboard, Mail, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { syncParentSession } from "../lib/portal-data";
import { createSessionRecord, saveSession, type SessionRecord } from "../lib/storage";
import {
  BUDGET_OPTIONS,
  parentProfileSchema,
  type ParentProfile,
} from "../lib/validation";

const locations = ["Johor", "Kuala Lumpur", "Penang", "Sabah", "Sarawak", "Selangor", "Open to anywhere"];
const priorities = [
  "Strong graduate outcomes",
  "Affordable total cost",
  "Scholarship availability",
  "Safe, supportive campus",
  "Recognised accreditation",
  "Close to home",
];

export function ParentPortal() {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ParentProfile>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: { location: "", email: "", expectations: [] },
  });

  const onSubmit = handleSubmit(async (profile) => {
    const nextSession = createSessionRecord(profile);
    if (!saveSession(nextSession)) {
      setSyncMessage("Your browser could not save this invitation. Check private browsing or storage settings.");
      return;
    }

    setSession(nextSession);
    const result = await syncParentSession(nextSession);
    setSyncMessage(
      result.source === "cloud"
        ? "Securely synced. The invitation is ready to share."
        : "Saved on this device. Connect Supabase to sync across devices.",
    );
  });

  const shareUrl = session ? `${window.location.origin}/student/${session.id}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (session) {
    return (
      <section className="mx-auto grid min-h-[72vh] max-w-5xl place-items-center px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full border border-emerald-900/10 bg-[#fafdff] p-7 shadow-[0_24px_70px_rgba(18,63,50,0.10)] sm:p-10 lg:p-12"
        >
          <span className="mb-6 grid size-14 place-items-center rounded-full bg-mint text-leaf">
            <Check className="size-7" aria-hidden="true" />
          </span>
          <p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">Parent profile complete</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight text-forest sm:text-5xl">
            Your invitation is ready.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Send this private link to your student. Their assessment will be paired with your family priorities.
          </p>
          <div className="mt-8 flex flex-col border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-3">
            <code className="min-w-0 flex-1 truncate px-2 py-2 text-sm text-slate-600">{shareUrl}</code>
            <button
              type="button"
              onClick={() => { void copyLink(); }}
              className="inline-flex items-center justify-center gap-2 bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-leaf"
            >
              {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />} {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500" role="status">{syncMessage}</p>
          <Link
            to={`/email-notification/${session.id}`}
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-sun pb-1 font-bold text-forest hover:text-leaf"
          >
            <Mail className="size-4" aria-hidden="true" /> Preview email invitation
          </Link>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute top-10 right-[-8rem] size-80 rounded-full border-[3rem] border-mint/70" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="pt-4 lg:sticky lg:top-36 lg:pt-8">
          <div className="inline-flex items-center gap-2 bg-mint px-3 py-2 text-xs font-bold tracking-[0.14em] text-forest uppercase">
            <Sparkles className="size-4 text-leaf" aria-hidden="true" /> Parent-guided matching
          </div>
          <h1 className="mt-6 max-w-xl font-display text-5xl leading-[1.04] font-bold tracking-[-0.04em] text-forest sm:text-6xl">
            Find the right university, together.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Start with what matters to your family. We’ll combine budget, location and your student’s strengths into a practical shortlist.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-300 pt-6">
            <div><dt className="text-xs font-bold text-slate-500 uppercase">Time</dt><dd className="mt-1 font-display text-2xl font-bold text-forest">3 min</dd></div>
            <div><dt className="text-xs font-bold text-slate-500 uppercase">Match inputs</dt><dd className="mt-1 font-display text-2xl font-bold text-forest">12+</dd></div>
            <div><dt className="text-xs font-bold text-slate-500 uppercase">Next step</dt><dd className="mt-1 font-display text-2xl font-bold text-forest">Student</dd></div>
          </dl>
        </div>

        <form onSubmit={(event) => { void onSubmit(event); }} noValidate className="border border-emerald-900/10 bg-[#fafdff] p-6 shadow-[0_24px_70px_rgba(18,63,50,0.08)] sm:p-10">
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-5">
            <div><p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">Step 1 of 2</p><h2 className="mt-2 font-display text-3xl font-bold text-forest">Family priorities</h2></div>
            <span className="font-display text-2xl text-slate-300">01</span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field label="Preferred study location" error={errors.location?.message}>
              <select {...register("location")} id="location" className="field-control">
                <option value="">Select a location</option>
                {locations.map((location) => <option key={location}>{location}</option>)}
              </select>
            </Field>
            <Field label="Annual education budget" error={errors.budget?.message}>
              <select {...register("budget")} id="budget" className="field-control">
                <option value="">Select a range</option>
                {BUDGET_OPTIONS.map((budget) => <option key={budget}>{budget}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Parent email" error={errors.email?.message}>
              <input {...register("email")} id="email" type="email" autoComplete="email" placeholder="parent@example.com" className="field-control" />
            </Field>
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm font-bold text-forest">What matters most to your family?</legend>
            <p className="mt-1 text-sm text-slate-500">Choose all that apply.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <label key={priority} className="cursor-pointer">
                  <input {...register("expectations")} type="checkbox" value={priority} className="peer sr-only" />
                  <span className="block border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-leaf">
                    {priority}
                  </span>
                </label>
              ))}
            </div>
            {errors.expectations && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{errors.expectations.message}</p>}
          </fieldset>

          {syncMessage && <p className="mt-6 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{syncMessage}</p>}
          <button disabled={isSubmitting} type="submit" className="mt-8 flex w-full items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white transition hover:bg-leaf disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? "Preparing invitation…" : "Generate Student Link"}
          </button>
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">Your answers are used only to create this university match session.</p>
        </form>
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error: string | undefined; children: React.ReactNode }) {
  const id = label === "Parent email" ? "email" : label === "Preferred study location" ? "location" : "budget";
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-forest">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{error}</p>}
    </div>
  );
}
