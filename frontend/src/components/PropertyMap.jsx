import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function extractCoords(link) {
  if (!link) return null;

  let match = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];

  match = link.match(/!4d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (match) return [parseFloat(match[2]), parseFloat(match[1])];

  match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];

  match = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];

  return null;
}


export default function PropertyMap({ link }) {
  const coords = useMemo(() => extractCoords(link), [link]);

  if (!coords) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Please paste full Google Maps link (Open map → Share → Copy link)
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
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coords}>
        <Popup>Property Location</Popup>
      </Marker>
    </MapContainer>
  );
}
