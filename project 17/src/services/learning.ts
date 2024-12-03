import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LearningMaterial } from '../types/database';
import { calculateKIU } from '../utils/kiu';

export async function saveLearningMaterial(data: Omit<LearningMaterial, 'id' | 'date'>) {
  try {
    const materialsRef = collection(db, 'learning_materials');
    const kiu = calculateKIU(data.text);
    
    const docRef = await addDoc(materialsRef, {
      ...data,
      kiu,
      date: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving learning material:', error);
    throw new Error('Failed to save learning material');
  }
}

export async function getLearningMaterials(userId: string): Promise<LearningMaterial[]> {
  try {
    const materialsRef = collection(db, 'learning_materials');
    const q = query(materialsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    } as LearningMaterial));
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    throw new Error('Failed to fetch learning materials');
  }
}