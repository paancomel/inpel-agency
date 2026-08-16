/** Recursive JSON value accepted by PostgreSQL json/jsonb columns. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Uuid = string;
export type Timestamp = string;
export type ProfileRole =
  | "parent"
  | "student"
  | "community_user"
  | "university_rep"
  | "content_moderator"
  | "payment_moderator"
  | "admin";
export type SessionStatus = "invited" | "completed";
export type SessionStudentBindingStatus = "issued" | "claimed" | "expired" | "revoked";
export type ReportAccessGrantKind = "demo";
export type ReportAccessGrantStatus = "active" | "revoked";
export type ModerationStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "needs_correction"
  | "published"
  | "rejected"
  | "hidden_under_review"
  | "removed";
export type InpolorLocale = "en" | "ms";
export type InpolorReviewKind = "standard" | "reward";
export type InpolorPhotoCategory =
  | "class" | "library" | "affordable_food" | "daily_route"
  | "campus" | "accommodation" | "hangout" | "nearby_activity";
export type InpolorVisibilityStatus = "published" | "hidden_under_review";
export type InpolorAnswerLabel =
  | "approved_reviewer" | "current_student" | "alumni" | "community_member";
export type InpolorRewardStatus =
  | "waiting_for_payment" | "needs_action" | "eligible"
  | "paid" | "ineligible" | "payment_problem";
export type PaymentStatus = "pending" | "success" | "failed";
export type InstitutionVerificationStatus = "unverified" | "verified" | "suspended";
export type InstitutionProfileStatus = "incomplete" | "complete";
export type InstitutionMemberRole = "representative" | "admin";
export type InstitutionMemberStatus = "active" | "removed";
export type InstitutionDomainStatus = "approved" | "suspended";
export type InstitutionDomainSource = "institution" | "manual_exception";
export type InstitutionVersionSource = "manual" | "import" | "restore" | "system";

/** Structured portal values persisted in JSONB/text columns. */
export type MalaysianStudyLocation =
  | "Johor" | "Kedah" | "Kelantan" | "Melaka" | "Negeri Sembilan" | "Pahang"
  | "Perak" | "Perlis" | "Penang" | "Sabah" | "Sarawak" | "Selangor"
  | "Terengganu" | "Kuala Lumpur" | "Labuan" | "Putrajaya" | "Open to anywhere";
export type MonthlyHouseholdIncome =
  | "Below RM 3,000"
  | "RM 3,000 - RM 5,999"
  | "RM 6,000 - RM 9,999"
  | "RM 10,000 - RM 14,999"
  | "RM 15,000 - RM 19,999"
  | "RM 20,000 and above";
export type ParentalPreferences = {
  campus_vibe:
    | "Public (IPTA) - Warm & Local"
    | "Private (IPTS) - Modern & Vibrant"
    | "International Branch - Global Exposure"
    | "No preference - open to anything!";
  campus_concern:
    | "Academic rigor & faculty quality"
    | "Campus safety & physical well-being"
    | "Mental health & student support"
    | "Networking & industry connections";
  ultimate_win:
    | "Guaranteed high-paying employment"
    | "Strong professional network"
    | "Character & leadership development"
    | "Path to international migration/work";
  independence:
    | "Highly independent self-starter"
    | "Needs some structural guidance"
    | "Requires close academic monitoring"
    | "Needs strong emotional/social support";
};
export type SpmGrade = "A+" | "A" | "A-" | "B+" | "B" | "C+" | "C" | "D" | "E" | "G";
export type AcademicRecord = Array<{ subject: string; grade: SpmGrade }>;
export type LikertScaleValue = 1 | 2 | 3 | 4 | 5;
export type PersonalityTestAnswers = [
  LikertScaleValue, LikertScaleValue, LikertScaleValue, LikertScaleValue,
  LikertScaleValue, LikertScaleValue, LikertScaleValue, LikertScaleValue,
  LikertScaleValue, LikertScaleValue, LikertScaleValue, LikertScaleValue,
  LikertScaleValue, LikertScaleValue, LikertScaleValue, LikertScaleValue,
];
export type VibeCheckQuiz = {
  friday_night: "cozy" | "networking";
  campus_setting: "nature" | "city";
  team_style: "solo" | "collaborative";
  schedule_style: "spontaneous" | "structured";
  learning_style: "creative" | "research";
  future_horizon: "local" | "global";
};

export interface ProfilesRow {
  id: Uuid;
  email: string;
  role: ProfileRole;
  has_unlocked_tea: boolean | null;
  created_at: Timestamp | null;
  date_of_birth: string | null;
  preferred_locale: InpolorLocale;
  updated_at: Timestamp;
}

export interface ProfilesInsert {
  id: Uuid;
  email: string;
  role: ProfileRole;
  has_unlocked_tea?: boolean | null;
  created_at?: Timestamp | null;
  date_of_birth?: string | null;
  preferred_locale?: InpolorLocale;
  updated_at?: Timestamp;
}

export type ProfilesUpdate = Partial<ProfilesInsert>;

export interface UniversitiesRow {
  id: Uuid;
  representative_id: Uuid | null;
  name: string;
  location: string | null;
  address: string | null;
  logo_url: string | null;
  tuition_fees: number | null;
  living_costs: number | null;
  acceptance_rate: string | null;
  facilities_flags: Json | null;
  contacts: Json | null;
  created_at: Timestamp | null;
  verification_status: InstitutionVerificationStatus;
  profile_status: InstitutionProfileStatus;
  is_suspended: boolean;
  primary_admin_id: Uuid | null;
  published_version: number;
  updated_at: Timestamp;
}

