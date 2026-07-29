import { BookOpenText, Edit3, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { usePortal } from "../state/usePortal";

export function CoursesPage() {
  const { draft, removeCourse } = usePortal();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow">Programme catalogue</p>
          <h2 className="page-title">Accredited programmes</h2>
          <p className="page-intro">Maintain the courses students can discover. Every programme must include its MQA accreditation code before publishing.</p>
        </div>
        <Link className="primary-button shrink-0" to="/dashboard/courses/form"><Plus aria-hidden="true" size={18} /> Add New Program</Link>
      </div>

      {draft.courses.length === 0 ? (
        <section className="mt-10 border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center bg-mist text-navy"><BookOpenText aria-hidden="true" size={27} /></span>
          <h3 className="mt-5 text-xl font-bold text-navy">Your programme catalogue is empty</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Add the first accredited programme to unlock review and publishing.</p>
          <Link className="secondary-button mt-6" to="/dashboard/courses/form"><Plus aria-hidden="true" size={18} /> Add New Program</Link>
        </section>
      ) : (
        <ul className="mt-10 divide-y divide-frost border border-frost bg-white">
          {draft.courses.map((course) => (
            <li className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center" key={course.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3"><h3 className="font-bold text-navy">{course.name}</h3><span className="bg-mist px-2.5 py-1 text-xs font-bold text-slate-600">{course.mqaCode}</span></div>
                <p className="mt-2 text-sm text-slate-500">{[course.facultySchool || "Faculty not specified", course.studyMode || "Study mode not specified", course.totalBaseTuitionFee ? `RM ${Number(course.totalBaseTuitionFee).toLocaleString("en-MY")}` : "Fee not specified"].join(" · ")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link className="icon-button" aria-label={`Edit ${course.name}`} to={`/dashboard/courses/form?course=${encodeURIComponent(course.id)}`}><Edit3 aria-hidden="true" size={17} /></Link>
                <button className="icon-button text-rose-700" aria-label={`Remove ${course.name}`} onClick={() => removeCourse(course.id)} type="button"><Trash2 aria-hidden="true" size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
