import { ArrowLeft, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { VIBE_QUESTIONS, type VibeQuestionId } from "../lib/assessment-data";

type VibeAnswers = { [Key in VibeQuestionId]?: string | undefined };

export function VibeCheckQuiz({ answers, onAnswer }: { answers: VibeAnswers; onAnswer: (id: VibeQuestionId, value: string) => void }) {
  const firstUnanswered = VIBE_QUESTIONS.findIndex((question) => !answers[question.id]);
  const [activeIndex, setActiveIndex] = useState(firstUnanswered === -1 ? VIBE_QUESTIONS.length - 1 : firstUnanswered);
  const question = VIBE_QUESTIONS[activeIndex]!;

  function choose(value: string) {
    onAnswer(question.id, value);
    if (activeIndex < VIBE_QUESTIONS.length - 1) setActiveIndex((index) => index + 1);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between"><p className="text-sm font-bold text-leaf">Question {activeIndex + 1} / {VIBE_QUESTIONS.length}</p><div className="flex gap-1.5">{VIBE_QUESTIONS.map((item, index) => <span key={item.id} className={`h-2 w-8 ${answers[item.id] ? "bg-leaf" : index === activeIndex ? "bg-sun" : "bg-slate-200"}`} />)}</div></div>
      <motion.div key={question.id} initial={{ opacity: 0, x: 30, rotate: 1 }} animate={{ opacity: 1, x: 0, rotate: 0 }} className="border border-slate-200 bg-slate-50 p-5 sm:p-8">
        <p className="text-xs font-bold tracking-[0.16em] text-leaf uppercase">{question.title}</p>
        <h3 className="mt-2 font-display text-3xl font-bold text-forest">{question.prompt}</h3>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            const selected = answers[question.id] === option.id;
            return <button key={option.id} type="button" aria-pressed={selected} onClick={() => choose(option.id)} className={`group overflow-hidden border-2 text-left transition hover:-translate-y-1 hover:shadow-xl ${selected ? "border-forest ring-4 ring-mint" : "border-transparent bg-white"}`}><VibeIllustration tone={option.tone} variant={optionIndex} label={option.label} /><span className="flex items-center justify-between px-5 py-4 font-display text-xl font-bold text-forest">{option.label}{selected && <span className="grid size-7 place-items-center rounded-full bg-forest text-white"><Check className="size-4" /></span>}</span></button>;
          })}
        </div>
      </motion.div>
      <div className="mt-4 flex items-center justify-between"><button type="button" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest disabled:opacity-30"><ArrowLeft className="size-4" /> Previous card</button><p className="text-sm text-slate-500">{Object.keys(answers).length} of 6 matched</p></div>
    </div>
  );
}

function VibeIllustration({ tone, variant, label }: { tone: string; variant: number; label: string }) {
  const colors: Record<string, [string, string]> = { mint: ["#cfeee2", "#247158"], sun: ["#ffe49a", "#c06b17"], blue: ["#cfe5ff", "#24578f"], violet: ["#e5dcff", "#6750a4"] };
  const [background, foreground] = colors[tone] ?? colors.mint!;
  return <svg role="img" aria-label={`${label} illustration`} viewBox="0 0 400 220" className="h-44 w-full" style={{ background }}><circle cx={variant ? 300 : 95} cy="68" r="44" fill={foreground} opacity="0.18" /><circle cx={variant ? 120 : 285} cy="158" r="64" fill={foreground} opacity="0.12" /><path d={variant ? "M58 165 C135 68 250 70 344 150" : "M55 150 C130 80 240 188 345 72"} fill="none" stroke={foreground} strokeWidth="12" strokeLinecap="round" opacity="0.7" /><rect x="145" y="78" width="110" height="72" rx="18" fill="#fff" opacity="0.9" /><circle cx="180" cy="114" r="14" fill={foreground} /><path d="M205 105h30M205 123h22" stroke={foreground} strokeWidth="8" strokeLinecap="round" /></svg>;
}
