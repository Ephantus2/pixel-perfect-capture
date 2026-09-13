# Chuo LMS — Frontend

A React + TypeScript frontend for a Kenyan university Learning Management System, wired to a
Django REST Framework backend. No mock data: every screen calls a real endpoint, and features
without a backend endpoint say "Coming soon".

## Tech stack

React 19, TypeScript, Vite, TanStack Router (file-based routing), TanStack Query, Tailwind CSS v4,
shadcn/ui, Lucide React, Axios, React Hook Form, Zod, Sonner toasts.

> Routing note: this project uses TanStack Router rather than React Router. The URL structure,
> route protection and role-based navigation requested in the brief are all implemented; only the
> router library differs.

## Install and run

```bash
bun install     # or: npm install
bun run dev     # or: npm run dev
```

The app runs on http://localhost:8080.

## Environment variables

`.env` at the project root:

```
VITE_API_URL=http://127.0.0.1:8000
```

Every request goes through `src/api/axios.ts`, which reads `import.meta.env.VITE_API_URL`.
The backend URL is never hardcoded in components.

## Axios credentials

```ts
axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true })
```

Django issues the JWT access and refresh tokens as HTTP-only cookies. The frontend never reads,
stores or forwards tokens — no localStorage, no Authorization header.

## CORS requirements (Django side)

```python
CORS_ALLOWED_ORIGINS = ["http://localhost:8080"]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:8080"]
```

## Authentication flow

1. On startup the app calls `GET /users/details/`. A 200 populates the auth context; a 401 means
   logged out and the login page is shown.
2. `POST /users/login/` sets the cookies, then `GET /users/details/` provides the authoritative
   user object.
3. The role returned by the backend decides the dashboard — users never pick a role.
4. `POST /users/logout/` clears state and returns to `/login`.

Auth lives in `src/context/AuthContext.tsx` with the `useAuth()` hook.

## Roles and routes

| Role | Routes |
| --- | --- |
| STUDENT | `/student/dashboard`, `/student/courses`, `/student/assessments`, `/student/submissions`, `/student/grades`, `/student/profile` |
| LECTURER | `/lecturer/dashboard`, `/lecturer/courses`, `/lecturer/materials`, `/lecturer/assessments`, `/lecturer/submissions`, `/lecturer/grading`, `/lecturer/statistics`, `/lecturer/profile` |
| ADMIN | `/admin/dashboard`, `/admin/courses`, `/admin/users`, `/admin/academic`, `/admin/statistics`, `/admin/profile` |

Shared: `/login`, `/register`, `/courses/$courseCode`. Route guards live in
`src/components/auth/RoleRoute.tsx` (`ProtectedRoute`, `StudentRoute`, `LecturerRoute`,
`AdminRoute`). Guards are for navigation only — the backend remains the authority.

## Endpoints used

```
POST   /users/register/
POST   /users/login/
POST   /users/logout/
GET    /users/details/

POST   /courses/create/course/
PUT    /courses/update/course/{id}/
DELETE /courses/update/course/{id}/

POST   /courses/create/materials/            (multipart: course, title, file)
PUT    /courses/update/materials/{id}/
DELETE /courses/update/materials/{id}/
GET    /courses/course/materials/{course_code}/

POST   /courses/enroll/course/               ({ course_code })
POST   /courses/unenroll/course/             ({ course_code })
GET    /courses/enrolled/units/
GET    /courses/course/statistics/{course_code}/

POST   /assessment/create/assessment/
PUT    /assessment/update/assessment/{id}/
DELETE /assessment/update/assessment/{id}/
GET    /assessment/course/assessments/{course_code}/

POST   /assessment/create/submission/        (multipart: assessment, answer, file)
PUT    /assessment/update/submission/{id}/
DELETE /assessment/update/submission/{id}/
GET    /assessment/submissions/{assessment_id}/

POST   /assessment/create/grade/             ({ submission, marks, feedback })
PUT    /assessment/update/grade/{id}/
GET    /assessment/view/grade/{submission_id}/
```

`lecturer` and `student` are never sent from the frontend — the backend assigns them from
`request.user`. Grades use `marks`, not `marks_obtained`.

## Missing backend functionality

These screens intentionally show "Coming soon" or ask for an ID instead of inventing data:

- No endpoint listing all courses → admin course management works by ID; lecturers open a course
  by code (recent codes are remembered in this browser only).
- No endpoint listing the courses a lecturer teaches.
- No endpoint returning a single course by code → the course overview shows full details only for
  units the signed-in student is enrolled in.
- No endpoint listing a student's own submissions → students update or withdraw a submission using
  the submission ID shown after submitting.
- No user-management or academic-structure endpoints (programmes, departments, users).
- No profile update endpoint → profiles are read-only.

## Error handling

`src/utils/apiError.ts` converts DRF payloads into readable text and per-field form errors:
field arrays (`{"email": ["email already exists"]}`), `non_field_errors`, and `detail`. Network
failure, timeouts and 400/401/403/404/409/422/500 each get their own message. Every mutation shows
a loading label, disables its button, and reports the result through a toast.

## Project structure

```
src/
  api/          axios.ts, authApi.ts, courseApi.ts, assessmentApi.ts
  components/   ui/ (shadcn), layout/, auth/, common/, courses/, assessments/, submissions/
  context/      AuthContext.tsx
  hooks/        useAuth.ts
  routes/       file-based routes (login, register, student/, lecturer/, admin/, courses/)
  types/        auth.ts, course.ts, assessment.ts, submission.ts, grade.ts
  utils/        apiError.ts
```
