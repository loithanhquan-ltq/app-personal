"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Place, Memory } from "@/data";

interface Props {
  places: Place[];
  memories: Memory[];
}

// Deduplicate places by lat/lng for polyline route
function uniqueCoords(places: Place[]): [number, number][] {
  const seen = new Set<string>();
  return places
    .map((p): [number, number] => [p.lat, p.lng])
    .filter(([lat, lng]) => {
      const key = `${lat},${lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export default function VietnamMap({ places, memories }: Props) {
  const routeCoords = uniqueCoords(places);
  const memsByPlace: Record<string, number> = {};
  memories.forEach((m) => { memsByPlace[m.placeId] = (memsByPlace[m.placeId] || 0) + 1; });

  const uniquePlaces = places.filter((p, i, arr) => arr.findIndex((x) => x.lat === p.lat && x.lng === p.lng) === i);

  return (
    <MapContainer
      center={[10.8, 107.5]}
      zoom={6}
      style={{ height: 400, width: "100%" }}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <Polyline
        positions={routeCoords}
        pathOptions={{ color: "#a44a2a", opacity: 0.55, dashArray: "5 5", weight: 2 }}
      />
      {uniquePlaces.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={8}
          pathOptions={{ fillColor: "#a44a2a", fillOpacity: 0.85, color: "#fff", weight: 2 }}
        >
          <Popup>
            <div style={{ fontFamily: "system-ui", fontSize: 13 }}>
              <strong>{p.label}</strong><br />
              <span style={{ color: "#888", fontSize: 11 }}>{p.country}</span><br />
              <span style={{ fontSize: 11 }}>{memsByPlace[p.id] ?? 0} memories</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
