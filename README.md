# RateMyStore — Full Stack Store Rating Platform

A full-stack web app where users can browse and rate stores, store owners can view their ratings, and admins can manage everything. Built with **Express.js**, **PostgreSQL**, and **React + Vite**.

---

## Table of Contents

- [What's Inside](#whats-inside)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Deployment (Production)](#deployment-production)
- [Seed Your First Admin](#seed-your-first-admin)
- [API Reference](#api-reference)
- [Validation Rules](#validation-rules)
- [File-by-File Guide](#file-by-file-guide)
- [Security Notes](#security-notes)

---

## What's Inside

```
Rating App/
├── backend/          Express.js REST API (Node.js + PostgreSQL)
└── frontend/         React + Vite SPA
```

### Roles

| Role | Can Do |
|------|--------|
| **Admin** | View stats, manage all users & stores |
| **Owner** | View their store's average rating and who rated them |
| **User** | Browse stores, submit and update ratings |

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, React Router v6                 |
| Styling   | Vanilla CSS (dark theme, glassmorphism)         |
| HTTP      | Axios with JWT Bearer interceptor               |
| Backend   | Node.js + Express.js                            |
| Database  | PostgreSQL                                      |
| Auth      | JWT (jsonwebtoken) + bcrypt                     |
| Dev Tools | Nodemon, React Hot Toast                        |

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14

### 2. Set Up PostgreSQL

```bash
psql -U postgres
CREATE DATABASE store_rating;
\q

# Run the schema (development only — this DROPS all tables first)
psql -U postgres -d store_rating -f backend/schema.sql
```

### 3. Configure the Backend

Create a `backend/.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://<USERNAME>:<PASSWORD>@localhost:5432/store_rating
JWT_SECRET=<generate a strong random secret — see Security Notes below>
JWT_EXPIRES_IN=7d
```

> **Tip:** Generate a secure JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Start the Backend

```bash
cd backend
npm install
npm run dev    # starts on http://localhost:5000
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

---

## Deployment (Production)

This repository is pre-configured for platforms like **Render** or **Heroku**:

1. Connect your GitHub repository to your platform.
2. The root `package.json` contains global `install`, `build`, and `start` scripts.
3. Set the following environment variables on your platform:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Your production DB connection string |
   | `JWT_SECRET` | A long, random secret (≥ 64 chars) |
   | `JWT_EXPIRES_IN` | e.g. `7d` |

When `NODE_ENV=production`, the Express backend automatically serves the built React frontend from the same port — no separate frontend server needed.

---

## Seed Your First Admin

For security reasons, Admin accounts **cannot be created** from the public website. To create your first Admin, run:

```bash
cd backend
npm run create-admin <your-email@example.com> <your-secure-password>
```

Example:
```bash
npm run create-admin boss@mysite.com SuperSecret123!
```

> ⚠️ **Note:** Passing the password as a command-line argument saves it to your shell history. On shared or production servers, consider clearing history afterwards (`history -c` on bash) or manually inserting the admin row via a DB client.

---

## API Reference

### Auth

```
POST  /api/auth/login            Body: { email, password }
POST  /api/auth/signup           Body: { name, email, password, address, role? }
PUT   /api/auth/change-password  Body: { currentPassword, newPassword }  [JWT]
```

### Admin *(requires admin JWT)*

```
GET   /api/admin/stats
GET   /api/admin/users           ?name=&email=&address=&role=&sortBy=&order=
POST  /api/admin/users           Body: { name, email, password, address, role }
GET   /api/admin/users/:id
GET   /api/admin/stores          ?name=&email=&address=&sortBy=&order=
POST  /api/admin/stores          Body: { name, email, address, owner_id? }
```

### User *(requires user JWT)*

```
GET   /api/user/stores           ?name=&address=&sortBy=&order=
POST  /api/user/ratings          Body: { store_id, rating }
PUT   /api/user/ratings/:storeId Body: { rating }
```

### Owner *(requires owner JWT)*

```
GET   /api/owner/dashboard
```

---

## Validation Rules

| Field    | Rule                                              |
|----------|---------------------------------------------------|
| Name     | Max 20 characters                                 |
| Email    | Valid email format, must be unique                |
| Password | 8–16 chars, ≥ 1 uppercase letter, ≥ 1 special char |
| Address  | Max 400 characters                                |
| Rating   | Integer between 1 and 5                           |

---

## File-by-File Guide

### Backend

| File | Purpose |
|------|---------|
| `backend/schema.sql` | PostgreSQL schema — users, stores, ratings tables + indexes |
| `backend/server.js` | Entry point — starts the HTTP server |
| `backend/src/app.js` | Express setup — CORS, JSON parsing, route mounting |
| `backend/src/config/db.js` | PostgreSQL connection pool (pg) |
| `backend/src/middleware/auth.js` | JWT `authenticate` + role-based `authorize` middleware |
| `backend/src/routes/auth.routes.js` | `/api/auth` — login, signup, change-password |
| `backend/src/routes/admin.routes.js` | `/api/admin` — admin-only endpoints |
| `backend/src/routes/user.routes.js` | `/api/user` — normal user endpoints |
| `backend/src/routes/owner.routes.js` | `/api/owner` — store owner endpoints |
| `backend/src/controllers/auth.controller.js` | Login, signup, change-password logic |
| `backend/src/controllers/admin.controller.js` | Stats, user CRUD, store CRUD |
| `backend/src/controllers/user.controller.js` | Store listing, submit/update rating |
| `backend/src/controllers/owner.controller.js` | Owner dashboard (avg rating + rater list) |
| `backend/scripts/createAdmin.js` | One-time CLI script to bootstrap an admin account |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/index.css` | Global design system — CSS variables, layout, all component styles |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/App.jsx` | All routes, role-based route guards, Toaster setup |
| `frontend/src/api/axios.js` | Axios instance — adds JWT header, handles 401 auto-logout |
| `frontend/src/context/AuthContext.jsx` | Global auth state (user, token, login, logout) |
| `frontend/src/components/ProtectedRoute.jsx` | Role-aware route guard component |
| `frontend/src/components/Navbar.jsx` | Top navigation with role-based links |
| `frontend/src/components/StarRating.jsx` | Interactive / read-only 1–5 star picker |
| `frontend/src/components/SortableTable.jsx` | Reusable table with asc/desc column sorting |
| `frontend/src/components/Modal.jsx` | Generic modal dialog |
| `frontend/src/pages/Login.jsx` | Shared login page for all roles |
| `frontend/src/pages/Signup.jsx` | Self-registration (user / owner roles only) |
| `frontend/src/pages/ChangePassword.jsx` | Change password (users + owners) |
| `frontend/src/pages/admin/Dashboard.jsx` | Admin stats: total users, stores, ratings |
| `frontend/src/pages/admin/Users.jsx` | User list with filters + add user modal |
| `frontend/src/pages/admin/Stores.jsx` | Store list with filters + add store modal |
| `frontend/src/pages/admin/UserDetail.jsx` | Single user details (+ store avg rating if owner) |
| `frontend/src/pages/user/StoreList.jsx` | Browse stores, submit or update a rating |
| `frontend/src/pages/owner/Dashboard.jsx` | Owner view: average rating + raters table |

---

## Security Notes

- **Never commit `.env`** — it is listed in `.gitignore`. Use `.env.example` for documentation.
- **JWT secret** must be a long, random string. Do not use guessable values. Rotate it if ever exposed.
- **Database password** — use a unique, strong password per environment (dev / staging / prod).
- **Rate limiting** — consider adding `express-rate-limit` to `/api/auth/login` and `/api/auth/signup` before deploying publicly to prevent brute-force attacks.
- **Helmet** — adding the `helmet` npm package sets important HTTP security headers with a single line of code.
- **SQL Injection** — all database queries use parameterized statements (`$1`, `$2` …), so SQL injection is not possible.
- **Role escalation** — users cannot self-assign the `admin` role through the signup form. Admin accounts must be created via the CLI script.
- **`schema.sql` warning** — this file drops and recreates all tables. **Never run it against a production database.**
