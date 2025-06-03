import {db} from '../firebase.js'
import { collection } from 'firebase/firestore';

// Users Database
const USER_DB_NAME = "PARKING_SITE_OWNER";
const userCollectionRef = collection(db, USER_DB_NAME);

const LOCATION_RES_DB_NAME = "LOCATION_RES";
const locationResCollectionRef = collection(db, LOCATION_RES_DB_NAME);

const STREAM_RES_DB_NAME = "STREAM_RES";
const streamResCollectionRef = collection(db, STREAM_RES_DB_NAME);

export{
    userCollectionRef,
    USER_DB_NAME,
    locationResCollectionRef,
    LOCATION_RES_DB_NAME,
    streamResCollectionRef,
    STREAM_RES_DB_NAME
}