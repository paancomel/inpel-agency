import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { LegalLinks } from "@repo/ui";

import { ParentSessionGate } from "../components/ParentSessionGate";
import { useLanguage } from "../lib/language";
import { grantDemoReportAccess } from "../lib/portal-data";
import { isValidSessionId } from "../lib/storage";

const copyByLanguage = {
  ms: { eyebrow: "Laporan demo percuma", title: "Semak penilaian yang telah dihantar.", intro: "Ini ialah demo tanpa caj. Ia tidak mengumpul butiran pembayaran, menjalankan transaksi atau mewakili pembelian berbayar.", features: ["Ringkasan penilaian yang diluluskan pelayan", "Cadangan yang telah dijana untuk sesi ini", "Paparan jelas apabila cadangan belum tersedia"], access: "Akses dikawal ibu bapa", activate: "Aktifkan akses demo", verify: "Pelayan mengesahkan bahawa akaun ibu bapa semasa memiliki jemputan yang lengkap ini sebelum mengaktifkan akses. Laporan tidak boleh dibuka dengan mengubah data setempat pelayar.", noPayment: "Tiada bayaran dikutip", return: "Anda boleh kembali ke laporan ini kemudian dengan mendaftar masuk menggunakan akaun yang dibenarkan.", activating: "Mengaktifkan akses selamat…", button: "Aktifkan laporan demo percuma" },
  en: { eyebrow: "Free demo report", title: "Review the submitted assessment.", intro: "This is a no-charge demo. It does not collect payment details, submit a transaction, or represent a paid purchase.", features: ["Server-authorized assessment summary", "Any recommendations already generated for this session", "Clear empty state when recommendations are not available"], access: "Parent-controlled access", activate: "Activate demo access", verify: "The server verifies that the current parent account owns this completed invitation before it activates access. This browser cannot unlock the report by changing local data.", noPayment: "No payment is collected", return: "You can return to this report later by signing in with the authorized account.", activating: "Activating secure access…", button: "Activate free demo report" },
  ta: { eyebrow: "இலவச மாதிரி அறிக்கை", title: "சமர்ப்பிக்கப்பட்ட மதிப்பீட்டைச் சரிபாருங்கள்.", intro: "இது கட்டணமில்லா மாதிரி. பணம் செலுத்தும் விவரங்களைச் சேகரிக்காது, பரிவர்த்தனையைச் செய்யாது, வாங்குதலாகவும் கருதப்படாது.", features: ["சேவையகம் அங்கீகரித்த மதிப்பீட்டுச் சுருக்கம்", "இந்த அமர்வுக்காக ஏற்கெனவே உருவாக்கப்பட்ட பரிந்துரைகள்", "பரிந்துரைகள் இல்லாதபோது தெளிவான நிலை"], access: "பெற்றோர் கட்டுப்பாட்டிலுள்ள அணுகல்", activate: "மாதிரி அணுகலைச் செயல்படுத்து", verify: "அணுகலைச் செயல்படுத்தும் முன் தற்போதைய பெற்றோர் கணக்கு இந்த அழைப்புக்குரியது என்பதைச் சேவையகம் சரிபார்க்கும். உள்ளூர் தரவை மாற்றி அறிக்கையைத் திறக்க முடியாது.", noPayment: "பணம் வசூலிக்கப்படாது", return: "அங்கீகரிக்கப்பட்ட கணக்கில் உள்நுழைந்து பின்னர் இந்த அறிக்கைக்குத் திரும்பலாம்.", activating: "பாதுகாப்பான அணுகல் செயல்படுத்தப்படுகிறது…", button: "இலவச மாதிரி அறிக்கையைச் செயல்படுத்து" },
  "zh-CN": { eyebrow: "免费演示报告", title: "查看已提交的评估。", intro: "这是免费演示，不会收集付款资料、发起交易，也不代表任何付费购买。", features: ["经服务器授权的评估摘要", "此会话已生成的建议", "暂无建议时显示清晰的空状态"], access: "家长控制的访问权限", activate: "启用演示访问", verify: "服务器会先确认当前家长账户拥有这份已完成的邀请，再启用访问权限。无法通过修改浏览器本地数据解锁报告。", noPayment: "不会收取任何费用", return: "以后可使用获授权的账户登录，再次查看此报告。", activating: "正在启用安全访问…", button: "启用免费演示报告" },
} as const;

export function Checkout() {
  const { id } = useParams();
  if (!isValidSessionId(id)) return <Navigate to="/" replace />;
  return <ParentSessionGate sessionId={id}><DemoReportActivation sessionId={id} /></ParentSessionGate>;
}

function DemoReportActivation({ sessionId }: { sessionId: string }) {
  const { language } = useLanguage();
  const copy = copyByLanguage[language];
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");

  async function activateReport() {
    setIsActivating(true);
    setError("");
    try {
      await grantDemoReportAccess(sessionId);
      navigate(`/results/${sessionId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The free demo report could not be activated.");
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <section className="min-h-[76vh] bg-mist px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,35,29,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-forest p-7 text-white sm:p-10 lg:p-12">
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-200 uppercase">{copy.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-md leading-7 text-emerald-50/80">{copy.intro}</p>
          <ul className="mt-9 space-y-4 text-sm">
            {copy.features.map((feature) => <li key={feature} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/10"><Check className="size-4 text-emerald-200" /></span>{feature}</li>)}
          </ul>
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <div className="flex items-start gap-4"><span className="grid size-10 place-items-center bg-mint text-leaf"><LockKeyhole className="size-5" /></span><div><p className="text-xs font-bold tracking-[0.18em] text-leaf uppercase">{copy.access}</p><h2 className="mt-2 font-display text-3xl font-bold text-forest">{copy.activate}</h2></div></div>
          <p className="mt-6 leading-7 text-slate-600">{copy.verify}</p>
          <div className="mt-7 border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"><p className="flex items-center gap-2 font-bold text-forest"><ShieldCheck className="size-4 text-leaf" /> {copy.noPayment}</p><p className="mt-2">{copy.return}</p></div>
          {error && <p role="alert" className="mt-5 border-l-4 border-red-600 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}
          <button type="button" disabled={isActivating} onClick={() => { void activateReport(); }} className="mt-7 flex w-full items-center justify-center bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:cursor-wait disabled:opacity-60">{isActivating ? copy.activating : copy.button}</button>
          <LegalLinks className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-forest underline underline-offset-4" />
        </div>
      </div>
    </section>
  );
}
