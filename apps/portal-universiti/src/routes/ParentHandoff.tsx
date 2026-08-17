import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { ParentSessionGate } from "../components/ParentSessionGate";
import { useLanguage } from "../lib/language";
import { isValidSessionId } from "../lib/storage";

const copyByLanguage = {
  ms: { verified: "Akaun ibu bapa disahkan", ready: "Penilaian sedia untuk anda semak.", ownership: "Halaman ini hanya tersedia selepas pelayan mengesahkan bahawa akaun ibu bapa semasa memiliki jemputan ini.", next: "Langkah seterusnya", activate: "Aktifkan laporan demo percuma.", noPayment: "Tiada bayaran, butiran kad atau transaksi. Pelayan akan menyemak jemputan ini sebelum memberikan akses kepada laporan.", continue: "Teruskan ke laporan demo percuma" },
  en: { verified: "Parent account verified", ready: "The assessment is ready for your review.", ownership: "This page is available only after the server confirms that your current parent account owns this invitation.", next: "Next step", activate: "Activate the free demo report.", noPayment: "No payment, card details, or transaction is involved. The server will check this invitation before it grants report access.", continue: "Continue to free demo report" },
  ta: { verified: "பெற்றோர் கணக்கு சரிபார்க்கப்பட்டது", ready: "மதிப்பீடு உங்கள் பார்வைக்குத் தயாராக உள்ளது.", ownership: "தற்போதைய பெற்றோர் கணக்கு இந்த அழைப்புக்குரியது என்பதைச் சேவையகம் உறுதிப்படுத்திய பிறகே இந்தப் பக்கம் கிடைக்கும்.", next: "அடுத்த படி", activate: "இலவச மாதிரி அறிக்கையைச் செயல்படுத்துங்கள்.", noPayment: "பணம், அட்டை விவரங்கள் அல்லது பரிவர்த்தனை எதுவும் இல்லை. அறிக்கை அணுகலை வழங்கும் முன் சேவையகம் இந்த அழைப்பைச் சரிபார்க்கும்.", continue: "இலவச மாதிரி அறிக்கைக்குத் தொடரவும்" },
  "zh-CN": { verified: "家长账户已验证", ready: "评估已准备好，供您查看。", ownership: "只有服务器确认当前家长账户拥有此邀请后，才能查看此页面。", next: "下一步", activate: "启用免费演示报告。", noPayment: "无需付款、银行卡资料或任何交易。服务器会先核验此邀请，再开放报告访问权限。", continue: "继续查看免费演示报告" },
} as const;

export function ParentHandoff() {
  const { language } = useLanguage();
  const copy = copyByLanguage[language];
  const { id } = useParams();
  if (!isValidSessionId(id)) return <Navigate to="/" replace />;

  return (
    <ParentSessionGate sessionId={id}>
      <section className="min-h-[76vh] bg-mist px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-4xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,35,29,0.10)] md:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-forest p-8 text-white sm:p-12">
            <span className="grid size-14 place-items-center rounded-full bg-white/10 text-emerald-200"><CheckCircle2 className="size-7" /></span>
            <p className="mt-7 text-xs font-bold tracking-[0.18em] text-emerald-200 uppercase">{copy.verified}</p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{copy.ready}</h1>
            <p className="mt-5 leading-7 text-emerald-50/80">{copy.ownership}</p>
          </div>
          <div className="p-8 sm:p-12">
            <span className="grid size-12 place-items-center bg-mint text-leaf"><ShieldCheck className="size-5" /></span>
            <p className="mt-6 text-xs font-bold tracking-[0.18em] text-leaf uppercase">{copy.next}</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-forest">{copy.activate}</h2>
            <p className="mt-3 leading-7 text-slate-600">{copy.noPayment}</p>
            <Link to={`/checkout/${id}`} className="mt-7 inline-flex items-center justify-center bg-forest px-6 py-4 font-bold text-white hover:bg-leaf">{copy.continue}</Link>
          </div>
        </div>
      </section>
    </ParentSessionGate>
  );
}
