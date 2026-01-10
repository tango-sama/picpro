# Deployment Guide for PicPro

Your application is built and configured for Firebase Hosting!

## Prerequisites

1.  **Firebase CLI**: Ensure you have the Firebase tools installed.
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login**: Authenticate with your Google account.
    ```bash
    firebase login
    ```

## Deployment Steps

1.  **Initialize Project** (Link your local app to your Firebase project):
    ```bash
    firebase use --add
    ```
    *   Select your existing Firebase project (the one you set up in `.env`).
    *   Give it an alias (e.g., `default`).

2.  **Build the Project** (Already done, but good to know):
    ```bash
    npm run build
    ```
    *   This creates the `dist` folder which will be uploaded.

3.  **Deploy**:
    ```bash
    firebase deploy --only hosting
    ```

## Backend Deployment (CRITICAL)

**PicPro uses a custom Node.js backend (`server.js`) for Logic & AI generation.**
Firebase Hosting *only* hosts the frontend. You **MUST** deploy the backend for the app to work.

### Option A: Firebase Cloud Functions (Recommended)
1.  Initialize functions: `firebase init functions`
2.  Copy your `server.js` logic into `functions/index.js` (or import it).
3.  Set your environment variables using `firebase functions:config:set`.
4.  Update `firebase.json` rewrites to point to the function:
    ```json
    "rewrites": [ { "source": "/api/**", "function": "api" }, ... ]
    ```

### Option B: Dedicated Node Host (Easier)
1.  Deploy this repo to **Render**, **Railway**, or **Heroku**.
2.  Set the environment variables in their dashboard.
3.  Update your local frontend `.env` to point to that new URL if separated, or just serve the static frontend from that Node server (already configured in `server.js` if you add static serving).

## Post-Deployment

*   Your app will be live at `https://<your-project-id>.web.app`.
*   **Authentication**: Ensure you add your new hosting domain (e.g., `picpro-app.web.app`) to the **Authorized Domains** list in the Firebase Console -> Authentication -> Settings.

## Troubleshooting

*   **404 on Refresh**: The `firebase.json` is already configured with rewrites to handle client-side routing, so this should work automatically.
*   **Missing Features**: Ensure your Firestore rules allow access to the collections used (`users/{userId}/creations`).
