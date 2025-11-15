// EduBusWeb/src/components/admin/LiveVehicleMap.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { TripDto } from '@/types';
import { LocationUpdateData } from '@/store/slices/liveTripsSlice';
import { FaBus, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

interface LiveVehicleMapProps {
  trips: TripDto[];
  locationUpdates: Record<string, LocationUpdateData>;
  className?: string;
  showControls?: boolean;
}

const SCHOOL_LOCATION = {
  lat: 10.8412,  // Changed from 15.9796
  lng: 106.8098  // Changed from 108.2605
};

// Colors for different trips
const VEHICLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

// Hash function for stable color assignment
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getVehicleColor = (tripId: string): string => {
  const hash = hashString(tripId);
  return VEHICLE_COLORS[hash % VEHICLE_COLORS.length];
};

// Create bus icon HTML
const createBusIcon = (color: string): string => {
  return `
    <div style="
      width: 32px;
      height: 32px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M4 6h16v10H4V6zm2 2v6h12V8H6zm-2 8h16v2H4v-2zm2-8h12v6H6V8z"/>
      </svg>
    </div>
  `;
};

const LiveVehicleMap: React.FC<LiveVehicleMapProps> = ({
  trips,
  locationUpdates,
  className = "w-full h-full",
  showControls = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, vietmapgl.Marker>>(new Map());
  const schoolMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // Update vehicle markers when trips or location updates change
  const updateVehicleMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Remove markers for trips that no longer exist
    const currentTripIds = new Set(trips.map(t => t.id));
    vehicleMarkersRef.current.forEach((marker, tripId) => {
      if (!currentTripIds.has(tripId)) {
        marker.remove();
        vehicleMarkersRef.current.delete(tripId);
      }
    });

    // Add or update markers for current trips
    trips.forEach(trip => {
      const locationUpdate = locationUpdates[trip.id];

      // Use real-time location if available, otherwise use trip's current location or first stop
      let lat: number;
      let lng: number;

      if (locationUpdate) {
        lat = locationUpdate.latitude;
        lng = locationUpdate.longitude;
      } else if (trip.stops && trip.stops.length > 0 && trip.stops[0].location) {
        // FIXED: Check for location property (with lowercase 'l' in TypeScript)
        lat = trip.stops[0].location.latitude;
        lng = trip.stops[0].location.longitude;
      } else {
        // Fallback to school location
        lat = SCHOOL_LOCATION.lat;
        lng = SCHOOL_LOCATION.lng;
      }

      const color = getVehicleColor(trip.id);
      const existingMarker = vehicleMarkersRef.current.get(trip.id);

      if (existingMarker) {
        // Update existing marker position
        existingMarker.setLngLat([lng, lat]);
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.innerHTML = createBusIcon(color);
        el.style.cursor = 'pointer';

        // FIXED: Add null check before using mapInstanceRef.current
        if (!mapInstanceRef.current) return;

        const marker = new vietmapgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current);

        // Create popup with trip info
        const popup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="min-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 8px; color: ${color};">
                ${trip.routeName || 'Unknown Route'}
              </div>
              <div style="font-size: 12px; color: #666;">
                <div style="margin-bottom: 4px;">
                  <strong>Vehicle:</strong> ${trip.vehicle?.maskedPlate || 'N/A'}
                </div>
                <div style="margin-bottom: 4px;">
                  <strong>Driver:</strong> ${trip.driver?.fullName || 'N/A'}
                </div>
                <div style="margin-bottom: 4px;">
                  <strong>Status:</strong> ${trip.status}
                </div>
                ${locationUpdate ? `
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #999;">
                    Updated: ${new Date(locationUpdate.timestamp).toLocaleTimeString()}
                    ${locationUpdate.speed ? `<br/>Speed: ${locationUpdate.speed.toFixed(1)} km/h` : ''}
                    ${locationUpdate.isMoving ? '<br/>🟢 Moving' : '<br/>🔴 Stopped'}
                  </div>
                ` : ''}
              </div>
            </div>
          `);

        marker.setPopup(popup);
        vehicleMarkersRef.current.set(trip.id, marker);
      }
    });

    // Fit map to show all vehicles
    // FIXED: Remove isValid() check and use try-catch instead
    if (trips.length > 0 && vehicleMarkersRef.current.size > 0 && mapInstanceRef.current) {
      try {
        const bounds = new vietmapgl.LngLatBounds();

        // Add school location
        bounds.extend([SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat]);

        // Add all vehicle positions
        vehicleMarkersRef.current.forEach((marker) => {
          const lngLat = marker.getLngLat();
          bounds.extend([lngLat.lng, lngLat.lat]);
        });

        // FIXED: Just call fitBounds without isValid check
        mapInstanceRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      } catch (err) {
        console.warn('Error fitting bounds:', err);
        // If bounds fail, just center on school
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter([SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat]);
          mapInstanceRef.current.setZoom(12);
        }
      }
    }
  }, [trips, locationUpdates, isMapLoaded]);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          setError('VietMap API key not configured');
          return;
        }

        if (!isMounted || !mapRef.current) return;

        const map = new vietmapgl.Map({
          container: mapRef.current,
          style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
          center: [SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat],
          zoom: 12
        });

        mapInstanceRef.current = map;

        if (showControls) {
          map.addControl(new vietmapgl.NavigationControl(), 'top-right');
        }

        // Add school marker
        const schoolEl = document.createElement('div');
        schoolEl.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            background-color: #FF0000;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="color: white; font-size: 12px; font-weight: bold;">🏫</span>
          </div>
        `;

        const schoolMarker = new vietmapgl.Marker({
          element: schoolEl,
          anchor: 'center'
        })
          .setLngLat([SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat])
          .addTo(map);

        const schoolPopup = new vietmapgl.Popup({ offset: 25 })
          .setHTML('<div style="font-weight: bold;">🏫 School</div>');

        schoolMarker.setPopup(schoolPopup);
        schoolMarkerRef.current = schoolMarker;

        map.on('load', () => {
          if (isMounted) {
            setIsMapLoaded(true);
          }
        });

        map.on('error', (e) => {
          console.error('Map error:', e);
          setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        });
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      vehicleMarkersRef.current.forEach(marker => marker.remove());
      vehicleMarkersRef.current.clear();

      if (schoolMarkerRef.current) {
        schoolMarkerRef.current.remove();
        schoolMarkerRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showControls]);

  // Update markers when trips or locations change
  useEffect(() => {
    updateVehicleMarkers();
  }, [updateVehicleMarkers]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div ref={mapRef} className="w-full h-full" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default LiveVehicleMap;