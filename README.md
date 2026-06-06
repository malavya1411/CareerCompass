# CareerCompass

CareerCompass is a React/Vite hackathon MVP for high school students to explore careers, discover colleges, compare schools, and track applications.

## Quick Start

```bash
npm install
npm run dev
```

Open the Vite URL shown in your terminal.

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password authentication in Firebase Auth.
3. Create a Cloud Firestore database in testing mode for the MVP.
4. Copy your web app config into `src/lib/firebase.ts`, or create a `.env` file:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

On first load with Firebase configured, `src/lib/seedData.ts` seeds the `careers` and `colleges` collections if they are empty.

## Firestore Collections

- `users`: profile data and saved college IDs
- `careers`: seeded career records
- `colleges`: seeded college records
- `applications`: user-specific application tracker records with real-time listeners

## Demo Checklist

- Register with email/password, then complete the student profile.
- Browse and filter careers.
- Open a career detail page to see related majors and relevant colleges.
- Browse and filter colleges, save schools, compare up to four, and add a school to the tracker.
- Update tracker status, deadline, and notes from the Kanban board.
- Refresh the app and confirm data persists in Firestore.

## 4-Day Implementation Plan

Day 1: Authentication, Firebase config, user profile creation/editing, seeded data utility.

Day 2: Career Explorer, Career Details, College Explorer, College Details, save/compare actions.

Day 3: Application Tracker with real-time Firestore listener, Dashboard recommendations, deadline summaries.

Day 4: Responsive polish, loading/empty states, validation, final demo pass.
