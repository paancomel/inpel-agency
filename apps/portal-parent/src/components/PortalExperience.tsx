// HERO: the decision desk — a bold score strip that turns community evidence into a readable verdict.
import {
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CircleHelp,
  GitCompareArrows,
  Heart,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LegalLinks } from "@repo/ui";
import {
  RATING_DIMENSIONS,
  type Review,
  type ReviewIdentity,
  type University,
} from "../lib/types";

interface ShellProps {
  identity: ReviewIdentity | null;
  saved: string[];
  compare: string[];
  onAuth: () => void;
  onToggleSaved: (id: string) => void;
  onToggleCompare: (id: string) => void;
  children: React.ReactNode;
}

export function SiteShell({ identity, compare, onAuth, children }: ShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/" className="brand-mark" aria-label="INPOLOR home">IN<span>•</span>POL<span>OR</span></Link>
        <nav className={open ? "is-open" : ""} aria-label="Main navigation">
          <Link to="/">Universities</Link>
          <Link to="/compare">Compare {compare.length ? <b>{compare.length}</b> : null}</Link>
          <Link to="/saved">Saved</Link>
          <Link to="/submit-review" className="nav-cta">Write a review</Link>
          {identity
            ? <Link to="/account/reviews" className="account-dot" aria-label="My account">{identity.email.slice(0, 1).toUpperCase()}</Link>
            : <button onClick={onAuth}>Sign in</button>}
        </nav>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {children}
      <footer className="site-footer">
        <div><strong>INPOLOR</strong><p>Real student experiences, handled with care.</p></div>
        <LegalLinks />
        <small>Anonymous by design · Kuala Lumpur + Selangor · BM / EN</small>
      </footer>
    </div>
  );
}

