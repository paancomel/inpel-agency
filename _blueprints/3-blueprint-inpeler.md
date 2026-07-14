# Blueprint: INPELER Portal (University Data Entry)

## 1. Tech Stack
* **Framework:** React 18+ (via Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** lucide-react
* **State Management:** React Hooks (`useState`, `useRef`, `useEffect`)

## 2. Validation Rules & Edge Cases
| Form Field | Validation Rule | Error Message |
|---|---|---|
| MQA Accreditation Code | Required | "MQA Accreditation Code is required." |

* **Edge Cases:**
  * Prevent publishing if `courses.length === 0`.
  * Prevent publishing if the attestation checkbox is not checked.
  * Handle form submissions with a loading state (`isPublishing`) to prevent double-submissions.
  * Clearly display empty non-required fields in the Review tab as "Empty" or "Not Specified".

## 3. User Flow
## /login
* User inputs institutional credentials and clicks **Login**.
  > Transitions state to `dashboard`.

## /dashboard/global-profile
* Default dashboard view. User inputs structural data and toggles facility checkboxes.
* User interacts with **Add Image** inputs.
* User clicks **Review Data**.
  > Transitions view to `/dashboard/review`.

## /dashboard/courses (List View)
* Displays empty state or list of current courses.
* User clicks **+ Add New Program**.
  > Transitions to `/dashboard/courses/form`.
* User can **Edit** or **Remove** existing courses.

## /dashboard/courses/form (Add/Edit View)
* User interacts with Expand/Collapse Chevron buttons for form sections.
* User inputs program details and clicks **Review Data** (Save Course).
  > Appends course and transitions to `/dashboard/review`.

## /dashboard/review
* Read-only consolidated summary of Global Profile, Gallery, and Courses.
* User clicks **Institution Accuracy Attestation** checkbox.
* User clicks **Publish to INPELER PORTAL**.
  > Sets loading state, simulates network delay, and transitions to `/dashboard/success`.

## /dashboard/success
* Displays success graphic and live portal metrics.
* User clicks **Return to Admin Dashboard**.

## 4. Component Tree & Specs
## Component Tree
- App
  - ToastNotification
  - LoginView
    - LoginForm
  - DashboardView
    - Sidebar
    - Header
    - MainContent
      - GlobalProfileTab
      - CoursesTab
        - CourseList
        - CourseForm
      - ReviewAndPublishTab

### Component Specs
### App & LoginView
* **Purpose:** Root component routing and authentication handling.
* **Visual Details:** `bg-pure-white`. Login is a centered card layout (`bg-white shadow-xl rounded-2xl`).

### Sidebar & Header
* **Purpose:** Navigation menu and top contextual bar.
* **Visual Details:** Fixed width sidebar (`w-64 border-r border-frost`). Header shows auto-save status.

### GlobalProfileTab
* **Purpose:** Collects institutional data, facilities, and images.
* **Visual Details:** Card-like layout with `space-y-24`. Input fields use `bg-mist/50 border-frost`. Dropzone uses dashed borders.

### CoursesTab & CourseForm
* **Purpose:** Manages list of courses and detailed input forms.
* **Visual Details:** Divided into logical toggleable sections (Academic, Financial). Auto-saves on typing.

### ReviewAndPublishTab & PublishSuccess
* **Purpose:** Read-only confirmation screens and final success state.
* **Visual Details:** Cleanly spaced grids `bg-white border-frost rounded-xl`. Success features large `emerald-500` checkmark.