export interface UniversitiesInsert {
  id?: Uuid;
  representative_id?: Uuid | null;
  name: string;
  location?: string | null;
  address?: string | null;
  logo_url?: string | null;
  tuition_fees?: number | null;
  living_costs?: number | null;
  acceptance_rate?: string | null;
  facilities_flags?: Json | null;
  contacts?: Json | null;
  created_at?: Timestamp | null;
  verification_status?: InstitutionVerificationStatus;
  profile_status?: InstitutionProfileStatus;
  is_suspended?: boolean;
  primary_admin_id?: Uuid | null;
  published_version?: number;
  updated_at?: Timestamp;
}

export type UniversitiesUpdate = Partial<UniversitiesInsert>;

export interface InstitutionDomainsRow {
  id: Uuid;
  university_id: Uuid;
  domain: string;
  status: InstitutionDomainStatus;
  source: InstitutionDomainSource;
  verified_at: Timestamp | null;
  suspended_at: Timestamp | null;
  created_by: Uuid | null;
  created_at: Timestamp;
}
export interface InstitutionDomainsInsert {
  id?: Uuid;
  university_id: Uuid;
  domain: string;
  status?: InstitutionDomainStatus;
  source?: InstitutionDomainSource;
  verified_at?: Timestamp | null;
  suspended_at?: Timestamp | null;
  created_by?: Uuid | null;
  created_at?: Timestamp;
}
export type InstitutionDomainsUpdate = Partial<InstitutionDomainsInsert>;

export interface ApprovedInstitutionDomainsRow {
  domain: string;
  university_id: Uuid | null;
  status: InstitutionDomainStatus;
  notes: string | null;
  created_by: Uuid | null;
  created_at: Timestamp;
}
export interface ApprovedInstitutionDomainsInsert {
  domain: string;
  university_id?: Uuid | null;
  status?: InstitutionDomainStatus;
  notes?: string | null;
  created_by?: Uuid | null;
  created_at?: Timestamp;
}
export type ApprovedInstitutionDomainsUpdate = Partial<ApprovedInstitutionDomainsInsert>;

export interface InstitutionMembersRow {
  university_id: Uuid;
  user_id: Uuid;
  role: InstitutionMemberRole;
  status: InstitutionMemberStatus;
  invited_by: Uuid | null;
  joined_at: Timestamp;
  removed_at: Timestamp | null;
}
export interface InstitutionMembersInsert {
  university_id: Uuid;
  user_id: Uuid;
  role?: InstitutionMemberRole;
  status?: InstitutionMemberStatus;
  invited_by?: Uuid | null;
  joined_at?: Timestamp;
  removed_at?: Timestamp | null;
}
export type InstitutionMembersUpdate = Partial<InstitutionMembersInsert>;

export interface InstitutionProfileVersionsRow {
  id: Uuid;
  university_id: Uuid;
  version_number: number;
  snapshot: Json;
  source: InstitutionVersionSource;
  changed_by: Uuid | null;
  created_at: Timestamp;
}
export interface InstitutionProfileVersionsInsert {
  id?: Uuid;
  university_id: Uuid;
  version_number: number;
  snapshot: Json;
  source?: InstitutionVersionSource;
  changed_by?: Uuid | null;
  created_at?: Timestamp;
}
export type InstitutionProfileVersionsUpdate = Partial<InstitutionProfileVersionsInsert>;

export interface InstitutionAuditEventsRow {
  id: Uuid;
  university_id: Uuid | null;
  actor_id: Uuid | null;
  event_type: string;
  payload: Json;
  created_at: Timestamp;
}
export interface InstitutionAuditEventsInsert {
  id?: Uuid;
  university_id?: Uuid | null;
  actor_id?: Uuid | null;
  event_type: string;
  payload?: Json;
  created_at?: Timestamp;
}
export type InstitutionAuditEventsUpdate = Partial<InstitutionAuditEventsInsert>;

export interface GalleryImagesRow {
  id: Uuid;
  university_id: Uuid | null;
  category: string | null;
  preview_url: string;
}

export interface GalleryImagesInsert {
  id?: Uuid;
  university_id?: Uuid | null;
  category?: string | null;
  preview_url: string;
}

export type GalleryImagesUpdate = Partial<GalleryImagesInsert>;

export interface CoursesRow {
  id: Uuid;
  university_id: Uuid | null;
  name: string;
  mqa_code: string | null;
  tuition_fee: number | null;
  course_details: Json | null;
}

export interface CoursesInsert {
  id?: Uuid;
  university_id?: Uuid | null;
  name: string;
  mqa_code?: string | null;
  tuition_fee?: number | null;
  course_details?: Json | null;
}

export type CoursesUpdate = Partial<CoursesInsert>;

export interface SessionsRow {
  id: Uuid;
  parent_id: Uuid | null;
  parent_preferences: Json | null;
  parent_email: string | null;
  preferred_location: MalaysianStudyLocation | null;
  monthly_household_income: MonthlyHouseholdIncome | null;
  parental_preferences: ParentalPreferences | null;
  status: SessionStatus;
}

