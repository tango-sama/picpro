import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.VITE_GOOGLE_REDIRECT_URI; // e.g., http://localhost:5174

// Helper to generate a random state string
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

// Step 1: Initiate Google OAuth – redirect user to Google consent screen
app.get('/auth/google', (req, res) => {
    const state = generateState();
    // Store state in a temporary cookie for verification later
    res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax' });
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', `${REDIRECT_URI}/auth/google/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');
    res.redirect(authUrl.toString());
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
    const session = req.cookies.session;
    if (!session) return res.status(401).json({ loggedIn: false });
    // Decode the id_token (no verification for demo)
    const idToken = Buffer.from(session, 'base64').toString('utf-8');
    res.json({ loggedIn: true, idToken });
});

// Proxy to ComfyDeploy
app.post('/api/generate', async (req, res) => {
    const { deployment_id, inputs } = req.body;
    const apiKey = process.env.COMFY_DEPLOY_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Missing COMFY_DEPLOY_API_KEY in server environment' });
    }

    try {
        const response = await axios.post(
            `https://api.comfydeploy.com/api/run/deployment/${deployment_id}`,
            { inputs },
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
        res.status(500).json({ error: 'Failed to trigger generation' });
    }
});

// Proxy to check run status
app.get('/api/run/:run_id', async (req, res) => {
    const { run_id } = req.params;
    const apiKey = process.env.COMFY_DEPLOY_API_KEY;

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

app.listen(PORT, () => {
    console.log(`OAuth server listening on http://localhost:${PORT}`);
});
