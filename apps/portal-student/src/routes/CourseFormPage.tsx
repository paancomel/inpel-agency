import { ArrowLeft, ArrowRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  CourseCheckbox,
  CourseInput,
  CourseSection,
  CourseTextarea,
  type CourseStringField,
} from "../components/CourseFormFields";
import { createEmptyCourse } from "../lib/defaults";
import { courseSchema } from "../lib/validation";
import { usePortal } from "../state/usePortal";
import type { Course } from "../types/portal";

type CourseErrors = Partial<Record<keyof Course, string>>;
type CourseBooleanField = Exclude<{
  [Key in keyof Course]: Course[Key] extends boolean ? Key : never;
}[keyof Course], undefined>;

export function CourseFormPage() {
  const { draft, upsertCourse } = usePortal();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedId = searchParams.get("course");
  const existingCourse = draft.courses.find((item) => item.id === requestedId);
  const [course, setCourse] = useState<Course>(() => existingCourse ?? createEmptyCourse());
  const [errors, setErrors] = useState<CourseErrors>({});

  function updateField(field: CourseStringField, value: string) {
    setCourse((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateCheckbox(field: CourseBooleanField, checked: boolean) {
    setCourse((current) => ({ ...current, [field]: checked }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = courseSchema.safeParse(course);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0]])));
      document.getElementById(`course-${String(result.error.issues[0]?.path[0] ?? "name")}`)?.focus();
      return;
    }

    upsertCourse({ id: course.id, ...result.data });
    navigate("/dashboard/review");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy" to="/dashboard/courses"><ArrowLeft aria-hidden="true" size={17} /> Back to programmes</Link>
      <div className="mt-7 max-w-3xl"><p className="eyebrow">{existingCourse ? "Edit programme" : "Manage Courses / Add New Course"}</p><h2 className="page-title">Programme catalog</h2><p className="page-intro">Capture the academic offer, complete cost picture, funding eligibility, and measurable student outcomes.</p></div>

      <form className="mt-9 space-y-6" noValidate onSubmit={handleSubmit}>
        <CourseSection description="Accreditation, delivery, entry requirements, and industry relevance." eyebrow="01" id="course-academic" title="Academic">
          <div className="grid gap-5 md:grid-cols-2">
            <CourseInput error={errors.name} field="name" label="Course Name *" onChange={updateField} placeholder="Bachelor of Computing" value={course.name} />
            <CourseInput error={errors.facultySchool} field="facultySchool" label="Faculty/School *" onChange={updateField} placeholder="Faculty of Computing" value={course.facultySchool} />
            <CourseInput error={errors.mqaCode} field="mqaCode" label="MQA Accreditation Code *" onChange={updateField} placeholder="MQA/FA12345" value={course.mqaCode} />
            <label className="block" htmlFor="course-studyMode"><span className="field-label">Study Mode *</span><select aria-describedby={errors.studyMode ? "course-studyMode-error" : undefined} aria-invalid={Boolean(errors.studyMode)} className="field-control mt-2 bg-mist/50" id="course-studyMode" onChange={(event) => updateField("studyMode", event.target.value)} value={course.studyMode}><option value="100% Face-to-Face">100% Face-to-Face</option><option value="Blended Learning">Blended Learning</option><option value="100% Online">100% Online</option><option value="Work-based Learning">Work-based Learning</option></select>{errors.studyMode ? <span className="mt-1 block text-xs font-semibold text-rose-700" id="course-studyMode-error">{errors.studyMode}</span> : null}</label>
            <CourseInput error={errors.studentLecturerRatio} field="studentLecturerRatio" label="Student-to-Lecturer Ratio" onChange={updateField} placeholder="18:1" value={course.studentLecturerRatio} />
            <div className="grid gap-3 sm:grid-cols-2 md:col-span-2"><CourseCheckbox checked={course.dualAwardDegree} label="Dual-Award Degree" onChange={(checked) => updateCheckbox("dualAwardDegree", checked)} /><CourseCheckbox checked={course.interviewPortfolioRequired} label="Interview/Portfolio required" onChange={(checked) => updateCheckbox("interviewPortfolioRequired", checked)} /></div>
            <div className="md:col-span-2"><CourseTextarea error={errors.minimumEntryRequirements} field="minimumEntryRequirements" label="Minimum Entry Requirements" onChange={updateField} placeholder="List minimum academic and subject requirements." value={course.minimumEntryRequirements} /></div>
            <div className="md:col-span-2"><CourseTextarea error={errors.documentChecklist} field="documentChecklist" label="Document Checklist" onChange={updateField} placeholder="List transcripts, certificates, identification, and supporting documents." value={course.documentChecklist} /></div>
            <CourseInput error={errors.microCredentials} field="microCredentials" label="Micro-credentials" onChange={updateField} placeholder="Embedded certificates or digital badges" value={course.microCredentials} />
            <CourseInput error={errors.professionalBodyExemptions} field="professionalBodyExemptions" label="Professional Body Exemptions" onChange={updateField} placeholder="ACCA papers, board exemptions, etc." value={course.professionalBodyExemptions} />
            <div className="md:col-span-2"><CourseTextarea error={errors.industryAdvisoryBoards} field="industryAdvisoryBoards" label="Industry Advisory Boards" onChange={updateField} placeholder="Name participating employers, associations, or advisory members." value={course.industryAdvisoryBoards} /></div>
          </div>
        </CourseSection>

        <CourseSection description="Published tuition, registration costs, and funding eligibility." eyebrow="02" id="course-financial" title="Financial Aid">
          <div className="grid gap-5 md:grid-cols-2">
            <CourseInput error={errors.totalBaseTuitionFee} field="totalBaseTuitionFee" inputMode="decimal" label="Total Base Tuition Fee (RM)" onChange={updateField} placeholder="56000" value={course.totalBaseTuitionFee} />
            <CourseInput error={errors.initialRegistrationFee} field="initialRegistrationFee" inputMode="decimal" label="Initial Registration Fee (RM)" onChange={updateField} placeholder="1200" value={course.initialRegistrationFee} />
            <CourseInput error={errors.costPerCreditHour} field="costPerCreditHour" inputMode="decimal" label="Cost per credit hour (RM)" onChange={updateField} placeholder="450" value={course.costPerCreditHour} />
            <CourseInput error={errors.additionalMaterialCosts} field="additionalMaterialCosts" inputMode="decimal" label="Additional Material Costs (RM)" onChange={updateField} placeholder="1800" value={course.additionalMaterialCosts} />
          </div>
          <fieldset className="mt-6"><legend className="field-label">Financial Aid Eligibility</legend><div className="mt-3 grid gap-3 md:grid-cols-3"><CourseCheckbox checked={course.ptptnApproved} label="PTPTN Approved" onChange={(checked) => updateCheckbox("ptptnApproved", checked)} /><CourseCheckbox checked={course.maraEligible} label="MARA Eligible" onChange={(checked) => updateCheckbox("maraEligible", checked)} /><CourseCheckbox checked={course.stateZakatYayasanEligible} label="State Zakat/Yayasan Eligible" onChange={(checked) => updateCheckbox("stateZakatYayasanEligible", checked)} /></div></fieldset>
        </CourseSection>

        <CourseSection description="Completion, placement, internship, and employer signals." eyebrow="03" id="course-outcomes" title="Outcomes">
          <div className="grid gap-5 md:grid-cols-3">
            <CourseInput error={errors.graduateEmployabilityRate} field="graduateEmployabilityRate" inputMode="decimal" label="Graduate Employability Rate (%)" onChange={updateField} placeholder="94.5" value={course.graduateEmployabilityRate} />
            <CourseInput error={errors.internshipDurationMonths} field="internshipDurationMonths" inputMode="numeric" label="Internship Duration (Months)" onChange={updateField} placeholder="6" value={course.internshipDurationMonths} />
            <CourseInput error={errors.onTimeGraduationRate} field="onTimeGraduationRate" inputMode="decimal" label="On-Time Graduation Rate (%)" onChange={updateField} placeholder="88" value={course.onTimeGraduationRate} />
            <div className="md:col-span-3"><CourseTextarea error={errors.topHiringCompanies} field="topHiringCompanies" label="Top Hiring Companies/Industry Partners" onChange={updateField} placeholder="List leading employers and active industry partners." value={course.topHiringCompanies} /></div>
          </div>
        </CourseSection>

        <div className="flex flex-col-reverse justify-end gap-3 pt-3 sm:flex-row"><Link className="secondary-button" to="/dashboard/courses">Cancel</Link><button className="primary-button" type="submit">Review Data <ArrowRight aria-hidden="true" size={18} /></button></div>
      </form>
    </div>
  );
}
