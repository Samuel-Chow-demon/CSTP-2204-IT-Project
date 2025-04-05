import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";
import "./StreamViewer.css";

const StreamViewer = () => {
  const { state } = useLocation();
  const user = useUser();
  const { streamId, streamName, locationName } = state || {};

  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState("Connecting...");
  const [detectionOn, setDetectionOn] = useState(false);
  const [parkingStats, setParkingStats] = useState({ occupied: 0, empty: 0 });

  useEffect(() => {
    if (!user || !streamId) return;

    const connectToStream = async () => {
      try {
        const response = await axios.post("http://localhost:8204/request-token", {
          accID: user.uid,
          expTime: 60,
        });

        const token = response.data.token;
        const ws = new WebSocket(
          `ws://localhost:8204/ws/${user.uid}/${streamId}/?token=${token}`
        );

        wsRef.current = ws;

        ws.onopen = () => {
          setStatus("Connected ✅");
          ws.send("DETECT_OFF");
        };

        ws.onmessage = (event) => {
          if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = function () {
              const arrayBuffer = reader.result;
              const dataView = new DataView(arrayBuffer);

              const numberOfData = dataView.getUint32(0);
              let offset = 4;

              if (numberOfData === 2) {
                const occupied = dataView.getUint32(offset);
                const empty = dataView.getUint32(offset + 4);
                setParkingStats({ occupied, empty });
                offset += 8;
              }

              const imageBytes = new Uint8Array(arrayBuffer, offset);
              const blob = new Blob([imageBytes], { type: "image/jpeg" });
              const imgUrl = URL.createObjectURL(blob);

              if (videoRef.current) {
                const oldUrl = videoRef.current.src;
                videoRef.current.src = imgUrl;
                if (oldUrl) URL.revokeObjectURL(oldUrl);
              }
            };
            reader.readAsArrayBuffer(event.data);
          } else {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === "error") {
                setStatus(`Error: ${msg.message}`);
              }
            } catch (e) {
              console.warn("Unknown message:", event.data);
            }
          }
        };

        ws.onclose = () => setStatus("Connection closed ❌");
        ws.onerror = () => setStatus("Error connecting 🚨");
      } catch (err) {
        console.error(err);
        setStatus("Failed to connect");
      }
    };

    connectToStream();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [streamId, user]);

  const handleToggleDetection = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const command = detectionOn ? "DETECT_OFF" : "DETECT_ON";
      wsRef.current.send(command);
      setDetectionOn(!detectionOn);
    }
  };

  const totalSpots = parkingStats.occupied + parkingStats.empty;
  const rushLevel = totalSpots === 0 ? "N/A" : Math.round((parkingStats.occupied / totalSpots) * 100);

  return (
    <div className="stream-viewer">
  <div className="stream-header">
    <h2>{locationName} - {streamName}</h2>
    <p className="stream-status">{status}</p>
  </div>

  <div className="stream-info-container">
    <div className="stream-card">
      <button onClick={handleToggleDetection} className="toggle-btn">
        {detectionOn ? "Disable Detection" : "Enable Detection"}
      </button>
      <div className="parking-info">
        <p>Total Spots: {totalSpots}</p>
        <p>Available: {parkingStats.empty}</p>
        <p>Occupied: {parkingStats.occupied}</p>
        <p>Rush Level: {rushLevel}%</p>
      </div>
    </div>

    <div className="zoom-wrapper">
      <img ref={videoRef} alt="Live Stream" className="stream-img zoomable" />
    </div>
  </div>
</div>

  );
};

export default StreamViewer;
