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
export type ProfileRole = "parent" | "student" | "university_rep" | "admin";
export type SessionStatus = "invited" | "completed";
export type SessionStudentBindingStatus = "issued" | "claimed" | "expired" | "revoked";
export type ReportAccessGrantKind = "demo";
export type ReportAccessGrantStatus = "active" | "revoked";
export type ModerationStatus = "pending" | "published" | "rejected" | "removed";
export type PaymentStatus = "pending" | "success" | "failed";

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
}

export interface ProfilesInsert {
  id: Uuid;
  email: string;
  role: ProfileRole;
  has_unlocked_tea?: boolean | null;
  created_at?: Timestamp | null;
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
}

export type UniversitiesUpdate = Partial<UniversitiesInsert>;

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
}

export type PublishedReviewsUpdate = Partial<PublishedReviewsInsert>;

export interface CommentsRow {
  id: Uuid;
  review_id: Uuid | null;
  user_id: Uuid | null;
  text: string;
  created_at: Timestamp;
  status: ModerationStatus;
}

export interface CommentsInsert {
  id?: Uuid;
  review_id?: Uuid | null;
  user_id?: Uuid | null;
  text: string;
  created_at?: Timestamp;
  status?: ModerationStatus;
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
    Views: {};
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
      submit_review_for_moderation: {
        Args: {
          p_university_id: string;
          p_review_data: Json;
          p_is_anonymous: boolean;
        };
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
