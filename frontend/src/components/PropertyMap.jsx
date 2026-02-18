import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

// fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function PropertyMap({ link }) {
  const coords = useMemo(() => {
    if (!link) return null;

    const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (!match) return null;

    return [parseFloat(match[1]), parseFloat(match[2])];
  }, [link]);

  if (!coords) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Map location not available
      </div>
    );
  }

  return (
    <MapContainer
      center={coords}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "14px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coords}>
        <Popup>Property Location</Popup>
      </Marker>
    </MapContainer>
  );
}
