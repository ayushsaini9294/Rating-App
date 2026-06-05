# RateMyStore — Full Stack Store Rating Platform

A production-ready web app where users can rate stores. Built with **Express.js**, **PostgreSQL**, and **React + Vite**.

---

## What's Inside

```
project-1/
├── backend/          Express.js REST API
└── frontend/         React + Vite SPA
```

---

## Quick Start

### 1. Set Up PostgreSQL

Create a database and run the schema:

```bash
psql -U postgres
CREATE DATABASE store_rating;
\q
psql -U postgres -d store_rating -f backend/schema.sql
```

### 2. Configure Backend

Create a `backend/.env` file with your PostgreSQL credentials:

```env
PORT=5000
DATABASE_URL=postgresql://<USERNAME>:<PASSWORD>@localhost:5432/store_rating
JWT_SECRET=<YOUR_SUPER_SECRET_JWT_KEY>
JWT_EXPIRES_IN=7d
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev    # starts on http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

---

## Deployment (Production)

This repository is pre-configured for platforms like Render or Heroku:
1. Connect your GitHub repository.
2. The root `package.json` contains global `install`, `build`, and `start` scripts.
3. Make sure to set your environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `JWT_SECRET`

When `NODE_ENV=production`, the Express backend automatically serves the built React frontend on the same port!

---

## Seed Your First Admin

For security reasons, Admin accounts cannot be created from the public website. To create your first Admin account, run the following command in your terminal from inside the `backend` folder:

```bash
npm run create-admin <your-email@example.com> <your-secure-password>
```

Example:
```bash
npm run create-admin boss@mysite.com SuperSecret123!
```

> **Tip:** You can also use the `/signup` endpoint or React signup page to create a normal user, then use your database tool to manually change their `role` to `'admin'`.

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18, Vite, React Router v6 |
| Styling   | Vanilla CSS (dark theme, glassmorphism) |
| HTTP      | Axios with JWT interceptor |
| Backend   | Node.js + Express.js    |
| Database  | PostgreSQL               |
| Auth      | JWT (jsonwebtoken) + bcrypt |
| Dev tools | Nodemon, React Hot Toast |

---

## File-by-File Guide

### Backend

| File | Purpose |
|---|---|
| `backend/schema.sql` | PostgreSQL schema — users, stores, ratings tables |
| `backend/.env` | Environment variables (DB URL, JWT secret) |
| `backend/server.js` | Entry point — starts HTTP server |
| `backend/src/app.js` | Express setup — CORS, JSON parsing, route mounting |
| `backend/src/config/db.js` | PostgreSQL connection pool |
| `backend/src/middleware/auth.js` | JWT verify + role guard middleware |
| `backend/src/routes/auth.routes.js` | `/api/auth` — login, signup, change-password |
| `backend/src/routes/admin.routes.js` | `/api/admin` — admin-only endpoints |
| `backend/src/routes/user.routes.js` | `/api/user` — normal user endpoints |
| `backend/src/routes/owner.routes.js` | `/api/owner` — store owner endpoints |
| `backend/src/controllers/auth.controller.js` | Login, signup, change-password logic |
| `backend/src/controllers/admin.controller.js` | Stats, user CRUD, store CRUD |
| `backend/src/controllers/user.controller.js` | Store listing, submit/update rating |
| `backend/src/controllers/owner.controller.js` | Owner dashboard data |

### Frontend

| File | Purpose |
|---|---|
| `frontend/src/index.css` | Global design system — variables, layout, all component styles |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/App.jsx` | All routes, role-based route guards, toast setup |
| `frontend/src/api/axios.js` | Axios instance with auth header + 401 redirect |
| `frontend/src/context/AuthContext.jsx` | Global auth state (user, token, login/logout) |
| `frontend/src/components/ProtectedRoute.jsx` | Route guard by role |
| `frontend/src/components/Navbar.jsx` | Top navigation with role-based links |
| `frontend/src/components/StarRating.jsx` | Interactive/readonly 1–5 star picker |
| `frontend/src/components/SortableTable.jsx` | Reusable table with asc/desc sort |
| `frontend/src/components/Modal.jsx` | Generic modal dialog |
| `frontend/src/pages/Login.jsx` | Shared login for all roles |
| `frontend/src/pages/Signup.jsx` | Normal user self-registration |
| `frontend/src/pages/ChangePassword.jsx` | Change password (users + owners) |
| `frontend/src/pages/admin/Dashboard.jsx` | Admin stats: users, stores, ratings |
| `frontend/src/pages/admin/Users.jsx` | User list + add user modal |
| `frontend/src/pages/admin/Stores.jsx` | Store list + add store modal |
| `frontend/src/pages/admin/UserDetail.jsx` | Single user details (+ store rating if owner) |
| `frontend/src/pages/user/StoreList.jsx` | Browse stores, rate/edit ratings |
| `frontend/src/pages/owner/Dashboard.jsx` | Owner: avg rating + raters table |

---

## API Reference

### Auth
```
POST  /api/auth/login            Body: { email, password }
POST  /api/auth/signup           Body: { name, email, password, address }
PUT   /api/auth/change-password  Body: { currentPassword, newPassword }  [JWT]
```

### Admin (requires admin JWT)
```
GET   /api/admin/stats
GET   /api/admin/users           ?name=&email=&address=&role=&sortBy=&order=
POST  /api/admin/users           Body: { name, email, password, address, role }
GET   /api/admin/users/:id
GET   /api/admin/stores          ?name=&email=&address=&sortBy=&order=
POST  /api/admin/stores          Body: { name, email, address, owner_id? }
```

### User (requires user JWT)
```
GET   /api/user/stores           ?name=&address=&sortBy=&order=
POST  /api/user/ratings          Body: { store_id, rating }
PUT   /api/user/ratings/:storeId Body: { rating }
```

### Owner (requires owner JWT)
```
GET   /api/owner/dashboard
```

---

## Validation Rules (enforced both sides)

| Field    | Rule |
|----------|------|
| Name     | Min 20 chars, Max 60 chars |
| Email    | Valid email format |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special char |
| Address  | Max 400 chars |
| Rating   | Integer 1–5 |
