import { adminDb } from '../firebase'; // Correct import path from firebase.js
import { collection } from 'firebase/firestore';

// Admin-specific collections
const USER_DB_NAME = "PARKING_SITE_OWNER"; // Admin-specific collection
const userCollectionRef = collection(adminDb, USER_DB_NAME);

const LOCATION_RES_DB_NAME = "LOCATION_RES"; // Location resources collection
const locationResCollectionRef = collection(adminDb, LOCATION_RES_DB_NAME);

const STREAM_RES_DB_NAME = "STREAM_RES"; // Streaming resources collection
const streamResCollectionRef = collection(adminDb, STREAM_RES_DB_NAME);

export {
  userCollectionRef,
  USER_DB_NAME,
  locationResCollectionRef,
  LOCATION_RES_DB_NAME,
  streamResCollectionRef,
  STREAM_RES_DB_NAME
};
