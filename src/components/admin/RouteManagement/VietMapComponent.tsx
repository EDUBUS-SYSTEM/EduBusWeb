'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { RouteDto } from '@/services/routeService/routeService.types';
import { vietmapService } from '@/services/vietmapService';

interface VietMapComponentProps {
  routes: RouteDto[];
  selectedRouteIds: string[];
  className?: string;
  showControls?: boolean;
  markerSize?: 'small' | 'medium' | 'large';
  strokeWeight?: number;
  schoolLocation?: { lat: number; lng: number };
}

// Default fallback location (Đà Nẵng)
const DEFAULT_SCHOOL_LOCATION = {
  lat: 15.9796,
  lng: 108.2605
};

// Stable color assignment - colors will remain consistent regardless of route order
const ROUTE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF6347',
  '#DDA0DD', '#98D8C8', '#20B2AA', '#BB8FCE', '#85C1E9'
];

// Hash function for stable color assignment based on route ID
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get stable color for a route based on its ID
const getRouteColor = (routeId: string): string => {
  const hash = hashString(routeId);
  return ROUTE_COLORS[hash % ROUTE_COLORS.length];
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

// Get actual route coordinates using VietMap Routing API
const getRouteCoordinates = async (
  route: RouteDto,
  schoolLocation: { lat: number; lng: number }
): Promise<number[][]> => {
  try {
    const sortedPoints = route.pickupPoints.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    if (sortedPoints.length === 0) {
      return [];
    }

    // Start from school
    let currentPoint = schoolLocation;
    const allCoordinates: number[][] = [];

    // Route from school to first pickup point
    if (sortedPoints.length > 0) {
      const firstPoint = sortedPoints[0].location;
      const routeResult = await vietmapService.getRoute(
        currentPoint,
        { lat: firstPoint.latitude, lng: firstPoint.longitude },
        'car'
      );

      if (routeResult.paths && routeResult.paths.length > 0) {
        const decodedPoints = decodePolyline(routeResult.paths[0].points);
        allCoordinates.push(...decodedPoints);
        currentPoint = { lat: firstPoint.latitude, lng: firstPoint.longitude };
      }
    }

    // Route between pickup points
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const currentPickupPoint = sortedPoints[i].location;
      const nextPickupPoint = sortedPoints[i + 1].location;

      const routeResult = await vietmapService.getRoute(
        { lat: currentPickupPoint.latitude, lng: currentPickupPoint.longitude },
        { lat: nextPickupPoint.latitude, lng: nextPickupPoint.longitude },
        'car'
      );

      if (routeResult.paths && routeResult.paths.length > 0) {
        const decodedPoints = decodePolyline(routeResult.paths[0].points);
        // Skip first point to avoid duplication
        allCoordinates.push(...decodedPoints.slice(1));
      }
    }

    // Route from last pickup point back to school
    if (sortedPoints.length > 0) {
      const lastPoint = sortedPoints[sortedPoints.length - 1].location;
      const routeResult = await vietmapService.getRoute(
        { lat: lastPoint.latitude, lng: lastPoint.longitude },
        schoolLocation,
        'car'
      );

      if (routeResult.paths && routeResult.paths.length > 0) {
        const decodedPoints = decodePolyline(routeResult.paths[0].points);
        // Skip first point to avoid duplication
        allCoordinates.push(...decodedPoints.slice(1));
      }
    }

    return allCoordinates;
  } catch (error) {
    console.error(`Error getting route coordinates for ${route.routeName}:`, error);

    // Fallback to straight line if routing fails
    const sortedPoints = route.pickupPoints.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const coordinates = [
      [schoolLocation.lng, schoolLocation.lat],
      ...sortedPoints.map(point => [point.location.longitude, point.location.latitude]),
      [schoolLocation.lng, schoolLocation.lat]
    ];
    return coordinates;
  }
};

