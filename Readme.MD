# Vinaya Seva — Temple/Trust Management System

A full-stack, multi-tenant MERN application for managing temple and trust operations — chandas (contributions), pooja and lighting expenses, daily events, and video archives — with PDF reporting, a public devotee transparency page, and QR code sharing.

Built from scratch as a guided, step-by-step learning project.

---

## Overview

Any temple or trust can register their own account and manage their own separate data. Each organization gets:

- A private **admin dashboard** to record and manage all financial and activity data
- A **public, read-only transparency page** devotees can visit (no login required) showing yearly summaries and videos
- A **QR code** linking directly to that public page, ready to print or share
- **PDF reports** with a styled letterhead (including the temple's own logo) for Chanda, Expense, and Daily Event records

---

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT-based authentication
- Multer (file/logo uploads)
- Puppeteer (PDF generation)
- Nodemailer (password reset emails)
- bcryptjs (password hashing)

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- react-hot-toast (notifications)
- lucide-react (icons)
- qrcode.react (QR code generation)

---

## Core Features

### Multi-Tenant Authentication
- Registering creates a new **Organization** (the temple/trust) and its first admin **User** in one step
- Every record (Chanda, Expense, Video, Daily Event) is scoped to `organization` — one temple's data is never visible to another's, enforced on every single database query
- JWT tokens carry the organization ID, so the server — never the client — always decides which tenant's data a request can touch
- Optional temple logo upload at registration, changeable anytime from the dashboard
- Forgot / reset password flow via emailed, time-limited reset links (Nodemailer + crypto-generated tokens)
- Show/hide password toggle on all password fields

### The "Other" Pattern
Every categorical field in the app — payment mode, chanda type (removed later per request), expense category & purpose, video category, daily event type — uses one reusable pattern: a fixed dropdown of common options, plus an "Other" choice that reveals a free-text field. This is implemented once as a shared Mongoose schema helper (`otherField`) and a shared React component (`SelectWithOther`), so any predefined list can be extended by the user at data-entry time without a code change.

### Chanda (Contributions)
- Devotee name, phone (optional, validated as a 10-digit Indian mobile number when provided), amount, payment mode
- Search by devotee name, filter by year
- Full create/edit/delete, with edit auto-scrolling the page to the form on mobile
- Styled monthly PDF report download

### Expenses
- Covers both pooja and lighting expenses via a `category` field (Pooja Items, Lighting/Deepam, Flowers, Prasadam, Maintenance, or custom)
- Category, purpose, payment mode, amount, notes
- Year filtering, full CRUD, PDF report download

### Daily Events
- Logs temple activities — Deeparadhana, Mangala Harathi, Bajana, Tug of War, Kabaddi, or any custom event
- Optional budget field per event
- Year filtering, full CRUD, PDF report download

### Videos
- Title, YouTube/Cloudinary URL, year, category
- Files are never stored directly — only external links — keeping the database small
- Year filtering, full CRUD

### Overview (Analytics)
- Year-filterable dashboard tab showing total chanda, total expenses, total event budget spent, and net profit/loss (signed, color-coded)
- Month-by-month breakdown table

### Public Temple Page
- Reachable at `/temple/:slug`, no login required
- Shows the temple's name and logo, a year-filterable summary (total chanda, total expenses, balance), and the video gallery
- Deliberately exposes only aggregated totals — never individual devotee names, phone numbers, or line-item expense details

### QR Code
- Generated client-side (no external API) on the dashboard, encoding the public temple page URL
- Includes a "Copy Link" button
- Scanning it only grants read access to the public summary page — no write, edit, or delete capability exists on any public route; every mutating endpoint requires a valid admin JWT

### PDF Reports
- Puppeteer renders a styled HTML template (with the temple's logo and letterhead) to PDF
- Separate report endpoints for Chanda, Expense, and Daily Events, filterable by month/year

### Responsive Design
- All four dashboard data pages render as a full table on desktop and as stacked cards on mobile (`hidden md:table` / `md:hidden` pattern)
- Row numbering, responsive grid stacking on the public page, and a centered mobile layout for the dashboard header and QR card

---

## Project Structure

```
vinaya-seva/
├── server/
│   ├── controllers/       # auth, chanda, expense, video, dailyEvent, report, overview
│   ├── middleware/         # auth (JWT), upload (Multer)
│   ├── models/              # User, Organization, Chanda, Expense, Video, DailyEvent
│   ├── routes/                # one router per resource, plus public (no-auth) routes
│   ├── templates/          # PDF report HTML template
│   ├── utils/                  # otherField helper, slugify, sendEmail
│   ├── uploads/              # uploaded logo images (served statically)
│   └── server.js
└── client/
    └── src/
        ├── api/                 # shared axios instance with auth interceptor
        ├── components/    # SelectWithOther, ProtectedRoute
        └── pages/              # Register, Login, ForgotPassword, ResetPassword,
                                       # Dashboard, ChandaPage, ExpensePage, VideoPage,
                                       # DailyEventPage, OverviewPage, PublicTemplePage
```

---

## Security Notes

- Passwords are hashed with bcrypt before storage; plaintext is never saved or returned
- Every write operation filters by `{ _id, organization: req.user.organization }` — even a guessed record ID from another organization cannot be read, edited, or deleted
- Password reset tokens are cryptographically random, single-use, and expire after 15 minutes
- File uploads are restricted by type (image only) and size (2MB), validated server-side via Multer
- The public API surface is read-only by design — no mutating route exists under `/api/public/*`

---

## Known Limitations / Possible Next Steps

- Image URLs (logos) are currently hardcoded to `http://localhost:5000`--> 'import.meta.env.VITE_API_URL' on the frontend — should become an environment variable before deployment
- No manual "backdate" option currently in the entry forms (all new records save under the current date) — a date picker can be reintroduced if historical data entry is needed
- No staff-invite flow yet — the `User` model supports a `staff` role, but only the registering admin can currently log in per organization
- A per-devotee QR code (linking to one specific record rather than the temple's overall public page) was discussed as a possible future feature