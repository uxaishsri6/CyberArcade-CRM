# 🤖 CyberArcade — Campaign Management & CRM Dashboard

A full-stack Campaign Management & CRM web application for CyberArcade, a kids' robotics and game-building academy. Convert trial attendees and new leads into full-time paid students.

## Features

- **Contact Intelligence** — 360° contact profiles with child info, lead scoring, activity timeline
- **Smart Segments** — 7 predefined segments + visual segment builder with live preview counts
- **Multi-Channel Campaigns** — Email (SendGrid), WhatsApp + SMS (Twilio), Instagram, Facebook
- **Campaign Analytics** — Engagement timeline, channel breakdown, conversion tracking
- **Conversion Funnel** — 8-stage pipeline with cohort analysis and source attribution
- **Mission Control Dashboard** — KPI cards, funnel chart, campaign performance bars, activity feed
- **Global Search** — Search contacts, campaigns, and segments simultaneously
- **Cyberpunk Design** — Dark neon theme with CRT scanline effects, Orbitron + JetBrains Mono fonts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS v4 |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| API Codegen | Orval (OpenAPI → React Query hooks) |

## Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and API keys
```

### Database Setup

```bash
# Push schema to database
pnpm --filter @workspace/db run push

# Seed with sample data (50 contacts, 7 segments, 3 campaigns)
pnpm --filter @workspace/scripts run seed
```

### Development

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend (separate terminal)
pnpm --filter @workspace/cyber-arcade run dev
```

### Production Build

```bash
pnpm run build
```

## API Routes

### Contacts
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/contacts | List with filters (status, source, search, leadScore, city, page) |
| POST | /api/contacts | Create contact |
| GET | /api/contacts/:id | Get contact details |
| PATCH | /api/contacts/:id | Update contact |
| DELETE | /api/contacts/:id | Delete contact |
| GET | /api/contacts/:id/activities | Contact activity timeline |
| POST | /api/contacts/:id/activities | Log activity |
| GET | /api/contacts/:id/campaigns | Contact's campaign logs |
| PATCH | /api/contacts/bulk | Bulk update (status, tags, add to campaign) |
| GET | /api/contacts/export | Export as CSV |

### Segments
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/segments | List all segments |
| POST | /api/segments | Create segment |
| GET | /api/segments/:id | Get segment |
| PATCH | /api/segments/:id | Update segment |
| DELETE | /api/segments/:id | Delete segment |
| POST | /api/segments/preview | Preview contact count for filters |

### Campaigns
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/campaigns | List (filter by status) |
| POST | /api/campaigns | Create campaign |
| GET | /api/campaigns/:id | Get campaign |
| PATCH | /api/campaigns/:id | Update campaign |
| DELETE | /api/campaigns/:id | Delete campaign |
| POST | /api/campaigns/:id/launch | Launch campaign |
| POST | /api/campaigns/:id/pause | Toggle pause/resume |
| POST | /api/campaigns/:id/duplicate | Duplicate campaign |
| GET | /api/campaigns/:id/logs | Campaign contact logs |
| GET | /api/campaigns/:id/timeline | Engagement timeline data |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard/stats | KPI stats |
| GET | /api/dashboard/funnel | Conversion funnel |
| GET | /api/dashboard/campaign-performance | Last 6 campaigns bar chart |
| GET | /api/dashboard/lead-sources | Contacts by source |
| GET | /api/dashboard/recent-activities | Activity feed |
| GET | /api/conversions/funnel | 8-stage pipeline funnel |
| GET | /api/conversions/cohorts | Monthly cohort table |
| GET | /api/conversions/by-source | Conversion rate by source |
| GET | /api/search?q= | Global search |

## Channel Integrations

### Email (SendGrid)
Set `SENDGRID_API_KEY` in `.env`. HTML emails are sent using the dark-themed template matching the CyberArcade design.

### WhatsApp + SMS (Twilio)
Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and phone numbers. WhatsApp uses approved templates; SMS limited to 160 chars.

### Instagram + Facebook (Phase 2)
Ad creatives are stored in the database. Copy-ready captions and text are displayed for manual posting. Meta API integration is planned for Phase 2.

## Seed Data

The seed command populates:
- **50 contacts**: 20 trial attendees (mixed enrollment stages), 15 warm Instagram/Facebook leads, 10 cold leads, 5 enrolled students
- **7 segments**: Trial No-Shows, Trial Attended Not Enrolled, High Intent Parents, Instagram Leads, Facebook Leads, Cold Outreach Pool, Re-Engagement
- **3 campaigns**: June Trial Conversion (active), Instagram Re-engagement (completed), New Batch Announcement (draft)

## Design System

| Token | Value |
|-------|-------|
| Background | `#050510` |
| Card | `#0d0d1f` |
| Elevated | `#12122a` |
| Accent Cyan | `#00f5ff` |
| Accent Purple | `#b44aff` |
| Accent Green | `#00ff88` |
| Accent Pink | `#ff2d78` |
| Accent Yellow | `#ffe033` |

Fonts: **Orbitron** (headings/nav) · **Rajdhani** (body) · **JetBrains Mono** (IDs/stats)
