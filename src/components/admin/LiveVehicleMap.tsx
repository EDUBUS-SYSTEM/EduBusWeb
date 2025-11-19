// EduBusWeb/src/components/admin/LiveVehicleMap.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { TripDto, TripStopDto } from '@/types';
import { LocationUpdateData } from '@/store/slices/liveTripsSlice';
import { vietmapService } from '@/services/vietmapService';
import { FaBus, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

interface LiveVehicleMapProps {
  trips: TripDto[];
  locationUpdates: Record<string, LocationUpdateData>;
  selectedTripIds?: string[];
  className?: string;
  showControls?: boolean;
  focusTripId?: string | null; // ✅ Added: Trip ID to focus on
  schoolLocation?: { lat: number; lng: number }; // ✅ Dynamic school location from API
}

// Default fallback school location (HCMC)
const DEFAULT_SCHOOL_LOCATION = {
  lat: 10.8412,
  lng: 106.8098
};

// Colors for different trips (same as route management)
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

// Decode polyline string to coordinates array
const decodePolyline = (encoded: string): number[][] => {
  const points: number[][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lng / 1e5, lat / 1e5]);
  }

  return points;
};

// Get route coordinates for a trip (School → Stops → School)
const getTripRouteCoordinates = async (
  trip: TripDto,
  schoolLocation: { lat: number; lng: number }
): Promise<number[][]> => {
  try {
    if (!trip.stops || trip.stops.length === 0) {
      console.log(`[getTripRouteCoordinates] Trip ${trip.id} has no stops`);
      return [];
    }

    // Sort stops by sequence
    const sortedStops = [...trip.stops].sort((a, b) => a.sequence - b.sequence);
    
    // Filter stops that have location data
    const stopsWithLocation = sortedStops.filter(
      stop => stop.location && stop.location.latitude && stop.location.longitude
    );

    console.log(`[getTripRouteCoordinates] Trip ${trip.id}: ${stopsWithLocation.length} stops with location out of ${trip.stops.length} total`);

    if (stopsWithLocation.length === 0) {
      console.warn(`[getTripRouteCoordinates] Trip ${trip.id} has no stops with location data`);
      return [];
    }

    const allCoordinates: number[][] = [];
    let currentPoint = schoolLocation;

    // Route from school to first stop
    const firstStop = stopsWithLocation[0];
    if (firstStop.location) {
      console.log(`[getTripRouteCoordinates] Getting route: School → Stop 1 (${firstStop.location.latitude}, ${firstStop.location.longitude})`);
      const routeResult = await vietmapService.getRoute(
        currentPoint,
        { lat: firstStop.location.latitude, lng: firstStop.location.longitude },
        'car'
      );
      
      if (routeResult.paths && routeResult.paths.length > 0) {
        const decodedPoints = decodePolyline(routeResult.paths[0].points);
        allCoordinates.push(...decodedPoints);
        currentPoint = { lat: firstStop.location.latitude, lng: firstStop.location.longitude };
        console.log(`[getTripRouteCoordinates] Added ${decodedPoints.length} points from school to first stop`);
      }
    }

    // Route between stops
    for (let i = 0; i < stopsWithLocation.length - 1; i++) {
      const currentStop = stopsWithLocation[i];
      const nextStop = stopsWithLocation[i + 1];
      
      if (currentStop.location && nextStop.location) {
        console.log(`[getTripRouteCoordinates] Getting route: Stop ${i + 1} → Stop ${i + 2}`);
        const routeResult = await vietmapService.getRoute(
          { lat: currentStop.location.latitude, lng: currentStop.location.longitude },
          { lat: nextStop.location.latitude, lng: nextStop.location.longitude },
          'car'
        );
        
        if (routeResult.paths && routeResult.paths.length > 0) {
          const decodedPoints = decodePolyline(routeResult.paths[0].points);
          // Skip first point to avoid duplication
          allCoordinates.push(...decodedPoints.slice(1));
          console.log(`[getTripRouteCoordinates] Added ${decodedPoints.length - 1} points between stops ${i + 1} and ${i + 2}`);
        }
      }
    }

    // Route from last stop back to school
    const lastStop = stopsWithLocation[stopsWithLocation.length - 1];
    if (lastStop.location) {
      console.log(`[getTripRouteCoordinates] Getting route: Last stop → School`);
      const routeResult = await vietmapService.getRoute(
        { lat: lastStop.location.latitude, lng: lastStop.location.longitude },
        schoolLocation,
        'car'
      );
      
      if (routeResult.paths && routeResult.paths.length > 0) {
        const decodedPoints = decodePolyline(routeResult.paths[0].points);
        // Skip first point to avoid duplication
        allCoordinates.push(...decodedPoints.slice(1));
        console.log(`[getTripRouteCoordinates] Added ${decodedPoints.length - 1} points from last stop to school`);
      }
    }

    console.log(`[getTripRouteCoordinates] Trip ${trip.id}: Total route coordinates: ${allCoordinates.length}`);
    return allCoordinates;
  } catch (error) {
    console.error(`[getTripRouteCoordinates] Error getting route coordinates for trip ${trip.id}:`, error);
    
    // Fallback to straight line if routing fails
    const sortedStops = [...trip.stops].sort((a, b) => a.sequence - b.sequence);
    const stopsWithLocation = sortedStops.filter(
      stop => stop.location && stop.location.latitude && stop.location.longitude
    );
    
    const coordinates = [
      [schoolLocation.lng, schoolLocation.lat],
      ...stopsWithLocation.map(stop => 
        stop.location ? [stop.location.longitude, stop.location.latitude] : null
      ).filter((coord): coord is number[] => coord !== null),
      [schoolLocation.lng, schoolLocation.lat]
    ];
    console.log(`[getTripRouteCoordinates] Using fallback straight-line route with ${coordinates.length} points`);
    return coordinates;
  }
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
  selectedTripIds = [],
  className = "w-full h-full",
  showControls = true,
  focusTripId,
  schoolLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, vietmapgl.Marker>>(new Map());
  const stopMarkersRef = useRef<vietmapgl.Marker[]>([]);
  const schoolMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const polylinesRef = useRef<string[]>([]);
  const sourcesRef = useRef<string[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // ✅ Use API-provided school location when available
  const effectiveSchoolLocation = useMemo(
    () => schoolLocation || DEFAULT_SCHOOL_LOCATION,
    [schoolLocation]
  );
  
  // ✅ Track which vehicle we're following (only when focused)
  const followingVehicleRef = useRef<string | null>(null);
  // ✅ Track if initial fit has been done
  const initialFitDoneRef = useRef(false);

  // ✅ Focus on a specific trip's vehicle
  const focusOnTrip = useCallback((tripId: string) => {
    if (!mapInstanceRef.current || !isMapLoaded) {
      console.warn('[focusOnTrip] Map not ready');
      return;
    }

    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
      console.warn(`[focusOnTrip] Trip ${tripId} not found`);
      return;
    }

    const locationUpdate = locationUpdates[tripId];
    let lat: number;
    let lng: number;

    // Get vehicle position (same logic as updateVehicleMarkers)
    if (locationUpdate) {
      lat = locationUpdate.latitude;
      lng = locationUpdate.longitude;
    } else if (trip.stops && trip.stops.length > 0 && trip.stops[0].location) {
      lat = trip.stops[0].location.latitude;
      lng = trip.stops[0].location.longitude;
    } else {
      // Fallback to school location from API (or default)
      lat = effectiveSchoolLocation.lat;
      lng = effectiveSchoolLocation.lng;
    }

    // Focus map on vehicle with smooth animation
    mapInstanceRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 1000,
      essential: true
    });

    // ✅ Enable following for this vehicle
    followingVehicleRef.current = tripId;

    // Optionally open the vehicle's popup
    const marker = vehicleMarkersRef.current.get(tripId);
    if (marker) {
      setTimeout(() => {
        marker.togglePopup();
      }, 500);
    }
  }, [trips, locationUpdates, isMapLoaded]);

  // ✅ Focus when focusTripId changes
  useEffect(() => {
    if (focusTripId && isMapLoaded) {
      focusOnTrip(focusTripId);
    } else if (!focusTripId) {
      // Stop following when focus is cleared
      followingVehicleRef.current = null;
    }
  }, [focusTripId, isMapLoaded, focusOnTrip]);

  // ✅ Follow vehicle movement (only when focused)
  useEffect(() => {
    if (!followingVehicleRef.current || !isMapLoaded || !mapInstanceRef.current) {
      return;
    }

    const tripId = followingVehicleRef.current;
    const locationUpdate = locationUpdates[tripId];
    
    if (!locationUpdate) {
      return;
    }

    // Only update if vehicle has moved significantly (to avoid jitter)
    const currentCenter = mapInstanceRef.current.getCenter();
    const distance = Math.sqrt(
      Math.pow(currentCenter.lng - locationUpdate.longitude, 2) +
      Math.pow(currentCenter.lat - locationUpdate.latitude, 2)
    );
    
    // Only follow if vehicle moved more than ~100 meters (roughly 0.001 degrees)
    if (distance > 0.001) {
      mapInstanceRef.current.easeTo({
        center: [locationUpdate.longitude, locationUpdate.latitude],
        duration: 500,
        essential: true
      });
    }
  }, [locationUpdates, isMapLoaded]);

  // Clear route polylines and stop markers
  const clearRoutePolylines = useCallback(() => {
    console.log('[clearRoutePolylines] Clearing all route elements...');
    if (!mapInstanceRef.current) {
      console.log('[clearRoutePolylines] No map instance, skipping');
      return;
    }

    // Clear stop markers
    console.log(`[clearRoutePolylines] Removing ${stopMarkersRef.current.length} stop markers`);
    stopMarkersRef.current.forEach((marker, index) => {
      try {
        marker.remove();
      } catch (err) {
        console.warn(`[clearRoutePolylines] Error removing stop marker ${index}:`, err);
      }
    });
    stopMarkersRef.current = [];

    // Remove layers first
    console.log(`[clearRoutePolylines] Removing ${polylinesRef.current.length} layers`);
    polylinesRef.current.forEach(layerId => {
      try {
        if (mapInstanceRef.current?.getLayer(layerId)) {
          mapInstanceRef.current.removeLayer(layerId);
        }
      } catch (err) {
        console.warn(`[clearRoutePolylines] Error removing layer ${layerId}:`, err);
      }
    });
    polylinesRef.current = [];

    // Remove sources
    console.log(`[clearRoutePolylines] Removing ${sourcesRef.current.length} sources`);
    sourcesRef.current.forEach(sourceId => {
      try {
        if (mapInstanceRef.current?.getSource(sourceId)) {
          mapInstanceRef.current.removeSource(sourceId);
        }
      } catch (err) {
        console.warn(`[clearRoutePolylines] Error removing source ${sourceId}:`, err);
      }
    });
    sourcesRef.current = [];
    console.log('[clearRoutePolylines] Finished clearing');
  }, []);

  // Add route polylines and stop markers for selected trips
  const addRoutePolylines = useCallback(async () => {
    console.log('\n=== [addRoutePolylines] START ===');
    console.log('[addRoutePolylines] Map ready check:', {
      hasMap: !!mapInstanceRef.current,
      isMapLoaded,
      isStyleLoaded: mapInstanceRef.current?.isStyleLoaded()
    });

    if (!mapInstanceRef.current || !isMapLoaded) {
      console.log('[addRoutePolylines] Map not ready, returning');
      return;
    }
    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.warn('[addRoutePolylines] Map style not loaded yet, skipping route elements');
      return;
    }

    const selectedTrips = trips.filter(trip => selectedTripIds.includes(trip.id));
    console.log('[addRoutePolylines] Selection info:', {
      totalTrips: trips.length,
      selectedTripIds: selectedTripIds,
      selectedTripsCount: selectedTrips.length,
      selectedTrips: selectedTrips.map(t => ({
        id: t.id,
        routeName: t.routeName,
        stopsCount: t.stops?.length || 0,
        hasStops: !!(t.stops && t.stops.length > 0)
      }))
    });
    
    // Clear existing routes and markers
    clearRoutePolylines();

    if (selectedTrips.length === 0) {
      console.log('[addRoutePolylines] No trips selected, nothing to draw');
      return;
    }

    // Process trips sequentially to avoid API rate limits
    for (const trip of selectedTrips) {
      const color = getVehicleColor(trip.id);
      console.log(`\n[addRoutePolylines] Processing trip: ${trip.routeName || trip.id} (${trip.id})`);
      console.log(`[addRoutePolylines] Trip color: ${color}`);
      console.log(`[addRoutePolylines] Trip stops count: ${trip.stops?.length || 0}`);
      
      // ✅ Add stop markers (like route management)
      if (trip.stops && trip.stops.length > 0) {
        console.log(`[addRoutePolylines] Trip has ${trip.stops.length} stops, processing...`);
        const sortedStops = [...trip.stops].sort((a, b) => a.sequence - b.sequence);
        console.log(`[addRoutePolylines] Sorted stops:`, sortedStops.map(s => ({
          id: s.id,
          name: s.name,
          sequence: s.sequence,
          hasLocation: !!s.location,
          location: s.location ? {
            lat: s.location.latitude,
            lng: s.location.longitude,
            address: s.location.address
          } : null
        })));
        
        const stopsWithLocation = sortedStops.filter(
          stop => stop.location && stop.location.latitude && stop.location.longitude
        );

        console.log(`[addRoutePolylines] Stops with location: ${stopsWithLocation.length} out of ${sortedStops.length}`);

        if (stopsWithLocation.length === 0) {
          console.warn(`[addRoutePolylines] ⚠️ Trip ${trip.id} has NO stops with location data!`);
          console.warn(`[addRoutePolylines] All stops data:`, sortedStops);
          // Continue to next trip
        } else {
          stopsWithLocation.forEach((stop, index) => {
            if (!stop.location) {
              console.warn(`[addRoutePolylines] Stop ${index} has no location, skipping`);
              return;
            }

            console.log(`[addRoutePolylines] Adding marker for stop ${stop.sequence}: ${stop.name || 'Unnamed'}`);
            console.log(`[addRoutePolylines] Stop location: (${stop.location.latitude}, ${stop.location.longitude})`);

            try {
              // Add the main stop marker (bus icon)
              const stopMarker = new vietmapgl.Marker({
                element: (() => {
                  const el = document.createElement('div');
                  el.innerHTML = '🚌';
                  el.style.fontSize = '12px';
                  el.style.backgroundColor = 'white';
                  el.style.borderRadius = '50%';
                  el.style.padding = '4px';
                  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                  el.style.border = `2px solid ${color}`;
                  el.style.textAlign = 'center';
                  el.style.lineHeight = '1';
                  return el;
                })(),
                anchor: 'center'
              })
                .setLngLat([stop.location.longitude, stop.location.latitude])
                .addTo(mapInstanceRef.current!);

              // Add sequence number marker
              const orderMarker = new vietmapgl.Marker({
                element: (() => {
                  const el = document.createElement('div');
                  el.innerHTML = `${stop.sequence}`;
                  el.style.backgroundColor = color;
                  el.style.color = 'white';
                  el.style.borderRadius = '50%';
                  el.style.width = '18px';
                  el.style.height = '18px';
                  el.style.display = 'flex';
                  el.style.alignItems = 'center';
                  el.style.justifyContent = 'center';
                  el.style.fontSize = '10px';
                  el.style.fontWeight = 'bold';
                  el.style.border = '2px solid white';
                  el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
                  return el;
                })(),
                anchor: 'center',
                offset: [12, -12]
              })
                .setLngLat([stop.location.longitude, stop.location.latitude])
                .addTo(mapInstanceRef.current!);

              // Add popup
              const popup = new vietmapgl.Popup({ 
                offset: 25,
                closeButton: true,
                closeOnClick: false
              })
                .setHTML(`
                  <div class="p-2">
                    <h3 class="font-semibold text-sm">${stop.name || `Stop ${stop.sequence}`}</h3>
                    <p class="text-xs text-gray-600">${stop.location.address || 'No address'}</p>
                    <p class="text-xs text-gray-600">Route: ${trip.routeName || 'Unknown'}</p>
                    <p class="text-xs text-gray-500">Stop ${stop.sequence}</p>
                  </div>
                `);
              
              stopMarker.setPopup(popup);
              
              // Store markers for cleanup
              stopMarkersRef.current.push(stopMarker);
              stopMarkersRef.current.push(orderMarker);
              
              console.log(`[addRoutePolylines] ✅ Added markers for stop ${stop.sequence}`);
            } catch (error) {
              console.error(`[addRoutePolylines] ❌ Error adding marker for stop ${stop.sequence}:`, error);
            }
          });
          
          console.log(`[addRoutePolylines] ✅ Total stop markers added for this trip: ${stopsWithLocation.length * 2}`);
        }
      } else {
        console.warn(`[addRoutePolylines] ⚠️ Trip ${trip.id} has no stops or stops array is empty`);
      }
      
      // Add route polyline
      try {
        console.log(`[addRoutePolylines] Getting route coordinates for trip ${trip.id}...`);
        const coordinates = await getTripRouteCoordinates(trip, effectiveSchoolLocation);
        console.log(`[addRoutePolylines] Got ${coordinates.length} coordinates for trip ${trip.id}`);
        
        if (coordinates.length === 0) {
          console.warn(`[addRoutePolylines] No coordinates for trip ${trip.id}, skipping polyline`);
          continue;
        }

        const sourceId = `trip-route-${trip.id}`;
        const layerId = `trip-route-layer-${trip.id}`;

        // Check if source already exists
        if (!mapInstanceRef.current.getSource(sourceId)) {
          // Add source
          mapInstanceRef.current.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              }
            }
          });
          sourcesRef.current.push(sourceId);
          console.log(`[addRoutePolylines] ✅ Added source: ${sourceId}`);

          // Add layer
          mapInstanceRef.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': color,
              'line-width': 4
            }
          });
          polylinesRef.current.push(layerId);
          console.log(`[addRoutePolylines] ✅ Added layer: ${layerId} with color ${color}`);
        } else {
          console.warn(`[addRoutePolylines] Source ${sourceId} already exists, skipping`);
        }
      } catch (error) {
        console.error(`[addRoutePolylines] ❌ Error adding route for trip ${trip.id}:`, error);
      }
    }
    
    console.log(`\n=== [addRoutePolylines] FINISHED ===`);
    console.log(`[addRoutePolylines] Total stop markers on map: ${stopMarkersRef.current.length}`);
    console.log(`[addRoutePolylines] Total route layers: ${polylinesRef.current.length}`);
    console.log(`[addRoutePolylines] Total sources: ${sourcesRef.current.length}`);
  }, [trips, selectedTripIds, isMapLoaded, clearRoutePolylines]);

  // Update vehicle markers when trips or location updates change
  const updateVehicleMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Only show markers for selected trips (or all if none selected)
    const tripsToShow = selectedTripIds.length > 0 
      ? trips.filter(t => selectedTripIds.includes(t.id))
      : trips;

    // Remove markers for trips that no longer exist or are not selected
    const currentTripIds = new Set(tripsToShow.map(t => t.id));
    vehicleMarkersRef.current.forEach((marker, tripId) => {
      if (!currentTripIds.has(tripId)) {
        marker.remove();
        vehicleMarkersRef.current.delete(tripId);
      }
    });

    // Add or update markers for current trips
    tripsToShow.forEach(trip => {
      const locationUpdate = locationUpdates[trip.id];

      // Use real-time location if available, otherwise use trip's current location or first stop
      let lat: number;
      let lng: number;

      if (locationUpdate) {
        lat = locationUpdate.latitude;
        lng = locationUpdate.longitude;
      } else if (trip.stops && trip.stops.length > 0 && trip.stops[0].location) {
        lat = trip.stops[0].location.latitude;
        lng = trip.stops[0].location.longitude;
      } else {
        // Fallback to school location
        lat = effectiveSchoolLocation.lat;
        lng = effectiveSchoolLocation.lng;
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

    // ✅ REMOVED: Automatic fitBounds - this was causing the map to constantly move
    // The map should only adjust when:
    // 1. Initial load (handled separately below)
    // 2. User focuses on a specific vehicle (handled in focusOnTrip)
    // 3. User manually interacts with the map
  }, [trips, locationUpdates, selectedTripIds, isMapLoaded]);

  // ✅ Initial fit to bounds (only once on first load)
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || initialFitDoneRef.current) return;
    
    const tripsToShow = selectedTripIds.length > 0 
      ? trips.filter(t => selectedTripIds.includes(t.id))
      : trips;

    if (tripsToShow.length > 0 && vehicleMarkersRef.current.size > 0) {
      try {
        const bounds = new vietmapgl.LngLatBounds();
        bounds.extend([effectiveSchoolLocation.lng, effectiveSchoolLocation.lat]);
        
        vehicleMarkersRef.current.forEach((marker) => {
          const lngLat = marker.getLngLat();
          bounds.extend([lngLat.lng, lngLat.lat]);
        });

        mapInstanceRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
        
        initialFitDoneRef.current = true;
      } catch (err) {
        console.warn('Error fitting bounds:', err);
      }
    }
  }, [isMapLoaded, trips, selectedTripIds]);

  // ✅ Reset initial fit when selection changes significantly
  useEffect(() => {
    initialFitDoneRef.current = false;
    followingVehicleRef.current = null; // Stop following when selection changes
  }, [selectedTripIds.length]);

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
          center: [effectiveSchoolLocation.lng, effectiveSchoolLocation.lat],
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
          .setLngLat([effectiveSchoolLocation.lng, effectiveSchoolLocation.lat])
          .addTo(map);

        const schoolPopup = new vietmapgl.Popup({ offset: 25 })
          .setHTML('<div style="font-weight: bold;">🏫 School</div>');

        schoolMarker.setPopup(schoolPopup);
        schoolMarkerRef.current = schoolMarker;

        map.on('load', () => {
          if (isMounted) {
            console.log('[initMap] Map loaded');
            setIsMapLoaded(true);
          }
        });

        map.on('styledata', () => {
          if (isMounted && map.isStyleLoaded()) {
            console.log('[initMap] Map style loaded, redrawing routes');
            setTimeout(async () => {
              if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
                clearRoutePolylines();
                await addRoutePolylines();
              }
            }, 100);
          }
        });

        map.on('error', (e) => {
          console.error('[initMap] Map error:', e);
          setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        });
      } catch (err) {
        console.error('[initMap] Failed to initialize map:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      vehicleMarkersRef.current.forEach(marker => marker.remove());
      vehicleMarkersRef.current.clear();
      clearRoutePolylines();

      if (schoolMarkerRef.current) {
        schoolMarkerRef.current.remove();
        schoolMarkerRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showControls, clearRoutePolylines, addRoutePolylines]);

  // Update markers when trips or locations change
  useEffect(() => {
    updateVehicleMarkers();
  }, [updateVehicleMarkers]);

  // Update routes when selection changes - FIXED: Wait for style to load
  useEffect(() => {
    console.log('\n=== [useEffect] Selection Changed ===');
    console.log('[useEffect] isMapLoaded:', isMapLoaded);
    console.log('[useEffect] mapInstanceRef.current:', !!mapInstanceRef.current);
    console.log('[useEffect] isStyleLoaded:', mapInstanceRef.current?.isStyleLoaded());
    console.log('[useEffect] selectedTripIds:', selectedTripIds);
    console.log('[useEffect] trips count:', trips.length);
    
    if (!isMapLoaded || !mapInstanceRef.current) {
      console.log('[useEffect] Map not loaded yet, waiting...');
      return;
    }

    // Wait for style to load
    const checkAndAddRoutes = () => {
      if (mapInstanceRef.current?.isStyleLoaded()) {
        console.log('[useEffect] Map style ready, calling addRoutePolylines...');
        addRoutePolylines();
      } else {
        console.log('[useEffect] Map style not ready yet, retrying in 200ms...');
        // Wait a bit and try again (max 10 attempts = 2 seconds)
        setTimeout(checkAndAddRoutes, 200);
      }
    };

    // If style is already loaded, call immediately
    if (mapInstanceRef.current.isStyleLoaded()) {
      console.log('[useEffect] Map style already loaded, calling addRoutePolylines immediately...');
      addRoutePolylines();
    } else {
      // Otherwise, wait for it with retry mechanism
      console.log('[useEffect] Waiting for map style to load...');
      let retryCount = 0;
      const maxRetries = 10;
      
      const retryCheck = () => {
        retryCount++;
        if (mapInstanceRef.current?.isStyleLoaded()) {
          console.log(`[useEffect] Map style loaded after ${retryCount} attempts`);
          addRoutePolylines();
        } else if (retryCount < maxRetries) {
          setTimeout(retryCheck, 200);
        } else {
          console.warn('[useEffect] Max retries reached, map style still not loaded');
        }
      };
      
      const timeoutId = setTimeout(retryCheck, 200);
      
      // Also listen for styledata event as backup
      const handleStyleData = () => {
        if (mapInstanceRef.current?.isStyleLoaded()) {
          console.log('[useEffect] Map style loaded via styledata event');
          clearTimeout(timeoutId);
          addRoutePolylines();
          mapInstanceRef.current.off('styledata', handleStyleData);
        }
      };
      
      mapInstanceRef.current.on('styledata', handleStyleData);
      
      return () => {
        clearTimeout(timeoutId);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.off('styledata', handleStyleData);
        }
      };
    }
  }, [selectedTripIds, isMapLoaded, addRoutePolylines]);

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