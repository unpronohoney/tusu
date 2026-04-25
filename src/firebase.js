import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbTH4tsY0HkWFi4dlNpCM6IIHftiEwu9o",
  authDomain: "tuanna-f9e77.firebaseapp.com",
  projectId: "tuanna-f9e77",
  storageBucket: "tuanna-f9e77.firebasestorage.app",
  messagingSenderId: "311225408623",
  appId: "1:311225408623:web:a6702645c095747749019a"
};

// Uygulamayı başlat
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Veritabanı ve Depolama referanslarını dışarı aktar
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const authReady = new Promise((resolve, reject) => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      unsub();
      resolve(user);
    }
  }, (err) => {
    unsub();
    reject(err);
  });

  if (!auth.currentUser) {
    signInAnonymously(auth).catch((err) => {
      console.error('anon auth failed', err);
      reject(err);
    });
  }
});
