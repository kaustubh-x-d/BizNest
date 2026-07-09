import React, { useCallback, useState, useEffect } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  useMap, 
  useMapEvents 
} from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, Navigation, Sliders, Layers, RefreshCw } from "lucide-react";
import { api } from "../../services/api";

// Import Leaflet CSS directly in this component to ensure it loads
import "leaflet/dist/leaflet.css";

// Fix default marker icon issues with bundlers
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const userIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Competitor marker using red dot/pin styling
const competitorIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
  className: "custom-competitor-marker",
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

// Amenity marker using color dot styling
const amenityIcon = (color: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 1px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.25);"></div>`,
  className: "custom-amenity-marker",
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

interface Competitor {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  category: string;
  rating: number;
  address: string;
}

interface Amenity {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
}

interface AmenitiesData {
  schools_colleges: Amenity[];
  hospitals: Amenity[];
  transit: Amenity[];
  parking: Amenity[];
}

interface GISMapProps {
  businessType: string;
  onLocationSelect: (lat: number, lon: number, radius: number) => void;
}

// Controller to fly map to coordinates when search changes
function MapFlyController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// Click events wrapper to update user marker selection
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function GISMap({ businessType, onLocationSelect }: GISMapProps) {
  // Primary map state (defaults to Kanpur, India coordinates)
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([26.4499, 80.3319]);
  const [radius, setRadius] = useState<number>(1000); // meters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [amenities, setAmenities] = useState<AmenitiesData>({
    schools_colleges: [],
    hospitals: [],
    transit: [],
    parking: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [gisMessage, setGisMessage] = useState<string>("");
  const [showAmenities, setShowAmenities] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Fetch competitors and amenities for selected coordinates and radius
  const fetchGISData = useCallback(async (lat: number, lon: number, r: number) => {
    // Check geofence bounds first
    const minLat = 26.30, maxLat = 26.60;
    const minLon = 80.10, maxLon = 80.50;
    const isInside = lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;

    if (!isInside) {
      setCompetitors([]);
      setAmenities({
        schools_colleges: [],
        hospitals: [],
        transit: [],
        parking: []
      });
      setGisMessage("The selected location is outside the supported boundary of Kanpur, India (Latitude: 26.30 to 26.60, Longitude: 80.10 to 80.50).");
      onLocationSelect(lat, lon, r);
      return;
    }

    setLoading(true);
    setGisMessage("");
    try {
      const [compRes, amenRes] = await Promise.all([
        api.get("/gis/competitors", {
          params: { lat, lon, radius: r, business_type: businessType }
        }),
        api.get("/gis/amenities", {
          params: { lat, lon, radius: r }
        })
      ]);
      setCompetitors(compRes.data);
      setAmenities(amenRes.data);
      if (compRes.data.length === 0) {
        setGisMessage("No matching live competitors found in this radius. Try a larger radius.");
      }

      // Notify parent page
      onLocationSelect(lat, lon, r);
    } catch (err) {
      console.error("Error loading GIS information", err);
      setGisMessage("Live map data could not be loaded. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [businessType, onLocationSelect]);

  // Initial trigger
  useEffect(() => {
    fetchGISData(selectedCoords[0], selectedCoords[1], radius);
  }, [fetchGISData, selectedCoords, radius]);

  // Handle Nominatim Geocode address search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await api.get("/gis/geocode", {
        params: { q: searchQuery }
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error geocoding address", err);
    } finally {
      setLoading(false);
    }
  };

  const selectSearchResult = (item: any) => {
    setSelectedCoords([item.lat, item.lon]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleMapClick = (lat: number, lon: number) => {
    setSelectedCoords([lat, lon]);
  };

  return (
    <div className="relative w-full h-[600px] bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row font-sans">
      {/* Sidebar Controls & Stats */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 p-5 flex flex-col justify-between z-10">
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-slate-700" />
              Location Explorer
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Search or click on map to select analysis point.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search area (e.g. Kanpur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg py-2 pl-3 pr-9 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button type="submit" className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-900">
              <Search className="w-3.5 h-3.5" />
            </button>
            
            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto shadow-md z-50 text-[11px]">
                {searchResults.map((item, idx) => (
                  <li 
                    key={idx}
                    onClick={() => selectSearchResult(item)}
                    className="p-2 border-b border-slate-100 text-slate-750 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Radius Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Target Radius
              </span>
              <span className="font-bold text-slate-900">{(radius / 1000).toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          {/* Toggle Amenities */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Display Amenities
            </span>
            <button 
              onClick={() => setShowAmenities(!showAmenities)}
              className={`px-3 py-0.5 rounded-full border text-[9px] font-bold transition-colors ${showAmenities ? 'bg-slate-100 text-slate-800 border-slate-350' : 'bg-white text-slate-400 border-slate-200'}`}
            >
              {showAmenities ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Toggle Heatmap */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-red-500" />
              Competition Heatmap
            </span>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-0.5 rounded-full border text-[9px] font-bold transition-colors ${showHeatmap ? 'bg-red-50 text-red-750 border-red-200' : 'bg-white text-slate-400 border-slate-200'}`}
            >
              {showHeatmap ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Location Details Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Density Statistics</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-slate-150 p-2 rounded text-center">
                <div className="text-sm font-bold text-red-650">{competitors.length}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Competitors</div>
              </div>
              <div className="bg-white border border-slate-150 p-2 rounded text-center">
                <div className="text-sm font-bold text-slate-800">
                  {amenities.schools_colleges.length + amenities.hospitals.length + amenities.transit.length}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Amenities</div>
              </div>
            </div>
            {gisMessage && (
              <p className="text-[9px] leading-relaxed text-slate-450">{gisMessage}</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <MapPin className="w-3 h-3 text-slate-400" />
            {selectedCoords[0].toFixed(4)}, {selectedCoords[1].toFixed(4)}
          </span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin text-slate-450" />}
        </div>
      </div>

      {/* Map Canvas container */}
      <div className="flex-1 h-full relative z-0">
        <MapContainer
          center={selectedCoords}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // CartoDB Voyager Light map
          />

          {/* Active selection marker */}
          <Marker position={selectedCoords} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="p-2 text-slate-900">
                <h4 className="font-bold text-xs">Target Location</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Opening a {businessType} here.</p>
              </div>
            </Popup>
          </Marker>

          {/* Selected radius circle visualization */}
          <Circle
            center={selectedCoords}
            radius={radius}
            pathOptions={{
              color: "#1e293b",
              fillColor: "#1e293b",
              fillOpacity: 0.05,
              weight: 1.5,
              dashArray: "3 3"
            }}
          />

          {/* Competition Heatmap Overlays */}
          {showHeatmap && competitors.map((item, index) => (
            <Circle
              key={`heat-${index}`}
              center={[item.lat, item.lon]}
              radius={150}
              pathOptions={{
                color: "transparent",
                fillColor: "#ef4444",
                fillOpacity: 0.12,
                stroke: false
              }}
            />
          ))}

          {/* Nearby Competitors Markers */}
          {competitors.map((item, index) => (
            <Marker key={`comp-${index}`} position={[item.lat, item.lon]} icon={competitorIcon}>
              <Popup>
                <div className="p-1 text-slate-900 max-w-[180px]">
                  <span className="bg-red-50 text-red-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-red-100">
                    Competitor ({item.category})
                  </span>
                  <h4 className="font-bold text-xs mt-1">{item.name}</h4>
                  <p className="text-[9px] text-slate-450 mt-0.5">{item.address}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-500">
                    <span>★ {item.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Nearby Amenities Markers (Conditional) */}
          {showAmenities && (
            <>
              {amenities.schools_colleges.map((item, index) => (
                <Marker key={`school-${index}`} position={[item.lat, item.lon]} icon={amenityIcon("#eab308")}>
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <span className="bg-yellow-50 text-yellow-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-yellow-100">Education</span>
                      <h4 className="font-bold text-xs mt-1">{item.name}</h4>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {amenities.hospitals.map((item, index) => (
                <Marker key={`hosp-${index}`} position={[item.lat, item.lon]} icon={amenityIcon("#22c55e")}>
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <span className="bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-green-100">Healthcare</span>
                      <h4 className="font-bold text-xs mt-1">{item.name}</h4>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {amenities.transit.map((item, index) => (
                <Marker key={`transit-${index}`} position={[item.lat, item.lon]} icon={amenityIcon("#06b6d4")}>
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <span className="bg-cyan-50 text-cyan-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-cyan-100">Transit Hub</span>
                      <h4 className="font-bold text-xs mt-1">{item.name}</h4>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}

          {/* Interactive Map Handlers */}
          <MapFlyController center={selectedCoords} />
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>
    </div>
  );
}
