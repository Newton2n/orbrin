# Orbrin Frontend

Orbrin is a project management SaaS frontend built with Next.js and TypeScript.

The frontend provides role-based dashboards for administrators, managers, and members. It communicates with the Orbrin Express API through **Next.js Server Actions**, which work as a Backend-for-Frontend (BFF) layer.

The main goal of this architecture is to keep API communication, authentication cookies, and server-side logic away from the browser while keeping the frontend simple and organized.

---

## What Orbrin Frontend Does

The frontend provides interfaces for:

* Authentication
* Organization management
* Projects
* Teams
* Sprints
* Tasks
* Comments
* User profiles
* Subscription management
* Role-based dashboards
* Account and organization settings

The application is organized around two main areas:

```text
Authentication
    ↓
Role-based Dashboard
    ↓
Feature Pages
    ↓
Server Actions
    ↓
Backend API
```

---

# Frontend Architecture

The application follows a simple BFF architecture.

```text
┌─────────────────────────────┐
│           Browser           │
│                             │
│ Pages / Components / Forms  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Next.js Server        │
│                             │
│       Server Actions        │
│          BFF Layer          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Express API           │
│                             │
│ Authentication / Business   │
│ Logic / Validation / RBAC   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        PostgreSQL           │
└─────────────────────────────┘
```

The browser does not directly communicate with the Express API for normal application operations.

Instead:

```text
Page
  ↓
Server Action
  ↓
Express API
  ↓
Response
  ↓
Server Action
  ↓
Page / Component
```

This keeps the frontend API boundary centralized.

---

# Why Server Actions Are Used as the BFF

The frontend uses Next.js Server Actions to communicate with the backend instead of putting API requests directly inside browser components.

For example:

```text
Task Form
   ↓
task.action.ts
   ↓
Express /tasks
   ↓
PostgreSQL
```

The Server Action can handle:

* Authentication cookies
* Backend API requests
* Request formatting
* `FormData` uploads
* Backend error handling
* Response normalization
* Cache/page revalidation
* Server-only environment variables

This also means the browser does not need to know the internal backend API structure.

---

# Authentication

Authentication is handled through the frontend BFF and the Express API.

## Login Flow

```text
Login Page
    ↓
auth.action.ts
    ↓
Express /auth/login
    ↓
Backend validates credentials
    ↓
Access Token + Refresh Token
    ↓
Next.js sets HTTP-only cookies
    ↓
Dashboard
```

The frontend receives the authenticated user information and redirects the user based on their role.

Supported roles:

```text
ADMIN
MANAGER
MEMBER
```

---

## Google Authentication

Google authentication follows the same BFF architecture.

```text
Google Button
      ↓
Google OAuth
      ↓
Google ID Token
      ↓
auth.action.ts
      ↓
Express /auth/google-login
      ↓
JWT Tokens
      ↓
HTTP-only Cookies
      ↓
Dashboard
```

For invited members, the organization context can also be passed during registration.

---

# Auth Pages

Authentication pages are separated from the dashboard.

```text
app/
└── (auth)/
    ├── login/
    ├── register-owner/
    ├── register-member/
    ├── forgot-password/
    ├── reset-password/
    └── verify-email/
```

The shared authentication UI is handled through reusable components such as:

```text
AuthLayout
AuthForm
GoogleLoginButton
```

The same form system supports different authentication modes instead of creating completely separate forms for every page.

---

# Dashboard Architecture

After authentication, users are redirected to a dashboard based on their role.

```text
/dashboard
│
├── admin
├── manager
└── member
```

Each dashboard exposes only the functionality relevant to that role.

---

## Admin Dashboard

The admin dashboard contains organization-level management.

```text
Admin
│
├── Overview
├── Projects
├── Teams
├── Sprints
├── Tasks
├── Subscription
└── Settings
```

Admin settings include:

* Organization profile
* Organization logo
* Organization members
* Member management
* Organization deletion
* Account settings

---

## Manager Dashboard

Managers work mainly with projects, teams, sprints, and tasks.

```text
Manager
│
├── Overview
├── Projects
├── Teams
├── Sprints
├── Tasks
└── Settings
```

---

## Member Dashboard

Members focus on the work assigned to them.

```text
Member
│
├── Overview
├── Projects
├── Sprints
├── Tasks
├── Comments
└── Settings
```

---

# Server Actions

All major frontend-to-backend operations are grouped into feature-based Server Action files.

