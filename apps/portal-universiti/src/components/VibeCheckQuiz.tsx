import { ArrowLeft, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { VIBE_QUESTIONS, type VibeQuestionId } from "../lib/assessment-data";
import { useLanguage } from "../lib/language";

const COPY = {
  ms: {
    question: "Soalan", previous: "Kad sebelumnya", matched: "dipadankan", illustration: "ilustrasi",
    questions: [
      { title: "Suasana Malam Jumaat", prompt: "Di mana anda mahu berehat selepas seminggu yang padat?", options: ["Malam santai di rumah", "Parti kampus / berkenalan"] },
      { title: "Latar Kampus Idaman", prompt: "Persekitaran kampus mana yang terasa lebih serasi?", options: ["Hijau dan tenang", "Kota yang bertenaga"] },
      { title: "Rentak Tugasan", prompt: "Bagaimanakah anda mahu tugasan besar dijalankan?", options: ["Fokus sendiri", "Bergerak bersama pasukan"] },
      { title: "Rentak Harian", prompt: "Pilih rutin yang membantu anda berkembang.", options: ["Ruang untuk meneroka", "Struktur yang jelas"] },
      { title: "Cara Belajar", prompt: "Kelas mana yang akan anda pilih dahulu?", options: ["Studio dan hasilkan karya", "Makmal dan penyelidikan"] },
      { title: "Arah Masa Depan", prompt: "Ke manakah universiti patut membuka peluang untuk anda?", options: ["Bawa perubahan di tanah air", "Terokai dunia"] },
    ],
  },
  en: {
    question: "Question", previous: "Previous card", matched: "matched", illustration: "illustration",
    questions: VIBE_QUESTIONS.map((item) => ({ title: item.title, prompt: item.prompt, options: item.options.map((option) => option.label) })),
  },
  ta: {
    question: "கேள்வி", previous: "முந்தைய அட்டை", matched: "பொருந்தியது", illustration: "விளக்கப்படம்",
    questions: [
      { title: "வெள்ளிக்கிழமை இரவு", prompt: "பரபரப்பான ஒரு வாரத்திற்குப் பிறகு எங்கே ஓய்வெடுக்க விரும்புவீர்கள்?", options: ["வீட்டில் அமைதியான இரவு", "வளாக விழா / புதிய தொடர்புகள்"] },
      { title: "உங்கள் விருப்பமான வளாகம்", prompt: "எந்த வளாகச் சூழல் உங்களுக்கு வீட்டைப் போல உணர வைக்கும்?", options: ["பசுமையும் அமைதியும்", "சுறுசுறுப்பான நகரம்"] },
      { title: "திட்டப் பணியின் ஆற்றல்", prompt: "பெரிய பணிகளை எப்படிச் செய்ய விரும்புவீர்கள்?", options: ["தனியாக முழுக் கவனம்", "குழுவுடன் முன்னேற்றம்"] },
      { title: "தினசரி ஓட்டம்", prompt: "நீங்கள் சிறப்பாக வளர உதவும் வழக்கத்தைத் தேர்ந்தெடுக்கவும்.", options: ["ஆராய இடமுள்ள சுதந்திரம்", "தெளிவான கட்டமைப்பு"] },
      { title: "கற்றல் முறை", prompt: "எந்த வகுப்பை முதலில் தேர்ந்தெடுப்பீர்கள்?", options: ["ஸ்டூடியோவும் உருவாக்கமும்", "ஆய்வகமும் ஆராய்ச்சியும்"] },
      { title: "எதிர்காலப் பாதை", prompt: "பல்கலைக்கழகம் உங்களுக்காக எங்கு வாயில்களைத் திறக்க வேண்டும்?", options: ["சொந்த நாட்டில் தாக்கம் ஏற்படுத்து", "உலகை ஆராயுங்கள்"] },
    ],
  },
  "zh-CN": {
    question: "问题", previous: "上一张", matched: "已匹配", illustration: "插图",
    questions: [
      { title: "周五夜晚", prompt: "忙碌一周后，你想在哪里恢复能量？", options: ["宅家放松", "校园聚会 / 结识新朋友"] },
      { title: "理想校园环境", prompt: "哪种校园环境更有家的感觉？", options: ["绿意宁静", "活力都市"] },
      { title: "项目节奏", prompt: "你希望怎样完成大型作业？", options: ["独立专注", "团队并肩推进"] },
      { title: "日常节奏", prompt: "选择最能让你发挥状态的日常安排。", options: ["保留探索空间", "清晰有序"] },
      { title: "学习方式", prompt: "你会优先选择哪种课堂？", options: ["工作室与创作", "实验室与研究"] },
      { title: "未来方向", prompt: "你希望大学为你打开哪里的机会之门？", options: ["在本地创造影响", "探索世界"] },
    ],
  },
} as const;

type VibeAnswers = { [Key in VibeQuestionId]?: string | undefined };

export function VibeCheckQuiz({ answers, onAnswer }: { answers: VibeAnswers; onAnswer: (id: VibeQuestionId, value: string) => void }) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const firstUnanswered = VIBE_QUESTIONS.findIndex((question) => !answers[question.id]);
  const [activeIndex, setActiveIndex] = useState(firstUnanswered === -1 ? VIBE_QUESTIONS.length - 1 : firstUnanswered);
  const question = VIBE_QUESTIONS[activeIndex]!;
  const questionCopy = copy.questions[activeIndex]!;

  function choose(value: string) {
    onAnswer(question.id, value);
    if (activeIndex < VIBE_QUESTIONS.length - 1) setActiveIndex((index) => index + 1);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between"><p className="text-sm font-bold text-leaf">{copy.question} {activeIndex + 1} / {VIBE_QUESTIONS.length}</p><div className="flex gap-1.5">{VIBE_QUESTIONS.map((item, index) => <span key={item.id} className={`h-2 w-8 ${answers[item.id] ? "bg-leaf" : index === activeIndex ? "bg-sun" : "bg-slate-200"}`} />)}</div></div>
      <motion.div key={question.id} initial={{ opacity: 0, x: 30, rotate: 1 }} animate={{ opacity: 1, x: 0, rotate: 0 }} className="border border-slate-200 bg-slate-50 p-5 sm:p-8">
        <p className="text-xs font-bold tracking-[0.16em] text-leaf uppercase">{questionCopy.title}</p>
        <h3 className="mt-2 font-display text-3xl font-bold text-forest">{questionCopy.prompt}</h3>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            const selected = answers[question.id] === option.id;
            const label = questionCopy.options[optionIndex]!;
            return <button key={option.id} type="button" aria-pressed={selected} onClick={() => choose(option.id)} className={`group overflow-hidden border-2 text-left transition hover:-translate-y-1 hover:shadow-xl ${selected ? "border-forest ring-4 ring-mint" : "border-transparent bg-white"}`}><VibeIllustration tone={option.tone} variant={optionIndex} label={label} illustrationLabel={copy.illustration} /><span className="flex items-center justify-between px-5 py-4 font-display text-xl font-bold text-forest">{label}{selected && <span className="grid size-7 place-items-center rounded-full bg-forest text-white"><Check className="size-4" /></span>}</span></button>;
          })}
        </div>
      </motion.div>
      <div className="mt-4 flex items-center justify-between"><button type="button" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest disabled:opacity-30"><ArrowLeft className="size-4" /> {copy.previous}</button><p className="text-sm text-slate-500">{Object.keys(answers).length} / 6 {copy.matched}</p></div>
    </div>
  );
}

