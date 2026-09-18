import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { User, MedicalDocument, TimelineEvent, Medication, DoctorQuestion } from "../types";

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Initialize Firestore with configured database ID
export const firestore = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || "(default)"
);

// Connection test helper per skill requirement
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestore, "test", "connection"));
    console.log("[Firebase] Firestore connection test successful.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Client is offline or database initializing.");
    } else {
      console.log("[Firebase] Connection check completed.");
    }
    return false;
  }
}

// Immediately run connection test
testFirestoreConnection();

/**
 * Sign in using Google OAuth Popup
 */
export async function signInWithGoogle(): Promise<{ firebaseUser: FirebaseUser; user: User }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    const user: User = {
      id: fbUser.uid,
      name: fbUser.displayName || "Patient",
      email: fbUser.email || "",
      created_at: new Date().toISOString(),
    };

    // Upsert user profile into Firestore
    await setDoc(doc(firestore, "users", fbUser.uid), {
      name: user.name,
      email: user.email,
      updated_at: new Date().toISOString(),
    }, { merge: true });

    return { firebaseUser: fbUser, user };
  } catch (error: any) {
    console.error("[Firebase] Google sign-in failed:", error);
    throw error;
  }
}

/**
 * Sign out of Firebase
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Save user document to Firestore
 */
export async function saveDocumentToFirestore(userId: string, document: MedicalDocument): Promise<void> {
  try {
    const docRef = doc(firestore, "users", userId, "documents", document.id);
    await setDoc(docRef, {
      ...document,
      markers: JSON.stringify(document.markers || []),
      analysis: JSON.stringify(document.analysis || {}),
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("[Firebase] Error saving document to Firestore:", err);
  }
}

/**
 * Load user documents from Firestore
 */
export async function loadDocumentsFromFirestore(userId: string): Promise<MedicalDocument[]> {
  try {
    const colRef = collection(firestore, "users", userId, "documents");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        markers: typeof data.markers === "string" ? JSON.parse(data.markers) : (data.markers || []),
        analysis: typeof data.analysis === "string" ? JSON.parse(data.analysis) : data.analysis,
      } as MedicalDocument;
    });
  } catch (err) {
    console.error("[Firebase] Error loading documents from Firestore:", err);
    return [];
  }
}

/**
 * Save timeline event to Firestore
 */
export async function saveTimelineEventToFirestore(userId: string, event: TimelineEvent): Promise<void> {
  try {
    const ref = doc(firestore, "users", userId, "timeline_events", event.id);
    await setDoc(ref, event, { merge: true });
  } catch (err) {
    console.error("[Firebase] Error saving timeline event to Firestore:", err);
  }
}

/**
 * Save doctor question to Firestore
 */
export async function saveDoctorQuestionToFirestore(userId: string, question: DoctorQuestion): Promise<void> {
  try {
    const ref = doc(firestore, "users", userId, "doctor_questions", question.id);
    await setDoc(ref, question, { merge: true });
  } catch (err) {
    console.error("[Firebase] Error saving doctor question to Firestore:", err);
  }
}

/**
 * Save medication to Firestore
 */
export async function saveMedicationToFirestore(userId: string, med: Medication): Promise<void> {
  try {
    const ref = doc(firestore, "users", userId, "medications", med.id);
    await setDoc(ref, med, { merge: true });
  } catch (err) {
    console.error("[Firebase] Error saving medication to Firestore:", err);
  }
}
