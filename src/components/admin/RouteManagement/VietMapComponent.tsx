'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { RouteDto } from '@/services/routeService/routeService.types';

interface VietMapComponentProps {
  routes: RouteDto[];
  selectedRouteIds: string[];
  className?: string;
  showControls?: boolean;
  markerSize?: 'small' | 'medium' | 'large';
  strokeWeight?: number;
}

const SCHOOL_LOCATION = {
  lat: 10.790353,
  lng: 106.748036
};

const VietMapComponent: React.FC<VietMapComponentProps> = ({
  routes,
  selectedRouteIds,
  className = "w-full h-full",
  showControls = true,
  markerSize = 'medium',
  strokeWeight = 4
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<vietmapgl.Map | null>(null);
  const markersRef = useRef<vietmapgl.Marker[]>([]);
  const schoolMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const polylinesRef = useRef<string[]>([]);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState('');

  // Route colors for different routes
  const routeColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

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

      // Clear polylines
      if (mapInstanceRef.current) {
        polylinesRef.current.forEach(polylineId => {
          try {
            if (mapInstanceRef.current?.getLayer(polylineId)) {
              mapInstanceRef.current.removeLayer(polylineId);
            }
            if (mapInstanceRef.current?.getSource(polylineId)) {
              mapInstanceRef.current.removeSource(polylineId);
            }
          } catch (err) {
            console.warn('Error removing polyline:', err);
          }
        });
        polylinesRef.current = [];
      }
    } catch (err) {
      console.warn('Error clearing map elements:', err);
    }
  }, []);

  // Add route markers and polylines
  const addRouteElements = useCallback(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    
    // Check if map style is loaded
    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.warn('Map style not loaded yet, skipping route elements');
      return;
    }

    const selectedRoutes = routes.filter(route => selectedRouteIds.includes(route.id));
    
    selectedRoutes.forEach((route, routeIndex) => {
      const color = routeColors[routeIndex % routeColors.length];
      
      // Add pickup point markers
      route.pickupPoints.forEach((point, pointIndex) => {
        const pickupIcon = document.createElement('div');
        pickupIcon.innerHTML = '🚌';
        pickupIcon.style.fontSize = `${currentMarkerSize.fontSize}px`;
        pickupIcon.style.textAlign = 'center';
        pickupIcon.style.lineHeight = '1';
        pickupIcon.style.backgroundColor = 'white';
        pickupIcon.style.borderRadius = '50%';
        pickupIcon.style.padding = '2px';
        pickupIcon.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        pickupIcon.style.border = `2px solid ${color}`;
        
        const marker = new vietmapgl.Marker({
          element: pickupIcon,
          anchor: 'center'
        })
          .setLngLat([point.location.longitude, point.location.latitude])
          .addTo(mapInstanceRef.current!);

        // Add popup
        const popup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${point.location.address}</h3>
              <p class="text-xs text-gray-600">Students: ${point.studentCount}</p>
              <p class="text-xs text-gray-600">Route: ${route.routeName}</p>
            </div>
          `);
        
        marker.setPopup(popup);
        markersRef.current.push(marker);
      });

      // Add route polyline
      if (route.pickupPoints.length > 1) {
        const coordinates = route.pickupPoints.map(point => [point.location.longitude, point.location.latitude]);
        
        const sourceId = `route-${route.id}`;
        const layerId = `route-layer-${route.id}`;

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
              'line-color': color,
              'line-width': strokeWeight
            }
          });
        }

        polylinesRef.current.push(layerId);
      }
    });
  }, [routes, selectedRouteIds, isMapLoaded, currentMarkerSize.size, strokeWeight]);

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

        // Initialize map
        const map = new vietmapgl.Map({
          container: mapRef.current,
          style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
          center: [SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat],
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
        schoolIcon.style.fontSize = '20px';
        schoolIcon.style.textAlign = 'center';
        schoolIcon.style.lineHeight = '1';
        
        const schoolMarker = new vietmapgl.Marker({
          element: schoolIcon,
          anchor: 'center'
        })
          .setLngLat([SCHOOL_LOCATION.lng, SCHOOL_LOCATION.lat])
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
        map.on('styledata', () => {
          if (isMounted) {
            // Redraw route elements when style is loaded
            setTimeout(() => {
              if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
                clearMapElements();
                addRouteElements();
              }
            }, 100);
          }
        });

        map.on('error', (e) => {
          if (isMounted) {
            setError(`Map error: ${e.error?.message || 'Unknown error'}`);
          }
        });

      } catch (err) {
        if (isMounted) {
          setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      
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
          // Remove all event listeners first
          mapInstanceRef.current.off('load', () => {});
          mapInstanceRef.current.off('error', () => {});
          mapInstanceRef.current.off('styledata', () => {});
          
          // Then remove the map
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Error cleaning up map:', err);
      }
    };
  }, [clearMapElements, showControls]);

  // Update map elements when routes or selection changes
  useEffect(() => {
    if (!isMapLoaded) return;

    setTimeout(() => {
      if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
        clearMapElements();
        addRouteElements();
      }
    }, 100);
  }, [isMapLoaded, addRouteElements, clearMapElements]);

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
