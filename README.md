# Mini Compliance Tracker

A simple web application to track compliance tasks for different clients, built with React, Node.js, Express, and Firebase.

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Git

### Local Setup
1. **Clone the repository** (or use the existing local folder).
2. **Backend Setup**:
   - `cd backend`
   - `npm install`
   - By default, the app uses a **mock local JSON database** (`mockDb.json`) for instant testing. If you want to connect to a real Firebase database:
     - Get your Firebase Service Account JSON key.
     - Rename it to `firebaseServiceKey.json` and place it in the **backend** folder (`d:\fullStack\backend`).
   - Run `npm start` or `node server.js`. The backend will run on `http://localhost:5000`.
3. **Frontend Setup**:
   - `cd frontend`
   - `npm install`
   - Run `npm run dev`. The frontend will be available at `http://localhost:5173`.

### Deploying to Production
To meet the requirement for a physical deployed link:
**Backend (Render.com)**
1. Create a Web Service on Render, connect your GitHub repo, and set the root directory to `backend`. 
2. Build command: `npm install`, Start command: `node server.js`.
3. Add environment variables if needed.

**Frontend (Vercel)**
1. Import the repository into Vercel.
2. Set the Root Directory to `frontend`.
3. Vercel will automatically detect Vite. Set the env var `VITE_API_URL` to your Render backend URL if you configure the frontend `api.js` to use `import.meta.env.VITE_API_URL`.

## Assumptions
- **Authentication**: Authentication was excluded to keep the "Mini" application simple and focus on core task requirements. 
- **Database**: We assumed standard NoSQL document structure works best here (Clients and Tasks collections). Given time constraints and ease of setup, an in-memory/JSON fallback is provided so the reviewer can run it end-to-end without Firebase keys.
- **Overdue Logic**: A task is considered overdue if its `due_date` is strictly before "today" and its status is not `Completed`. Timezones are assumed to be local to the browser.

## Tradeoffs
- **Mock DB vs Real Firebase**: Implementing a full Firebase instance would require sharing sensitive credentials or asking the evaluator to create their own. I built a dynamic mock JSON DB wrapper mimicking Firestore API so that the reviewer has ZERO friction checking out the repo, while keeping the API exactly identical to Firebase Admin SDK calls.
- **UI Framework**: Tailwind CSS with React/Vite was chosen over a heavier template or simple CSS. This provides a balance between rapid development and a highly polished "wow" aesthetic without bloating the repo.
- **State Management**: React's built-in `useState` and `useEffect` were used instead of Redux/Zustand. For a 2-page dashboard, local state passed down via props is considerably cleaner and faster to read.
