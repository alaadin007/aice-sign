import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Certificate } from '../types/database';
import { calculateKIU } from '../utils/kiu';

export interface CertificateData {
  name: string;
  email: string;
  title: string;
  score: number;
  date: Date;
  originalText: string;
  source?: {
    type: 'text' | 'youtube';
    id?: string;
    url?: string;
  };
}

export async function saveCertificate(data: CertificateData) {
  try {
    const kiu = calculateKIU(data.originalText);
    const certificatesRef = collection(db, 'certificates');
    
    const docRef = await addDoc(certificatesRef, {
      ...data,
      kiu,
      date: data.date,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw new Error('Failed to save certificate');
  }
}

export async function getCertificates(email: string): Promise<Certificate[]> {
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const certificatesRef = collection(db, 'certificates');
    const q = query(certificatesRef, where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    } as Certificate));
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw new Error('Failed to fetch certificates');
  }
}