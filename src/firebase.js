import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByMjNCFY5EyljAc4C1DMMeLgHxl2H-10Y",
  authDomain: "velarii.firebaseapp.com",
  projectId: "velarii",
  storageBucket: "velarii.appspot.com",
  messagingSenderId: "855345885467",
  appId: "1:855345885467:web:bca89af3d89e25557de3be"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
