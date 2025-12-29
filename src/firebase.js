import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDA41xrlhiufQgEPu1rtg0uTzaPHPKBlFs",
  authDomain: "chancha-f052c.firebaseapp.com",
  projectId: "chancha-f052c",
  storageBucket: "chancha-f052c.firebasestorage.app",
  messagingSenderId: "212584059178",
  appId: "1:212584059178:web:59fdfbe4a6c735421b4e53",
  measurementId: "G-D1HZ9YBNT4",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
