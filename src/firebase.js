// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration
//
// Firestore Koleksiyon Yapısı (Schema):
//
// Collection: "events"
//   Document ID: otomatik (push key)
//   Fields:
//     title       : string        — Etkinlik başlığı
//     date        : Timestamp     — Etkinlik tarihi
//     description : string        — Kısa açıklama
//     photos      : string[]      — Fotoğraf URL'leri (Storage veya harici)
//     rating      : number|null   — 1-10 puan (alt etkinlik yoksa kullanıcı girer)
//     order       : number        — Sıralama için (isteğe bağlı)
//
//   Sub-collection: "subEvents"  (events/{eventId}/subEvents/{subId})
//     title       : string
//     description : string
//     photos      : string[]
//     rating      : number|null   — 1-10, Tuanna tarafından girilir
//     order       : number
//
// Collection: "wishes"
//   Document ID: otomatik
//   Fields:
//     text        : string        — İstek metni
//     createdAt   : Timestamp     — Gönderim zamanı
//
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAbTH4tsY0HkWFi4dlNpCM6IIHftiEwu9o",
  authDomain: "tuanna-f9e77.firebaseapp.com",
  projectId: "tuanna-f9e77",
  storageBucket: "tuanna-f9e77.firebasestorage.app",
  messagingSenderId: "311225408623",
  appId: "1:311225408623:web:a6702645c095747749019a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)