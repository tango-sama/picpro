import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Email/Password Signup
export async function handleSignup(req, res) {
    try {
        const { email, password, name } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' })
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' })
        }

        // Initialize Firebase
        const { initializeApp } = await import('firebase/app')
        const { getFirestore, collection, query, where, getDocs, setDoc, doc, serverTimestamp } = await import('firebase/firestore')

        const firebaseConfig = {
            apiKey: process.env.VITE_FIREBASE_API_KEY,
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.VITE_FIREBASE_APP_ID
        }

        const firebaseApp = initializeApp(firebaseConfig, 'auth-signup-' + Date.now())
        const db = getFirestore(firebaseApp)

        // Check if user already exists
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('email', '==', email.toLowerCase()))
        const existingUsers = await getDocs(q)

        if (!existingUsers.empty) {
            return res.status(400).json({ error: 'User already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user ID
        const userId = crypto.randomUUID()

        // Create user document
        await setDoc(doc(db, 'users', userId), {
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name || email.split('@')[0],
            credits: 200,
            createdAt: serverTimestamp(),
            authMethod: 'email'
        })

        // Create JWT token
        const token = jwt.sign({
            sub: userId,
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            picture: null
        }, JWT_SECRET, { expiresIn: '7d' })

        // Set session cookie
        res.cookie('session', Buffer.from(token).toString('base64'), {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        })

        res.json({ success: true, user: { uid: userId, email: email.toLowerCase(), name: name || email.split('@')[0] } })
    } catch (error) {
        console.error('Signup error:', error)
        res.status(500).json({ error: 'Signup failed' })
    }
}

// Email/Password Login
export async function handleLogin(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' })
        }

        // Initialize Firebase
        const { initializeApp } = await import('firebase/app')
        const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore')

        const firebaseConfig = {
            apiKey: process.env.VITE_FIREBASE_API_KEY,
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.VITE_FIREBASE_APP_ID
        }

        const firebaseApp = initializeApp(firebaseConfig, 'auth-login-' + Date.now())
        const db = getFirestore(firebaseApp)

        // Find user by email
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('email', '==', email.toLowerCase()))
        const userDocs = await getDocs(q)

        if (userDocs.empty) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const userDoc = userDocs.docs[0]
        const userData = userDoc.data()

        // Check if user uses email/password auth
        if (userData.authMethod !== 'email') {
            return res.status(400).json({ error: 'Please use Google Sign-In for this account' })
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, userData.password)

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Create JWT token
        const token = jwt.sign({
            sub: userDoc.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture || null
        }, JWT_SECRET, { expiresIn: '7d' })

        // Set session cookie
        res.cookie('session', Buffer.from(token).toString('base64'), {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        })

        res.json({ success: true, user: { uid: userDoc.id, email: userData.email, name: userData.name } })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Login failed' })
    }
}
