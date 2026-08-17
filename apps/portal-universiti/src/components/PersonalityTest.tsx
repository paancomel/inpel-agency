import { Check } from "lucide-react";

import { LIKERT_OPTIONS, PERSONALITY_QUESTIONS } from "../lib/assessment-data";
import { useLanguage } from "../lib/language";

const COPY = {
  ms: {
    answered: "dijawab", agree: "Setuju", disagree: "Tidak setuju",
    options: ["Setuju", "Agak setuju", "Neutral", "Agak tidak setuju", "Tidak setuju"],
    questions: ["Anda mudah mendapat kawan baharu.", "Idea yang rumit dan baharu lebih menarik minat anda berbanding idea yang ringkas.", "Anda biasanya lebih yakin dengan perkara yang menyentuh perasaan berbanding hujah berdasarkan fakta.", "Anda suka membahagikan masalah yang sukar kepada langkah-langkah kecil yang logik.", "Anda lebih bersemangat apabila membentangkan idea kepada sekumpulan orang.", "Anda peka terhadap perincian visual, corak dan nilai estetika yang mungkin tidak disedari orang lain.", "Anda suka membina, membaiki atau mencuba untuk memahami cara sesuatu berfungsi.", "Anda secara semula jadi suka menyusun orang dan memastikan rancangan bersama terus berjalan.", "Anda ingin tahu sebab di sebalik tingkah laku manusia.", "Anda lebih suka melihat bukti dan data sebelum membuat keputusan penting.", "Anda suka menulis, bercerita atau menyusun mesej untuk sesuatu khalayak.", "Anda lebih rela menguji idea dalam dunia sebenar daripada sekadar membincangkannya.", "Anda kekal tenang apabila seseorang memerlukan bantuan praktikal atau kata-kata yang meyakinkan.", "Anda suka berunding, memujuk atau memperjuangkan sesuatu pandangan.", "Anda boleh membayangkan beberapa penyelesaian berbeza untuk cabaran yang sama.", "Anda terdorong oleh kerja yang membawa kesan positif kepada orang lain."],
  },
  en: {
    answered: "answered", agree: "Agree", disagree: "Disagree",
    options: LIKERT_OPTIONS.map((option) => option.label), questions: [...PERSONALITY_QUESTIONS],
  },
  ta: {
    answered: "பதிலளிக்கப்பட்டது", agree: "ஒப்புக்கொள்கிறேன்", disagree: "ஒப்புக்கொள்ளவில்லை",
    options: ["ஒப்புக்கொள்கிறேன்", "ஓரளவு ஒப்புக்கொள்கிறேன்", "நடுநிலை", "ஓரளவு ஒப்புக்கொள்ளவில்லை", "ஒப்புக்கொள்ளவில்லை"],
    questions: ["நீங்கள் எளிதில் புதிய நண்பர்களை உருவாக்குவீர்கள்.", "எளிய யோசனைகளைவிட சிக்கலான, புதுமையான யோசனைகள் உங்களை அதிகம் ஈர்க்கும்.", "உண்மைத் தகவல்களின் அடிப்படையிலான வாதங்களைவிட உணர்வுபூர்வமாக உங்களைத் தொடும் விஷயங்களால் நீங்கள் அதிகம் நம்பிக்கை பெறுவீர்கள்.", "கடினமான பிரச்சினைகளைச் சிறிய, தர்க்கரீதியான படிகளாகப் பிரிப்பது உங்களுக்குப் பிடிக்கும்.", "ஒரு குழுவினரிடம் யோசனைகளை விளக்கும்போது நீங்கள் உற்சாகமடைவீர்கள்.", "மற்றவர்கள் தவறவிடக்கூடிய காட்சி நுணுக்கங்கள், வடிவங்கள் மற்றும் அழகியலை நீங்கள் கவனிப்பீர்கள்.", "பொருட்களை உருவாக்குவது, பழுதுபார்ப்பது அல்லது அவை எப்படி இயங்குகின்றன என்று சோதிப்பது உங்களுக்குப் பிடிக்கும்.", "மக்களை ஒருங்கிணைத்து, அனைவரின் திட்டமும் முன்னேறச் செய்வது உங்களுக்கு இயல்பாக வரும்.", "மக்கள் ஏன் ஒரு குறிப்பிட்ட விதத்தில் நடந்துகொள்கிறார்கள் என்பதை அறிய ஆர்வமாக இருப்பீர்கள்.", "முக்கிய முடிவெடுக்கும் முன் ஆதாரங்களையும் தரவுகளையும் பார்க்க விரும்புவீர்கள்.", "எழுதுவது, கதை சொல்வது அல்லது ஒரு பார்வையாளர் குழுவுக்காக செய்தியை வடிவமைப்பது உங்களுக்குப் பிடிக்கும்.", "ஒரு யோசனையைப் பற்றி பேசுவதைக் காட்டிலும் அதை நிஜ உலகில் சோதித்துப் பார்க்க விரும்புவீர்கள்.", "ஒருவருக்கு நடைமுறை உதவியோ ஆறுதலோ தேவைப்படும்போது நீங்கள் அமைதியாக இருப்பீர்கள்.", "பேச்சுவார்த்தை நடத்துவது, சம்மதிக்க வைப்பது அல்லது ஒரு கருத்தை ஆதரிப்பது உங்களுக்குப் பிடிக்கும்.", "ஒரே சவாலுக்குப் பல்வேறு தீர்வுகளை நீங்கள் கற்பனை செய்ய முடியும்.", "மற்றவர்களுக்கு நல்ல மாற்றத்தை ஏற்படுத்தும் வேலை உங்களை ஊக்குவிக்கும்."],
  },
  "zh-CN": {
    answered: "已回答", agree: "同意", disagree: "不同意",
    options: ["同意", "比较同意", "中立", "比较不同意", "不同意"],
    questions: ["你经常能结交新朋友。", "比起简单直接的想法，复杂而新颖的想法更能吸引你。", "相比基于事实的论点，你通常更容易被能引起情感共鸣的内容说服。", "你喜欢把难题拆成一个个有逻辑的小步骤。", "向一群人介绍想法时，你会更有活力。", "你能留意到别人可能忽略的视觉细节、规律和美感。", "你喜欢动手制作、修理，或尝试了解事物如何运作。", "你很自然地会组织大家，并推动共同计划继续前进。", "你对人们行为背后的原因感到好奇。", "做重要决定前，你更愿意先看证据和数据。", "你喜欢写作、讲故事，或为受众组织信息。", "比起只讨论一个想法，你更愿意在现实中试一试。", "当别人需要实际帮助或安慰时，你能够保持冷静。", "你喜欢谈判、说服他人，或为某个观点发声。", "面对同一个挑战，你能想到好几种不同的解决办法。", "能为他人带来积极影响的工作会激励你。"],
  },
} as const;

