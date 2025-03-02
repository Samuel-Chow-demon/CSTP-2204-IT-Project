import React, { useState } from "react";
import StatsBar from "../StatsBar/StatsBar";
import "./ParkingDashboard.css";

function ParkingDashboard() {
  const [parkingName] = useState("Walmart, Grandview Hwy");
  const [time] = useState("9:41 AM");
  const [totalSpots] = useState(25);
  const [availableSpots] = useState(12);
  const [address] = useState("1234 Grandview Highway, Vancouver, BC");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        alert("Address copied to clipboard!");
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="parking-dashboard-container">
      {/* TOP BAR */}
      <div className="top-bar">
        <button className="back-button">
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="header">{parkingName}</div>
        <button className="save-button">
          <i className="bi bi-save"></i>
        </button>
      </div>

      {/* STATS BAR */}
      <StatsBar
        totalSpots={totalSpots}
        availableSpots={availableSpots}
        time={time}
      />

      {/* LIVE STREAM */}
      <div className="live-stream">
        <img src="w" alt="live stream" />
      </div>

      {/* ADDRESS BUTTON */}
      <div className="address-button">
        <button className="copy-address" onClick={handleCopyAddress}>
          Copy Address
        </button>
      </div>
    </div>
  );
}

export default ParkingDashboard;
