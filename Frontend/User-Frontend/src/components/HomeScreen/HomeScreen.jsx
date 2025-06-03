import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useParking } from "../../contexts/ParkingContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo.png";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import IconButton from "@mui/material/IconButton";
import "./HomeScreen.css";
import SearchBar from "../Search/SearchBar";

const HomeScreen = () => {
  const user = useUser();
  const { logout } = useAuth();
  const { locationData } = useParking();
  const [expandedLocation, setExpandedLocation] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (locationId) => {
    setExpandedLocation((prev) => (prev === locationId ? null : locationId));
  };

  const handleArrowClick = (location) => {
    navigate("/dashboard-stream", {
      state: {
        locationId: location.id,
        locationName: location.name,
        streamResID: location.streamResID || [],
      },
    });
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload(); // Reset back to login screen
  };

  return (
    <div className="home-container">
      {/* Header */}
      <div className="header-row">
        <div className="logo-col">
          <img src={logo} alt="JustPark Logo" className="logo" />
        </div>
        <div className="greeting-col">
          <span className="greeting">Hi, {user?.username || "User"}</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar-row">
        <SearchBar />
      </div>

      {/* Parking Cards */}
      <div className="card-wrapper">
        <div className="locations">
          {locationData?.map((location) => (
            <div
              className={`location-card ${expandedLocation === location.id ? "expanded" : ""}`}
              key={location.id}
              onClick={() => handleCardClick(location.id)}
            >
              <div className="location-header">
                <div>
                  <div className="location-title">{location.name}</div>
                  <div className="location-address">{location.address}</div>
                </div>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card expand
                    handleArrowClick(location);
                  }}
                  className="arrow-btn"
                >
                  <ArrowForwardIosIcon style={{ fontSize: "1rem", color: "#6f268b" }} />
                </IconButton>
              </div>

              {expandedLocation === location.id && (
                <div className="parking-info">
                  {location.parkingSiteInfoJSON ? (
                    Object.entries(JSON.parse(location.parkingSiteInfoJSON)).map(
                      ([key, value]) => (
                        <div className="info-row" key={key}>
                          <span className="info-label">{key}:</span>
                          <span className="info-value">{value}</span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="info-row">No additional info available</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Logout Icon */}
      <IconButton className="logout-btn" onClick={handleLogout}>
        <ExitToAppIcon style={{ color: "#fff", fontSize: "2rem" }} />
      </IconButton>
    </div>
  );
};

export default HomeScreen;