export function DirectoryPage({
  universities,
  message,
  saved,
  compare,
  onToggleSaved,
  onToggleCompare,
}: {
  universities: University[];
  message?: string | null;
  saved: string[];
  compare: string[];
  onToggleSaved: (id: string) => void;
  onToggleCompare: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(0);
  const [cost, setCost] = useState<number | null>(null);
  const [sort, setSort] = useState("rating");
  const filtered = useMemo(() => universities
    .filter((item) => {
      const matchesQuery = `${item.name} ${item.courses?.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesRating = rating === 0
        || Boolean(item.rankingEligible && item.rating >= rating);
      const matchesCost = cost === null
        || (item.livingCost !== undefined && item.livingCost <= cost);
      return matchesQuery && matchesRating && matchesCost;
    })
    .sort((a, b) => {
      if (sort === "reviews") return b.reviewCount - a.reviewCount;
      if (sort === "newest") return b.latestReviewAt.localeCompare(a.latestReviewAt);
      if (sort === "cost") return (a.livingCost ?? Infinity) - (b.livingCost ?? Infinity);
      if (a.rankingEligible !== b.rankingEligible) return a.rankingEligible ? -1 : 1;
      return b.rating - a.rating;
    }), [universities, query, rating, cost, sort]);

  return (
    <main>
      <section className="directory-hero">
        <div className="hero-copy">
          <p className="eyebrow">KUALA LUMPUR + SELANGOR</p>
          <h1>Bantu pelajar lain buat <em>keputusan lebih baik.</em></h1>
          <p>Bandingkan pengalaman sebenar—kos hidup, kelas, keselamatan dan realiti kampus yang brosur tak ceritakan.</p>
          <div className="hero-actions">
            <Link to="/submit-review" className="button-primary">Tulis review<ArrowRight /></Link>
            <a href="#directory" className="button-ghost">Explore universities</a>
          </div>
        </div>
        <div className="hero-proof" aria-label="Community launch target">
          <div className="proof-stamp"><strong>1000</strong><span>student stories<br />launch target</span></div>
          <blockquote>“Not a ranking.<br />A field guide.”</blockquote>
          <div className="proof-note"><Sparkles /><span>Anonymous reviews<br />Manual approval<br />Eight real-world scores</span></div>
        </div>
      </section>

      <section id="directory" className="directory-section">
        <div className="section-heading">
          <div><p className="eyebrow">THE DIRECTORY · {universities.length} INSTITUTIONS</p><h2>Find your honest shortlist.</h2></div>
          <p>Search by university or course. A numbered rank appears only after five approved reviews.</p>
        </div>
        {message ? <div className="notice-card" role="status"><Shield /><p>{message}</p></div> : null}
        <div className="filter-desk">
          <label className="search-field"><Search /><input aria-label="Search universities or courses" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="University or course" /></label>
          <label>Minimum rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))}><option value="0">Any rating</option><option value="7">7.0+</option><option value="8">8.0+</option></select></label>
          <label>Monthly cost<select value={cost ?? ""} onChange={(event) => setCost(event.target.value ? Number(event.target.value) : null)}><option value="">Any verified cost</option><option value="1500">Under RM1,500</option><option value="2000">Under RM2,000</option></select></label>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="rating">Highest rating</option><option value="reviews">Most reviews</option><option value="newest">Newest review</option><option value="cost">Lowest cost</option></select></label>
        </div>
        <div className="result-line"><strong>{filtered.length} institutions</strong><span>Approved community evidence only</span></div>
        {filtered.length ? (
          <div className="university-grid">
            {filtered.map((item, index) => {
              const eligibleRank = item.rankingEligible
                ? filtered.slice(0, index + 1).filter((candidate) => candidate.rankingEligible).length
                : null;
              return <UniversityCard key={item.id} university={item} rank={eligibleRank} saved={saved.includes(item.id)} comparing={compare.includes(item.id)} onSave={() => onToggleSaved(item.id)} onCompare={() => onToggleCompare(item.id)} />;
            })}
          </div>
        ) : (
          <div className="empty-state"><Search /><h2>No institutions to show.</h2><p>Try a different filter, or return when verified directory data is available.</p></div>
        )}
      </section>
    </main>
  );
}

function UniversityCard({
  university,
  rank,
  saved,
  comparing,
  onSave,
  onCompare,
}: {
  university: University;
  rank: number | null;
  saved: boolean;
  comparing: boolean;
  onSave: () => void;
  onCompare: () => void;
}) {
  return (
    <article className="university-card">
      <div className="card-topline">
        <span>{rank ? `#${String(rank).padStart(2, "0")}` : "NOT RANKED"}</span>
        <div>
          <button aria-label={`${saved ? "Remove" : "Save"} ${university.name}`} onClick={onSave}><Bookmark fill={saved ? "currentColor" : "none"} /></button>
          <button aria-label={`${comparing ? "Remove from" : "Add to"} compare`} onClick={onCompare}><GitCompareArrows /></button>
        </div>
      </div>
      <Link to={`/universities/${university.id}`}>
        <div className="university-monogram">{university.shortName}</div>
        <p className="location-line"><MapPin />{university.location}</p>
        <h3>{university.name}</h3>
        <p className="institution-type">{university.type}</p>
        <div className="card-metrics">
          <div><strong>{university.reviewCount ? university.rating.toFixed(1) : "—"}</strong><span>/10 community</span></div>
          <div><strong>{university.reviewCount}</strong><span>approved reviews</span></div>
          <div><strong>{university.livingCost ? `RM${university.livingCost.toLocaleString()}` : "—"}</strong><span>{university.livingCost ? "monthly estimate" : "cost unavailable"}</span></div>
        </div>
        {!university.rankingEligible ? <p className="mt-3 text-xs font-semibold text-slate-500">Fewer than five approved reviews — no numerical rank.</p> : null}
        <span className="card-link">View student field guide <ChevronRight /></span>
      </Link>
    </article>
  );
}

function ScoreStrip({ university }: { university: University }) {
  return (
    <div className="score-strip">
      {RATING_DIMENSIONS.map(([key, label]) => (
        <div key={key}>
          <span>{label}</span>
          <strong>{university.reviewCount ? university.ratings[key].toFixed(1) : "—"}</strong>
          <i><b style={{ width: `${university.reviewCount ? university.ratings[key] * 10 : 0}%` }} /></i>
        </div>
      ))}
    </div>
  );
}

function PublicReview({ review, saved, onSave }: { review: Review; saved: boolean; onSave: () => void }) {
  if (review.visibilityStatus === "hidden_under_review") {
    return <article className="public-review"><div className="notice-card"><Shield /><p>Kandungan ini sedang disemak</p></div></article>;
  }
  const hasFlags = Boolean(review.greenFlags || review.redFlags);
  return (
    <article className="public-review">
      <header>
        <div><span className="anonymous-seal">A</span><div><strong>Anonymous reviewer</strong><p>{review.course} · {review.year}</p></div></div>
        <div className="review-score">{review.rating.toFixed(1)}<span>/10</span></div>
      </header>
      {review.isComplete ? <span className="complete-badge"><Check />Complete review</span> : null}
      <p className="review-quote">“{review.spillTheTea}”</p>
      {hasFlags ? (
        <div className="flags">
          {review.greenFlags ? <p><span>STRENGTH</span>{review.greenFlags}</p> : null}
          {review.redFlags ? <p><span>WATCH OUT</span>{review.redFlags}</p> : null}
        </div>
      ) : null}
      <footer>
        <button disabled title="Helpful voting is available after sign in"><Heart />Helpful · {review.likesCount}</button>
        <button disabled title="Comments enter moderation before publication"><MessageCircle />Comment</button>
        <button onClick={onSave}><Bookmark fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button>
        <button disabled title="Report flow requires a signed-in account"><Shield />Report</button>
      </footer>
    </article>
  );
}

export function UniversityPage({ universities, reviews, saved, compare, onToggleSaved, onToggleCompare }: { universities: University[]; reviews: Review[]; saved: string[]; compare: string[]; onToggleSaved: (id: string) => void; onToggleCompare: (id: string) => void }) {
  const { id } = useParams();
  const university = universities.find((item) => item.id === id);
  if (!university) return <main className="utility-page"><div className="empty-state"><CircleHelp /><h2>Institution not found.</h2><p>This profile is unavailable or has not been added to the verified directory.</p><Link className="button-primary" to="/">Browse universities</Link></div></main>;
  const shownReviews = reviews.filter((item) => item.universityId === university.id);
  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-breadcrumb"><Link to="/">Directory</Link><ChevronRight />{university.location}</div>
        <div className="profile-title">
          <div><p className="eyebrow">STUDENT FIELD GUIDE</p><h1>{university.name}</h1><p><MapPin />{university.address} · {university.type}</p></div>
          <div className="headline-score"><strong>{university.reviewCount ? university.rating.toFixed(1) : "—"}</strong><span>/10<br />{university.reviewCount} approved reviews</span></div>
        </div>
        {!university.rankingEligible ? <div className="notice-card"><Shield /><p>Not ranked yet. A numbered rank requires at least five approved reviews.</p></div> : null}
        <div className="profile-actions"><Link className="button-primary" to={`/submit-review?university=${university.id}`}>Write a review<ArrowRight /></Link><button className="button-ghost" onClick={() => onToggleSaved(university.id)}><Bookmark fill={saved.includes(university.id) ? "currentColor" : "none"} />{saved.includes(university.id) ? "Saved" : "Save"}</button><button className="button-ghost" onClick={() => onToggleCompare(university.id)}><GitCompareArrows />{compare.includes(university.id) ? "Comparing" : "Compare"}</button></div>
        <ScoreStrip university={university} />
      </section>
      <div className="profile-layout">
        <div>
          <section className="verdict-section">
            <div className="section-heading compact"><div><p className="eyebrow">RECENT APPROVED REVIEWER NOTES</p><h2>What reviewers mentioned.</h2></div></div>
            {university.strengths.length || university.weaknesses.length ? <div className="verdict-grid"><div><span className="verdict-icon good">+</span><h3>Positive notes</h3>{university.strengths.map((item) => <p key={item}>{item}</p>)}</div><div><span className="verdict-icon bad">−</span><h3>Caution notes</h3>{university.weaknesses.map((item) => <p key={item}>{item}</p>)}</div></div> : <div className="empty-state"><MessageCircle /><h2>Not enough approved evidence yet.</h2><p>Reviewer notes appear only when approved reviews provide them.</p></div>}
          </section>
          <section className="reviews-section"><div className="section-heading compact"><div><p className="eyebrow">APPROVED EXPERIENCES</p><h2>Reviews from students, not brochures.</h2></div><select aria-label="Sort reviews"><option>Most helpful</option><option>Newest</option><option>Highest rating</option><option>Lowest rating</option></select></div>{shownReviews.length ? shownReviews.map((review) => <PublicReview key={review.id} review={review} saved={saved.includes(review.id)} onSave={() => onToggleSaved(review.id)} />) : <div className="empty-state"><MessageCircle /><h2>No approved reviews yet.</h2><p>Submitted reviews stay private until manual moderation is complete.</p></div>}</section>
          <section className="qa-section"><p className="eyebrow">ANONYMOUS Q&A</p><h2>Ask the people who were there.</h2><div className="empty-state"><CircleHelp /><h2>No approved questions yet.</h2><p>Questions and answers will appear here only after moderation.</p></div><button className="button-ghost" disabled title="Question submission is being connected to the moderation queue">Question submission coming soon</button></section>
          <section className="truth-gate"><div><p className="eyebrow">THE UNSPOKEN TRUTH</p><h2>Low-score experiences, carefully classified.</h2><p>An approved and published review unlocks moderator-approved excerpts from reviews rated 4.0/10 or lower.</p><Link className="button-primary" to="/submit-review">Contribute for moderator review</Link></div><div className="blurred-truth" aria-hidden="true"><span>MODERATOR-APPROVED EXCERPTS</span><p>Protected content remains hidden until access is unlocked.</p></div></section>
        </div>
        <aside className="profile-sidebar"><div className="cost-card"><p className="eyebrow">MONTHLY LIVING COST</p><strong>{university.livingCost ? `RM${university.livingCost.toLocaleString()}` : "—"}</strong><span>{university.livingCost ? "community estimate" : "not enough approved responses"}</span><p>Shown only from approved numeric responses once the minimum sample is met.</p></div><div className="gallery-card"><p className="eyebrow">COMMUNITY GALLERY</p><div className="notice-card"><Shield /><p>No approved photos are available yet.</p></div><button disabled>Gallery unavailable</button></div><div className="info-card"><p className="eyebrow">INSTITUTION INFO</p><dl><dt>Official name</dt><dd>{university.name}</dd><dt>Type</dt><dd>{university.type}</dd><dt>Area</dt><dd>{university.location}</dd></dl>{university.website ? <a href={university.website} rel="noreferrer">Official website <ArrowRight /></a> : null}<a href={university.mapUrl} rel="noreferrer">Open map <ArrowRight /></a></div></aside>
      </div>
    </main>
  );
}

export function ComparePage({ universities, compare, onToggleCompare }: { universities: University[]; compare: string[]; onToggleCompare: (id: string) => void }) {
  const navigate = useNavigate();
  const selected = compare.map((id) => universities.find((item) => item.id === id)).filter((item): item is University => Boolean(item));
  return <main className="utility-page"><p className="eyebrow">YOUR SHORTLIST</p><h1>Compare universities.</h1><p className="utility-lede">Up to three institutions, side by side. Small samples stay clearly labelled.</p>{selected.length ? <div className="comparison-table"><div className="comparison-head"><span>Evidence</span>{selected.map((item) => <div key={item.id}><button onClick={() => onToggleCompare(item.id)} aria-label={`Remove ${item.name}`}><X /></button><strong>{item.shortName}</strong><p>{item.name}</p></div>)}</div>{[["Overall", "rating"], ["Approved reviews", "reviewCount"], ["Monthly living", "livingCost"]].map(([label, key]) => <div className="comparison-row" key={key}><span>{label}</span>{selected.map((item) => <strong key={item.id}>{key === "livingCost" ? item.livingCost ? `RM${item.livingCost.toLocaleString()}` : "—" : key === "rating" ? item.reviewCount ? item.rating.toFixed(1) : "—" : item.reviewCount}</strong>)}</div>)}{RATING_DIMENSIONS.map(([key, label]) => <div className="comparison-row" key={key}><span>{label}</span>{selected.map((item) => <strong key={item.id}>{item.reviewCount ? item.ratings[key].toFixed(1) : "—"}</strong>)}</div>)}</div> : <div className="empty-state"><GitCompareArrows /><h2>Your comparison is empty.</h2><p>Add up to three institutions from the directory.</p><button className="button-primary" onClick={() => navigate("/")}>Browse universities</button></div>}</main>;
}

export function SavedPage({ universities, reviews, saved }: { universities: University[]; reviews: Review[]; saved: string[] }) {
  const savedUniversities = universities.filter((item) => saved.includes(item.id));
  const savedReviews = reviews.filter((item) => saved.includes(item.id));
  return <main className="utility-page"><p className="eyebrow">YOUR RESEARCH DESK</p><h1>Saved items.</h1><p className="utility-lede">Universities, reviews and questions you want to return to.</p><div className="saved-tabs"><button className="is-active">Universities · {savedUniversities.length}</button><button>Reviews · {savedReviews.length}</button><button>Q&A · 0</button></div>{savedUniversities.length ? <div className="saved-list">{savedUniversities.map((item) => <Link to={`/universities/${item.id}`} key={item.id}><span>{item.shortName}</span><div><strong>{item.name}</strong><p>{item.location} · {item.reviewCount ? `${item.rating.toFixed(1)}/10` : "No approved score"}</p></div><ArrowRight /></Link>)}</div> : <div className="empty-state"><Bookmark /><h2>Nothing saved yet.</h2><p>Save institutions and reviews to build your research desk.</p><Link className="button-primary" to="/">Browse universities</Link></div>}</main>;
}

export function AccountPage({ identity, reviews }: { identity: ReviewIdentity | null; reviews: Review[] }) {
  const mine = reviews.filter((item) => item.status && item.status !== "published");
  return <main className="utility-page"><p className="eyebrow">PRIVATE ACCOUNT</p><h1>My reviews.</h1><p className="utility-lede">Track drafts, moderation, corrections and publishing in one place.</p><div className="account-grid"><aside><button className="is-active"><MessageCircle />My reviews</button><button><Bell />Notifications</button><button><Bookmark />Saved items</button><button><Shield />Settings & privacy</button></aside><section><div className="account-note"><LockKeyhole /><p><strong>Your public identity is always anonymous.</strong><br />Signed in as {identity?.email ?? "preview user"}</p></div>{mine.length ? mine.map((item) => <div className="status-row" key={item.id}><span className="status-pill">{item.status}</span><div><strong>{item.course} · {item.year}</strong><p>{item.rating}/10 · Awaiting manual moderation</p></div><ArrowRight /></div>) : <div className="empty-state"><MessageCircle /><h2>No submissions yet.</h2><p>Start a review now. Your local draft is kept until you delete it.</p><Link className="button-primary" to="/submit-review">Write a review</Link></div>}</section></div></main>;
}
