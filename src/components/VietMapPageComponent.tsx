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


  const clearTempMarker = useCallback(() => {
    try {
      if (tempMarkerRef.current) {

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

      lastRouteCoordsRef.current = null;
    } catch (err) {
      console.warn('Error clearing route line:', err);
      routeLineRef.current = null;
      routeSourceRef.current = null;
      lastRouteCoordsRef.current = null;
    }
  }, []);


  const drawRouteDebounced = useRef<NodeJS.Timeout | null>(null);

  const drawRoute = useCallback(async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    console.log('drawRoute called with:', { origin, destination, isRouting });

    if (!mapInstanceRef.current || isRouting) {
      console.log('drawRoute skipped: no map or already routing');
      return;
    }


    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.warn('Map style not loaded yet, skipping route drawing');
      return;
    }


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


    drawRouteDebounced.current = setTimeout(async () => {
      console.log('Starting route drawing...');

      clearRouteLine();
      setIsRouting(true);

      try {

        const data = await vietmapService.getRoute(origin, destination, 'car');
        console.log('VietMap Route API Response:', data);

        if (data.paths && data.paths.length > 0) {
          const path = data.paths[0];
          console.log('Route path:', path);
          console.log('Encoded points:', path.points);


          const coordinates = decodePolyline(path.points);
          console.log('Decoded coordinates:', coordinates);


          const sourceId = 'route-line';
          const layerId = 'route-layer';


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


            mapInstanceRef.current.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#0066CC',
                'line-width': 4,
                'line-opacity': 0.8
              }
            });

            routeLineRef.current = layerId;
            routeSourceRef.current = sourceId;
          }


          const distanceKm = (path.distance / 1000).toFixed(2);
          const durationMs = path.time;
          const minutes = Math.round(durationMs / (1000 * 60));
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;

          const distanceText = `${distanceKm} km`;
          const durationText = hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;


          const fareNumber = parseFloat(distanceKm) * unitPrice;
          const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));


          if (onRouteCalculated) {
            onRouteCalculated(distanceText, durationText, formattedFare);
          }


          lastRouteCoordsRef.current = { origin, destination };
        } else {
          throw new Error('No routes found');
        }
      } catch (error) {
        console.log('Using straight line fallback:', error instanceof Error ? error.message : 'Unknown error');


        const coordinates = [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat]
        ];

        const sourceId = 'route-line';
        const layerId = 'route-layer';

        console.log('Adding fallback route with coordinates:', coordinates);


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


        const lat1 = origin.lat * Math.PI / 180;
        const lat2 = destination.lat * Math.PI / 180;
        const deltaLat = (destination.lat - origin.lat) * Math.PI / 180;
        const deltaLng = (destination.lng - origin.lng) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distanceKm = 6371 * c;
        const estimatedMinutes = Math.round(distanceKm * 2);
        const hours = Math.floor(estimatedMinutes / 60);
        const mins = estimatedMinutes % 60;

        const distanceText = `${distanceKm.toFixed(2)} km`;
        const durationText = hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;


        const fareNumber = distanceKm * (unitPrice || 7000);
        const formattedFare = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.round(fareNumber));

        console.log('Fallback route calculated:', { distanceText, durationText, formattedFare });


        if (onRouteCalculated) {
          onRouteCalculated(distanceText, durationText, formattedFare);
        }


        lastRouteCoordsRef.current = { origin, destination };
      } finally {
        setIsRouting(false);
      }
    }, 300);
  }, [isRouting, clearRouteLine, onRouteCalculated]);


  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    let mapInstance: unknown = null;

    const initMap = async () => {
      try {

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


        const map = new vietmapgl.Map({
          container: mapRef.current,
          style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
          center: [schoolLocation.lng, schoolLocation.lat],
          zoom: MAP_ZOOM_LEVEL
        });

        mapInstance = map;
        mapInstanceRef.current = map;


        map.addControl(new vietmapgl.NavigationControl(), 'top-right');


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


        const schoolPopup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">FPT Primary & Secondary School Da Nang</h3>
              <p class="text-xs text-gray-600">Central pickup point</p>
            </div>
          `);

        schoolMarkerRef.current.setPopup(schoolPopup);


        map.on('click', (e) => {
          const coords = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          };
          onMapClick(coords);
        });


        map.on('load', () => {
          if (isMounted) {
            setIsMapLoaded(true);
            setIsLoading(false);
            setError('');
            onMapReady(map);
          }
        });


        map.on('styledata', () => {
          if (isMounted && map.isStyleLoaded()) {
            console.log('Map style loaded');

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


      abortController.abort();


      if (drawRouteDebounced.current) {
        clearTimeout(drawRouteDebounced.current);
        drawRouteDebounced.current = null;
      }


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


      try {
        if (mapInstance && isMounted === false) {

          try {

            (mapInstance as { off: (event: string) => void }).off('click');
            (mapInstance as { off: (event: string) => void }).off('load');
            (mapInstance as { off: (event: string) => void }).off('error');
            (mapInstance as { off: (event: string) => void }).off('styledata');


            (mapInstance as { remove: () => void }).remove();
          } catch (removeError: unknown) {

            if ((removeError as Error)?.name !== 'AbortError') {
              console.warn('Error removing map instance:', removeError);
            }
          }
        }


        mapInstance = null;
        mapInstanceRef.current = null;
      } catch (err: unknown) {

        if ((err as Error)?.name !== 'AbortError') {
          console.warn('Error cleaning up map:', err);
        }

        mapInstance = null;
        mapInstanceRef.current = null;
      }
    };
  }, [onMapReady, onMapClick, setIsMapLoaded, setError, setIsLoading, clearTempMarker, clearRouteLine]);


  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;


    if (!mapInstanceRef.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting for style load...');


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


      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      clearTempMarker();


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


        const popup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">Selected Location</h3>
            <p class="text-xs text-gray-600">Lat: ${selectedCoords.lat.toFixed(6)}</p>
            <p class="text-xs text-gray-600">Lng: ${selectedCoords.lng.toFixed(6)}</p>
          </div>
        `);

        markerRef.current.setPopup(popup);


        setTimeout(() => {
          if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
            drawRoute(schoolLocation, selectedCoords);
          }
        }, 100);
      }


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


        const tempPopup = new vietmapgl.Popup({ offset: 25 })
          .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">Temporary Location</h3>
            <p class="text-xs text-gray-600">Click marker to confirm</p>
          </div>
        `);

        tempMarkerRef.current.setPopup(tempPopup);


        const clickHandler = () => {
          onMarkerClick(tempCoords);
        };
        tempMarkerClickListenerRef.current = clickHandler;
        tempMarkerRef.current.getElement().addEventListener('click', clickHandler);


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
