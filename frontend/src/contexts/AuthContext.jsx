import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { userApp } from "../firebase"; 

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext); // Custom hook to access the AuthContext
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state to show the loader while auth state is being checked

  const auth = getAuth(userApp); // Initialize Firebase Authentication

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid, // Store uid from Firebase Auth
          email: authUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false); // Stop loading once the auth state is resolved
    });

    return unsubscribe; // Cleanup on unmount
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
