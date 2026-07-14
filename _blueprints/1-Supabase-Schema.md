# Database Schema Specification (Centralized Monorepo)

## 1. Authentication & Users

### `profiles`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, FK (`auth.users.id`) | Matches Supabase's native auth user ID. |
| `email` | text | Unique, Not Null | The user's email address. |
| `role` | text | Not Null | Defines access level: 'parent', 'student', 'university_rep', or 'admin'. |
| `has_unlocked_tea` | boolean | default(false) | Gamification flag for INPOLOR (Student Portal). |
| `created_at` | timestamp | default(now()) | Record creation timestamp. |
> **Relationship:** The central user table extending Supabase Auth.
> **RLS Policy:** Users can only update their own profile. Anyone can read basic profile info.

---

## 2. Core Catalog (Shared by INPELER, INPOLOR, INPEL)

### `universities`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique institution identifier. |
| `name` | text | Unique, Not Null | Official name of the university. |
| `location` | text | | Geographic location (City, State). |
| `address` | text | | Full official physical address. |
| `logo_url` | text | | CDN URL for the university logo/avatar. |
| `tuition_fees` | numeric | | Estimated average annual tuition. |
| `living_costs` | numeric | | Estimated average annual living costs. |
| `acceptance_rate` | text | | Acceptance rate (e.g., "65%"). |
| `facilities_flags` | jsonb | | JSON containing booleans for clinic, library, surau, halal, transit, etc. |
| `contacts` | jsonb | | JSON containing admissions contact name, phone, and social media links. |
| `created_at` | timestamp | default(now()) | Record creation timestamp. |
> **Relationship:** The Single Source of Truth for all campuses. Merged from all 3 portals.
> **RLS Policy:** Public read access. Only users with role 'university_rep' (and matching university relation) or 'admin' can update.

### `gallery_images`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique identifier. |
| `university_id` | uuid | FK (`universities.id`) ON DELETE CASCADE | The university this image belongs to. |
| `category` | text | | Category (Campus, Hostel, etc.). |
| `preview_url` | text | Not Null | Storage bucket URL. |
> **Relationship:** Visual assets for universities.
> **RLS Policy:** Public read access. Only matching 'university_rep' can insert/delete.

### `courses`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique identifier. |
| `university_id` | uuid | FK (`universities.id`) ON DELETE CASCADE | The university offering the course. |
| `name` | text | Not Null | Official name of the academic program. |
| `mqa_code` | text | Unique | MQA Accreditation Code. |
| `tuition_fee` | numeric | | Total base tuition fee. |
| `course_details` | jsonb | | JSON containing study mode, duration, entry requirements, dual award info, etc. |
> **Relationship:** Academic program catalog linked to universities.
> **RLS Policy:** Public read access. Only matching 'university_rep' can insert/update/delete.

---

## 3. Matchmaking & Assessments (INPEL - Parent/Student)

### `sessions`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique session/invite link ID. |
| `parent_id` | uuid | FK (`profiles.id`) | Links to the parent who generated the link. |
| `parent_preferences` | jsonb | | JSON containing location preference, budget, and questionnaire answers. |
| `status` | text | Not Null | Lifecycle status ('invited', 'completed'). |
> **RLS Policy:** Private. Only the specific 'parent' or the linked 'student' can read/update.

### `student_assessments`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique assessment identifier. |
| `session_id` | uuid | FK (`sessions.id`) | Links to the parent's session. |
| `student_id` | uuid | FK (`profiles.id`) | Links to the student taking the test. |
| `assessment_data` | jsonb | | JSON containing hobbies, psychometric sliders, scenario answers, and SPM grades. |
> **RLS Policy:** Private. Only the specific 'student' and the linked 'parent' can read/update.

### `recommendation_results`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique AI recommendation ID. |
| `session_id` | uuid | FK (`sessions.id`) | Links back to the session. |
| `university_id` | uuid | FK (`universities.id`) | The recommended university. |
| `match_score` | integer | Not Null | Compatibility percentage. |
| `roi_and_career` | jsonb | | JSON containing ROI details and career progression tracks. |
> **RLS Policy:** Private. Only accessible by the linked 'parent' or 'student' if payment is cleared.

### `payments`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Transaction ID. |
| `session_id` | uuid | FK (`sessions.id`) | Session being upgraded. |
| `tier` | integer | Not Null | Purchased tier. |
| `status` | text | Not Null | 'pending', 'success', 'failed'. |
> **RLS Policy:** Private to the 'parent' user making the purchase.

---

## 4. Community & Reviews (INPOLOR - Student)

### `reviews`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique review ID. |
| `user_id` | uuid | FK (`profiles.id`) | Author of the review. |
| `university_id` | uuid | FK (`universities.id`) | University being reviewed. |
| `review_data` | jsonb | | JSON containing rating, course, vibe tags, green/red flags, and 'spill_the_tea' content. |
| `is_anonymous` | boolean | default(false) | Hides user_id on the frontend if true. |
| `likes_count` | integer | default(0) | Cached count of likes. |
> **RLS Policy:** Public read access. Only authenticated users with role 'student' can insert. Authors can edit/delete their own.

### `comments`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Unique comment ID. |
| `review_id` | uuid | FK (`reviews.id`) ON DELETE CASCADE | Parent review. |
| `user_id` | uuid | FK (`profiles.id`) | Author of comment. |
| `text` | text | Not Null | Comment content. |
> **RLS Policy:** Public read access. Authenticated users can insert. Authors can delete their own.

### `review_likes`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | uuid | PK, default(uuid_v4()) | Like record ID. |
| `review_id` | uuid | FK (`reviews.id`) ON DELETE CASCADE | Liked review. |
| `user_id` | uuid | FK (`profiles.id`) | User who liked it. |
> **Constraint:** Unique composite key (`review_id`, `user_id`) to prevent duplicate likes.
> **RLS Policy:** Public read access. Authenticated users can toggle their own likes.