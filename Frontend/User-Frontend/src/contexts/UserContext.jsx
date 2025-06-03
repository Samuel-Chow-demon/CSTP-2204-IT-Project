import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Import AuthContext to access user UID
import { userDb } from "../firebase"; // Import Firestore instance
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext); // Custom hook to access the UserContext
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth(); // Get user data from AuthContext
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch the username from Firestore using the uid from AuthContext
        const userDocRef = doc(userDb, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData({
            uid: user.uid,
            username: userDoc.data().username,
          });
        }
      }
    };

    fetchUserData();
  }, [user]); // Fetch user data whenever the user changes (e.g. login or logout)

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
};