```text
src/
└── actions/
    ├── auth.action.ts
    ├── comment.action.ts
    ├── organization.action.ts
    ├── project.action.ts
    ├── sprint.action.ts
    ├── subscription.action.ts
    ├── task.action.ts
    ├── team.action.ts
    └── user.action.ts
```

Each action file owns the frontend API communication for its feature.

---

# Auth Actions

### `auth.action.ts`

Responsible for authentication-related operations.

Typical responsibilities:

* Login
* Register organization owner
* Register invited member
* Google login
* Logout
* Refresh token
* Send verification email
* Verify email
* Forgot password
* Reset password
* Get authentication/session information

Flow:

```text
Login Page
    ↓
auth.action.ts
    ↓
Express Auth API
    ↓
Authentication Result
    ↓
HTTP-only Cookies
    ↓
Dashboard
```

---

# Organization Actions

### `organization.action.ts`

Responsible for organization-level operations.

Examples:

* Get current organization
* Update organization
* Upload organization logo
* Delete organization logo
* Get organization members
* Manage organization membership

Flow:

```text
Organization Settings
        ↓
organization.action.ts
        ↓
Express Organization API
        ↓
Database
        ↓
Updated Organization
        ↓
Revalidate UI
```

---

# Project Actions

### `project.action.ts`

Responsible for project operations.

Examples:

* Get projects
* Get project details
* Create project
* Update project
* Delete project
* Manage project information

Project pages use these actions instead of directly calling the backend.

```text
Project Page
    ↓
project.action.ts
    ↓
Express API
    ↓
Project Data
```

---

# Team Actions

### `team.action.ts`

Responsible for team-related operations.

Examples:

* Get teams
* Create team
* Update team
* Delete team
* Add members
* Remove members
* Manage team membership

Flow:

```text
Team Page
    ↓
team.action.ts
    ↓
Express API
    ↓
Team Data
```

---

# Sprint Actions

### `sprint.action.ts`

Responsible for sprint operations.

Examples:

* Get sprints
* Get sprint details
* Create sprint
* Update sprint
* Delete sprint
* Manage sprint information

Flow:

```text
Sprint Page
    ↓
sprint.action.ts
    ↓
Express API
    ↓
Sprint Data
```

Sprints are connected with projects and tasks.

```text
Project
   │
   ├── Sprint
   │     ├── Task
   │     ├── Task
   │     └── Task
   │
   └── Task without Sprint
```

---

# Task Actions

### `task.action.ts`

Tasks are one of the main features of Orbrin.

The task actions handle operations such as:

* Get tasks
* Get task details
* Create task
* Update task
* Delete task
* Assign users
* Change task status
* Change priority
* Move tasks between sprints
* Update task information

Typical flow:

```text
Task Form
    ↓
task.action.ts
    ↓
Express API
    ↓
Database
    ↓
Updated Task
    ↓
Revalidate / Update UI
```

Tasks can be displayed from project, sprint, or task-focused pages.

---

# Comment Actions

### `comment.action.ts`

Comments provide collaboration around tasks and other work items.

Responsibilities include:

* Get comments
* Create comment
* Update comment
* Delete comment

Flow:

```text
Task Details
     ↓
Comment Form
     ↓
comment.action.ts
     ↓
Express API
     ↓
Updated Comments
```

---

# User Actions

### `user.action.ts`

Responsible for personal account operations.

Examples:

* Get current profile
* Update profile
* Upload profile image
* Delete profile image
* Change password
* Delete account

Profile page structure:

```text
Profile Settings
│
├── Profile Information
├── Profile Image
├── Password
└── Delete Account
```

Profile image uploads are also sent through the BFF.

```text
Browser
   ↓
Server Action
   ↓
Express API
   ↓
Image Storage
   ↓
Updated Profile
```

---

# Subscription Actions

### `subscription.action.ts`

Responsible for subscription and billing-related frontend operations.

Examples:

* Get current subscription
* Start checkout
* Get subscription status
* Manage subscription state

Flow:

```text
Subscription Page
       ↓
subscription.action.ts
       ↓
Express API
       ↓
Billing System
       ↓
Subscription Status
       ↓
Frontend UI
```

The frontend does not contain billing business logic. It only starts the required operation and displays the resulting subscription state.

---

# Feature-to-Action Map