interface PersonalityTestProps {
  answers: number[];
  onAnswer: (questionIndex: number, value: number) => void;
}

export function PersonalityTest({ answers, onAnswer }: PersonalityTestProps) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const answered = answers.filter((answer) => answer !== undefined).length;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 border border-slate-200 bg-slate-50 px-4 py-3">
        <div><strong className="text-forest">{answered} / {PERSONALITY_QUESTIONS.length}</strong><span className="ml-2 text-sm text-slate-500">{copy.answered}</span></div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-leaf transition-all" style={{ width: `${answered / PERSONALITY_QUESTIONS.length * 100}%` }} /></div>
      </div>
      <div className="space-y-4">
        {PERSONALITY_QUESTIONS.map((question, questionIndex) => (
          <fieldset key={question} className="border border-slate-200 p-5 sm:p-6">
            <legend className="float-left w-full text-base font-bold leading-7 text-forest"><span className="mr-2 text-leaf">{String(questionIndex + 1).padStart(2, "0")}</span>{copy.questions[questionIndex]}</legend>
            <div className="clear-both mt-5 flex items-end justify-between gap-2 sm:justify-center sm:gap-7">
              {LIKERT_OPTIONS.map((option, optionIndex) => {
                const selected = answers[questionIndex] === option.value;
                return (
                  <label key={option.value} className="group flex cursor-pointer flex-col items-center gap-2">
                    <input type="radio" name={`personality-${questionIndex}`} value={option.value} checked={selected} onChange={() => onAnswer(questionIndex, option.value)} aria-label={copy.options[optionIndex]} className="peer sr-only" />
                    <span aria-hidden="true" className={`${option.size} grid place-items-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-leaf peer-focus-visible:ring-offset-2 ${selected ? "border-forest bg-forest text-white" : "border-slate-300 bg-white group-hover:border-leaf"}`}>{selected && <Check className="size-4" />}</span>
                    <span aria-hidden="true" className={`hidden max-w-16 text-center text-[0.65rem] font-semibold leading-3 sm:block ${selected ? "text-forest" : "text-slate-400"}`}>{copy.options[optionIndex]}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between text-xs font-bold tracking-wide text-slate-400 uppercase sm:hidden"><span>{copy.agree}</span><span>{copy.disagree}</span></div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
