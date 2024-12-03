import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { SignUpData, SignInData, User } from '../types/auth';

export async function signUp({ email, password, firstName, lastName }: SignUpData): Promise<void> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
    
    await setDoc(doc(db, 'users', user.uid), {
      email: email.toLowerCase(),
      firstName,
      lastName,
      createdAt: new Date()
    });

    // Send verification email
    await sendEmailVerification(user);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email already in use');
    }
    throw new Error('Failed to create account');
  }
}

export async function signIn({ email, password }: SignInData): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password');
    }
    throw new Error('Failed to sign in');
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error('Failed to sign out');
  }
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error('Failed to send verification email');
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      if (!userData) {
        callback(null);
        return;
      }

      callback({
        uid: firebaseUser.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailVerified: firebaseUser.emailVerified
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      callback(null);
    }
  });
}

export async function updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Update email in Firebase Auth if provided
    if (data.email && data.email !== user.email) {
      await updateEmail(user, data.email);
      // Send verification email for new email address
      await sendEmailVerification(user);
    }

    // Update user data in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      ...(data.email && { email: data.email.toLowerCase() })
    });
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please sign in again to update your email');
    }
    throw new Error('Failed to update profile');
  }
}