| Feature        | Server Action            | Main UI                         |
| -------------- | ------------------------ | ------------------------------- |
| Authentication | `auth.action.ts`         | Login / Register / Verification |
| Organization   | `organization.action.ts` | Organization Settings           |
| Projects       | `project.action.ts`      | Project Pages                   |
| Teams          | `team.action.ts`         | Team Pages                      |
| Sprints        | `sprint.action.ts`       | Sprint Pages                    |
| Tasks          | `task.action.ts`         | Task Pages                      |
| Comments       | `comment.action.ts`      | Task / Project Details          |
| Users          | `user.action.ts`         | Profile / Settings              |
| Subscription   | `subscription.action.ts` | Subscription Settings           |

---

# Page to Action Architecture

The frontend follows a predictable pattern.

```text
Page
 ↓
Feature Component
 ↓
Form / Interaction
 ↓
Server Action
 ↓
Backend API
 ↓
Action Result
 ↓
UI Update
```

For example:

```text
/dashboard/admin/projects
        ↓
ProjectList
        ↓
CreateProjectForm
        ↓
project.action.ts
        ↓
Express API
        ↓
Project created
        ↓
Revalidate project page
        ↓
Updated project list
```

This makes it easier to locate functionality because each feature has a clear action boundary.

---

# Project Structure

The main frontend structure is organized around application routes, reusable components, actions, and feature-specific code.

```text
src/
│
├── actions/
│   ├── auth.action.ts
│   ├── comment.action.ts
│   ├── organization.action.ts
│   ├── project.action.ts
│   ├── sprint.action.ts
│   ├── subscription.action.ts
│   ├── task.action.ts
│   ├── team.action.ts
│   └── user.action.ts
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register-owner/
│   │   ├── register-member/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │
│   └── dashboard/
│       ├── admin/
│       ├── manager/
│       └── member/
│
├── components/
│   ├── auth/
│   ├── organization/
│   ├── profile/
│   ├── projects/
│   ├── tasks/
│   ├── teams/
│   ├── sprints/
│   ├── shared/
│   └── ui/
│
├── features/
│   └── auth/
│
├── lib/
│   └── ...
│
└── types/
    └── ...
```

---

# Forms and Validation

Forms use:

* React Hook Form
* Zod

The frontend validates user input before sending it to the Server Action.

```text
User Input
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
Server Action
    ↓
Backend Validation
```

Frontend validation exists mainly for a better user experience.

The backend remains responsible for authoritative validation.

This means frontend validation should never be treated as a security boundary.

---

# UI Architecture

The UI uses reusable components instead of duplicating the same interface across pages.

Common UI includes:

* Buttons
* Inputs
* Dialogs
* Dropdown menus
* Tabs
* Cards
* Avatars
* Tables
* Forms
* Empty states
* Error states
* Loading states

The application uses shadcn/ui components with Base UI primitives where appropriate.

---

# User Experience

The frontend focuses on simple, predictable interactions.

Examples:

* Forms show validation errors close to the related field.
* Server errors are displayed using toast messages.
* Destructive actions use confirmation dialogs.
* Uploads show progress/loading states.
* Empty states explain what the user can do next.
* Dashboard navigation changes based on the user's role.
* Settings pages keep related account or organization operations together.

---

# Data Flow

A typical read operation:

```text
Server Component / Page
        ↓
Server Action
        ↓
Express API
        ↓
Response
        ↓
Page
        ↓
Render UI
```

A typical mutation:

```text
Client Component
        ↓
Form Submit
        ↓
Server Action
        ↓
Express API
        ↓
Database
        ↓
Server Action
        ↓
Revalidation
        ↓
Updated UI
```

---

# Error Handling

Server Actions normalize backend responses into a frontend-friendly result.

The UI can then handle success and failure consistently.

Conceptually:

```ts
{
  success: true,
  data: ...
}
```

or:

```ts
{
  success: false,
  message: "Something went wrong."
}
```

This prevents every component from needing to understand the backend's complete response format.

---

# Authentication Cookies

Authentication tokens are stored in HTTP-only cookies.

The frontend does not store authentication tokens in:

* `localStorage`
* `sessionStorage`
* regular browser-accessible cookies

The Server Action layer handles authentication-related cookie operations.

This keeps authentication handling centralized on the server side of the Next.js application.

---

# Role-Based Navigation

The dashboard is organized around the authenticated user's role.

```text
ADMIN
  ↓
/dashboard/admin

MANAGER
  ↓
/dashboard/manager

MEMBER
  ↓
/dashboard/member
```

The frontend uses role information to control navigation and presentation.