const VietMapComponent: React.FC<VietMapComponentProps> = ({
  routes,
  selectedRouteIds,
  className = "w-full h-full",
  showControls = true,
  markerSize = 'medium',
  strokeWeight = 4,
  schoolLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const markersRef = useRef<vietmapgl.Marker[]>([]);
  const schoolMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const polylinesRef = useRef<string[]>([]);
  const sourcesRef = useRef<string[]>([]); // Track sources separately
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // Marker sizes
  const markerSizes = {
    small: { size: 20, fontSize: 10 },
    medium: { size: 24, fontSize: 12 },
    large: { size: 28, fontSize: 14 }
  };

  const currentMarkerSize = markerSizes[markerSize];

  // Clear existing markers and polylines
  const clearMapElements = useCallback(() => {
    try {
      // Clear markers
      markersRef.current.forEach(marker => {
        if (marker) {
          marker.remove();
        }
      });
      markersRef.current = [];

      // Clear polylines and sources properly
      if (mapInstanceRef.current) {
        // Remove layers first
        polylinesRef.current.forEach(layerId => {
          try {
            if (mapInstanceRef.current?.getLayer(layerId)) {
              mapInstanceRef.current.removeLayer(layerId);
            }
          } catch (err) {
            console.warn('Error removing layer:', layerId, err);
          }
        });
        polylinesRef.current = [];

        // Remove sources using correct source IDs
        sourcesRef.current.forEach(sourceId => {
          try {
            if (mapInstanceRef.current?.getSource(sourceId)) {
              mapInstanceRef.current.removeSource(sourceId);
            }
          } catch (err) {
            console.warn('Error removing source:', sourceId, err);
          }
        });
        sourcesRef.current = [];
      }
    } catch (err) {
      console.warn('Error clearing map elements:', err);
    }
  }, []);

  // Add route markers and polylines
  const addRouteElements = useCallback(async () => {
    if (!mapInstanceRef.current || !isMapLoaded) {
      return;
    }

    // Check if map style is loaded
    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.warn('Map style not loaded yet, skipping route elements');
      return;
    }

    const selectedRoutes = routes.filter(route => selectedRouteIds.includes(route.id));

    // Process routes sequentially to avoid API rate limits
    for (const route of selectedRoutes) {
      // Use stable color based on route ID
      const color = getRouteColor(route.id);

      // Add pickup point markers
      // Add pickup point markers using symbol markers
      route.pickupPoints
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .forEach((point, pointIndex) => {
          // Add the main bus marker
          const busMarker = new vietmapgl.Marker({
            element: (() => {
              const el = document.createElement('div');
              el.innerHTML = '🚌';
              el.style.fontSize = `${currentMarkerSize.fontSize}px`;
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
            .setLngLat([point.location.longitude, point.location.latitude])
            .addTo(mapInstanceRef.current!);

          // Add order number marker slightly offset
          const orderMarker = new vietmapgl.Marker({
            element: (() => {
              const el = document.createElement('div');
              el.innerHTML = `${point.sequenceOrder}`;
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
            offset: [12, -12] // Offset to position near the bus icon
          })
            .setLngLat([point.location.longitude, point.location.latitude])
            .addTo(mapInstanceRef.current!);

          // Add popup to the main marker
          const popup = new vietmapgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
          })
            .setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${point.location.address}</h3>
          <p class="text-xs text-gray-600">Students: ${point.studentCount}</p>
          <p class="text-xs text-gray-600">Route: ${route.routeName}</p>
          <p class="text-xs text-gray-500">Stop ${point.sequenceOrder}</p>
        </div>
      `);

          busMarker.setPopup(popup);

          // Store both markers for cleanup
          markersRef.current.push(busMarker);
          markersRef.current.push(orderMarker);
        });

      // Add route polyline using actual road routes
      if (route.pickupPoints.length > 0) {
        try {
          const currentSchoolLocation = schoolLocation || DEFAULT_SCHOOL_LOCATION;
          const coordinates = await getRouteCoordinates(route, currentSchoolLocation);

          const sourceId = `route-${route.id}`;
          const layerId = `route-layer-${route.id}`;

          // Check if source already exists
          if (mapInstanceRef.current && !mapInstanceRef.current.getSource(sourceId)) {
            try {
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
                  'line-width': strokeWeight
                }
              });
              polylinesRef.current.push(layerId);
            } catch (err) {
              console.error(`Error adding route ${route.routeName}:`, err);
            }
          } else {
            console.warn(`Source ${sourceId} already exists, skipping`);
          }
        } catch (error) {
          console.error(`Error getting route coordinates for ${route.routeName}:`, error);
        }
      }
    }
  }, [routes, selectedRouteIds, isMapLoaded, markerSize, strokeWeight, schoolLocation]);

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

        const currentSchoolLocation = schoolLocation || DEFAULT_SCHOOL_LOCATION;

        // Initialize map
        const map = new vietmapgl.Map({
          container: mapRef.current,
          style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
          center: [currentSchoolLocation.lng, currentSchoolLocation.lat],
          zoom: 13
        });

        mapInstanceRef.current = map;

        // Add navigation controls if enabled
        if (showControls) {
          map.addControl(new vietmapgl.NavigationControl(), 'top-right');
        }

        // Add school marker with custom icon
        const schoolIcon = document.createElement('div');
        schoolIcon.innerHTML = '🏫';
        schoolIcon.style.fontSize = '40px';
        schoolIcon.style.textAlign = 'center';
        schoolIcon.style.lineHeight = '1';

        const schoolMarker = new vietmapgl.Marker({
          element: schoolIcon,
          anchor: 'center'
        })
          .setLngLat([currentSchoolLocation.lng, currentSchoolLocation.lat])
          .addTo(map);

        // Add school popup
        const schoolPopup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">School Location</h3>
              <p class="text-xs text-gray-600">Central pickup point</p>
            </div>
          `);

        schoolMarker.setPopup(schoolPopup);
        schoolMarkerRef.current = schoolMarker;

        // Handle map load
        map.on('load', () => {
          if (isMounted) {
            setIsMapLoaded(true);
            setError('');
          }
        });

        // Handle style load - redraw route elements if needed

        map.on('error', (e) => {
          if (isMounted) {
            console.error('Map error:', e);
            setError(`Map error: ${e.error?.message || 'Unknown error'}`);
          }
        });

      } catch (err) {
        if (isMounted) {
          console.error('Failed to initialize map:', err);
          setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clean up map elements first
      try {
        clearMapElements();
        if (schoolMarkerRef.current) {
          schoolMarkerRef.current.remove();
          schoolMarkerRef.current = null;
        }
      } catch (err) {
        console.warn('Error cleaning up map elements:', err);
      }

      // Clean up map instance last
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Error cleaning up map:', err);
      }
    };
  }, [clearMapElements, showControls, schoolLocation]);

  // Update map elements when routes or selection changes
  useEffect(() => {
    if (!isMapLoaded) return;

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    const timeoutId = setTimeout(async () => {
      if (mapInstanceRef.current &&
        mapInstanceRef.current.isStyleLoaded() &&
        !abortControllerRef.current?.signal.aborted) {
        clearMapElements();
        await addRouteElements();
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [routes, selectedRouteIds, isMapLoaded]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div ref={mapRef} className="w-full h-full" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VietMapComponent;