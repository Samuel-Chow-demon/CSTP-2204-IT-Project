import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParking } from "../../contexts/ParkingContext";
import "./DashboardStream.css";

const DashboardStream = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { streamData } = useParking(); 

  const { locationName, streamResID = [] } = state || {};

  const getStreamById = (id) => streamData.find((stream) => stream.id === id);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </button>
        <h2 className="dashboard-title">{locationName}</h2>
      </div>

      <div className="stream-list">
        {streamResID.length === 0 ? (
          <p>No stream resources available.</p>
        ) : (
          streamResID.map((streamId) => {
            const stream = getStreamById(streamId);
            return (
              <div className="stream-card" key={streamId}>
                <h3 className="stream-name">{stream?.name || "Unnamed Stream"}</h3>
                <button
                    className="stream-btn"
                    onClick={() =>
                        navigate("/stream", {
                        state: {
                            streamId: stream.id,
                            streamName: stream.name,
                            locationName,
                        },
                        })
                    }
                    >
                    Connect to Stream
                </button>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardStream;
