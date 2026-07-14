# Blueprint: INPOLOR Portal (Student Reviews)

## 1. Tech Stack
* **Framework:** React 18 (Functional Components, Hooks)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (utility classes)
* **Icons:** Lucide React (`lucide-react`)
* **State Management:** React `useState`, `useEffect` (Local Component State)
* **Persistence:** Browser `localStorage` (for prototyping/mockup state)

## 2. Validation Rules & Edge Cases
| Form Field | Validation Rule | Error Message |
|---|---|---|
| Course/Major | Required, non-empty string | "Course is required" |
| Year of Study | Required, must be a valid selection | "Please select your year" |
| Overall Rating | Required, must be between 1 and 5 | "Please provide a rating" |
| Spill the Tea (Text) | Required, minimum length | "Please share your experience" |
| Email (Auth) | Required, valid email format | "Enter a valid email address" |

* **Edge Cases:**
  * Display friendly empty state if filters yield no results.
  * Catch `localStorage` quota full errors gracefully.
  * Scrub User ID/Email from payload if `isAnonymous` is toggled true.
  * Prompt Auth Modal for unauthenticated Like/Comment actions.

## 3. User Flow
## / (Home - Reviews Tab Active)
* User lands on page, views Navbar, Header Banner, and Review Feed.
* User clicks a **Tab** (e.g., Tuition) to update main content view.
* User clicks **Write a Review** to open Multi-Step Review Modal.
* User clicks **Sign In** to open Auth Modal.
* User attempts to view "Unspoken Truths" unauthenticated, opening Gamified Quick Review Modal.

## /submit-review (Multi-Step Modal Flow)
* **Step 1:** User fills Background. Clicks **Next**.
* **Step 2:** User fills Green & Red Flags. Clicks **Next**.
* **Step 3:** User rates, adds Spill the Tea text and Vibe tags. Clicks **Submit**.
  > Appends review to local state, persists to `localStorage`, and shows Success.
* **Step 4:** User clicks **Close**. Feed updates.

## /quick-review (Gamified Flow)
* Unauthenticated user attempts gated action.
  > Gamified Modal opens.
* User fills minimal fields and clicks **Submit & Unlock Secrets**.
  > Grants access and closes modal.

## 4. Component Tree & Specs
## Component Tree
- App Layout
  - Navbar
  - Header Banner (University Profile)
  - Horizontal Tabs
  - Main Content
    - Left Column (Feed)
      - Filter Section
      - Review List
        - Review Card
          - Comments Section
    - Right Column (Sidebar)
  - Modals
    - Multi-Step Review Modal
    - Auth Modal
    - Gamified Quick Review Modal

### Component Specs
### Navbar & Header Banner
* **Purpose:** Top brand navigation, university switcher, and high-level stats.
* **Visual Details:** `bg-white/95 backdrop-blur-md sticky top-0`. Header is `bg-white border-b border-sea-fog`.

### Horizontal Tabs & Feed
* **Purpose:** View switcher and review list container.
* **Visual Details:** Horizontally scrollable tabs without scrollbars. Feed has search/filter controls (`bg-ice-tint`).

### Review Card
* **Purpose:** Displays individual review.
* **Visual Details:** `bg-white rounded-[24px] border border-sea-fog shadow-sm p-5`.

### Multi-Step Review Modal
* **Purpose:** Comprehensive wizard for submitting reviews.
* **Visual Details:** `fixed inset-0 bg-midnight-harbor/60 backdrop-blur-md flex items-center justify-center z-50`.

### Gamified Quick Review Modal
* **Purpose:** Prompts non-authenticated users for a quick review to unlock access.
* **Visual Details:** `bg-white rounded-[32px] overflow-hidden animate-scaleUp`.

### Auth Modal
* **Purpose:** Handles magic link email login.
* **Visual Details:** Centered card `max-w-sm w-full p-6 animate-scaleUp`.