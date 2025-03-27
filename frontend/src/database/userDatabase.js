// userDatabase.js
import { userDb } from '../firebase.js'; // Import the user-side Firestore database
import { collection } from 'firebase/firestore';

const USER_DB_NAME = "PARKING_SITE_CUSTOMER"; // User-specific collection
const userCollectionRef = collection(userDb, USER_DB_NAME);

const LOCATION_RES_DB_NAME = "LOCATION_RES"; // Location resources collection
const locationResCollectionRef = collection(userDb, LOCATION_RES_DB_NAME);

const STREAM_RES_DB_NAME = "STREAM_RES"; // Streaming resources collection
const streamResCollectionRef = collection(userDb, STREAM_RES_DB_NAME);

export {
  userCollectionRef,
  USER_DB_NAME,
  locationResCollectionRef,
  LOCATION_RES_DB_NAME,
  streamResCollectionRef,
  STREAM_RES_DB_NAME
};
