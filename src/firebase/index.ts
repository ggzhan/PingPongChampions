
'use client';

import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This check ensures Firebase is only initialized on the client side.
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);

  // Use a try/catch block to gracefully handle environments where emulators are not running.
  // This is the standard approach for robust emulator connections.
  try {
    // @ts-ignore - This is a safe way to check for an existing emulator connection.
    if (!auth.emulatorConfig) {
        connectAuthEmulator(auth, '127.0.0.1', 9099, { disableWarnings: true });
    }
    // @ts-ignore - This is a safe way to check for an existing emulator connection.
    if (!(db as any)._settings.host) {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
  } catch (e) {
      console.warn("Could not connect to Firebase emulators. This is expected in production.", e);
  }
}

// Export the initialized services and the config.
export { app, auth, db, firebaseConfig };
export * from './provider';
