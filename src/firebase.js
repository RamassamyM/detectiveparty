import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, update, remove, push } from 'firebase/database'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredKeys = [
  'apiKey',
  'authDomain',
  'databaseURL',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

const isFirebaseConfigured = requiredKeys.every((k) => Boolean(firebaseConfig[k]))

let app = null
export let db = null
export let auth = null
export let googleProvider = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  } catch (e) {
    console.error('Firebase init failed. Check VITE_FIREBASE_* env vars.', e)
  }
} else {
  console.warn('Firebase not configured (missing VITE_FIREBASE_*). Running in no-op mode.')
}

// ── Auth helpers ──────────────────────────────
export const loginWithGoogle = () => {
  if (!auth || !googleProvider) throw new Error('Firebase auth not configured')
  return signInWithPopup(auth, googleProvider)
}
export const logout = () => {
  if (!auth) return Promise.resolve()
  return signOut(auth)
}
export const onAuth = (cb) => {
  if (!auth) {
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(auth, cb)
}

// ── Database helpers ──────────────────────────
export const dbRef = (path) => {
  if (!db) throw new Error('Firebase database not configured')
  return ref(db, path)
}
export const dbSet = (path, val) => {
  if (!db) throw new Error('Firebase database not configured')
  return set(ref(db, path), val)
}
export const dbGet = async (path) => {
  if (!db) return null
  const snap = await get(ref(db, path))
  return snap.exists() ? snap.val() : null
}
export const dbUpdate = (path, val) => {
  if (!db) throw new Error('Firebase database not configured')
  return update(ref(db, path), val)
}
export const dbRemove = (path) => {
  if (!db) throw new Error('Firebase database not configured')
  return remove(ref(db, path))
}
export const dbListen = (path, cb) => {
  if (!db) {
    cb(null)
    return () => {}
  }
  return onValue(ref(db, path), (snap) => cb(snap.exists() ? snap.val() : null))
}
export const dbPush = (path, val) => {
  if (!db) throw new Error('Firebase database not configured')
  return push(ref(db, path), val)
}
