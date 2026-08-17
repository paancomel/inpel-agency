import { ArrowLeft, ArrowRight, Inbox, ShieldCheck } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { useLanguage } from "../lib/language";
import { isValidSessionId, readSession } from "../lib/storage";

const copyByLanguage = {
  ms: { inbox: "Peti masuk / Padanan INPEL", today: "Hari ini, 9:42 PG", back: "Kembali ke portal ibu bapa", note: "Pesanan daripada keluarga anda", title: "Perjalanan universiti anda bermula di sini.", from: "Daripada:", to: "Kepada:", student: "Bakal pelajar universiti", hello: "Hai,", invite: "Keluarga anda telah memulakan padanan INPEL peribadi dan menjemput anda melengkapkan penilaian ringkas tentang kekuatan dan minat.", answers: "Tiada jawapan betul atau salah. Pilih yang paling menggambarkan diri anda, dan kami akan menghasilkan senarai pendek universiti berserta konteks kos dan kerjaya.", start: "Mulakan Penilaian Pelajar", private: "Privasi diutamakan.", attached: "Jawapan anda hanya dikaitkan dengan jemputan yang berakhir dengan" },
  en: { inbox: "Inbox / INPEL Match", today: "Today, 9:42 AM", back: "Back to parent portal", note: "A note from your family", title: "Your university journey starts here.", from: "From:", to: "To:", student: "Future university student", hello: "Hello,", invite: "Your family has started a private INPEL match and invited you to complete a short strengths and interests assessment.", answers: "There are no right answers. Choose what feels most like you, and we’ll turn it into a university shortlist with cost and career context.", start: "Start Student Assessment", private: "Private by design.", attached: "Your answers are attached only to the invitation ending in" },
  ta: { inbox: "உள்வாங்கல் / INPEL பொருத்தம்", today: "இன்று, காலை 9:42", back: "பெற்றோர் தளத்திற்குத் திரும்பு", note: "உங்கள் குடும்பத்திடமிருந்து ஒரு செய்தி", title: "உங்கள் பல்கலைக்கழகப் பயணம் இங்கே தொடங்குகிறது.", from: "அனுப்புநர்:", to: "பெறுநர்:", student: "வருங்கால பல்கலைக்கழக மாணவர்", hello: "வணக்கம்,", invite: "உங்கள் குடும்பம் தனிப்பட்ட INPEL பொருத்தத்தைத் தொடங்கி, உங்கள் திறன்கள் மற்றும் ஆர்வங்கள் பற்றிய சிறு மதிப்பீட்டை முடிக்க அழைத்துள்ளது.", answers: "சரியான அல்லது தவறான பதில்கள் இல்லை. உங்களைச் சிறப்பாகப் பிரதிபலிப்பதைத் தேர்ந்தெடுங்கள்; செலவு மற்றும் தொழில் தகவலுடன் பல்கலைக்கழகப் பட்டியலை உருவாக்குவோம்.", start: "மாணவர் மதிப்பீட்டைத் தொடங்கு", private: "தனியுரிமை இயல்பிலேயே பாதுகாக்கப்படுகிறது.", attached: "உங்கள் பதில்கள் இந்த எண்ணில் முடியும் அழைப்புடன் மட்டுமே இணைக்கப்படும்:" },
  "zh-CN": { inbox: "收件箱 / INPEL 匹配", today: "今天上午 9:42", back: "返回家长平台", note: "来自家人的留言", title: "你的大学旅程从这里开始。", from: "发件人：", to: "收件人：", student: "未来的大学生", hello: "你好！", invite: "你的家人已发起一项私密的 INPEL 匹配，并邀请你完成一份简短的优势与兴趣评估。", answers: "答案没有对错。请选择最符合你的选项，我们会结合费用和职业信息，为你整理大学候选名单。", start: "开始学生评估", private: "隐私保护融入设计。", attached: "你的答案只会关联至尾号为以下字符的邀请：" },
} as const;

export function EmailNotification() {
  const { language } = useLanguage();
  const copy = copyByLanguage[language];
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("token");
  if (!isValidSessionId(id)) return <Navigate to="/" replace />;

  const session = readSession(id);
  if (!session || !invitationToken) return <Navigate to="/" replace />;

  return (
    <section className="min-h-[75vh] bg-mist px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,35,29,0.10)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-5 py-4 text-slate-500">
          <div className="flex items-center gap-3"><Inbox className="size-5" aria-hidden="true" /><span className="text-sm font-bold">{copy.inbox}</span></div>
          <span className="text-xs">{copy.today}</span>
        </div>
        <article className="p-6 sm:p-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-forest">
            <ArrowLeft className="size-4" aria-hidden="true" /> {copy.back}
          </Link>
          <p className="mt-8 text-xs font-bold tracking-[0.18em] text-leaf uppercase">{copy.note}</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-forest sm:text-5xl">{copy.title}</h1>
          <div className="mt-7 border-y border-slate-200 py-5 text-sm text-slate-500">
            <p><strong className="text-ink">{copy.from}</strong> INPEL University Match &lt;hello@inpel.my&gt;</p>
            <p className="mt-2"><strong className="text-ink">{copy.to}</strong> {copy.student}</p>
          </div>
          <div className="mt-7 space-y-4 text-base leading-7 text-slate-600">
            <p>{copy.hello}</p>
            <p>{copy.invite}</p>
            <p>{copy.answers}</p>
          </div>
          <Link to={`/student/${id}?token=${encodeURIComponent(invitationToken)}`} className="mt-8 inline-flex items-center gap-3 bg-forest px-6 py-4 font-bold text-white transition hover:bg-leaf">
            {copy.start} <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <div className="mt-8 flex gap-3 border-l-4 border-leaf bg-mint/60 p-4 text-sm leading-6 text-forest">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p><strong>{copy.private}</strong> {copy.attached} <span className="font-mono">{id.slice(-6)}</span>.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
