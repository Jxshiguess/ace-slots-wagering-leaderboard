
import type { LeaderboardEntry } from '@/types/leaderboard';
import { db } from './firebase'; // Import Firestore instance
import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';

export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardCol = collection(db, 'leaderboard');
    // Order by wagerAmount descending, limit to 15 entries (configurable)
    const q = query(leaderboardCol, orderBy('wagerAmount', 'desc'), limit(15));

    const querySnapshot = await getDocs(q);
    const data: LeaderboardEntry[] = [];

    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      data.push({
        id: doc.id,
        username: docData.username as string,
        wagerAmount: docData.wagerAmount as number,
        // Use stored avatar if available, otherwise generate placeholder
        avatar: docData.avatar || `https://placehold.co/40x40.png?text=${(docData.username as string).substring(0,2).toUpperCase()}`
      });
    });
    
    return data;

  } catch (error) {
    console.error("Error fetching leaderboard data from Firestore:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch leaderboard data from Firestore: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching leaderboard data from Firestore.");
  }
}

// Optional: Function to add a new leaderboard entry
// You can call this function from your application logic where new scores are generated.
export async function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'avatar'> & { avatar?: string }): Promise<string> {
  try {
    const leaderboardCol = collection(db, 'leaderboard');
    // Ensure avatar is either provided or defaults to a placeholder logic if needed before saving
    // For simplicity, this example assumes avatar URL is provided or handled elsewhere if needed
    const docRef = await addDoc(leaderboardCol, {
      ...entry,
      avatar: entry.avatar || `https://placehold.co/40x40.png?text=${entry.username.substring(0,2).toUpperCase()}`
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding leaderboard entry to Firestore:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to add leaderboard entry: ${error.message}`);
    }
    throw new Error("An unknown error occurred while adding leaderboard entry.");
  }
}
