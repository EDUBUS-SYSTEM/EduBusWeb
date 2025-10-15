'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { vietmapService } from '@/services/vietmapService';

type Student = {
  id?: string | number;
  fullName?: string;
  name?: string;
};

const SCHOOL_LOCATION = {
  lat: 15.9796,
  lng: 108.2605
};

// Polyline decoder function for VietMap
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
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

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5
    });
  }

  return points;
}

// Constants
const MAP_ZOOM_LEVEL = 14;
const MAP_ZOOM_LEVEL_DETAILED = 15;

interface VietMapPageComponentProps {
  onMapReady: (map: vietmapgl.Map) => void;
  onMapClick: (coords: { lat: number; lng: number }) => void;
  onMarkerClick: (coords: { lat: number; lng: number }) => void;
  selectedCoords: { lat: number; lng: number } | null;
  tempCoords: { lat: number; lng: number } | null;
  isRouting: boolean;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  isLoading: boolean;
  error: string;
  isMapLoaded: boolean;
  setIsMapLoaded: (loaded: boolean) => void;
  setError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsRouting: (routing: boolean) => void;
  onRouteCalculated?: (distance: string, duration: string, fare: string) => void;
  unitPrice?: number;
}

export default function VietMapPageComponent({
  onMapReady,
  onMapClick,
  onMarkerClick,
  selectedCoords,
  tempCoords,
  isRouting,
  travelMode,
  isLoading,
  error,
  isMapLoaded,
  setIsMapLoaded,
  setError,
  setIsLoading,
  setIsRouting,
  onRouteCalculated,
  unitPrice = 7000
}: VietMapPageComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const markerRef = useRef<vietmapgl.Marker | null>(null);
  const schoolMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const tempMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const routeLineRef = useRef<string | null>(null);
  const routeSourceRef = useRef<string | null>(null);
  const tempMarkerClickListenerRef = useRef<(() => void) | null>(null);
  const lastRouteCoordsRef = useRef<{ origin: { lat: number; lng: number }; destination: { lat: number; lng: number } } | null>(null);

  const schoolLocation = SCHOOL_LOCATION;

  // Clear temporary marker
  const clearTempMarker = useCallback(() => {
    try {
      if (tempMarkerRef.current) {
        // Remove click listener if exists
        if (tempMarkerClickListenerRef.current) {
          tempMarkerRef.current.getElement().removeEventListener('click', tempMarkerClickListenerRef.current);
          tempMarkerClickListenerRef.current = null;
        }
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    } catch (err) {
      console.warn('Error clearing temp marker:', err);
      tempMarkerRef.current = null;
      tempMarkerClickListenerRef.current = null;
    }
  }, []);

  // Clear route line
  const clearRouteLine = useCallback(() => {
    try {
      if (mapInstanceRef.current && routeLineRef.current) {
        if (mapInstanceRef.current.getLayer(routeLineRef.current)) {
          mapInstanceRef.current.removeLayer(routeLineRef.current);
        }
        if (routeSourceRef.current && mapInstanceRef.current.getSource(routeSourceRef.current)) {
          mapInstanceRef.current.removeSource(routeSourceRef.current);
        }
        routeLineRef.current = null;
        routeSourceRef.current = null;
      }
      // Reset last route coordinates to allow redrawing
      lastRouteCoordsRef.current = null;
    } catch (err) {
      console.warn('Error clearing route line:', err);
      routeLineRef.current = null;
      routeSourceRef.current = null;
      lastRouteCoordsRef.current = null;
    }
  }, []);

  // Debounced route drawing to prevent excessive API calls
  const drawRouteDebounced = useRef<NodeJS.Timeout | null>(null);
  
  const drawRoute = useCallback(async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    console.log('drawRoute called with:', { origin, destination, isRouting });
    
    if (!mapInstanceRef.current || isRouting) {
      console.log('drawRoute skipped: no map or already routing');
      return;
    }

    // Check if map style is loaded
    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.warn('Map style not loaded yet, skipping route drawing');
      return;
    }

    // Check if route is already drawn for the same coordinates
    if (lastRouteCoordsRef.current && 
        Math.abs(lastRouteCoordsRef.current.origin.lat - origin.lat) < 0.0001 &&
        Math.abs(lastRouteCoordsRef.current.origin.lng - origin.lng) < 0.0001 &&
        Math.abs(lastRouteCoordsRef.current.destination.lat - destination.lat) < 0.0001 &&
        Math.abs(lastRouteCoordsRef.current.destination.lng - destination.lng) < 0.0001) {
      console.log('Route already drawn for these coordinates, skipping');
      return;
    }

    // Clear previous debounced call
    if (drawRouteDebounced.current) {
      clearTimeout(drawRouteDebounced.current);
    }

    // Debounce route drawing to prevent excessive API calls
    drawRouteDebounced.current = setTimeout(async () => {
      console.log('Starting route drawing...');
      // Clear existing route
      clearRouteLine();
      setIsRouting(true);

    try {
      // Use VietMap Service for route calculation
      const data = await vietmapService.getRoute(origin, destination, 'car');
      console.log('VietMap Route API Response:', data);
      
      if (data.paths && data.paths.length > 0) {
        const path = data.paths[0];
        console.log('Route path:', path);
        console.log('Encoded points:', path.points);
        
        // Decode polyline points from VietMap response
        const coordinates = decodePolyline(path.points);
        console.log('Decoded coordinates:', coordinates);
        
        // Draw the actual route
        const sourceId = 'route-line';
        const layerId = 'route-layer';

        // Add source with actual route geometry
        const geoJsonData = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates.map(coord => [coord.lng, coord.lat])
          }
        };
        console.log('GeoJSON data for route:', geoJsonData);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.addSource(sourceId, {
            type: 'geojson',
            data: geoJsonData
          });

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
              'line-color': '#FDC700',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });

          routeLineRef.current = layerId;
          routeSourceRef.current = sourceId;
        }

        // Calculate distance and duration from actual route
        const distanceKm = (path.distance / 1000).toFixed(2);
        const durationMs = path.time; // Already in milliseconds
        const minutes = Math.round(durationMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        const distanceText = `${distanceKm} km`;
        const durationText = hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;
        
        // Calculate fare based on actual distance and unit price
        const fareNumber = parseFloat(distanceKm) * unitPrice;
        const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));

        // Call the parent's route calculation callback
        if (onRouteCalculated) {
          onRouteCalculated(distanceText, durationText, formattedFare);
        }

        // Store the coordinates to prevent redrawing
        lastRouteCoordsRef.current = { origin, destination };
      } else {
        throw new Error('No routes found');
      }
    } catch (error) {
      console.log('Using straight line fallback:', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to straight line if Directions API fails
      const coordinates = [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
      ];

      const sourceId = 'route-line';
      const layerId = 'route-layer';

      console.log('Adding fallback route with coordinates:', coordinates);

      // Add source
      if (mapInstanceRef.current) {
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
            'line-color': '#FDC700',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        routeLineRef.current = layerId;
        routeSourceRef.current = sourceId;
      }

      // Calculate distance using Haversine formula
      const lat1 = origin.lat * Math.PI / 180;
      const lat2 = destination.lat * Math.PI / 180;
      const deltaLat = (destination.lat - origin.lat) * Math.PI / 180;
      const deltaLng = (destination.lng - origin.lng) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distanceKm = 6371 * c; // Earth's radius in km
      const estimatedMinutes = Math.round(distanceKm * 2); // Rough estimate: 2 minutes per km
      const hours = Math.floor(estimatedMinutes / 60);
      const mins = estimatedMinutes % 60;
      
      const distanceText = `${distanceKm.toFixed(2)} km`;
      const durationText = hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;
      
      // Calculate fare
      const fareNumber = distanceKm * (unitPrice || 7000);
      const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));

      console.log('Fallback route calculated:', { distanceText, durationText, formattedFare });

      // Call the parent's route calculation callback
      if (onRouteCalculated) {
        onRouteCalculated(distanceText, durationText, formattedFare);
      }

      // Store the coordinates to prevent redrawing
      lastRouteCoordsRef.current = { origin, destination };
    } finally {
      setIsRouting(false);
    }
    }, 300); // 300ms debounce delay
  }, [isRouting, clearRouteLine, onRouteCalculated]);

  // Initialize map
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    let mapInstance: unknown = null;

    const initMap = async () => {
      try {
        // Check if API key is properly configured
        const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
        console.log('Map initialization - API Key check:', { 
          hasKey: !!apiKey, 
          keyLength: apiKey?.length || 0,
          keyPrefix: apiKey?.substring(0, 10) + '...' || 'none'
        });
        
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          setError('VietMap API key is not configured. Please check .env.local');
          setIsLoading(false);
          return;
        }

        if (!isMounted || !mapRef.current) return;

        // Initialize map
        const map = new vietmapgl.Map({
          container: mapRef.current,
          style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
          center: [schoolLocation.lng, schoolLocation.lat],
          zoom: MAP_ZOOM_LEVEL
        });

        mapInstance = map;
        mapInstanceRef.current = map;

        // Add navigation controls
        map.addControl(new vietmapgl.NavigationControl(), 'top-right');

        // Create school marker with custom icon
        const schoolIcon = document.createElement('div');
        schoolIcon.innerHTML = '🏫';
        schoolIcon.style.fontSize = '24px';
        schoolIcon.style.textAlign = 'center';
        schoolIcon.style.lineHeight = '1';
        
        schoolMarkerRef.current = new vietmapgl.Marker({
          element: schoolIcon,
          anchor: 'center'
        })
          .setLngLat([schoolLocation.lng, schoolLocation.lat])
          .addTo(map);

        // Add school popup
        const schoolPopup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">FPT Primary & Secondary School Da Nang</h3>
              <p class="text-xs text-gray-600">Central pickup point</p>
            </div>
          `);
        
        schoolMarkerRef.current.setPopup(schoolPopup);

        // Handle map clicks
        map.on('click', (e) => {
          const coords = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          };
          onMapClick(coords);
        });

        // Handle map load
        map.on('load', () => {
          if (isMounted) {
            setIsMapLoaded(true);
            setIsLoading(false);
            setError('');
            onMapReady(map);
          }
        });

        // Handle style load - only log, don't redraw routes to prevent flashing
        map.on('styledata', () => {
          if (isMounted && map.isStyleLoaded()) {
            console.log('Map style loaded');
            // Don't redraw routes here to prevent flashing
          }
        });

        map.on('error', (e) => {
          if (isMounted) {
            setError(`Map error: ${e.error?.message || 'Unknown error'}`);
            setIsLoading(false);
          }
        });

      } catch (err) {
        if (isMounted) {
          setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      
      // Abort any ongoing requests
      abortController.abort();
      
      // Clean up debounced timeout
      if (drawRouteDebounced.current) {
        clearTimeout(drawRouteDebounced.current);
        drawRouteDebounced.current = null;
      }
      
      // Clean up markers first
      try {
        clearTempMarker();
        clearRouteLine();
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (schoolMarkerRef.current) {
          schoolMarkerRef.current.remove();
          schoolMarkerRef.current = null;
        }
      } catch (err) {
        console.warn('Error cleaning up markers:', err);
      }
      
      // Clean up map instance last - use the local reference
      try {
        if (mapInstance && isMounted === false) {
          // Only remove if component is unmounting
          try {
            // Remove event listeners first
            (mapInstance as { off: (event: string) => void }).off('click');
            (mapInstance as { off: (event: string) => void }).off('load');
            (mapInstance as { off: (event: string) => void }).off('error');
            (mapInstance as { off: (event: string) => void }).off('styledata');
            
            // Remove the map
            (mapInstance as { remove: () => void }).remove();
          } catch (removeError: unknown) {
            // Ignore AbortError during cleanup
            if ((removeError as Error)?.name !== 'AbortError') {
              console.warn('Error removing map instance:', removeError);
            }
          }
        }
        
        // Clear references
        mapInstance = null;
        mapInstanceRef.current = null;
      } catch (err: unknown) {
        // Ignore AbortError during cleanup
        if ((err as Error)?.name !== 'AbortError') {
          console.warn('Error cleaning up map:', err);
        }
        // Ensure ref is cleared even if cleanup fails
        mapInstance = null;
        mapInstanceRef.current = null;
      }
    };
  }, [onMapReady, onMapClick, setIsMapLoaded, setError, setIsLoading, clearTempMarker, clearRouteLine]);

  // Update markers and routes based on coordinates (optimized to prevent flashing)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    
    // Check if map style is loaded, if not, wait for it
    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting for style load...');
      
      // Wait for style to load
      const waitForStyle = () => {
        if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
          console.log('Map style loaded, proceeding with marker update');
          updateMarkersAndRoutes();
        } else {
          setTimeout(waitForStyle, 100);
        }
      };
      waitForStyle();
      return;
    }
    
    updateMarkersAndRoutes();
    
    function updateMarkersAndRoutes() {

    // Clear existing markers
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    clearTempMarker();

    // Add selected coordinates marker (confirmed location)
    if (selectedCoords) {
      const selectedIcon = document.createElement('div');
      selectedIcon.innerHTML = '🏠';
      selectedIcon.style.fontSize = '20px';
      selectedIcon.style.textAlign = 'center';
      selectedIcon.style.lineHeight = '1';
      selectedIcon.style.backgroundColor = 'white';
      selectedIcon.style.borderRadius = '50%';
      selectedIcon.style.padding = '4px';
      selectedIcon.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      markerRef.current = new vietmapgl.Marker({
        element: selectedIcon,
        anchor: 'center'
      })
        .setLngLat([selectedCoords.lng, selectedCoords.lat])
        .addTo(mapInstanceRef.current!);

      // Add popup
      const popup = new vietmapgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">Selected Location</h3>
            <p class="text-xs text-gray-600">Lat: ${selectedCoords.lat.toFixed(6)}</p>
            <p class="text-xs text-gray-600">Lng: ${selectedCoords.lng.toFixed(6)}</p>
          </div>
        `);
      
      markerRef.current.setPopup(popup);

      // Draw route for confirmed location (only if not already drawn)
      setTimeout(() => {
        if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
          drawRoute(schoolLocation, selectedCoords);
        }
      }, 100);
    }

    // Add temporary coordinates marker (preview location)
    if (tempCoords && !selectedCoords) {
      console.log('Adding temp marker at:', tempCoords);
      
      const tempIcon = document.createElement('div');
      tempIcon.innerHTML = '📍';
      tempIcon.style.fontSize = '18px';
      tempIcon.style.textAlign = 'center';
      tempIcon.style.lineHeight = '1';
      tempIcon.style.backgroundColor = 'white';
      tempIcon.style.borderRadius = '50%';
      tempIcon.style.padding = '3px';
      tempIcon.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      tempIcon.style.border = '2px solid #FFA500';
      
      tempMarkerRef.current = new vietmapgl.Marker({
        element: tempIcon,
        anchor: 'center'
      })
        .setLngLat([tempCoords.lng, tempCoords.lat])
        .addTo(mapInstanceRef.current!);

      // Add popup
      const tempPopup = new vietmapgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">Temporary Location</h3>
            <p class="text-xs text-gray-600">Click marker to confirm</p>
          </div>
        `);
      
      tempMarkerRef.current.setPopup(tempPopup);
      
      // Add click listener to temp marker for confirmation
      const clickHandler = () => {
        onMarkerClick(tempCoords);
      };
      tempMarkerClickListenerRef.current = clickHandler;
      tempMarkerRef.current.getElement().addEventListener('click', clickHandler);
      
      // Draw route from school to temp location (only if not already drawn)
      setTimeout(() => {
        if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
          drawRoute(schoolLocation, tempCoords);
        }
      }, 100);
    }
    }
  }, [selectedCoords, tempCoords, isMapLoaded, clearTempMarker, drawRoute, schoolLocation, onMarkerClick]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải bản đồ...</h3>
            <p className="text-gray-500">Đang khởi tạo VietMap</p>
          </div>
        </div>
      )}
    </div>
  );
}
