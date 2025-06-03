import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { ParkingProvider } from "./contexts/ParkingContext";

import LoginSignup from "./components/LoginSignup/LoginSignup";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import SearchResults from "./components/Search/SearchResults";
import DashboardStream from "./components/Streaming/DashboardStream";
import StreamViewer from "./components/Streaming/StreamViewer";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <AuthProvider>
      <UserProvider>
        <ParkingProvider>
          <Router>
            <div className="App">
              {!isAuthenticated ? (
                <Routes>
                  <Route path="*" element={<LoginSignup onLoginSuccess={handleLoginSuccess} />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/dashboard-stream" element={<DashboardStream />} />
                  <Route path="/stream" element={<StreamViewer />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </div>
          </Router>
        </ParkingProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
