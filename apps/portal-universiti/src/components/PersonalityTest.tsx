import { Check } from "lucide-react";

import { LIKERT_OPTIONS, PERSONALITY_QUESTIONS } from "../lib/assessment-data";

interface PersonalityTestProps {
  answers: number[];
  onAnswer: (questionIndex: number, value: number) => void;
}

export function PersonalityTest({ answers, onAnswer }: PersonalityTestProps) {
  const answered = answers.filter((answer) => answer !== undefined).length;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 border border-slate-200 bg-slate-50 px-4 py-3">
        <div><strong className="text-forest">{answered} of {PERSONALITY_QUESTIONS.length}</strong><span className="ml-2 text-sm text-slate-500">answered</span></div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-leaf transition-all" style={{ width: `${answered / PERSONALITY_QUESTIONS.length * 100}%` }} /></div>
      </div>
      <div className="space-y-4">
        {PERSONALITY_QUESTIONS.map((question, questionIndex) => (
          <fieldset key={question} className="border border-slate-200 p-5 sm:p-6">
            <legend className="float-left w-full text-base font-bold leading-7 text-forest"><span className="mr-2 text-leaf">{String(questionIndex + 1).padStart(2, "0")}</span>{question}</legend>
            <div className="clear-both mt-5 flex items-end justify-between gap-2 sm:justify-center sm:gap-7">
              {LIKERT_OPTIONS.map((option) => {
                const selected = answers[questionIndex] === option.value;
                return (
                  <label key={option.value} className="group flex cursor-pointer flex-col items-center gap-2">
                    <input type="radio" name={`personality-${questionIndex}`} value={option.value} checked={selected} onChange={() => onAnswer(questionIndex, option.value)} aria-label={option.label} className="peer sr-only" />
                    <span aria-hidden="true" className={`${option.size} grid place-items-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-leaf peer-focus-visible:ring-offset-2 ${selected ? "border-forest bg-forest text-white" : "border-slate-300 bg-white group-hover:border-leaf"}`}>{selected && <Check className="size-4" />}</span>
                    <span aria-hidden="true" className={`hidden max-w-16 text-center text-[0.65rem] font-semibold leading-3 sm:block ${selected ? "text-forest" : "text-slate-400"}`}>{option.label}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold tracking-wide text-slate-400 uppercase sm:hidden"><span>Agree</span><span>Disagree</span></div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
