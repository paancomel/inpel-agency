export interface SharedCatalogInstitution {
  referenceInstitutionId: string;
  institutionName: string;
  institutionPreviousName: string | null;
  universityId: string | null;
  isLinkedToUniversity: boolean;
  programmeCount: number;
}

export interface SharedCatalogProgramme {
  referenceInstitutionId: string;
  institutionName: string;
  canonicalRecordId: string;
  referenceNo: string;
  referenceFamily: string;
  qualificationName: string;
  previousQualificationName: string | null;
  necCode: string;
  necDescription: string;
  necBroadArea: string;
  courseId: string | null;
  isLinkedToCourse: boolean;
}

interface DatabaseError {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}

interface InstitutionRow {
  reference_institution_id: string;
  institution_name: string;
  institution_previous_name: string | null;
  university_id: string | null;
  is_linked_to_university: boolean;
  programme_count: number;
}

interface ProgrammeRow {
  reference_institution_id: string;
  institution_name: string;
  canonical_record_id: string;
  reference_no: string;
  reference_family: string;
  qualification_name: string;
  previous_qualification_name: string | null;
  nec_code: string;
  nec_description: string;
  nec_broad_area: string;
  course_id: string | null;
  is_linked_to_course: boolean;
}

interface QueryResult<Row> {
  data: Row[] | null;
  error: DatabaseError | null;
}

interface InstitutionCatalogBuilder {
  select(columns: string): {
    order(column: "institution_name", options: { ascending: true }): PromiseLike<QueryResult<InstitutionRow>>;
  };
}

interface ProgrammeCatalogBuilder {
  select(columns: string): {
    eq(column: "institution_name", value: string): {
      order(column: "qualification_name", options: { ascending: true }): PromiseLike<QueryResult<ProgrammeRow>>;
    };
  };
}

async function getSharedDatabase() {
  return import("@repo/database");
}

export async function listSharedCatalogInstitutions(): Promise<SharedCatalogInstitution[]> {
  const { supabase } = await getSharedDatabase();
  const catalog = supabase.from("shared_catalog_institutions") as unknown as InstitutionCatalogBuilder;
  const { data, error } = await catalog
    .select("reference_institution_id,institution_name,institution_previous_name,university_id,is_linked_to_university,programme_count")
    .order("institution_name", { ascending: true });

  if (error) {
    console.error("Failed to read shared institution catalog", error);
    throw new Error("The live institution catalog is currently unavailable.");
  }

  return (data ?? []).map((row) => ({
    referenceInstitutionId: row.reference_institution_id,
    institutionName: row.institution_name,
    institutionPreviousName: row.institution_previous_name,
    universityId: row.university_id,
    isLinkedToUniversity: row.is_linked_to_university,
    programmeCount: row.programme_count,
  }));
}

export async function listSharedCatalogProgrammes(
  institutionName: string,
): Promise<SharedCatalogProgramme[]> {
  const normalizedInstitutionName = institutionName.trim();
  if (!normalizedInstitutionName) return [];

  const { supabase } = await getSharedDatabase();
  const catalog = supabase.from("shared_catalog_programmes") as unknown as ProgrammeCatalogBuilder;
  const { data, error } = await catalog
    .select("reference_institution_id,institution_name,canonical_record_id,reference_no,reference_family,qualification_name,previous_qualification_name,nec_code,nec_description,nec_broad_area,course_id,is_linked_to_course")
    .eq("institution_name", normalizedInstitutionName)
    .order("qualification_name", { ascending: true });

  if (error) {
    console.error("Failed to read shared programme catalog", error);
    throw new Error("The live programme catalog is currently unavailable.");
  }

  return (data ?? []).map((row) => ({
    referenceInstitutionId: row.reference_institution_id,
    institutionName: row.institution_name,
    canonicalRecordId: row.canonical_record_id,
    referenceNo: row.reference_no,
    referenceFamily: row.reference_family,
    qualificationName: row.qualification_name,
    previousQualificationName: row.previous_qualification_name,
    necCode: row.nec_code,
    necDescription: row.nec_description,
    necBroadArea: row.nec_broad_area,
    courseId: row.course_id,
    isLinkedToCourse: row.is_linked_to_course,
  }));
}
