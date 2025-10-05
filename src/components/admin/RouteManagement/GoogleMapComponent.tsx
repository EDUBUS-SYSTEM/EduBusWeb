'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { RouteDto } from '@/services/routeService/routeService.types';

interface GoogleMapComponentProps {
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

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  routes,
  selectedRouteIds,
  className = "w-full h-full",
  showControls = true,
  markerSize = 'medium',
  strokeWeight = 4
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const schoolMarkerRef = useRef<google.maps.Marker | null>(null);
  
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

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          setError('Google Maps API key not configured');
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry'],
          language: 'vi',
          region: 'VN'
        });

        const { Map } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');
        const { DirectionsService, DirectionsRenderer } = await loader.importLibrary('routes');

        if (!isMounted || !mapRef.current) return;

        // Initialize map
        const map = new Map(mapRef.current, {
          center: SCHOOL_LOCATION,
          zoom: 13,
          mapTypeControl: showControls,
          streetViewControl: showControls,
          fullscreenControl: showControls,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          gestureHandling: 'greedy',
          clickableIcons: false
        });

        mapInstanceRef.current = map;
        directionsServiceRef.current = new DirectionsService();

        // Add school marker
        const schoolMarker = new Marker({
          position: SCHOOL_LOCATION,
          map: map,
          title: 'FPT School',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="${currentMarkerSize.size + 8}" height="${currentMarkerSize.size + 8}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF6B6B"/>
                <path d="M2 17L12 22L22 17" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#FF6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(currentMarkerSize.size + 8, currentMarkerSize.size + 8),
            anchor: new google.maps.Point((currentMarkerSize.size + 8) / 2, (currentMarkerSize.size + 8) / 2)
          }
        });
        schoolMarkerRef.current = schoolMarker;

        setIsMapLoaded(true);
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Failed to load map');
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [showControls, currentMarkerSize.size]);

  // Clear all routes and markers
  const clearMap = useCallback(() => {
    // Clear directions renderers
    directionsRenderersRef.current.forEach(renderer => {
      renderer.setMap(null);
    });
    directionsRenderersRef.current = [];

    // Clear pickup point markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // Draw route on map
  const drawRoute = useCallback(async (route: RouteDto, color: string) => {
    if (!directionsServiceRef.current || !mapInstanceRef.current || route.pickupPoints.length === 0) {
      return;
    }

    try {
      // Sort pickup points by sequence order
      const sortedPoints = [...route.pickupPoints].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      
      // Create waypoints (excluding first and last points)
      const waypoints = sortedPoints.slice(1, -1).map(point => ({
        location: new google.maps.LatLng(point.location.latitude, point.location.longitude),
        stopover: true
      }));

      // Create directions request
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(sortedPoints[0].location.latitude, sortedPoints[0].location.longitude),
        destination: new google.maps.LatLng(sortedPoints[sortedPoints.length - 1].location.latitude, sortedPoints[sortedPoints.length - 1].location.longitude),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false, // Keep the sequence order
        provideRouteAlternatives: false
      };

      // Add school as final destination if not already the last point
      const lastPoint = sortedPoints[sortedPoints.length - 1];
      const schoolDistance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(lastPoint.location.latitude, lastPoint.location.longitude),
        new google.maps.LatLng(SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng)
      );

      // If last pickup point is far from school, add school as final destination
      if (schoolDistance > 1000) { // More than 1km from school
        request.destination = new google.maps.LatLng(SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
        if (!request.waypoints) {
          request.waypoints = [];
        }
        request.waypoints.push({
          location: new google.maps.LatLng(lastPoint.location.latitude, lastPoint.location.longitude),
          stopover: true
        });
      }

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsServiceRef.current!.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      // Create directions renderer
      const renderer = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        directions: result,
        suppressMarkers: true, // We'll add custom markers
        polylineOptions: {
          strokeColor: color,
          strokeWeight: strokeWeight,
          strokeOpacity: 0.8
        }
      });

      directionsRenderersRef.current.push(renderer);

      // Add custom markers for pickup points
      sortedPoints.forEach((point, index) => {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(point.location.latitude, point.location.longitude),
          map: mapInstanceRef.current,
          title: `${point.location.address} (${point.studentCount} students)`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="${currentMarkerSize.size}" height="${currentMarkerSize.size}" viewBox="0 0 ${currentMarkerSize.size} ${currentMarkerSize.size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${currentMarkerSize.size / 2}" cy="${currentMarkerSize.size / 2}" r="${currentMarkerSize.size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
                <text x="${currentMarkerSize.size / 2}" y="${currentMarkerSize.size / 2 + 2}" text-anchor="middle" fill="white" font-size="${currentMarkerSize.fontSize}" font-weight="bold">${index + 1}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(currentMarkerSize.size, currentMarkerSize.size),
            anchor: new google.maps.Point(currentMarkerSize.size / 2, currentMarkerSize.size / 2)
          }
        });

        markersRef.current.push(marker);
      });

    } catch (error) {
      console.error(`Failed to draw route ${route.routeName}:`, error);
    }
  }, [strokeWeight, currentMarkerSize]);

  // Update map when selected routes change
  useEffect(() => {
    if (!isMapLoaded) return;

    clearMap();

    // Draw selected routes
    selectedRouteIds.forEach((routeId, index) => {
      const route = routes.find(r => r.id === routeId);
      if (route && route.pickupPoints.length > 0) {
        const color = routeColors[index % routeColors.length];
        drawRoute(route, color);
      }
    });

    // Fit map to show all routes
    if (selectedRouteIds.length > 0 && mapInstanceRef.current) {
      const bounds = new google.maps.LatLngBounds();
      
      // Add school location
      bounds.extend(new google.maps.LatLng(SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng));
      
      // Add all pickup points from selected routes
      selectedRouteIds.forEach(routeId => {
        const route = routes.find(r => r.id === routeId);
        if (route) {
          route.pickupPoints.forEach(point => {
            bounds.extend(new google.maps.LatLng(point.location.latitude, point.location.longitude));
          });
        }
      });

      mapInstanceRef.current.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current!.getZoom()! > 15) {
          mapInstanceRef.current!.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [selectedRouteIds, routes, isMapLoaded, clearMap, drawRoute]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
      />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;