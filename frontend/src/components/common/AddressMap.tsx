"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface AddressMapProps {
  latitude?: number | null;
  longitude?: number | null;
  onCoordinateChange?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

// Component to update map center when coordinates change
function MapUpdater({ latitude, longitude }: { latitude?: number | null; longitude?: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function AddressMap({
  latitude,
  longitude,
  onCoordinateChange,
  height = "400px",
  className = "",
}: AddressMapProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const markerRef = useRef<L.Marker>(null);

  // Initialize marker position
  useEffect(() => {
    if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
      setMarkerPosition([latitude, longitude]);
    } else {
      // Default to US center if no coordinates
      setMarkerPosition([39.8283, -98.5795]);
    }
  }, [latitude, longitude]);

  // Default center (US center)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const center = markerPosition || defaultCenter;

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker && onCoordinateChange) {
      const position = marker.getLatLng();
      setMarkerPosition([position.lat, position.lng]);
      onCoordinateChange(position.lat, position.lng);
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setMarkerPosition([lat, lng]);
    if (onCoordinateChange) {
      onCoordinateChange(lat, lng);
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={markerPosition ? 15 : 4}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater latitude={latitude} longitude={longitude} />
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={!!onCoordinateChange}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
            ref={markerRef}
          />
        )}
        {onCoordinateChange && (
          <MapClickHandler onMapClick={handleMapClick} />
        )}
      </MapContainer>
    </div>
  );
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap();

  useEffect(() => {
    map.on("click", onMapClick);
    return () => {
      map.off("click", onMapClick);
    };
  }, [map, onMapClick]);

  return null;
}

