import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy, 
  limit, 
  Timestamp, 
  deleteDoc,
  getDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";

export interface ReadingRecord {
  id: string;
  question: string;
  hexagramName: string;
  hexagramNumber: number;
  changingLines: number[];
  report: string;
  coreReflection: string;
  tags: string[];
  sentiment: string;
  questionType?: string;
  primaryTheme?: string;
  createdAt: any;
  isStarred: boolean;
  userNote: string | null;
  dialogueCount: number;
  source: "local_migrated" | "cloud_created";
}

export interface InsightReport {
  id: string;
  type: "third_hint" | "five_card" | "ten_report_preview" | "ten_report_full";
  title: string;
  content: string;
  structuredData: any;
  relatedReadingIds: string[];
  isPaid: boolean;
  createdAt: any;
}

const MAX_FREE_READINGS = 5;

export const saveInsightReport = async (userId: string, report: Omit<InsightReport, "id">) => {
  const path = `users/${userId}/insightReports`;
  try {
    const newDocRef = doc(collection(db, path));
    await setDoc(newDocRef, {
      ...report,
      createdAt: Timestamp.now()
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getInsightReports = async (userId: string) => {
  const path = `users/${userId}/insightReports`;
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InsightReport));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getUserReadings = async (userId: string) => {
  const path = `users/${userId}/readings`;
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReadingRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const saveReading = async (userId: string, reading: Omit<ReadingRecord, "id">, isVip: boolean = false) => {
  const path = `users/${userId}/readings`;
  try {
    const readings = await getUserReadings(userId);
    
    if (!isVip && readings.length >= MAX_FREE_READINGS) {
      // Find the oldest one to delete
      const oldest = readings[readings.length - 1];
      await deleteDoc(doc(db, `users/${userId}/readings/${oldest.id}`));
    }

    const newDocRef = doc(collection(db, path));
    await setDoc(newDocRef, {
      ...reading,
      createdAt: Timestamp.now()
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const migrateLocalReadings = async (userId: string, localReadings: any[]) => {
  const path = `users/${userId}/readings`;
  const userRef = doc(db, 'users', userId);
  
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists() && userDoc.data().localMigrationCompleted) {
      return;
    }

    const batch = writeBatch(db);
    
    // Take only the last 5 if not VIP (simplified assumption for migration)
    const toMigrate = localReadings.slice(0, 5);
    
    toMigrate.forEach(record => {
      const newDocRef = doc(collection(db, path));
      batch.set(newDocRef, {
        question: record.question || "",
        hexagramName: record.hexagramName || "未知",
        hexagramNumber: record.hexagramNumber || 0,
        changingLines: record.lines || [],
        report: record.interpretation || "",
        coreReflection: record.interpretation?.substring(0, 100) || "",
        tags: [],
        sentiment: "neutral",
        createdAt: Timestamp.fromMillis(record.timestamp || Date.now()),
        isStarred: false,
        userNote: null,
        dialogueCount: 0,
        source: "local_migrated"
      });
    });

    batch.update(userRef, { localMigrationCompleted: true });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const initializeUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
        subscriptionTier: "free",
        subscriptionExpiresAt: null,
        totalReadings: 0,
        firstReadingAt: null,
        lastReadingAt: null,
        localMigrationCompleted: false
      });
    } else {
      await updateDoc(userRef, {
        lastActiveAt: Timestamp.now()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
};
