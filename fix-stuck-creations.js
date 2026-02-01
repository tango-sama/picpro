// Fix Stuck Creations Script
// Run this to manually check and update creations stuck in "processing" status

import dotenv from 'dotenv'
import axios from 'axios'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

dotenv.config()

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
const COMFY_API_KEY = process.env.VITE_COMFY_DEPLOY_API_KEY

async function fixStuckCreations() {
    try {
        console.log('🔍 Scanning for stuck creations...\n')

        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'))

        let totalProcessing = 0
        let totalFixed = 0
        let totalFailed = 0

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id
            console.log(`\n👤 Checking user: ${userId}`)

            // Get processing creations
            const creationsRef = collection(db, `users/${userId}/creations`)
            const q = query(creationsRef, where('status', '==', 'processing'))
            const processingCreations = await getDocs(q)

            if (processingCreations.empty) {
                console.log('   ✅ No stuck creations')
                continue
            }

            console.log(`   ⏳ Found ${processingCreations.size} processing creation(s)`)

            for (const creationDoc of processingCreations.docs) {
                const creationData = creationDoc.data()
                const runId = creationData.runId

                if (!runId) {
                    console.log(`   ❌ Creation ${creationDoc.id} has no runId`)
                    continue
                }

                totalProcessing++

                console.log(`   📡 Checking run ID: ${runId}`)

                try {
                    // Check status in ComfyDeploy
                    const response = await axios.get(`https://api.comfydeploy.com/api/run/${runId}`, {
                        headers: { Authorization: `Bearer ${COMFY_API_KEY}` }
                    })

                    const data = response.data
                    console.log(`      Status: ${data.status}`)

                    if (data.status === 'success' && data.outputs) {
                        // Download and save image
                        console.log('      ✨ Image ready! Saving...')

                        // ComfyDeploy returns outputs as an object with arrays
                        let imageUrl
                        const outputValues = Object.values(data.outputs)
                        if (Array.isArray(outputValues[0])) {
                            imageUrl = outputValues[0][0] // First item in first array
                        } else {
                            imageUrl = outputValues[0] // Direct URL
                        }

                        console.log(`      📥 Downloading from: ${imageUrl}`)

                        const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' })
                        const buffer = Buffer.from(imageRes.data)

                        const storagePath = `users/${userId}/outputs/${runId}.png`
                        const storageRef = ref(storage, storagePath)
                        await uploadBytes(storageRef, buffer, { contentType: 'image/png' })
                        const downloadUrl = await getDownloadURL(storageRef)

                        await updateDoc(doc(db, `users/${userId}/creations`, creationDoc.id), {
                            outputUrl: downloadUrl,
                            status: 'completed',
                            completedAt: serverTimestamp()
                        })

                        console.log('      ✅ Fixed and saved!')
                        totalFixed++

                    } else if (data.status === 'failed') {
                        console.log('      ❌ Generation failed')

                        await updateDoc(doc(db, `users/${userId}/creations`, creationDoc.id), {
                            status: 'failed',
                            error: 'AI generation failed'
                        })

                        totalFailed++

                    } else {
                        console.log(`      ⏳ Still processing (${data.status})`)
                    }

                } catch (error) {
                    console.error(`      ❌ Error checking run:`, error.message)
                }

                // Wait a bit between API calls
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        console.log('\n' + '='.repeat(50))
        console.log('📊 Summary:')
        console.log(`   Total stuck creations found: ${totalProcessing}`)
        console.log(`   ✅ Fixed: ${totalFixed}`)
        console.log(`   ❌ Failed: ${totalFailed}`)
        console.log(`   ⏳ Still processing: ${totalProcessing - totalFixed - totalFailed}`)
        console.log('='.repeat(50) + '\n')

        process.exit(0)

    } catch (error) {
        console.error('❌ Script error:', error)
        process.exit(1)
    }
}

// Run the script
fixStuckCreations()
