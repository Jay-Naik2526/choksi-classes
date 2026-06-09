# Choksi Classes — Tuition Management Portal

> **Full-stack web application** for Choksi Classes, Navsari, Gujarat.  
> Built with React + Vite + Node.js + MongoDB Atlas.  
> Manages students, tests, fees, doubts, homework, materials, batches, and more.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Features — Complete List](#3-features--complete-list)
4. [User Roles](#4-user-roles)
5. [Project Structure](#5-project-structure)
6. [Installation & Setup](#6-installation--setup)
7. [Environment Variables](#7-environment-variables)
8. [Running Locally](#8-running-locally)
9. [Production Deployment](#9-production-deployment)
10. [API Routes Reference](#10-api-routes-reference)
11. [Feature Guide (for Sir)](#11-feature-guide-for-sir)
12. [Push Notifications Setup](#12-push-notifications-setup)
13. [Google Drive Setup](#13-google-drive-setup)

---

## 1. Project Overview

Choksi Classes Portal is a private web application for managing a tuition centre in Navsari, Gujarat. It serves three types of users — **Sir** (admin/teacher), **Student**, and **Parent** — each with their own dashboard, permissions, and view of the data.

The **public landing page** (`/`) showcases the institute with animated effects, student reviews, course listings, a Google Maps embed pointing to the actual location, a floating WhatsApp enquiry button, and an online admission enquiry form that emails both owners instantly.

The **private portal** (`/dashboard`) provides:
- Test creation, assignment, and auto-grading
- Study material uploads backed by Google Drive
- Doubt threads with real-time chat (Socket.IO)
- Homework assignment, submission, and grading
- Fee management with overdue tracking
- Branded progress report PDF generation
- Push notifications for every key event
- Parent dashboard with their child's full academic snapshot

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **State Management** | Zustand (auth store) |
| **Routing** | React Router v6 |
| **Real-time** | Socket.IO v4 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas + Mongoose |
| **Authentication** | JWT (7-day expiry), bcryptjs |
| **File Storage** | Google Drive API v3 |
| **Email** | Nodemailer + Gmail SMTP |
| **PDF Generation** | PDFKit |
| **Push Notifications** | Web Push API + VAPID |
| **Security** | Helmet.js, express-rate-limit, compression (gzip) |
| **Fonts** | Playfair Display (headings), Inter (body) |

---

## 3. Features — Complete List

### 🌐 Public Landing Page (`/`)
- Full-screen dark hero with animated "CHOKSI / CLASSES" heading, 28 floating particles, and ambient glow orbs
- "CLASSES" has a shimmering gold animation effect
- Dual infinite ticker marquees scrolling in opposite directions: CBSE · GSEB · Commerce · 20+ Years · Navsari · Daily Tests
- Animated count-up statistics (triggers on scroll into view):
  - 37+ Google Reviews · 4.7★ Average Rating · 100+ Active Students · 20+ Years Experience
- About section with real business content, feature chips, and a 2-column layout
- Four course cards: CBSE Board (Std 1–10) · GSEB Board (Std 1–12) · Commerce Stream (Std 11–12) · Daily Evaluation
- Testimonials carousel — real reviews from Google/Justdial/Facebook — horizontal scroll glassmorphism cards
- "Admissions Open" call-to-action section
- 4-column contact cards: Location · Dip Choksi (8238216622) · CA Kairavi Choksi (9726019001) · Google Rating
- Google Maps embed pinned to exact GPS coordinates (20.9503°N, 72.9267°E — Navsari)
- **Floating WhatsApp button** (bottom-right) — opens WhatsApp with a pre-filled enquiry message
- **Floating "Enquire Now" button** (above WhatsApp) — links to the admissions form
- JSON-LD LocalBusiness schema markup for Google search visibility
- Full SEO meta tags (og:title, og:description, keywords, og:locale)
- Footer: "Designed & built with ❤️ by a proud student of Choksi Classes"

### 📋 Admission Enquiry Form (`/admissions`)
- Fully public page — no login required
- Fields: Parent name, Child name, Class (dropdown Std 1–12 Commerce), Board (CBSE/GSEB), Phone number, Message
- On submit → sends a branded HTML email to **both** `dipchoksi@hotmail.com` and `kairavichoksi@yahoo.com`
- Shows a success screen with a direct "Call Now" button
- Rate-limited: 10 submissions per IP per hour (prevents spam)

### 🔐 Authentication
- Login page with a role selector (Sir / Student / Parent)
- Decorative art panel on desktop (warm amber study-room illustration using CSS)
- JWT token stored in `localStorage`, auto-restored on page refresh
- Forgot password → OTP sent to email → Reset password form
- Role-based route protection (`<PrivateRoute>` / `<PublicRoute>`)

### 🏠 Dashboards

**Sir Dashboard:**
- Two-column layout with:
  - Stats overview (total students, tests this month, fees pending, doubts pending)
  - Class health rings (SVG circular progress per subject/batch)
  - 4-column quick actions grid (links to key sections)
  - Upcoming tests list
  - Doubts awaiting reply
  - Fee alerts (overdue students list)
  - Top scorer of the month

**Student Dashboard:**
- Featured "Next Test" card + Study Progress panel side by side
- SVG progress rings: Avg Score · Doubts Answered %
- Daily schedule (upcoming tests this week)
- Recent materials (horizontal scroll)
- Sections reveal on scroll with slide-up animations

**Parent Dashboard:**
- Child selector tabs at the top (supports multiple children if linked)
- Child hero card: name, roll number, batch name, Download Report button
- 3-stat row: Tests taken · Average score · Fee status (green ✓ cleared / red ₹ due)
- SVG score ring + enrolled batches list side by side
- Fee alert block (red banner if overdue, green banner if cleared)
- Quick action grid: Tests · Materials · Notices · Download Report PDF
- 24-hr helpline card with direct call buttons to Dip Sir and Kairavi Ma'am

### 👩‍🎓 Student Management
- Sir creates student accounts: name, email, temporary password, phone, roll number, batch, address, "referred by"
- Welcome email sent automatically on account creation
- Edit student details, activate/deactivate accounts
- Filter and search the student list
- Generate and download progress report PDF for any student

### 👨‍👩‍👧 Parent Management
- Sir links parent accounts to their children
- Create parent accounts (auto welcome email)
- Edit linked children

### 👥 Batch Management (`/batches`)
- Create batches with: name, subject, schedule description, timing, maximum capacity
- Expand any batch card to see all enrolled students
- Add unassigned students to a batch in one click
- Remove students from a batch
- Color-coded batch cards (6 rotating colors)
- Tests, homework, and materials can all be targeted to a specific batch

### 📝 Homework Module (`/homework`)

**Sir view:**
- Assign homework: title, subject, description/instructions, due date, target batch
- Push notification sent to all students in the batch immediately on assignment
- View every student's submission for a given homework
- Grade each submission individually: grade (A+, B, 8/10, etc.) + written feedback
- Push notification sent to student on grading with their grade in the notification

**Student view:**
- See all assigned homework with filter tabs: All / Pending / Submitted
- Status badges: `X days left` · `Overdue` · `Submitted` · `Graded: A+`
- Submit with a typed note/answer + optional file attachment (PDF, image, Word doc)
- See Sir's grade and feedback once graded

### 📚 Study Materials (`/materials`)
- Google Drive-style folder browser
- Root level shows coloured subject folders
- Drill down: Subject → Chapter → Files
- Breadcrumb navigation with back button
- Search mode: type to search; results show as flat file list
- View toggle: folder grid / file list
- File cards show: type icon, file name, upload date, file size
- Sir uploads files with subject and chapter tags → stored on Google Drive
- No server storage used — unlimited file size (Drive quota permitting)
- Students can bookmark any material (bookmarks saved per user)

### 🧪 Tests (`/tests`)
- Sir creates tests: title, subject, batch, date, duration, total marks, pass marks
- Add questions from the Question Bank: MCQ · Subjective · True/False — with answer options and correct answer marked
- Students can attempt the test within the assigned time window
- Auto-grading for MCQ questions; manual grading for subjective
- Students see their result immediately after submission
- Test history and performance charts on the student dashboard
- Question Bank management: add, edit, delete questions independently of tests
- Per-student performance history tracked over time

### ❓ Doubts (`/doubts`)
- Student submits a doubt with a title and description
- Real-time threaded chat via Socket.IO — Sir and student reply back and forth
- Live connection indicator (green dot) shows whether Sir is in the thread
- Messages are role-aligned: student messages on the right, Sir's on the left
- Status transitions: Pending → Answered (Sir marks it resolved)
- Each doubt has its own Socket.IO room (`doubt_<id>`) — no polling, instant delivery

### 💰 Fee Management (`/fees`)
- Sir creates fee records per student: amount, month/year, due date, description
- Status lifecycle: `pending` → `overdue` (auto-marked at startup if due date passed) → `paid`
- Mark as paid with a payment date
- Fee alerts on Sir's dashboard list all overdue students
- Parent sees their child's fee status directly on their dashboard
- Fee history table included in the progress report PDF

### 📢 Notices (`/notices`)
- Sir posts notices with: title, content, tag (exam / holiday / general)
- All users see notices in reverse-chronological order
- Unread badge count shown in the bottom navigation bar

### 👤 Profile (`/profile`)
- View and edit own profile: name, phone, address, date of birth
- Upload profile photo (stored on Google Drive)
- Students see their enrolled batches
- Parents see their linked children

### 📄 Progress Report PDF
- Branded A4 PDF generated server-side using PDFKit — no client-side libraries needed
- Content:
  - Dark header band with Choksi Classes name and gold accent
  - Student info box (name, roll number, batch, phone, email)
  - 4-card summary row (tests taken, average score, best score, fee status)
  - Full test performance table with dates, subjects, scores, and pass/fail
  - Fee history table with months, amounts, status, and payment dates
- Download from Sir's student list (PDF icon per student)
- Download from Parent dashboard's "Download Report" button
- API route: `GET /api/users/students/:id/progress-report`

### 🔔 Push Notifications
- Browser push notifications using the Web Push API with VAPID keys
- Users are automatically subscribed 3 seconds after login (browser asks permission once)
- Automatically unsubscribed on logout (subscription removed from database)
- **Notification triggers:**

| Event | Recipient |
|---|---|
| New homework assigned | All students in the target batch |
| Student submits homework | Sir |
| Sir grades homework | That student (includes grade in notification body) |

- Notifications work even when the browser/tab is closed (service worker handles background delivery)
- Clicking a notification opens the app at the relevant page

### 🏆 Referral Tracker (`/referrals`)
- Sir records "Referred by" when creating a student
- Leaderboard sorted by number of referrals with 🥇 🥈 🥉 medals for the top 3
- Expand any referrer row to see which students they referred + their join dates
- Summary cards: total students referred · total active referrers

### 🔒 Security (Production)
- **Helmet.js** — sets 15+ security HTTP headers automatically
- **express-rate-limit** — three-tier rate limiting:
  - Global: 300 requests / 15 minutes per IP
  - Auth routes (`/api/auth`): 20 requests / 15 minutes per IP
  - Enquiry route (`/api/enquiry`): 10 requests / hour per IP
- **compression** — gzip compression on all API responses
- **CORS** — whitelisted origins only (localhost in dev, production URL in prod)
- **NODE_ENV-aware error handler** — full stack traces in development, clean messages in production
- **Health check** — `GET /health` returns `{"status":"ok","env":"..."}` for uptime monitors

### 🎨 UI / UX Design
- **Colour palette:** Terracotta `#C1440E` · Turmeric `#E8A020` · Ink Brown `#2C1810` · Chalk `#F7F4EF`
- **Typography:** Playfair Display for headings, Inter for body text
- Glassmorphism sticky `PageHeader` with backdrop-blur effect
- White bottom navigation with terracotta active pill indicator
- Scroll-triggered reveal animations using `IntersectionObserver`
- CSS keyframe animations: fadeIn · slideUp · shimmer (skeleton loading) · livePulse · glowPulse · spinSlow
- Branded `PageLoader` spinner with "C" monogram
- Smooth hover transitions on all interactive cards
- **PWA-ready**: `manifest.json`, service worker, installable on mobile home screen
- Mobile-first responsive design

---

## 4. User Roles

| Role | Access |
|---|---|
| **Sir** | Full admin: create/edit students & parents, manage all content, view all data, generate reports, manage batches and homework |
| **Student** | Own dashboard only: attempt tests, submit doubts & homework, view materials & notices, see own scores and fees |
| **Parent** | Read-only child view: scores, fees, batches, download progress report; 24-hr helpline contact |

---

## 5. Project Structure

```
choksi-classes/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js        Login, OTP, reset password
│   │   │   ├── doubtController.js       Doubts + real-time messages
│   │   │   ├── enquiryController.js     Public admission enquiry email
│   │   │   ├── feeController.js         Fee CRUD + overdue marking
│   │   │   ├── homeworkController.js    Homework CRUD + submissions + grading
│   │   │   ├── materialController.js    Material upload/list/delete (Google Drive)
│   │   │   ├── noticeController.js      Notice CRUD
│   │   │   ├── pushController.js        Push subscription management
│   │   │   ├── testController.js        Test + attempt + grading
│   │   │   └── userController.js        Users, batches, reports, referrals
│   │   ├── middleware/
│   │   │   └── auth.js                  JWT protect + role authorize
│   │   ├── models/
│   │   │   ├── Attempt.js               Test attempt record
│   │   │   ├── Batch.js                 Batch (named group of students)
│   │   │   ├── Doubt.js                 Doubt thread + messages
│   │   │   ├── Fee.js                   Fee record per student
│   │   │   ├── Homework.js              Homework + submissions sub-documents
│   │   │   ├── Material.js              Material metadata (Drive file ID)
│   │   │   ├── Notice.js                Notice post
│   │   │   ├── PushSubscription.js      Web push endpoint + keys per user
│   │   │   ├── Question.js              Question bank entry
│   │   │   ├── Test.js                  Test definition
│   │   │   └── User.js                  User (role: sir/student/parent)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── doubtRoutes.js
│   │   │   ├── enquiryRoutes.js
│   │   │   ├── feeRoutes.js
│   │   │   ├── homeworkRoutes.js
│   │   │   ├── materialRoutes.js
│   │   │   ├── noticeRoutes.js
│   │   │   ├── pushRoutes.js
│   │   │   ├── testRoutes.js
│   │   │   └── userRoutes.js
│   │   └── utils/
│   │       ├── driveUpload.js            Google Drive upload helper
│   │       ├── pushNotifications.js      sendPushToUser / sendPushToMany
│   │       └── sendEmail.js              Nodemailer wrapper
│   ├── server.js                         Express app + Socket.IO + security middleware
│   ├── .env                              Secret keys (never commit this file)
│   └── .env.example                      Template — fill this in to create .env
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── manifest.json               PWA manifest
│   │   └── sw.js                       Service worker (cache + push notifications)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── BottomNav.jsx        Role-aware bottom navigation bar
│   │   │   │   └── PageHeader.jsx       Glassmorphism sticky page header
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       └── Spinner.jsx          Spinner + PageLoader components
│   │   ├── pages/
│   │   │   ├── Landing.jsx              Public landing page (fully animated)
│   │   │   ├── Admissions.jsx           Public admission enquiry form
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── batches/
│   │   │   │   └── BatchManagement.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx        Role router → correct dashboard component
│   │   │   │   ├── SirDashboard.jsx
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   └── ParentDashboard.jsx
│   │   │   ├── doubts/
│   │   │   │   ├── DoubtList.jsx
│   │   │   │   ├── SubmitDoubt.jsx
│   │   │   │   └── DoubtDetail.jsx      Real-time Socket.IO chat thread
│   │   │   ├── fees/
│   │   │   │   └── FeeList.jsx
│   │   │   ├── homework/
│   │   │   │   ├── HomeworkList.jsx     Filter: All / Pending / Submitted
│   │   │   │   ├── CreateHomework.jsx   Sir assigns homework to a batch
│   │   │   │   └── HomeworkDetail.jsx   Submit (student) / Grade (sir)
│   │   │   ├── materials/
│   │   │   │   ├── MaterialList.jsx     Google Drive-style folder browser
│   │   │   │   └── UploadMaterial.jsx
│   │   │   ├── notices/
│   │   │   │   ├── NoticeList.jsx
│   │   │   │   └── CreateNotice.jsx
│   │   │   ├── profile/
│   │   │   │   └── Profile.jsx
│   │   │   ├── students/
│   │   │   │   ├── StudentList.jsx
│   │   │   │   └── ReferralTracker.jsx  Leaderboard with medals
│   │   │   └── tests/
│   │   │       ├── TestList.jsx
│   │   │       ├── CreateTest.jsx
│   │   │       ├── AttemptTest.jsx
│   │   │       ├── TestResult.jsx
│   │   │       └── QuestionBank.jsx
│   │   ├── store/
│   │   │   └── authStore.js             Zustand: user, token, setAuth, logout
│   │   ├── utils/
│   │   │   ├── api.js                   Axios instance with JWT Authorization header
│   │   │   └── pushNotifications.js     subscribeToPush / unsubscribeFromPush helpers
│   │   ├── App.jsx                      All routes defined here
│   │   ├── main.jsx
│   │   └── index.css                    Global animations + body styles
│   ├── index.html                       JSON-LD schema, SEO meta tags, PWA link
│   ├── .env                             VITE_API_URL
│   └── .env.example                     Template
│
├── .gitignore                           Ignores .env, node_modules, dist, logs
├── package.json                         Root convenience scripts
└── README.md
```

---

## 6. Installation & Setup

### Prerequisites
- **Node.js v18+** (v20 LTS recommended) — [nodejs.org](https://nodejs.org)
- **npm v9+** (bundled with Node)
- **MongoDB Atlas account** (free M0 cluster works fine) — [mongodb.com/atlas](https://mongodb.com/atlas)
- **Gmail account** with App Passwords enabled
- **Google Cloud project** with the Drive API enabled (for file/material uploads)

### Step 1 — Clone the repository
```bash
git clone https://github.com/your-username/choksi-classes.git
cd choksi-classes
```

### Step 2 — Install dependencies
```bash
# Install all at once using the root script:
npm run install:all

# OR install separately:
cd backend  && npm install
cd ../frontend && npm install
```

### Step 3 — Configure environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and fill in every value

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env and set VITE_API_URL=http://localhost:5000/api
```

See [Section 7](#7-environment-variables) for every variable explained.

---

## 7. Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port. Default: `5000` |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | **Yes** | Full MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Long random string (min 32 chars). Used to sign tokens. |
| `JWT_EXPIRE` | No | Token lifetime. Default: `7d` |
| `CLIENT_URL` | **Yes** | Frontend URL for CORS (e.g. `http://localhost:5174`) |
| `EMAIL_USER` | **Yes** | Gmail address used to send emails |
| `EMAIL_PASS` | **Yes** | Gmail **App Password** — NOT your login password |
| `GOOGLE_CLIENT_ID` | **Yes** | OAuth2 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | **Yes** | OAuth2 Client Secret |
| `GOOGLE_REFRESH_TOKEN` | **Yes** | OAuth2 Refresh Token (generated once via OAuth Playground) |
| `GOOGLE_DRIVE_FOLDER_ID` | **Yes** | ID of the Google Drive folder to store files |
| `VAPID_PUBLIC_KEY` | **Yes** | Web Push VAPID public key (generate once) |
| `VAPID_PRIVATE_KEY` | **Yes** | Web Push VAPID private key |

**Generate VAPID keys (run once):**
```bash
cd backend
npx web-push generate-vapid-keys
# Copy BOTH keys into backend/.env
```

**Generate a Gmail App Password:**
1. Visit [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → App passwords
3. Create an app password for "Mail"
4. Copy the 16-character password into `EMAIL_PASS`

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | **Yes** | Backend API base URL, no trailing slash |

**Example:**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Running Locally

Open **two terminal windows** simultaneously:

**Terminal 1 — Start the backend:**
```bash
cd backend
node server.js
# Output: 🚀 Choksi Classes API running on port 5000 [development]
```

**Terminal 2 — Start the frontend:**
```bash
cd frontend
npm run dev
# Output: Local: http://localhost:5174
```

Open **[http://localhost:5174](http://localhost:5174)** in your browser.

**Verify the backend is running:**
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","env":"development"}
```

**First run notes:**
- The database starts empty. You'll need to create a Sir account first.
- Connect to your MongoDB Atlas cluster, open the `users` collection, and insert one document manually with role `"sir"`.
- Alternatively, temporarily create a seed route in the backend, run it once, then remove it.
- After logging in as Sir, you can create all students and parents through the UI.

---

## 9. Production Deployment

### Option A — Render + Netlify (recommended, both have free tiers)

**Deploy the Backend on Render:**
1. Push your code to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo → select `backend/` as the root directory
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `backend/.env` in Render's "Environment" tab
7. Set `NODE_ENV=production`
8. Set `CLIENT_URL=https://your-frontend.netlify.app`

**Deploy the Frontend on Netlify:**
1. Go to [netlify.com](https://netlify.com) → Add new site → GitHub
2. Select your repo → set Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Site settings → Environment variables → add:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
6. Redeploy

### Option B — VPS (DigitalOcean / AWS / any Linux server)

```bash
# On the server
git clone https://github.com/your-username/choksi-classes.git
cd choksi-classes/backend
npm install --production
NODE_ENV=production node server.js &   # or use PM2

# Build and serve frontend via Nginx
cd ../frontend
npm install && npm run build
# Point Nginx root to choksi-classes/frontend/dist
```

### Pre-launch Checklist

- [ ] `NODE_ENV=production` set on backend
- [ ] `CLIENT_URL` set to production frontend URL (needed for CORS)
- [ ] `VITE_API_URL` set to production backend URL
- [ ] MongoDB Atlas → Network Access → whitelist `0.0.0.0/0` or your server's IP
- [ ] Gmail App Password is working (test with a dummy enquiry form submission)
- [ ] Google Drive OAuth tokens valid (test by uploading a material)
- [ ] VAPID keys set in backend env (test with a login + push permission)
- [ ] HTTPS enabled — Render and Netlify do this automatically
- [ ] `GET /health` returns `{"status":"ok","env":"production"}`

---

## 10. API Routes Reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | Public | Login with email + password → returns JWT token |
| POST | `/forgot-password` | Public | Send OTP to user's email |
| POST | `/reset-password` | Public | Reset password using OTP |

### Users — `/api/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Sir | Dashboard stats for Sir |
| GET | `/my-stats` | Student | Dashboard stats for the logged-in student |
| GET | `/my-children` | Parent | Parent's linked children with academic snapshots |
| GET | `/students` | Sir | List all students |
| POST | `/students` | Sir | Create student + send welcome email |
| PATCH | `/students/:id` | Sir | Edit student details |
| GET | `/students/:id/progress-report` | Sir / Parent | Download progress report PDF |
| GET | `/batches` | Auth | List all batches |
| POST | `/batches` | Sir | Create a new batch |
| PATCH | `/batches/:id` | Sir | Edit batch (add/remove students) |
| DELETE | `/batches/:id` | Sir | Delete batch |
| GET | `/parents` | Sir | List all parent accounts |
| POST | `/parents` | Sir | Create parent account |
| PATCH | `/parents/:id` | Sir | Edit parent / linked children |
| GET | `/referrals` | Sir | Referral leaderboard |
| GET | `/profile` | Auth | Get own profile |
| PATCH | `/profile` | Auth | Update own profile |
| POST | `/profile/photo` | Auth | Upload profile photo to Google Drive |

### Homework — `/api/homework`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Auth | List homework (Sir: all; Student: own batch) |
| GET | `/:id` | Auth | Get single homework with all submissions |
| POST | `/` | Sir | Create homework + notify batch students |
| PATCH | `/:id` | Sir | Edit homework details |
| DELETE | `/:id` | Sir | Soft-delete (marks inactive) |
| POST | `/:id/submit` | Student | Submit homework (note + optional file) |
| PATCH | `/:id/grade/:studentId` | Sir | Grade a student's submission + notify student |

### Tests — `/api/tests`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Auth | List tests (Sir: all; Student: assigned) |
| POST | `/` | Sir | Create test |
| GET | `/:id` | Auth | Test details (with questions) |
| PATCH | `/:id` | Sir | Edit test |
| POST | `/:id/attempt` | Student | Start or submit a test attempt |
| GET | `/:id/results` | Sir | All student results for a test |

### Materials — `/api/materials`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Auth | List all materials (filter by subject/chapter) |
| POST | `/` | Sir | Upload material → stores on Google Drive |
| DELETE | `/:id` | Sir | Delete material + remove from Drive |
| POST | `/:id/bookmark` | Student | Toggle bookmark on a material |

### Doubts — `/api/doubts`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Auth | List doubts (Sir: all; Student: own) |
| POST | `/` | Student | Submit a new doubt |
| GET | `/:id` | Auth | Get doubt thread with all messages |
| POST | `/:id/message` | Auth | Post a reply (also emits via Socket.IO) |
| PATCH | `/:id/status` | Sir | Mark doubt as answered |

### Fees — `/api/fees`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Auth | List fees (Sir: all; Student/Parent: own) |
| POST | `/` | Sir | Create fee record |
| PATCH | `/:id` | Sir | Update fee (mark paid, edit amount) |
| DELETE | `/:id` | Sir | Delete fee record |

### Notices — `/api/notices`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Auth | List all notices |
| POST | `/` | Sir | Create notice |
| DELETE | `/:id` | Sir | Delete notice |

### Push — `/api/push`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vapid-key` | Public | Get VAPID public key (needed to subscribe) |
| POST | `/subscribe` | Auth | Save / update push subscription |
| DELETE | `/unsubscribe` | Auth | Remove push subscription |

### Enquiry — `/api/enquiry`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Public | Submit admission enquiry → emails both owners |

### System
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Health check — returns `{"status":"ok"}` |
| GET | `/` | Public | API info — name and version |

---

## 11. Feature Guide (for Sir)

This section explains how to use the portal day-to-day.

---

### 👤 Creating a Student Account
1. Go to the **Students** section from your dashboard
2. Tap the **+** button
3. Fill in: Name, Email, Temporary Password, Phone, Roll Number
4. Optionally assign a Batch and set "Referred by" (another student's name)
5. Tap **Create**
6. The student receives a welcome email with their login details automatically

---

### 👨‍👩‍👧 Creating a Parent Account
1. Go to **Students** → tap **Parents** tab (or navigate to Parents section)
2. Tap **+ New Parent**
3. Fill in parent's name, email, phone
4. Select which student(s) are their children from the dropdown
5. Tap **Create** — parent gets a welcome email

---

### 👥 Managing Batches
1. Navigate to **Batches** (`/batches`)
2. Tap **+ Create Batch** — enter name (e.g. "Morning Batch"), subject, timing, capacity
3. Tap any batch card to expand it
4. Use **Add Student** to enroll students from the unassigned list
5. Use **Remove** next to any student to unenroll them

---

### 📝 Assigning Homework
1. Go to the **Homework** section
2. Tap **+ Assign**
3. Fill in: Title, Subject, Instructions/Description, Due Date
4. Select the target Batch (leave blank to assign to all students)
5. Tap **Assign Homework**
6. Students in that batch get a push notification instantly

To **grade** submitted homework:
1. Open any homework entry
2. Scroll down to "Submissions"
3. For each student, enter a grade (e.g. A+, 8/10, B) and optional feedback
4. Tap **Grade** — student gets a push notification with their grade

---

### 📚 Uploading Study Materials
1. Go to **Materials** → tap **+ Upload**
2. Select the file from your device (PDF, image, Word, etc.)
3. Enter: Subject name, Chapter/Topic name, Display title
4. Tap **Upload** — the file is stored securely on Google Drive
5. Students see the file appear in the correct subject → chapter folder immediately

---

### 🧪 Creating a Test
1. Go to **Tests** → tap **+ New Test**
2. Fill in: Title, Subject, Target Batch, Test Date, Duration (minutes), Total Marks, Pass Marks
3. Add questions:
   - Select type: MCQ / Subjective / True-False
   - Enter question text, options (for MCQ), and mark the correct answer
   - Set marks for this question
4. Tap **Publish** — students in the batch see it on their dashboard and can attempt it from the given date

To **view results:**
1. Open the test → tap **View Results**
2. See all students' scores, time taken, and question-by-question breakdown
3. For subjective questions, enter marks manually per student

---

### ❓ Answering Doubts
1. Go to **Doubts** — pending doubts are shown with a badge count
2. Tap any doubt to open the thread
3. Type your reply in the box at the bottom → tap **Send**
4. The student sees your reply immediately (real-time via Socket.IO)
5. Once resolved, tap **Mark as Answered** — it moves out of the pending list

---

### 💰 Managing Fees
1. Go to **Fees** → tap **+ Add Fee Record**
2. Select the student, enter amount, month (e.g. June 2025), due date
3. Tap **Save**
4. When the student pays, find their record and tap **Mark Paid** → enter payment date
5. Fee turns green; removed from your overdue alert list

Overdue fees are **automatically flagged** (the system checks on every startup).

---

### 📢 Posting a Notice
1. Go to **Notices** → tap **+ New Notice**
2. Enter title, content, and select a tag (Exam / Holiday / General)
3. Tap **Post** — all students and parents see it immediately under their Notices section

---

### 📄 Downloading a Progress Report
1. Go to **Students** → find the student in the list
2. Tap the **Download Report** icon (PDF symbol)
3. A branded A4 PDF downloads to your device containing:
   - Student info, test history, and fee records

---

### 🏆 Checking Referrals
1. Navigate to `/referrals`
2. See the leaderboard of students who referred the most new students
3. Tap any row to expand and see exactly which students they referred

---

## 12. Push Notifications Setup

Push notifications let the browser notify users even when they don't have the app open.

### One-time key generation
```bash
cd backend
npx web-push generate-vapid-keys
```

Output looks like:
```
Public Key: BBX_vhd...
Private Key: iY7yWTg...
```

Add both to `backend/.env`:
```
VAPID_PUBLIC_KEY=BBX_vhd...
VAPID_PRIVATE_KEY=iY7yWTg...
```

### How it works
1. User logs in → 3 seconds later, the browser asks "Allow notifications?"
2. If the user clicks Allow → the browser's push subscription is saved to the database
3. When an event happens (new homework, submission graded) → server sends a push message
4. The service worker (`frontend/public/sw.js`) receives the push and displays the notification
5. Clicking the notification opens the app at the relevant page

### Troubleshooting notifications
- If the browser denied permission, the user must go to browser Settings → Site Settings → Notifications → reset the permission for the site
- HTTPS is required in production (notifications do not work on plain HTTP)
- The VAPID public key must match between the backend env and what the frontend fetches at `/api/push/vapid-key`

---

## 13. Google Drive Setup

All uploaded files (study materials, profile photos, homework attachments) are stored on Google Drive — not on the server. This means no server disk space is used.

### Steps to configure

1. **Create a Google Cloud project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - New Project → give it any name

2. **Enable the Drive API**
   - APIs & Services → Library → search "Google Drive API" → Enable

3. **Create OAuth2 credentials**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: add `https://developers.google.com/oauthplayground`

4. **Generate a refresh token**
   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   - Click the gear icon (top right) → check "Use your own OAuth credentials" → enter your Client ID and Secret
   - In Step 1, find and select: `https://www.googleapis.com/auth/drive`
   - Click "Authorize APIs" → sign in → "Exchange authorization code for tokens"
   - Copy the **Refresh token**

5. **Create a Google Drive folder**
   - Open Google Drive → New → Folder (name it e.g. "Choksi Classes Files")
   - Right-click the folder → Get link → copy the folder ID from the URL
   - The folder ID is the long string after `/folders/` in the URL

6. **Add to backend/.env**
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id
   ```

### Important notes
- The refresh token rarely expires, but if it does, repeat step 4 to generate a new one
- All uploaded files inherit the folder's sharing settings — keep the folder private (default)
- Files are accessed by students via pre-signed Drive URLs returned by the API

---

## Contact

**Choksi Classes**  
304/5/6/7, Union Heights, Ashanagar, Navsari, Gujarat — 396445

| | Name | Number |
|---|---|---|
| 📞 | Dip Choksi | +91 82382 16622 |
| 📞 | CA Kairavi Choksi | +91 97260 19001 |
| 📧 | Email | dipchoksi@hotmail.com · kairavichoksi@yahoo.com |

---

*Built with ❤️ by a proud student of Choksi Classes*
