import { collection, getDocs, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Migrate existing users without userNumber to assign them sequential numbers
 * Run this ONCE if you have existing users
 */
export async function migrateExistingUsers() {
    console.log('🔄 Starting user migration...');

    try {
        // Get all users
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        if (usersSnap.empty) {
            console.log('ℹ️ No users found to migrate');
            return;
        }

        // Sort by creation date (oldest first)
        const users = usersSnap.docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis() || 0;
            const bTime = b.data().createdAt?.toMillis() || 0;
            return aTime - bTime;
        });

        let nextUserNumber = 1;
        let migratedCount = 0;
        let skippedCount = 0;

        // First pass: find the highest existing user number
        for (const userDoc of users) {
            const userData = userDoc.data();
            if (userData.userNumber) {
                nextUserNumber = Math.max(nextUserNumber, userData.userNumber + 1);
            }
        }

        console.log(`📊 Starting migration from user number: ${nextUserNumber}`);

        // Second pass: assign numbers to users without them
        for (const userDoc of users) {
            const userData = userDoc.data();

            // Skip if already has userNumber
            if (userData.userNumber) {
                skippedCount++;
                console.log(`⏭️  Skipped: ${userData.profile?.email || userData.email} (already has #${userData.userNumber})`);
                continue;
            }

            // Assign user number
            const userDisplayId = `USER_${String(nextUserNumber).padStart(4, '0')}`;

            await updateDoc(userDoc.ref, {
                userNumber: nextUserNumber,
                userDisplayId: userDisplayId,
                updatedAt: serverTimestamp()
            });

            console.log(`✅ Migrated: ${userData.profile?.email || userData.email} → ${userDisplayId}`);
            migratedCount++;
            nextUserNumber++;
        }

        // Update counter document
        const counterRef = doc(db, 'metadata', 'counters');
        await setDoc(counterRef, {
            nextUserNumber: nextUserNumber,
            totalUsers: users.length,
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp()
        }, { merge: true });

        console.log('\n✅ Migration complete!');
        console.log(`   Total users: ${users.length}`);
        console.log(`   Migrated: ${migratedCount}`);
        console.log(`   Skipped (already had numbers): ${skippedCount}`);
        console.log(`   Next user number: ${nextUserNumber}`);

        return {
            total: users.length,
            migrated: migratedCount,
            skipped: skippedCount,
            nextUserNumber: nextUserNumber
        };

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
}

/**
 * Get user statistics from the database
 */
export async function getUserStatistics() {
    try {
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const stats = {
            totalUsers: usersSnap.size,
            withUserNumbers: 0,
            withoutUserNumbers: 0,
            authMethods: { google: 0, email: 0, other: 0 },
            subscriptionTiers: { free: 0, starter: 0, pro: 0, studio: 0 },
            totalCreditsInCirculation: 0,
            bannedUsers: 0,
            inactiveUsers: 0
        };

        usersSnap.forEach(doc => {
            const data = doc.data();

            // Count user numbers
            if (data.userNumber) {
                stats.withUserNumbers++;
            } else {
                stats.withoutUserNumbers++;
            }

            // Count auth methods
            const authMethod = data.authentication?.method || data.authMethod || 'other';
            if (authMethod === 'google') stats.authMethods.google++;
            else if (authMethod === 'email') stats.authMethods.email++;
            else stats.authMethods.other++;

            // Count subscription tiers
            const tier = data.billing?.subscriptionTier || 'free';
            stats.subscriptionTiers[tier] = (stats.subscriptionTiers[tier] || 0) + 1;

            // Sum credits
            const credits = data.billing?.credits ?? data.credits ?? 0;
            stats.totalCreditsInCirculation += credits;

            // Count banned/inactive
            if (data.status?.isBanned) stats.bannedUsers++;
            if (!data.status?.isActive) stats.inactiveUsers++;
        });

        return stats;
    } catch (error) {
        console.error('Error getting user statistics:', error);
        throw error;
    }
}

/**
 * List all users with their IDs (for admin purposes)
 */
export async function listAllUsers() {
    try {
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        const users = [];

        usersSnap.forEach(doc => {
            const data = doc.data();
            users.push({
                firebaseUid: doc.id,
                userNumber: data.userNumber || null,
                userDisplayId: data.userDisplayId || null,
                email: data.profile?.email || data.email,
                username: data.profile?.username || data.username,
                credits: data.billing?.credits ?? data.credits ?? 0,
                tier: data.billing?.subscriptionTier || 'free',
                authMethod: data.authentication?.method || data.authMethod,
                createdAt: data.createdAt?.toDate(),
                lastLogin: data.lastLogin?.toDate(),
                isActive: data.status?.isActive ?? true,
                isBanned: data.status?.isBanned ?? false
            });
        });

        // Sort by user number (null last)
        users.sort((a, b) => {
            if (a.userNumber === null) return 1;
            if (b.userNumber === null) return -1;
            return a.userNumber - b.userNumber;
        });

        return users;
    } catch (error) {
        console.error('Error listing users:', error);
        throw error;
    }
}
