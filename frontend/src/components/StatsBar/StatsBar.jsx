import React from "react";
import "./StatsBar.css";
import { getBusyStatus } from "../../utils/helpers";

function StatsBar({ totalSpots = 25, availableSpots = 10, time = "9:41 AM" }) {
  const { label, color } = getBusyStatus(totalSpots, availableSpots);

  return (
    <div className="stats-bar">
      <div className="stats-row-top">
        <span 
          className="busy-stat" 
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
        <span className="time-label">{time}</span>
      </div>

      <div className="stats-row-bottom">
        <span className="total-spots-label">
          Total Spots: {totalSpots}
        </span>
        <span className="available-spots-label">
          Available Spots: {availableSpots}
        </span>
      </div>
    </div>
  );
}

export default StatsBar;
