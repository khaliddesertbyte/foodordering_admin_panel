// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyBQ7jxUPdHT3YLjjnsbVqL4Eo6dDh627bo",
  authDomain: "foodorderingadminpanel.firebaseapp.com",
  projectId: "foodorderingadminpanel",
  storageBucket: "foodorderingadminpanel.appspot.com",
  messagingSenderId: "447814699523",
  appId: "1:447814699523:web:7663fc791a0aa8e0525c36",
  measurementId: "G-J5B50M3K27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
