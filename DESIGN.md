# DESIGN.md — Pollify

## 1. Design System

### Color Palette
- **Background**: `zinc-950` (`#09090b`) — main app background
- **Surface**: `zinc-900/70` (`#18181b`) — cards, modals, sections
- **Border**: `zinc-800/80` (`#27272a`) — subtle dividers and card borders
- **Text Primary**: `zinc-100` (`#f4f4f5`) — headings
- **Text Secondary**: `zinc-300` (`#d4d4d8`) — body text
- **Text Muted**: `zinc-500` (`#71717a`) — labels, timestamps
- **Accent**: `emerald-500` (`#10b981`) — primary actions, active states
- **Danger**: `rose-400` (`#fb7185`) — delete, destructive actions
- **Warning**: `amber-400` (`#fbbf24`) — closed poll badges

### Typography
- **Body**: `Inter, sans-serif` (set globally in `App.jsx`)
- **Headings**: `'Plus Jakarta Sans', sans-serif` (on important headings)
- **Scale**: 10px–14px range for most UI; text-xs (12px) is default

### Spacing & Layout
- Cards: `rounded-2xl`, `p-4` interior padding
- Page container: `max-w-2xl mx-auto py-8 px-4`
- Consistent `gap-3` between cards in lists
- Owner controls: `gap-1`, icon-only buttons with `p-1.5 rounded-lg`

### Icons
- [Lucide React](https://lucide.dev/icons/) — consistent 14px default, 13px in owner controls, 11px in compact areas

---

## 2. Component Architecture

### PollCard (Central Component)
```
PollCard
├── Header (Avatar, userName, username, timestamp, category tag, closed badge)
├── Owner Controls (icons-only: Edit, Share, Close/Reopen, Delete)
├── Question (editable inline when editing)
├── PollVote (poll-type-aware voting UI)
│   ├── YesNoVote
│   ├── SingleChoiceVote
│   ├── ImageVote
│   ├── RatingVote
│   └── OpenVote
├── Footer (Vote count, Comments toggle, Bookmark)
└── Comments (expandable section)
```

### Props Contract
| Prop | Type | Description |
|------|------|-------------|
| `poll` | Object | Full poll object with `creator`, `myVote`, `results`, etc. |
| `vote` | (pollId, value) => void | Cast vote |
| `unvote` | (pollId) => void | Remove vote |
| `bookmark` | (pollId) => void | Toggle bookmark |
| `owner` | boolean | Show owner controls |
| `edit` | (pollId, data) => void | Save edits |
| `close` | (pollId) => void | Toggle close |
| `remove` | (pollId) => void | Delete poll |

### Page Layout
Every authenticated page wraps content in `<Layout>` which provides Sidebar + main content area. The Layout handles responsive breakpoints.

---

## 3. Data Flow

### Authentication Flow
1. User registers/login → backend returns JWT + user object
2. Token stored in `localStorage("token")`
3. `AuthContext` verifies token on mount via `GET /api/auth/profile`
4. All subsequent API calls use `api.js` which injects `Authorization: Bearer <token>`

### Voting Flow
1. `POST /api/polls/:id/vote` with `{ value }`
2. Optimistic update: refetch poll with `GET /api/polls/:id`
3. Update local state with fresh poll data

### Image Upload Flow
1. User selects images in CreatePollPage (grid UI with previews)
2. FormData sent to `POST /api/polls` with `images[]` field
3. Backend uploads each to Cloudinary, stores URLs in `options[].image`
4. Voting displays images instead of text options

---

## 4. Poll Type Specifications

| Type | Options | Vote Value | Results Display |
|------|---------|------------|-----------------|
| `yesno` | ["Yes", "No"] | "Yes" or "No" | Two-bar comparison |
| `single` | User-defined text | Selected option text | Horizontal bars |
| `image` | Image URLs from upload | Selected image URL | Image grid with counts |
| `rating` | 1–5 stars | Number (1-5) | Star visualization |
| `open` | None | Free text | List of responses |

---

## 5. File Organization

```
backend/
├── controllers/        # Route handlers (poll, auth, user, bookmark, comment, follow, notification)
├── config/             # DB, Cloudinary, Mailer setup
├── middleware/          # JWT auth, optionalAuth
├── models/             # Mongoose schemas (Poll, User, Comment, Notification)
├── routes/             # Express routers
├── utils/              # Helpers (mailer, computeResults)
└── server.js           # Entry point

frontend/
├── src/
│   ├── assets/
│   │   ├── dummyStyles.jsx       # ALL Tailwind classes (centralized)
│   │   └── helpers component/    # Reusable UI (PollCard, PollResults, Comments, etc.)
│   ├── components/               # App shell (Layout, Sidebar, FilterBar, UIElements)
│   ├── context/                  # AuthContext, ToastContext
│   ├── pages/                    # Page-level components
│   └── utils/                    # api.js wrapper
└── App.jsx                       # Routes
```

---

## 6. UI/UX Guidelines

- Always keep owner controls as icon-only buttons with `title` tooltips (no text labels)
- Use `window.confirm` before destructive actions (delete poll)
- Share popover should close on outside click
- Hostile/decaying states: show meaningful empty states ("No polls yet"), never raw errors
- Loading: `PollSkeleton` component for consistent placeholder
- Transitions: `transition-all` on interactive elements, `hover:bg-zinc-800/60` for icon buttons
- All Tailwind classes MUST go in `dummyStyles.jsx` — never inline
