import { useState, useEffect, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import AuthContext from "../context/AuthContext";
import { apiClient } from "../api/client"; // Ensure you have this API client
import styles from "./styles/Map.module.css";
import "leaflet/dist/leaflet.css";

// Fix missing marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom marker icons
const userOperatorIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue icon for user’s operator
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const otherOperatorIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red icon for other operators
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function Map() {
  const { auth } = useContext(AuthContext);
  const [tollStations, setTollStations] = useState([]);

  useEffect(() => {
    const fetchTollStations = async () => {
      try {
        const response = await apiClient.getOperatorsWithStations(auth.token);
        console.log(response);

        // Flatten data: Extract toll station info from each operator
        const stations = response.operatorsWithStations.flatMap(operator =>
          operator.tollstations.map(station => {
            // Find matching pass data for this station
            const incomingPassData = response.incomingPasses.find(pass => pass.tollid === station.TollID);
            const outgoingPassData = response.outgoingPasses.find(pass => pass.tollid === station.TollID);

            return {
              id: station.TollID,
              name: station.Name,
              latitude: station.Lat,
              longitude: station.Long,
              totalPasses: incomingPassData ? incomingPassData.totalpasses : 0, 
              totalRevenue: incomingPassData ? incomingPassData.totalrevenue : 0,
              outgoingPasses: outgoingPassData ? outgoingPassData.totalpasses : 0,
              outgoingRevenue: outgoingPassData ? outgoingPassData.totalrevenue : 0,
              user_opid: response.userOperatorId, // Store user's operator ID
              ts_opid: operator.operatorid, // Toll station's operator ID
              ts_opname: operator.operatorname,
            };
          })
        );

        setTollStations(stations);
      } catch (error) {
        console.error("Error fetching toll stations:", error);
      }
    };

    fetchTollStations();
  }, [auth.token]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[39.0742, 21.8243]} 
        zoom={7}
        minZoom={6}
        maxBounds={[[41.7489, 26.6042], [34.7001, 19.3722]]} 
        maxBoundsViscosity={1.0}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render markers for each toll station */}
        {tollStations.map((station, idx) => (
          <Marker 
            key={station.id || idx} 
            position={[station.latitude, station.longitude]} 
            icon={station.user_opid === station.ts_opid ? userOperatorIcon : otherOperatorIcon}
          >
            <Popup>
              <strong>{station.name}</strong><br />
              
              {/* Show Operator Passes & Revenue only if the user belongs to this toll station's operator */}
              {station.user_opid === station.ts_opid ? (
                <>
                  Passes: {station.totalPasses} <br />
                  Revenue: €{station.totalRevenue} <br />
                </>
              ) : (
                <>
                  {station.ts_opname} Passes: {station.outgoingPasses} <br />
                  {station.ts_opname} Revenue: €{station.outgoingRevenue} <br />
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
