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
export type PaymentStatus = "pending" | "success" | "failed";

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
  status: SessionStatus;
}

export interface SessionsInsert {
  id?: Uuid;
  parent_id?: Uuid | null;
  parent_preferences?: Json | null;
  status: SessionStatus;
}

export type SessionsUpdate = Partial<SessionsInsert>;

export interface StudentAssessmentsRow {
  id: Uuid;
  session_id: Uuid | null;
  student_id: Uuid | null;
  assessment_data: Json | null;
}

export interface StudentAssessmentsInsert {
  id?: Uuid;
  session_id?: Uuid | null;
  student_id?: Uuid | null;
  assessment_data?: Json | null;
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
}

export interface ReviewsInsert {
  id?: Uuid;
  user_id?: Uuid | null;
  university_id?: Uuid | null;
  review_data?: Json | null;
  is_anonymous?: boolean | null;
  likes_count?: number | null;
}

export type ReviewsUpdate = Partial<ReviewsInsert>;

export interface CommentsRow {
  id: Uuid;
  review_id: Uuid | null;
  user_id: Uuid | null;
  text: string;
}

export interface CommentsInsert {
  id?: Uuid;
  review_id?: Uuid | null;
  user_id?: Uuid | null;
  text: string;
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
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
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
