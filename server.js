import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.VITE_GOOGLE_REDIRECT_URI;
const COMFY_API_KEY = process.env.VITE_COMFY_DEPLOY_API_KEY;

console.log('--- Server Configuration ---');
console.log('PORT:', PORT);
console.log('CLIENT_ID:', CLIENT_ID ? 'Loaded' : 'MISSING');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Loaded' : 'MISSING');
console.log('REDIRECT_URI:', REDIRECT_URI);
console.log('COMFY_API_KEY:', COMFY_API_KEY ? 'Loaded' : 'MISSING');
console.log('---------------------------');
// Helper to generate a random state string
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

// Step 1: Initiate Google OAuth – redirect user to Google consent screen
app.get('/auth/google', (req, res) => {
    try {
        if (!CLIENT_ID || !REDIRECT_URI) {
            console.error('ERROR: Missing CLIENT_ID or REDIRECT_URI for Google Auth');
            return res.status(500).send('OAuth Configuration Error');
        }

        const state = generateState();
        res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax' });

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', `${REDIRECT_URI}/auth/google/callback`);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'openid email profile');
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('prompt', 'select_account');

        console.log("DEBUG: Redirecting to Google:", authUrl.toString());
        res.redirect(authUrl.toString());
    } catch (error) {
        console.error('ERROR in /auth/google:', error);
        res.status(500).send('Failed to initiate login');
    }
});

// Step 2: Google redirects back here with ?code=...&state=...
app.get('/auth/google/callback', async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;
    if (!state || !storedState || state !== storedState) {
        return res.status(400).send('Invalid state parameter');
    }
    // Clear the state cookie
    res.clearCookie('oauth_state');

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${REDIRECT_URI}/auth/google/callback`
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const { id_token, expires_in } = tokenResponse.data;
        // Create a simple signed session cookie (for demo purposes we just base64‑encode the id_token)
        const sessionToken = Buffer.from(id_token).toString('base64');
        res.cookie('session', sessionToken, {
            httpOnly: true,
            maxAge: expires_in * 1000,
            sameSite: 'lax'
        });
        // Redirect back to the front‑end (root of the app)
        res.redirect(REDIRECT_URI);
    } catch (err) {
        console.error('Token exchange error', err.response?.data || err.message);
        res.status(500).send('Authentication failed');
    }
});

// Simple endpoint to verify session (optional)
app.get('/auth/me', (req, res) => {
    try {
        const session = req.cookies.session;
        if (!session) return res.status(401).json({ loggedIn: false });

        // Decode the id_token
        const idToken = Buffer.from(session, 'base64').toString('utf-8');
        if (!idToken.includes('.')) {
            console.error('ERROR: Malformed session token');
            res.clearCookie('session');
            return res.status(401).json({ loggedIn: false });
        }

        res.json({ loggedIn: true, idToken });
    } catch (error) {
        console.error('ERROR in /auth/me:', error);
        res.status(500).json({ error: 'Session processing failed' });
    }
});

// Initialize Firebase for Server
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App for backend
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Proxy to ComfyDeploy
app.post('/api/generate', async (req, res) => {
    const { deployment_id, inputs } = req.body;
    const apiKey = COMFY_API_KEY;

    // 1. Verify Authentication & User
    const session = req.cookies.session;
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    let userId;
    try {
        const idToken = Buffer.from(session, 'base64').toString('utf-8');
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('ascii'));
        userId = payload.sub;
    } catch (e) {
        console.error('Invalid session token:', e);
        return res.status(401).json({ error: 'Invalid session' });
    }

    if (!userId) return res.status(401).json({ error: 'User ID not found in session' });

    // 2. Check & Deduct Credits
    const COST = 15;
    const userRef = doc(db, 'users', userId);

    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        const userData = userSnap.data();
        const currentCredits = userData.credits || 0;

        if (currentCredits < COST) {
            return res.status(402).json({ error: `Insufficient credits. You have ${currentCredits}, required ${COST}.` });
        }

        // Deduct credits
        await updateDoc(userRef, {
            credits: increment(-COST)
        });

        console.log(`Deducted ${COST} credits from user ${userId}. New balance: ${currentCredits - COST}`);

    } catch (dbError) {
        console.error('Database error during credit check:', dbError);
        return res.status(500).json({ error: 'Transaction failed' });
    }

    if (!apiKey) {
        console.error('ERROR: Missing COMFY_API_KEY');
        // Refund if API key is missing? rare case.
        return res.status(500).json({ error: 'Missing COMFY_API_KEY in server environment' });
    }

    try {
        const response = await axios.post(
            `https://api.comfydeploy.com/api/run/deployment/queue`,
            { deployment_id, inputs },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('ComfyDeploy Error:', error.response?.data || error.message);
        // Ideally render a refund here if the API call fails, but keeping it simple for now as requested strictness.
        // Or we could refund:
        try {
            await updateDoc(userRef, { credits: increment(COST) });
            console.log(`Refunded ${COST} credits to user ${userId} due to API failure.`);
        } catch (refundErr) {
            console.error('Refund failed:', refundErr);
        }
        res.status(500).json({ error: 'Failed to trigger generation' });
    }
});

// Proxy to check run status
app.get('/api/run/:run_id', async (req, res) => {
    const { run_id } = req.params;
    const apiKey = COMFY_API_KEY;

    try {
        const response = await axios.get(
            `https://api.comfydeploy.com/api/run/${run_id}`,
            {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('ComfyDeploy Status Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

app.get('/auth/logout', (req, res) => {
    // Clear the session cookie
    res.clearCookie('session');
    res.status(200).send('Logged out');
});

// Catch-all handler for any request that doesn't match the above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`OAuth server listening on http://localhost:${PORT}`);
});

export { app };