function VibeIllustration({ tone, variant, label, illustrationLabel }: { tone: string; variant: number; label: string; illustrationLabel: string }) {
  const colors: Record<string, [string, string]> = { mint: ["#cfeee2", "#247158"], sun: ["#ffe49a", "#c06b17"], blue: ["#cfe5ff", "#24578f"], violet: ["#e5dcff", "#6750a4"] };
  const [background, foreground] = colors[tone] ?? colors.mint!;
  return <svg role="img" aria-label={`${label} — ${illustrationLabel}`} viewBox="0 0 400 220" className="h-44 w-full" style={{ background }}><circle cx={variant ? 300 : 95} cy="68" r="44" fill={foreground} opacity="0.18" /><circle cx={variant ? 120 : 285} cy="158" r="64" fill={foreground} opacity="0.12" /><path d={variant ? "M58 165 C135 68 250 70 344 150" : "M55 150 C130 80 240 188 345 72"} fill="none" stroke={foreground} strokeWidth="12" strokeLinecap="round" opacity="0.7" /><rect x="145" y="78" width="110" height="72" rx="18" fill="#fff" opacity="0.9" /><circle cx="180" cy="114" r="14" fill={foreground} /><path d="M205 105h30M205 123h22" stroke={foreground} strokeWidth="8" strokeLinecap="round" /></svg>;
}
