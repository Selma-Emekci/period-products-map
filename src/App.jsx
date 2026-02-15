import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import locations from "./locations.json";

// Fix default marker icons (Vite + Leaflet)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(s1 + Math.cos(lat1) * Math.cos(lat2) * s2));
  return R * c;
}

function formatDistance(km) {
  if (km == null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function openInMaps(address, lat, lng) {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  if (isIOS) {
    const url = `https://maps.apple.com/?daddr=${encodeURIComponent(
      `${lat},${lng}`
    )}&q=${encodeURIComponent(address)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${lat},${lng}`
    )}&travelmode=walking`;
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export default function App() {
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [selectedId, setSelectedId] = useState(locations?.[0]?.id ?? null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeoError(err?.message || "Location permission denied."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  const enriched = useMemo(() => {
    if (!userPos) return locations.map((l) => ({ ...l, km: null }));
    return locations
      .map((l) => ({ ...l, km: haversineKm(userPos, { lat: l.lat, lng: l.lng }) }))
      .sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9));
  }, [userPos]);

  const selected = useMemo(
    () => enriched.find((l) => l.id === selectedId) || enriched[0] || null,
    [enriched, selectedId]
  );

  const mapCenter = selected
    ? [selected.lat, selected.lng]
    : userPos
    ? [userPos.lat, userPos.lng]
    : [37.7749, -122.4194];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", height: "100vh" }}>
      <aside style={{ padding: 16, borderRight: "1px solid #eee", overflow: "auto" }}>
        <h2 style={{ margin: "0 0 6px" }}>🌸 Free Period Products Near Me</h2>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
        </div>

        {geoError && (
          <div style={{ padding: 12, background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: 12 }}>
            <strong>Location:</strong> {geoError}
            <div style={{ fontSize: 13, marginTop: 6 }}>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {enriched.map((l) => {
            const active = l.id === (selected?.id ?? selectedId);
            return (
              <div
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: active ? "2px solid #ff5fa2" : "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800 }}>{l.name}</div>
                <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>{l.address}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                  {l.km != null ? <b>{formatDistance(l.km)} away</b> : "Distance unknown"}
                </div>

                {active && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <div style={{ color: "#333" }}>{l.notes}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(l.address, l.lat, l.lng);
                      }}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: "1px solid #222",
                        background: "#222",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      Open Directions in Maps
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#777" }}>
          Map data © OpenStreetMap contributors.
        </div>
      </aside>

      <main style={{ height: "100%", width: "100%" }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <Recenter center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userPos && (
            <Marker position={[userPos.lat, userPos.lng]}>
              <Popup>Your location</Popup>
            </Marker>
          )}

          {enriched.map((l) => (
            <Marker key={l.id} position={[l.lat, l.lng]} eventHandlers={{ click: () => setSelectedId(l.id) }}>
              <Popup>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{l.name}</div>
                <div style={{ fontSize: 13, marginBottom: 10 }}>{l.address}</div>
                <button
                  onClick={() => openInMaps(l.address, l.lat, l.lng)}
                  style={{
                    width: "100%",
                    padding: "9px 10px",
                    borderRadius: 12,
                    border: "1px solid #222",
                    background: "#222",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Open in Maps
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
