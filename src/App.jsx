
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

export default function App() {
  return (
    <div style={{height: "100vh", display: "grid", placeItems: "center",
      background: "linear-gradient(135deg,#ffe6f2,#f0e6ff)"}}>
      <div style={{textAlign:"center"}}>
        <h1 style={{fontSize:"28px", marginBottom:"10px"}}>
          🌸 Free Period Products Near Me
        </h1>
        <p style={{color:"#555"}}>
          Your full version map is ready to customize in this project.
        </p>
        <div style={{height:"400px", width:"90vw", maxWidth:"900px",
          borderRadius:"20px", overflow:"hidden", marginTop:"20px",
          boxShadow:"0 20px 50px rgba(0,0,0,0.1)"}}>
          <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{height:"100%", width:"100%"}}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