export interface SessionsInsert {
  id?: Uuid;
  parent_id?: Uuid | null;
  parent_preferences?: Json | null;
  parent_email?: string | null;
  preferred_location?: MalaysianStudyLocation | null;
  monthly_household_income?: MonthlyHouseholdIncome | null;
  parental_preferences?: ParentalPreferences | null;
  status: SessionStatus;
}

export type SessionsUpdate = Partial<SessionsInsert>;

export interface SessionStudentBindingsRow {
  id: Uuid;
  session_id: Uuid;
  student_id: Uuid | null;
  token_digest: string;
  invited_email_digest: string;
  status: SessionStudentBindingStatus;
  expires_at: Timestamp;
  claimed_at: Timestamp | null;
  claimed_by: Uuid | null;
  revoked_at: Timestamp | null;
  revoked_by: Uuid | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SessionStudentBindingsInsert {
  id?: Uuid;
  session_id: Uuid;
  student_id?: Uuid | null;
  token_digest: string;
  invited_email_digest: string;
  status?: SessionStudentBindingStatus;
  expires_at?: Timestamp;
  claimed_at?: Timestamp | null;
  claimed_by?: Uuid | null;
  revoked_at?: Timestamp | null;
  revoked_by?: Uuid | null;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export type SessionStudentBindingsUpdate = Partial<SessionStudentBindingsInsert>;

export interface ReportAccessGrantsRow {
  id: Uuid;
  session_id: Uuid;
  grant_kind: ReportAccessGrantKind;
  status: ReportAccessGrantStatus;
  granted_by: Uuid;
  granted_at: Timestamp;
  revoked_at: Timestamp | null;
  revoked_by: Uuid | null;
}

export interface ReportAccessGrantsInsert {
  id?: Uuid;
  session_id: Uuid;
  grant_kind?: ReportAccessGrantKind;
  status?: ReportAccessGrantStatus;
  granted_by: Uuid;
  granted_at?: Timestamp;
  revoked_at?: Timestamp | null;
  revoked_by?: Uuid | null;
}

export type ReportAccessGrantsUpdate = Partial<ReportAccessGrantsInsert>;

export interface StudentAssessmentsRow {
  id: Uuid;
  session_id: Uuid | null;
  student_id: Uuid | null;
  assessment_data: Json | null;
  student_email: string | null;
  academic_record: AcademicRecord | null;
  personality_test: PersonalityTestAnswers | null;
  vibe_check_quiz: VibeCheckQuiz | null;
}

export interface StudentAssessmentsInsert {
  id?: Uuid;
  session_id?: Uuid | null;
  student_id?: Uuid | null;
  assessment_data?: Json | null;
  student_email?: string | null;
  academic_record?: AcademicRecord | null;
  personality_test?: PersonalityTestAnswers | null;
  vibe_check_quiz?: VibeCheckQuiz | null;
}

export type StudentAssessmentsUpdate = Partial<StudentAssessmentsInsert>;

export interface RecommendationResultsRow {
  id: Uuid;
  session_id: Uuid | null;
  university_id: Uuid | null;
  match_score: number;
  roi_and_career: Json | null;
}

export interface RecommendationResultsInsert {
  id?: Uuid;
  session_id?: Uuid | null;
  university_id?: Uuid | null;
  match_score: number;
  roi_and_career?: Json | null;
}

export type RecommendationResultsUpdate = Partial<RecommendationResultsInsert>;

export interface PaymentsRow {
  id: Uuid;
  session_id: Uuid | null;
  tier: number;
  status: PaymentStatus;
}

export interface PaymentsInsert {
  id?: Uuid;
  session_id?: Uuid | null;
  tier: number;
  status: PaymentStatus;
}

export type PaymentsUpdate = Partial<PaymentsInsert>;

export interface ReviewsRow {
  id: Uuid;
  user_id: Uuid | null;
  university_id: Uuid | null;
  review_data: Json | null;
  is_anonymous: boolean | null;
  likes_count: number | null;
  created_at: Timestamp;
  status: ModerationStatus;
  course_id: Uuid | null;
  course_name: string | null;
  study_year: number | null;
  review_kind: InpolorReviewKind;
  rating_facilities: number | null;
  rating_teaching: number | null;
  rating_class_experience: number | null;
  rating_safety: number | null;
  rating_value: number | null;
  rating_transport: number | null;
  rating_campus_life: number | null;
  rating_career: number | null;
  overall_rating: number | null;
  living_cost_monthly: number | null;
  is_complete_review: boolean;
  current_version: number;
  acquisition_source: string | null;
  acquisition_campaign: string | null;
  submitted_at: Timestamp | null;
  published_at: Timestamp | null;
  updated_at: Timestamp;
}

export interface ReviewsInsert {
  id?: Uuid;
  user_id?: Uuid | null;
  university_id?: Uuid | null;
  review_data?: Json | null;
  is_anonymous?: boolean | null;
  likes_count?: number | null;
  created_at?: Timestamp;
  status?: ModerationStatus;
  course_id?: Uuid | null;
  course_name?: string | null;
  study_year?: number | null;
  review_kind?: InpolorReviewKind;
  rating_facilities?: number | null;
  rating_teaching?: number | null;
  rating_class_experience?: number | null;
  rating_safety?: number | null;
  rating_value?: number | null;
  rating_transport?: number | null;
  rating_campus_life?: number | null;
  rating_career?: number | null;
  overall_rating?: never;
  living_cost_monthly?: number | null;
  is_complete_review?: boolean;
  current_version?: number;
  acquisition_source?: string | null;
  acquisition_campaign?: string | null;
  submitted_at?: Timestamp | null;
  published_at?: Timestamp | null;
  updated_at?: Timestamp;
}

export type ReviewsUpdate = Partial<ReviewsInsert>;

/** Safe public projection. It intentionally has no author identifier or raw JSONB payload. */
export interface PublishedReviewsRow {
  id: Uuid;
  university_id: Uuid | null;
  course: string;
  year: string;
  rating: number;
  green_flags: string;
  red_flags: string;
  spill_the_tea: string;
  vibe_tags: Json;
  is_anonymous: boolean;
  likes_count: number;
  created_at: Timestamp;
  rating_facilities: number | null;
  rating_teaching: number | null;
  rating_class_experience: number | null;
  rating_safety: number | null;
  rating_value: number | null;
  rating_transport: number | null;
  rating_campus_life: number | null;
  rating_career: number | null;
  living_cost_monthly: number | null;
  content: Json;
  is_complete_review: boolean;
  visibility_status: InpolorVisibilityStatus;
  published_at: Timestamp | null;
}

export interface PublishedReviewsInsert {
  id: Uuid;
  university_id?: Uuid | null;
  course: string;
  year: string;
  rating: number;
  green_flags?: string;
  red_flags?: string;
  spill_the_tea: string;
  vibe_tags?: Json;
  is_anonymous: boolean;
  likes_count?: number;
  created_at: Timestamp;
  rating_facilities?: number | null;
  rating_teaching?: number | null;
  rating_class_experience?: number | null;
  rating_safety?: number | null;
  rating_value?: number | null;
  rating_transport?: number | null;
  rating_campus_life?: number | null;
  rating_career?: number | null;
  living_cost_monthly?: number | null;
  content?: Json;
  is_complete_review?: boolean;
  visibility_status?: InpolorVisibilityStatus;
  published_at?: Timestamp | null;
}

export type PublishedReviewsUpdate = Partial<PublishedReviewsInsert>;

export interface CommentsRow {
  id: Uuid;
  review_id: Uuid | null;
  user_id: Uuid | null;
  text: string;
  created_at: Timestamp;
  status: ModerationStatus;
  parent_comment_id: Uuid | null;
  depth: number;
  updated_at: Timestamp;
}

export interface CommentsInsert {
  id?: Uuid;
  review_id?: Uuid | null;
  user_id?: Uuid | null;
  text: string;
  created_at?: Timestamp;
  status?: ModerationStatus;
  parent_comment_id?: Uuid | null;
  depth?: number;
  updated_at?: Timestamp;
}

export type CommentsUpdate = Partial<CommentsInsert>;

export interface ReviewLikesRow {
  id: Uuid;
  review_id: Uuid | null;
  user_id: Uuid | null;
}

export interface ReviewLikesInsert {
  id?: Uuid;
  review_id?: Uuid | null;
  user_id?: Uuid | null;
}

export type ReviewLikesUpdate = Partial<ReviewLikesInsert>;

export interface ReviewVersionsRow { id: Uuid; review_id: Uuid; version_number: number; payload: Json; status: "submitted" | "needs_correction" | "approved" | "rejected"; submitted_by: Uuid; moderator_note: string | null; created_at: Timestamp; decided_at: Timestamp | null; decided_by: Uuid | null }
export interface ReviewVersionsInsert { id?: Uuid; review_id: Uuid; version_number: number; payload: Json; status?: ReviewVersionsRow["status"]; submitted_by: Uuid; moderator_note?: string | null; created_at?: Timestamp; decided_at?: Timestamp | null; decided_by?: Uuid | null }
export type ReviewVersionsUpdate = Partial<ReviewVersionsInsert>;
export interface ReviewPhotosRow { id: Uuid; review_id: Uuid; category: InpolorPhotoCategory; storage_path: string; mime_type: "image/jpeg" | "image/png" | "image/webp"; size_bytes: number; redaction_status: "pending" | "redacted" | "confirmed" | "rejected"; redaction_confirmed_at: Timestamp | null; quality_score: number | null; community_score: number; moderator_featured: boolean; sort_order: number; status: "pending" | InpolorVisibilityStatus | "rejected" | "removed"; created_at: Timestamp }
export interface ReviewPhotosInsert extends Omit<ReviewPhotosRow, "id" | "redaction_confirmed_at" | "quality_score" | "community_score" | "moderator_featured" | "sort_order" | "status" | "created_at"> { id?: Uuid; redaction_confirmed_at?: Timestamp | null; quality_score?: number | null; community_score?: number; moderator_featured?: boolean; sort_order?: number; status?: ReviewPhotosRow["status"]; created_at?: Timestamp }
export type ReviewPhotosUpdate = Partial<ReviewPhotosInsert>;
export interface ModerationActionsRow { id: Uuid; content_type: string; content_id: Uuid; action: string; reason_code: string | null; note: string | null; actor_id: Uuid; created_at: Timestamp }
export interface ModerationActionsInsert extends Omit<ModerationActionsRow, "id" | "reason_code" | "note" | "created_at"> { id?: Uuid; reason_code?: string | null; note?: string | null; created_at?: Timestamp }
export type ModerationActionsUpdate = Partial<ModerationActionsInsert>;
export interface ReviewUnspokenTruthsRow { id: Uuid; review_id: Uuid; review_version_id: Uuid | null; excerpt: string; topic: string; status: "candidate" | "approved" | "rejected" | "hidden_under_review"; classified_by: "automation" | "moderator"; decided_by: Uuid | null; decided_at: Timestamp | null; created_at: Timestamp }
export interface ReviewUnspokenTruthsInsert extends Omit<ReviewUnspokenTruthsRow, "id" | "review_version_id" | "status" | "classified_by" | "decided_by" | "decided_at" | "created_at"> { id?: Uuid; review_version_id?: Uuid | null; status?: ReviewUnspokenTruthsRow["status"]; classified_by?: ReviewUnspokenTruthsRow["classified_by"]; decided_by?: Uuid | null; decided_at?: Timestamp | null; created_at?: Timestamp }
export type ReviewUnspokenTruthsUpdate = Partial<ReviewUnspokenTruthsInsert>;
export interface UniversityQuestionsRow { id: Uuid; university_id: Uuid; author_id: Uuid; body: string; status: Exclude<ModerationStatus, "draft" | "submitted" | "needs_correction">; created_at: Timestamp; updated_at: Timestamp }
export interface UniversityQuestionsInsert extends Omit<UniversityQuestionsRow, "id" | "status" | "created_at" | "updated_at"> { id?: Uuid; status?: UniversityQuestionsRow["status"]; created_at?: Timestamp; updated_at?: Timestamp }
export type UniversityQuestionsUpdate = Partial<UniversityQuestionsInsert>;
export interface QuestionAnswersRow { id: Uuid; question_id: Uuid; author_id: Uuid; parent_answer_id: Uuid | null; depth: number; author_label: InpolorAnswerLabel; body: string; status: UniversityQuestionsRow["status"]; upvotes_count: number; created_at: Timestamp; updated_at: Timestamp }
export interface QuestionAnswersInsert extends Omit<QuestionAnswersRow, "id" | "parent_answer_id" | "depth" | "author_label" | "status" | "upvotes_count" | "created_at" | "updated_at"> { id?: Uuid; parent_answer_id?: Uuid | null; depth?: number; author_label?: InpolorAnswerLabel; status?: QuestionAnswersRow["status"]; upvotes_count?: number; created_at?: Timestamp; updated_at?: Timestamp }
export type QuestionAnswersUpdate = Partial<QuestionAnswersInsert>;
export interface QuestionAnswerVotesRow { answer_id: Uuid; user_id: Uuid; created_at: Timestamp }
export interface QuestionAnswerVotesInsert { answer_id: Uuid; user_id: Uuid; created_at?: Timestamp }
export type QuestionAnswerVotesUpdate = Partial<QuestionAnswerVotesInsert>;
export interface OfficialResponsesRow { id: Uuid; university_id: Uuid; author_id: Uuid; target_type: "profile" | "review" | "question"; target_id: Uuid | null; body: string; status: UniversityQuestionsRow["status"]; created_at: Timestamp; published_at: Timestamp | null }
export interface OfficialResponsesInsert extends Omit<OfficialResponsesRow, "id" | "target_id" | "status" | "created_at" | "published_at"> { id?: Uuid; target_id?: Uuid | null; status?: OfficialResponsesRow["status"]; created_at?: Timestamp; published_at?: Timestamp | null }
export type OfficialResponsesUpdate = Partial<OfficialResponsesInsert>;
export interface ContentReportsRow { id: Uuid; reporter_id: Uuid; content_type: string; content_id: Uuid; reason_code: string; details: string | null; status: "received" | "under_review" | "action_taken" | "no_action"; created_at: Timestamp; resolved_at: Timestamp | null; resolved_by: Uuid | null }
export interface ContentReportsInsert extends Omit<ContentReportsRow, "id" | "details" | "status" | "created_at" | "resolved_at" | "resolved_by"> { id?: Uuid; details?: string | null; status?: ContentReportsRow["status"]; created_at?: Timestamp; resolved_at?: Timestamp | null; resolved_by?: Uuid | null }
export type ContentReportsUpdate = Partial<ContentReportsInsert>;
export interface UserSaveRow { user_id: Uuid; created_at: Timestamp }
export interface ReviewSavesRow extends UserSaveRow { review_id: Uuid }
export interface ReviewSavesInsert { review_id: Uuid; user_id: Uuid; created_at?: Timestamp }
export type ReviewSavesUpdate = Partial<ReviewSavesInsert>;
export interface UniversitySavesRow extends UserSaveRow { university_id: Uuid }
export interface UniversitySavesInsert { university_id: Uuid; user_id: Uuid; created_at?: Timestamp }
export type UniversitySavesUpdate = Partial<UniversitySavesInsert>;
export interface QuestionSavesRow extends UserSaveRow { question_id: Uuid }
export interface QuestionSavesInsert { question_id: Uuid; user_id: Uuid; created_at?: Timestamp }
export type QuestionSavesUpdate = Partial<QuestionSavesInsert>;
export interface NotificationsRow { id: Uuid; user_id: Uuid; kind: string; title_key: string; body_key: string; data: Json; read_at: Timestamp | null; created_at: Timestamp }
export interface NotificationsInsert extends Omit<NotificationsRow, "id" | "data" | "read_at" | "created_at"> { id?: Uuid; data?: Json; read_at?: Timestamp | null; created_at?: Timestamp }
export type NotificationsUpdate = Partial<NotificationsInsert>;
export interface RewardClaimStatusesRow { id: Uuid; user_id: Uuid; review_id: Uuid; status: InpolorRewardStatus; transaction_reference: string | null; submitted_at: Timestamp; paid_at: Timestamp | null; updated_at: Timestamp }
export interface RewardClaimStatusesInsert extends Omit<RewardClaimStatusesRow, "transaction_reference" | "paid_at" | "updated_at"> { transaction_reference?: string | null; paid_at?: Timestamp | null; updated_at?: Timestamp }
export type RewardClaimStatusesUpdate = Partial<RewardClaimStatusesInsert>;
export interface PublishedReviewPhotosRow { id: Uuid; review_id: Uuid; university_id: Uuid; category: InpolorPhotoCategory; storage_path: string; quality_score: number | null; community_score: number; moderator_featured: boolean; sort_order: number; visibility_status: InpolorVisibilityStatus; created_at: Timestamp }
export type PublishedReviewPhotosInsert = PublishedReviewPhotosRow; export type PublishedReviewPhotosUpdate = Partial<PublishedReviewPhotosRow>;
export interface PublishedCommentsRow { id: Uuid; review_id: Uuid; parent_comment_id: Uuid | null; depth: number; text: string; visibility_status: InpolorVisibilityStatus; created_at: Timestamp }
export type PublishedCommentsInsert = PublishedCommentsRow; export type PublishedCommentsUpdate = Partial<PublishedCommentsRow>;
export interface PublishedQuestionsRow { id: Uuid; university_id: Uuid; body: string; visibility_status: InpolorVisibilityStatus; created_at: Timestamp }
export type PublishedQuestionsInsert = PublishedQuestionsRow; export type PublishedQuestionsUpdate = Partial<PublishedQuestionsRow>;
export interface PublishedQuestionAnswersRow { id: Uuid; question_id: Uuid; parent_answer_id: Uuid | null; depth: number; author_label: InpolorAnswerLabel; body: string; upvotes_count: number; visibility_status: InpolorVisibilityStatus; created_at: Timestamp }
export type PublishedQuestionAnswersInsert = PublishedQuestionAnswersRow; export type PublishedQuestionAnswersUpdate = Partial<PublishedQuestionAnswersRow>;
export interface PublishedOfficialResponsesRow { id: Uuid; university_id: Uuid; target_type: "profile" | "review" | "question"; target_id: Uuid | null; body: string; visibility_status: InpolorVisibilityStatus; published_at: Timestamp }
export type PublishedOfficialResponsesInsert = PublishedOfficialResponsesRow; export type PublishedOfficialResponsesUpdate = Partial<PublishedOfficialResponsesRow>;
export interface PublishedUnspokenTruthsRow { id: Uuid; review_id: Uuid; university_id: Uuid; topic: string; excerpt: string; created_at: Timestamp }
export type PublishedUnspokenTruthsInsert = PublishedUnspokenTruthsRow; export type PublishedUnspokenTruthsUpdate = Partial<PublishedUnspokenTruthsRow>;
export interface UnspokenTruthTeasersRow { id: Uuid; review_id: Uuid; university_id: Uuid; topic: string; created_at: Timestamp }
export type UnspokenTruthTeasersInsert = UnspokenTruthTeasersRow; export type UnspokenTruthTeasersUpdate = Partial<UnspokenTruthTeasersRow>;

/** Constraints that Supabase's generated TypeScript table shape cannot encode. */
export const DATABASE_CONSTRAINTS = {
  unique: [
    { table: "profiles", columns: ["email"] },
    { table: "universities", columns: ["name"] },
    { table: "courses", columns: ["mqa_code"] },
    { table: "review_likes", columns: ["review_id", "user_id"] },
    { table: "session_student_bindings", columns: ["session_id"] },
    { table: "session_student_bindings", columns: ["token_digest"] },
    { table: "session_student_bindings", columns: ["session_id", "student_id"] },
    { table: "report_access_grants", columns: ["session_id"] },
  ],
  onDeleteCascade: [
    {
      table: "gallery_images",
      columns: ["university_id"],
      referencedTable: "universities",
      referencedColumns: ["id"],
    },
    {
      table: "courses",
      columns: ["university_id"],
      referencedTable: "universities",
      referencedColumns: ["id"],
    },
    {
      table: "comments",
      columns: ["review_id"],
      referencedTable: "reviews",
      referencedColumns: ["id"],
    },
    {
      table: "review_likes",
      columns: ["review_id"],
      referencedTable: "reviews",
      referencedColumns: ["id"],
    },
    {
      table: "session_student_bindings",
      columns: ["session_id"],
      referencedTable: "sessions",
      referencedColumns: ["id"],
    },
    {
      table: "report_access_grants",
      columns: ["session_id"],
      referencedTable: "sessions",
      referencedColumns: ["id"],
    },
    {
      table: "published_reviews",
      columns: ["id"],
      referencedTable: "reviews",
      referencedColumns: ["id"],
    },
  ],
} as const;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: ProfilesInsert;
        Update: ProfilesUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      universities: {
        Row: UniversitiesRow;
        Insert: UniversitiesInsert;
        Update: UniversitiesUpdate;
        Relationships: [];
      };
      institution_domains: {
        Row: InstitutionDomainsRow;
        Insert: InstitutionDomainsInsert;
        Update: InstitutionDomainsUpdate;
        Relationships: [
          {
            foreignKeyName: "institution_domains_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      approved_institution_domains: {
        Row: ApprovedInstitutionDomainsRow;
        Insert: ApprovedInstitutionDomainsInsert;
        Update: ApprovedInstitutionDomainsUpdate;
        Relationships: [];
      };
      institution_members: {
        Row: InstitutionMembersRow;
        Insert: InstitutionMembersInsert;
        Update: InstitutionMembersUpdate;
        Relationships: [
          {
            foreignKeyName: "institution_members_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "institution_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      institution_profile_versions: {
        Row: InstitutionProfileVersionsRow;
        Insert: InstitutionProfileVersionsInsert;
        Update: InstitutionProfileVersionsUpdate;
        Relationships: [
          {
            foreignKeyName: "institution_profile_versions_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      institution_audit_events: {
        Row: InstitutionAuditEventsRow;
        Insert: InstitutionAuditEventsInsert;
        Update: InstitutionAuditEventsUpdate;
        Relationships: [
          {
            foreignKeyName: "institution_audit_events_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      gallery_images: {
        Row: GalleryImagesRow;
        Insert: GalleryImagesInsert;
        Update: GalleryImagesUpdate;
        Relationships: [
          {
            foreignKeyName: "gallery_images_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: CoursesRow;
        Insert: CoursesInsert;
        Update: CoursesUpdate;
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: SessionsRow;
        Insert: SessionsInsert;
        Update: SessionsUpdate;
        Relationships: [
          {
            foreignKeyName: "sessions_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      session_student_bindings: {
        Row: SessionStudentBindingsRow;
        Insert: SessionStudentBindingsInsert;
        Update: SessionStudentBindingsUpdate;
        Relationships: [
          {
            foreignKeyName: "session_student_bindings_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_student_bindings_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_student_bindings_claimed_by_fkey";
            columns: ["claimed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_student_bindings_revoked_by_fkey";
            columns: ["revoked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      report_access_grants: {
        Row: ReportAccessGrantsRow;
        Insert: ReportAccessGrantsInsert;
        Update: ReportAccessGrantsUpdate;
        Relationships: [
          {
            foreignKeyName: "report_access_grants_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_access_grants_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_access_grants_revoked_by_fkey";
            columns: ["revoked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_assessments: {
        Row: StudentAssessmentsRow;
        Insert: StudentAssessmentsInsert;
        Update: StudentAssessmentsUpdate;
        Relationships: [
          {
            foreignKeyName: "student_assessments_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_assessments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendation_results: {
        Row: RecommendationResultsRow;
        Insert: RecommendationResultsInsert;
        Update: RecommendationResultsUpdate;
        Relationships: [
          {
            foreignKeyName: "recommendation_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendation_results_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: PaymentsRow;
        Insert: PaymentsInsert;
        Update: PaymentsUpdate;
        Relationships: [
          {
            foreignKeyName: "payments_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: ReviewsRow;
        Insert: ReviewsInsert;
        Update: ReviewsUpdate;
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      review_versions: { Row: ReviewVersionsRow; Insert: ReviewVersionsInsert; Update: ReviewVersionsUpdate; Relationships: [] };
      review_photos: { Row: ReviewPhotosRow; Insert: ReviewPhotosInsert; Update: ReviewPhotosUpdate; Relationships: [] };
      moderation_actions: { Row: ModerationActionsRow; Insert: ModerationActionsInsert; Update: ModerationActionsUpdate; Relationships: [] };
      review_unspoken_truths: { Row: ReviewUnspokenTruthsRow; Insert: ReviewUnspokenTruthsInsert; Update: ReviewUnspokenTruthsUpdate; Relationships: [] };
      published_reviews: {
        Row: PublishedReviewsRow;
        Insert: PublishedReviewsInsert;
        Update: PublishedReviewsUpdate;
        Relationships: [
          {
            foreignKeyName: "published_reviews_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "published_reviews_university_id_fkey";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: CommentsRow;
        Insert: CommentsInsert;
        Update: CommentsUpdate;
        Relationships: [
          {
            foreignKeyName: "comments_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      university_questions: { Row: UniversityQuestionsRow; Insert: UniversityQuestionsInsert; Update: UniversityQuestionsUpdate; Relationships: [] };
      question_answers: { Row: QuestionAnswersRow; Insert: QuestionAnswersInsert; Update: QuestionAnswersUpdate; Relationships: [] };
      question_answer_votes: { Row: QuestionAnswerVotesRow; Insert: QuestionAnswerVotesInsert; Update: QuestionAnswerVotesUpdate; Relationships: [] };
      official_responses: { Row: OfficialResponsesRow; Insert: OfficialResponsesInsert; Update: OfficialResponsesUpdate; Relationships: [] };
      content_reports: { Row: ContentReportsRow; Insert: ContentReportsInsert; Update: ContentReportsUpdate; Relationships: [] };
      review_saves: { Row: ReviewSavesRow; Insert: ReviewSavesInsert; Update: ReviewSavesUpdate; Relationships: [] };
      university_saves: { Row: UniversitySavesRow; Insert: UniversitySavesInsert; Update: UniversitySavesUpdate; Relationships: [] };
      question_saves: { Row: QuestionSavesRow; Insert: QuestionSavesInsert; Update: QuestionSavesUpdate; Relationships: [] };
      notifications: { Row: NotificationsRow; Insert: NotificationsInsert; Update: NotificationsUpdate; Relationships: [] };
      reward_claim_statuses: { Row: RewardClaimStatusesRow; Insert: RewardClaimStatusesInsert; Update: RewardClaimStatusesUpdate; Relationships: [] };
      published_review_photos: { Row: PublishedReviewPhotosRow; Insert: PublishedReviewPhotosInsert; Update: PublishedReviewPhotosUpdate; Relationships: [] };
      published_comments: { Row: PublishedCommentsRow; Insert: PublishedCommentsInsert; Update: PublishedCommentsUpdate; Relationships: [] };
      published_questions: { Row: PublishedQuestionsRow; Insert: PublishedQuestionsInsert; Update: PublishedQuestionsUpdate; Relationships: [] };
      published_question_answers: { Row: PublishedQuestionAnswersRow; Insert: PublishedQuestionAnswersInsert; Update: PublishedQuestionAnswersUpdate; Relationships: [] };
      published_official_responses: { Row: PublishedOfficialResponsesRow; Insert: PublishedOfficialResponsesInsert; Update: PublishedOfficialResponsesUpdate; Relationships: [] };
      published_unspoken_truths: { Row: PublishedUnspokenTruthsRow; Insert: PublishedUnspokenTruthsInsert; Update: PublishedUnspokenTruthsUpdate; Relationships: [] };
      unspoken_truth_teasers: { Row: UnspokenTruthTeasersRow; Insert: UnspokenTruthTeasersInsert; Update: UnspokenTruthTeasersUpdate; Relationships: [] };
      review_likes: {
        Row: ReviewLikesRow;
        Insert: ReviewLikesInsert;
        Update: ReviewLikesUpdate;
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      inpolor_university_summaries: {
        Row: {
          university_id: Uuid;
          review_count: number;
          overall_rating: number | null;
          rating_facilities: number | null;
          rating_teaching: number | null;
          rating_class_experience: number | null;
          rating_safety: number | null;
          rating_value: number | null;
          rating_transport: number | null;
          rating_campus_life: number | null;
          rating_career: number | null;
          living_cost_monthly: number | null;
          ranking_eligible: boolean;
          newest_review_at: Timestamp | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_parent_student_invitation: {
        Args: {
          p_monthly_household_income: string;
          p_parent_preferences: Json;
          p_parental_preferences: Json;
          p_preferred_location: string;
          p_student_email: string;
        };
        Returns: Json;
      };
      revoke_parent_student_invitation: {
        Args: { p_session_id: string };
        Returns: Json;
      };
      claim_student_invitation: {
        Args: { p_invitation_token: string };
        Returns: Json;
      };
      complete_student_assessment: {
        Args: {
          p_academic_record: Json;
          p_assessment_data: Json;
          p_personality_test: Json;
          p_session_id: string;
          p_vibe_check_quiz: Json;
        };
        Returns: Json;
      };
      grant_demo_report_access: {
        Args: { p_session_id: string };
        Returns: Json;
      };
      get_authorized_report: {
        Args: { p_session_id: string };
        Returns: Json;
      };
      get_institution_entitlement: {
        Args: { p_university_id: string };
        Returns: Json;
      };
      claim_institution_domain: {
        Args: { p_university_id: string; p_domain: string };
        Returns: Json;
      };
      transfer_institution_admin: {
        Args: { p_university_id: string; p_new_admin_id: string };
        Returns: Json;
      };
      set_institution_suspension: {
        Args: { p_university_id: string; p_suspended: boolean; p_reason?: string | null };
        Returns: Json;
      };
      set_institution_verification: {
        Args: { p_university_id: Uuid; p_verification_status: "unverified" | "verified" | "suspended" };
        Returns: Json;
      };
      submit_review_for_moderation: {
        Args: {
          p_university_id: string;
          p_review_data: Json;
          p_is_anonymous: boolean;
        };
        Returns: Json;
      };
      submit_inpolor_review: {
        Args: { p_payload: Json };
        Returns: Json;
      };
      complete_inpolor_community_onboarding: {
        Args: { p_date_of_birth: string; p_locale?: InpolorLocale };
        Returns: Json;
      };
      create_inpolor_reward_draft: {
        Args: { p_university_id: Uuid };
        Returns: Json;
      };
      submit_inpolor_reward_claim: {
        Args: { p_review_id: Uuid; p_ewallet_number: string };
        Returns: Json;
      };
      mark_inpolor_reward_paid: {
        Args: { p_claim_id: Uuid; p_transaction_reference: string };
        Returns: Json;
      };
      get_inpolor_payment_queue: {
        Args: { p_limit?: number };
        Returns: Json;
      };
      record_inpolor_reward_risk: {
        Args: { p_review_id: Uuid; p_signal_type: string; p_signal_digest: string | null; p_score: number; p_metadata?: Json };
        Returns: undefined;
      };
      moderate_inpolor_review: {
        Args: { p_review_id: Uuid; p_action: "publish" | "request_correction" | "reject" | "hide" | "restore"; p_note?: string | null };
        Returns: Json;
      };
      report_inpolor_content: {
        Args: { p_content_type: string; p_content_id: Uuid; p_reason_code: string; p_details?: string | null };
        Returns: Json;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

type PublicSchema = Database["public"];

export type PublicTableName = keyof PublicSchema["Tables"];

export type Tables<TableName extends PublicTableName> =
  PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<TableName extends PublicTableName> =
  PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<TableName extends PublicTableName> =
  PublicSchema["Tables"][TableName]["Update"];
