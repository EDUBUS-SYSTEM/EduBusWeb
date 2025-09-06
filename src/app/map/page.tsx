'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader } from '@googlemaps/js-api-loader';

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const schoolMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [distance, setDistance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // FPT School Đà Nẵng - Khu A3-1, Khu đô thị Công nghệ FPT, phường Hòa Hải, quận Ngũ Hành Sơn
  const schoolLocation = {
    lat: 16.0544,
    lng: 108.2022
  };

  // Memoized distance calculation
  const calculateDistance = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    if (window.google?.maps?.geometry?.spherical) {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(origin.lat, origin.lng),
        new google.maps.LatLng(destination.lat, destination.lng)
      );
      
      const distanceKm = (distance / 1000).toFixed(2);
      setDistance(`${distanceKm} km`);
    }
  }, []);

  // Memoized route drawing
  const drawRoute = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    if (directionsServiceRef.current && directionsRendererRef.current) {
      directionsServiceRef.current.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRendererRef.current?.setDirections(result);
          }
        }
      );
    }
  }, []);

  // Create home marker
  const createHomeMarker = useCallback((lat: number, lng: number, map: google.maps.Map) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: 'Vị trí nhà bạn',
      icon: {
        url: '/edubus_logo.png',
        scaledSize: new google.maps.Size(35, 35),
        anchor: new google.maps.Point(17.5, 17.5)
      },
      draggable: true
    });

    // Add drag listener
    markerRef.current.addListener('dragend', () => {
      const newPosition = markerRef.current?.getPosition();
      if (newPosition) {
        const newLat = newPosition.lat();
        const newLng = newPosition.lng();
        calculateDistance(schoolLocation, { lat: newLat, lng: newLng });
        drawRoute(schoolLocation, { lat: newLat, lng: newLng });
      }
    });

    // Calculate distance and draw route
    calculateDistance(schoolLocation, { lat, lng });
    drawRoute(schoolLocation, { lat, lng });
  }, [calculateDistance, drawRoute]);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        // Check if API key is properly configured
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          setError('API key chưa được cấu hình. Vui lòng kiểm tra file .env.local');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const { Map } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');
        const { DirectionsService, DirectionsRenderer } = await loader.importLibrary('routes');

        if (!isMounted || !mapRef.current) return;

        // Initialize map with optimized settings
        const map = new Map(mapRef.current, {
          center: schoolLocation,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
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

        // Initialize services
        directionsServiceRef.current = new DirectionsService();
        directionsRendererRef.current = new DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#FDC700',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        directionsRendererRef.current.setMap(map);

        // Create school marker with custom icon
        schoolMarkerRef.current = new Marker({
          position: schoolLocation,
          map: map,
          title: 'Trường Tiểu học và THCS FPT Đà Nẵng',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="50" height="65" viewBox="0 0 50 65" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
                  </filter>
                </defs>
                <!-- School building -->
                <rect x="10" y="20" width="30" height="20" fill="#FDC700" stroke="#D08700" stroke-width="1.5" filter="url(#shadow)"/>
                <rect x="15" y="25" width="4" height="4" fill="#D08700"/>
                <rect x="21" y="25" width="4" height="4" fill="#D08700"/>
                <rect x="27" y="25" width="4" height="4" fill="#D08700"/>
                <rect x="15" y="31" width="4" height="4" fill="#D08700"/>
                <rect x="21" y="31" width="4" height="4" fill="#D08700"/>
                <rect x="27" y="31" width="4" height="4" fill="#D08700"/>
                <!-- Roof -->
                <polygon points="10,20 25,8 40,20" fill="#D08700" filter="url(#shadow)"/>
                <!-- Flag -->
                <rect x="23" y="8" width="2" height="12" fill="#8B4513"/>
                <rect x="25" y="8" width="6" height="4" fill="#FF0000"/>
                <!-- Marker pin -->
                <circle cx="25" cy="55" r="6" fill="#FDC700" stroke="#D08700" stroke-width="1.5" filter="url(#shadow)"/>
                <circle cx="25" cy="55" r="3" fill="#D08700"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
          }
        });

        // Add school info window
        const schoolInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; text-align: center; font-family: Arial, sans-serif; max-width: 200px;">
              <div style="font-weight: bold; color: #D08700; font-size: 14px; margin-bottom: 5px;">
                🏫 Trường Tiểu học và THCS FPT Đà Nẵng
              </div>
              <div style="font-size: 11px; color: #666; line-height: 1.4;">
                Khu A3-1, Khu đô thị Công nghệ FPT<br>
                Phường Hòa Hải, Quận Ngũ Hành Sơn<br>
                Đà Nẵng 550000
              </div>
            </div>
          `,
          position: schoolLocation
        });

        // Show info window on school marker click
        schoolMarkerRef.current.addListener('click', () => {
          schoolInfoWindow.open(map, schoolMarkerRef.current);
        });

        // Add click listener to map
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            createHomeMarker(lat, lng, map);
          }
        });

        setIsMapLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        
        // Check for specific billing error
        if (error instanceof Error && error.message.includes('BillingNotEnabledMapError')) {
          setError('Billing chưa được kích hoạt. Vui lòng bật billing trong Google Cloud Console để sử dụng Google Maps API.');
        } else if (error instanceof Error && error.message.includes('ApiNotActivatedMapError')) {
          setError('Google Maps API chưa được kích hoạt. Vui lòng kích hoạt Maps JavaScript API trong Google Cloud Console.');
        } else {
          setError('Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng và API key.');
        }
        
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [createHomeMarker]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current || !isMapLoaded) return;

    setError('');
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Center map on searched location
          mapInstanceRef.current?.setCenter({ lat, lng });
          mapInstanceRef.current?.setZoom(15);

          // Create home marker
          if (mapInstanceRef.current) {
            createHomeMarker(lat, lng, mapInstanceRef.current);
          }
        } else {
          setError('Không tìm thấy địa chỉ. Vui lòng thử lại với địa chỉ khác.');
        }
      });
    } catch (error) {
      console.error('Error searching address:', error);
      setError('Có lỗi xảy ra khi tìm kiếm địa chỉ.');
    }
  }, [searchQuery, isMapLoaded, createHomeMarker]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between px-6 py-4 bg-[#FEFCE8] shadow-soft"
      >
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src="/edubus_logo.png"
              alt="EduBus Logo"
              width={60}
              height={60}
              className="drop-shadow-lg"
            />
          </motion.div>
          <span className="text-2xl font-bold text-[#D08700]">EduBus - Tìm đường</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="bg-[#FDC700] text-black px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Về trang chủ
        </motion.button>
      </motion.header>

      {/* Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#FEFCE8] px-6 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Tìm khoảng cách từ nhà đến trường
            </h1>
            <p className="text-gray-600">
              Nhập địa chỉ nhà của bạn hoặc click trên bản đồ để xác định vị trí
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập địa chỉ nhà của bạn..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg"
                disabled={!isMapLoaded}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={!isMapLoaded || !searchQuery.trim()}
              className="bg-[#FDC700] text-black px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tìm kiếm
            </motion.button>
          </div>

          {distance && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="bg-white rounded-2xl p-4 shadow-soft-lg inline-block">
                <p className="text-lg font-semibold text-gray-800">
                  Khoảng cách: <span className="text-[#D08700] text-2xl font-bold">{distance}</span>
                </p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <div className="bg-red-100 border border-red-300 rounded-2xl p-4 inline-block">
                <p className="text-red-600">{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Map Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative h-[600px] w-full"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700] mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải bản đồ...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Không thể tải bản đồ</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="bg-white rounded-2xl p-4 text-left">
                <h4 className="font-semibold text-gray-800 mb-2">Hướng dẫn khắc phục:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Kiểm tra API key trong file .env.local</li>
                  <li>• Bật billing trong Google Cloud Console</li>
                  <li>• Kích hoạt Maps JavaScript API</li>
                  <li>• Kiểm tra kết nối mạng</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '600px' }}
        />
      </motion.div>

      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white px-6 py-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hướng dẫn sử dụng</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#FEFCE8] rounded-2xl p-6">
              <div className="w-12 h-12 bg-[#FDC700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Tìm kiếm địa chỉ</h3>
              <p className="text-gray-600 text-sm">Nhập địa chỉ nhà của bạn vào ô tìm kiếm</p>
            </div>
            <div className="bg-[#FEFCE8] rounded-2xl p-6">
              <div className="w-12 h-12 bg-[#FDC700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Click trên bản đồ</h3>
              <p className="text-gray-600 text-sm">Click vào vị trí nhà của bạn trên bản đồ</p>
            </div>
            <div className="bg-[#FEFCE8] rounded-2xl p-6">
              <div className="w-12 h-12 bg-[#FDC700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Xem khoảng cách</h3>
              <p className="text-gray-600 text-sm">Khoảng cách sẽ được hiển thị tự động</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}