# AGENTS.md — Pollify

## Project Overview
A full-stack polling application where users create, vote, bookmark, and share polls across types (yes/no, single choice, image, star rating, open-ended). Built with React + Vite frontend and Express/MongoDB backend.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Tailwind CSS, Lucide Icons |
| State | AuthContext, ToastContext, local state |
| Styling | Tailwind utility classes via `dummyStyles.jsx` (centralized style objects) |
| Backend | Express, Mongoose, JWT auth, Cloudinary (image upload), Nodemailer |
| Database | MongoDB |

## Key Conventions
- **Styles**: All Tailwind classes live in `frontend/src/assets/dummyStyles.jsx` as exported JS objects. Components import `{ someStyles as s }` and use `s.className`.
- **API**: `frontend/src/utils/api.js` wraps `fetch` with JWT injection. Methods: `api.get, .post, .put, .patch, .delete`. FormData is auto-detected.
- **Auth**: JWT stored in `localStorage("token")`. `AuthContext` provides `user` and `login/logout`. Backend `auth` middleware sets `req.userId`.
- **Routes**: Frontend routes in `App.jsx`. Backend routes in `backend/routes/`.
- **Poll Types**: `yesno`, `single`, `image`, `rating`, `open` — mapped in `FilterBar.jsx` via `TYPE_META`.
- **PollCard**: Central poll display component accepts `poll`, `vote`, `unvote`, `bookmark`, `owner`, `edit`, `close`, `remove` props. Owner controls are icon-only with `title` tooltips.

## Running Locally
```bash
# Backend
cd backend && node server.js

# Frontend
cd frontend && npx vite
```

## Build
```bash
cd frontend && npx vite build
```

## Development Rules
1. Never add comments to source code — keep files clean.
2. All Tailwind classes go in `dummyStyles.jsx`, never inline in components.
3. Always verify frontend build (`npx vite build --logLevel error`) after changes.
4. Use `api.js` methods for all HTTP — never raw fetch.
5. FormData for image uploads; JSON for everything else.