The backend remains responsible for authoritative authorization.

Frontend role checks are therefore a UX layer, not the final security boundary.

---

# Image Uploads

The frontend supports profile and organization image uploads.

The current architecture is:

```text
Browser
   ↓
Next.js Server Action
   ↓
Express API
   ↓
Image Storage
   ↓
Image URL
   ↓
Next.js UI
```

Images are validated on the frontend before upload.

Supported formats:

```text
PNG
JPG / JPEG
WEBP
```

Maximum frontend upload size:

```text
5 MB
```

The Next.js Server Action body limit is configured above the application upload limit to account for multipart request overhead.

---

# Main Dependencies

| Dependency               | Why it is used                                                    |
| ------------------------ | ----------------------------------------------------------------- |
| Next.js                  | Application framework, routing, Server Components, Server Actions |
| React                    | UI rendering                                                      |
| TypeScript               | Static type safety                                                |
| Tailwind CSS             | Utility-based styling                                             |
| shadcn/ui                | Reusable UI components                                            |
| Base UI                  | Accessible UI primitives                                          |
| React Hook Form          | Form state and submission                                         |
| Zod                      | Form validation and type inference                                |
| Sonner                   | Toast notifications                                               |
| Lucide React             | Icons                                                             |
| date-fns                 | Date formatting and date utilities                                |
| next-themes              | Theme management                                                  |
| `@react-oauth/google`    | Google authentication UI                                          |
| cmdk                     | Command menu functionality                                        |
| class-variance-authority | Component variant management                                      |

---

# Environment Variables

The frontend uses public environment variables for values that are safe to expose to the browser.

Example:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Server-only secrets such as JWT signing secrets must not be placed in `NEXT_PUBLIC_*` variables.

---

# Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The application will run through the Next.js development server.

---

# Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
```

### Development

Starts the Next.js development server.

### Build

Creates the production build.

### Start

Runs the production Next.js application.

### Lint

Runs Biome checks.

### Format

Formats the project using Biome.

---

# Frontend Development Principles

The frontend follows a few practical rules:

### 1. Keep API communication centralized

Components should not repeatedly implement backend request logic.

Prefer:

```text
Component
   ↓
Server Action
```

instead of:

```text
Component
   ↓
fetch()
   ↓
Backend
```

---

### 2. Keep features separated

Authentication logic belongs in:

```text
auth.action.ts
```

Task logic belongs in:

```text
task.action.ts
```

Organization logic belongs in:

```text
organization.action.ts
```

This keeps the codebase easier to navigate.

---

### 3. Keep validation close to forms

Use React Hook Form and Zod for user-facing form validation.

---

### 4. Keep security on the server

The frontend can hide UI based on permissions, but authorization must be enforced by the backend.

---

### 5. Reuse UI components

If multiple pages need the same interaction, create a reusable component instead of copying the implementation.

---

### 6. Keep pages focused

Pages should mainly compose:

```text
Data
+
Feature Components
+
Layout
```

Business/API communication should remain in the appropriate Server Action.

---

# Current Frontend Architecture Summary

The complete flow can be summarized as:

```text
                         ORBRIN FRONTEND

┌─────────────────────────────────────────────────────────┐
│                     Next.js App                         │
│                                                         │
│  Auth Pages                                             │
│  Dashboard Pages                                        │
│  Components                                             │
│  Forms                                                  │
│                                                         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Server Actions / BFF                   │
│                                                         │
│  auth.action.ts                                         │
│  organization.action.ts                                │
│  project.action.ts                                     │
│  team.action.ts                                        │
│  sprint.action.ts                                      │
│  task.action.ts                                        │
│  comment.action.ts                                     │
│  user.action.ts                                        │
│  subscription.action.ts                                │
│                                                         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
                 Express Backend API
                        │
                        ▼
                    Application Data
```

The important frontend principle is:

**Pages handle presentation, components handle interaction, Server Actions handle communication with the backend, and the backend remains responsible for business rules and authorization.**

---

# Project Status

The frontend currently provides the core application structure for:

* Authentication
* Google authentication
* Role-based dashboards
* Organization management
* Organization logo management
* User profiles
* Profile image management
* Projects
* Teams
* Sprints
* Tasks
* Comments
* Subscription management
* Account settings

The architecture is designed so additional features can follow the same pattern:

```text
New Feature
    ↓
New Server Action
    ↓
Feature Components
    ↓
Feature Pages
```

This keeps the frontend predictable as Orbrin grows.
