# Blueprint: INPEL Portal (Parent Matchmaking)

## 1. Tech Stack
* **Framework:** React 18+ (Single Page Application)
* **Routing:** React Router v6 (`react-router-dom`)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Utility-first CSS framework)
* **Icons:** Lucide React (`lucide-react`)
* **Data Visualization:** Recharts (Radar, Line charts), D3.js (Force-directed graph)
* **Animation:** Motion (`motion/react`)
* **PDF Generation:** jsPDF, html2canvas
* **State Management:** React local state (`useState`, `useEffect`, `Context API`) and `localStorage` persistence

## 2. Validation Rules & Edge Cases
| Form Field | Validation Rule | Error Message |
|---|---|---|
| Parent Location | Must be a non-empty string | "Please select your location." |
| Parent Salary / Budget | Must be a valid numerical range or selected option | "Please select your budget/salary range." |
| Parent Email | Must be a valid email format (`^\S+@\S+\.\S+$`) | "Please enter a valid email address." |
| Student Email | Must be a valid email format (`^\S+@\S+\.\S+$`) | "Please enter a valid student email address." |
| Student Password | Must be at least 8 characters | "Password must be at least 8 characters long." |
| Student Hobbies | Minimum 1 hobby selected from the graph | "Please select at least one hobby to continue." |
| Psychometric Sliders | Numeric value between 0 and 100 | "Invalid assessment value." |
| SPM Core Subjects | Must have valid grade selected (A+, A, B, etc.) | "Please provide grades for all core subjects." |
| SPM Electives | Array of strings, optional but max limit may apply | "Invalid elective selection." |

* **Edge Cases:**
  * Missing or Invalid Route Parameters (UUID mismatch results in fallback redirect).
  * Network Failures gracefully caught for mock APIs (e.g., `/api/checkout/:id`).
  * Corrupted LocalStorage handled smoothly to prevent app crash.
  * Incomplete Multi-step Form Access redirects user to the last valid step.
  * PDF Generation Timeouts / Memory Limits gracefully catch `html2canvas` errors.

## 3. User Flow
## / (Parent Portal)
* User selects preferred language from the header.
* User inputs financial and demographic data (Location, Income, Email).
* User answers parent-specific expectation questions.
* User clicks **Generate Student Link**.
  > Creates a new session ID and saves parent data. Displays success state with a link.
* User clicks **Copy Link**.
* User clicks **Preview Email Invitation**.
  > Redirects to /email-notification/:id.

## /email-notification/:id 
* Simulates an inbox view showing an automated email.
* User clicks **Start Student Assessment**.
  > Redirects to /student/:id.

## /student/:id (Student Portal)
* Student creates an account (Email and Password).
* Student navigates multi-step assessment using **Next** and **Back**:
  - Step 1: Hobbies and Interests (interacts with Hobby Graph).
  - Step 2: Psychometric Profiling (adjusts Sliders).
  - Step 3: Academic Record (selects grades and electives).
* User clicks **Submit Profile**.
  > Saves all data and redirects to /checkout/:id.

## /checkout/:id (Payment & Checkout)
* User reviews report pricing options and clicks **Unlock Full Report**.
  > Sets loading state (simulated payment) and redirects to /results/:id.

## /results/:id (Recommendation Dashboard)
* System loads processed Parent and Student data.
* User views matched universities, ROI calculations, and career progressions.
* User clicks **Generate PDF Report** to configure and download PDF.
* User clicks **View Details** on a scholarship.
  > Redirects to /guide/:guideId.

## /guide/:guideId
* User views detailed application instructions and document checklists.

## 4. Component Tree & Specs
## Component Tree
- App (Router & Layout)
  - MockUniversityLogo
  - ParentPortal
  - EmailNotification
  - Checkout
  - StudentPortal
    - HobbyGraph
  - Results
    - LocationMap
    - CustomSalaryTooltip
    - ROICalculator
    - CareerProgressionDashboard
  - ScholarshipGuide

### Component Specs
### App
* **Purpose:** Main application router and layout wrapper.
* **Props/State:** Manages global `language` state.
* **Visual Details:** Full height `min-h-screen bg-slate-50`. Sticky header with language dropdown and infinite scrolling marquee.

### ParentPortal
* **Purpose:** Form interface for parents.
* **Props/State:** Manages `location`, `salary`, `email`, `parentAnswers`, `loading`, `session`, `copied`.
* **Visual Details:** Minimalist card layout (`bg-[#fafdff] p-[40px] rounded-[32px]`).
* **Interactivity:** Toggling selection chips updates array. Submitting triggers success state with shareable link.

### EmailNotification
* **Purpose:** Simulates the email inbox view.
* **Visual Details:** Styled like an email client viewport (`max-w-3xl mx-auto`).
* **Interactivity:** "View Results & Pay" navigates to `/checkout/:id`.

### Checkout
* **Purpose:** Handles payment gateway simulation.
* **Visual Details:** Split-pane layout (product summary vs payment form).
* **Interactivity:** Clicking pay triggers mock loading and redirects to results.

### StudentPortal
* **Purpose:** Interactive psychometric/academic assessment.
* **Visual Details:** Multi-step wizard with large friendly typography.

### HobbyGraph
* **Purpose:** Visual node-graph for hobbies.
* **Visual Details:** D3.js force-directed graph in an SVG.
* **Interactivity:** D3 pan/zoom, draggable nodes. Clicking toggles selection.

### Results
* **Purpose:** Data-rich dashboard displaying matches and career projections.
* **Visual Details:** High-density dashboard (`max-w-7xl mx-auto`). Radar charts and clean white university cards.
* **Interactivity:** "Compare" functionality, dynamic PDF generation via `html2canvas`.

### ROICalculator & CareerProgressionDashboard
* **Purpose:** Widgets for calculating ROI and visualizing salary growth.
* **Visual Details:** Range inputs for ROI. `Recharts` `LineChart` for career tracks.