import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminDb } from '../firebase'; // Admin-side Firebase instance
import { collection, getDocs } from 'firebase/firestore';

const ParkingContext = createContext();

export const useParking = () => {
  return useContext(ParkingContext);
};

export const ParkingProvider = ({ children }) => {
  const [locationData, setLocationData] = useState(null);
  const [streamData, setStreamData] = useState(null);

  useEffect(() => {
    // Fetch the parking location data and stream data
    const fetchParkingData = async () => {
      const locationSnapshot = await getDocs(collection(adminDb, 'LOCATION_RES'));
      const streamSnapshot = await getDocs(collection(adminDb, 'STREAM_RES'));
      
      // Format data from Firebase
      const locations = locationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const streams = streamSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLocationData(locations);
      setStreamData(streams);
    };

    fetchParkingData();
  }, []);

  return (
    <ParkingContext.Provider value={{ locationData, streamData }}>
      {children}
    </ParkingContext.Provider>
  );
};
