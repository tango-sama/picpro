import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

/**
 * Get next sequential user number using Firestore transaction
 * This ensures atomicity and prevents duplicate numbers
 * 
 * @param {Firestore} db - Firestore database instance
 * @returns {Promise<number>} Next available user number
 */
export async function getNextUserNumber(db) {
    const counterRef = doc(db, 'metadata', 'counters');

    try {
        const userNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            if (!counterDoc.exists()) {
                // Initialize counter if it doesn't exist
                transaction.set(counterRef, {
                    nextUserNumber: 2,
                    totalUsers: 1,
                    lastUpdated: serverTimestamp(),
                    createdAt: serverTimestamp()
                });
                console.log('📊 Initialized user counter at 1');
                return 1;
            }

            const currentNumber = counterDoc.data().nextUserNumber;

            // Increment for next user
            transaction.update(counterRef, {
                nextUserNumber: currentNumber + 1,
                totalUsers: currentNumber,
                lastUpdated: serverTimestamp()
            });

            console.log(`📊 Assigned user number: ${currentNumber}`);
            return currentNumber;
        });

        return userNumber;
    } catch (error) {
        console.error('Error getting user number:', error);
        // Fallback: return null if transaction fails
        return null;
    }
}

/**
 * Format user number as display ID
 * 
 * @param {number} userNumber - Sequential user number
 * @returns {string} Formatted display ID (e.g., "USER_0001")
 */
export function formatUserDisplayId(userNumber) {
    if (!userNumber) return null;
    return `USER_${String(userNumber).padStart(4, '0')}`;
}

/**
 * Initialize counter document (one-time setup)
 * Call this once when setting up the database
 * 
 * @param {Firestore} db - Firestore database instance
 */
export async function initializeUserCounter(db) {
    const counterRef = doc(db, 'metadata', 'counters');

    try {
        const counterDoc = await getDoc(counterRef);

        if (!counterDoc.exists()) {
            await setDoc(counterRef, {
                nextUserNumber: 1,
                totalUsers: 0,
                lastUpdated: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            console.log('✅ User counter initialized successfully');
        } else {
            console.log('ℹ️ User counter already exists');
        }
    } catch (error) {
        console.error('Error initializing counter:', error);
    }
}

/**
 * Get total user count from counter
 * 
 * @param {Firestore} db - Firestore database instance
 * @returns {Promise<number>} Total number of users
 */
export async function getTotalUserCount(db) {
    const counterRef = doc(db, 'metadata', 'counters');

    try {
        const counterDoc = await getDoc(counterRef);
        if (counterDoc.exists()) {
            return counterDoc.data().totalUsers || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error getting total user count:', error);
        return 0;
    }
}
