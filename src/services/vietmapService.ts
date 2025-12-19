export interface VietMapGeocodeResult {
  ref_id: string;
  distance: number;
  address: string;
  name: string;
  display: string;
  boundaries: Array<{
    type: number;
    id: number;
    name: string;
    prefix: string;
    full_name: string;
  }>;
  categories: string[];
  entry_points: Array<{
    ref_id: string;
    name: string;
  }>;
  data_old?: unknown;
  data_new?: unknown;
}

export interface VietMapAutocompleteResult {
  ref_id: string;
  distance: number;
  address: string;
  name: string;
  display: string;
  boundaries: Array<{
    type: number;
    id: number;
    name: string;
    prefix: string;
    full_name: string;
  }>;
  categories: string[];
  entry_points: Array<{
    ref_id: string;
    name: string;
  }>;
  data_old?: unknown;
  data_new?: unknown;
}

export interface VietMapRouteResult {
  paths: Array<{
    distance: number;
    time: number;
    points: string;
    instructions: Array<{
      distance: number;
      time: number;
      text: string;
      street_name: string;
    }>;
  }>;
}

class VietMapService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY || '';
  }

  async geocode(query: string, location?: { lat: number; lng: number }): Promise<VietMapGeocodeResult[]> {
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('VietMap API key not configured, using mock data for testing');
      return this.getMockGeocodeResults(query);
    }

    const params = new URLSearchParams({
      text: query
    });

    if (location) {
      params.append('focus', `${location.lat},${location.lng}`);
    }

    const response = await fetch(`/api/vietmap/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('VietMap Geocode API Response:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          ref_id: typedItem.ref_id as string || '',
          distance: typedItem.distance as number || 0,
          address: typedItem.address as string || '',
          name: typedItem.name as string || '',
          display: typedItem.display as string || '',
          boundaries: (typedItem.boundaries as Array<{
            type: number;
            id: number;
            name: string;
            prefix: string;
            full_name: string;
          }>) || [],
          categories: typedItem.categories as string[] || [],
          entry_points: (typedItem.entry_points as Array<{
            ref_id: string;
            name: string;
          }>) || [],
          data_old: typedItem.data_old || null,
          data_new: typedItem.data_new || null
        };
      });
    }

    return [];
  }

  async getPlaceDetails(ref_id: string, signal?: AbortSignal): Promise<{ lat: number; lng: number } | null> {
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('VietMap API key not configured, using mock coordinates');
      return {
        lat: 16.0544 + (Math.random() - 0.5) * 0.1,
        lng: 108.2022 + (Math.random() - 0.5) * 0.1
      };
    }

    try {
      const params = new URLSearchParams({
        ref_id: ref_id
      });

      const response = await fetch(`/api/vietmap/place/details?${params}`, {
        signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          console.warn(`Place details API returned ${response.status} for ref_id: ${ref_id}`);
          return null;
        }
        throw new Error(`Place details API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data === null) {
        return null;
      }
      
      console.log('VietMap Place Details API Response:', data);
      
      if (data && typeof data === 'object') {
        const coords = data.coordinates || data.coord || data.location || data.geometry?.location || 
                      (data.geometry && data.geometry.coordinates ? 
                        { lng: data.geometry.coordinates[0], lat: data.geometry.coordinates[1] } : null);
        
        if (coords && (coords.lat !== undefined || coords.latitude !== undefined) && 
            (coords.lng !== undefined || coords.longitude !== undefined)) {
          return {
            lat: coords.lat ?? coords.latitude,
            lng: coords.lng ?? coords.longitude
          };
        }
      }

      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error getting place details. This might be due to network issues or API endpoint problems.');
        return null;
      }
      
      console.error('Error getting place details:', error);
      return null;
    }
  }

  async geocodeWithNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'vn' 
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'EduBusWeb/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Nominatim API Response:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      }

      return null;
    } catch (error) {
      console.error('Error with Nominatim geocoding:', error);
      return null;
    }
  }

  async autocomplete(query: string, location?: { lat: number; lng: number }, signal?: AbortSignal): Promise<VietMapAutocompleteResult[]> {
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('VietMap API key not configured, using mock data for testing');
      return this.getMockAutocompleteResults(query);
    }

    const params = new URLSearchParams({
      text: query
    });

    if (location) {
      params.append('focus', `${location.lat},${location.lng}`);
    }

    const response = await fetch(`/api/vietmap/autocomplete?${params}`, {
      signal
    });
    
    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          ref_id: typedItem.ref_id as string || '',
          distance: typedItem.distance as number || 0,
          address: typedItem.address as string || '',
          name: typedItem.name as string || '',
          display: typedItem.display as string || '',
          boundaries: (typedItem.boundaries as Array<{
            type: number;
            id: number;
            name: string;
            prefix: string;
            full_name: string;
          }>) || [],
          categories: typedItem.categories as string[] || [],
          entry_points: (typedItem.entry_points as Array<{
            ref_id: string;
            name: string;
          }>) || [],
          data_old: typedItem.data_old || null,
          data_new: typedItem.data_new || null
        };
      });
    }

    return [];
  }

  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    vehicle: string = 'car',
    signal?: AbortSignal
  ): Promise<VietMapRouteResult> {
    console.log('VietMap getRoute called with:', { origin, destination, vehicle });
    
    if (!this.apiKey) {
      console.error('VietMap API key not configured');
      throw new Error('VietMap API key not configured');
    }
    
    console.log('API Key available:', this.apiKey.substring(0, 10) + '...');

    try {
      const baseUrl = 'https://maps.vietmap.vn/api/route';
      const params = new URLSearchParams({
        'api-version': '1.1',
        apikey: this.apiKey,
        points_encoded: 'true',
        vehicle: vehicle
      });
      
      params.append('point', `${origin.lat},${origin.lng}`);
      params.append('point', `${destination.lat},${destination.lng}`);

      const url = `${baseUrl}?${params}`;
      console.log('VietMap Route API URL:', url);
      
      const response = await fetch(url, { signal });
      
      if (!response.ok) {
        console.error('VietMap Route API error:', response.status, response.statusText);
        throw new Error(`Route API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('VietMap Route API Response:', data);
      
      if (data.code !== 'OK') {
        console.error('VietMap Route API error:', data.messages || 'Unknown error');
        throw new Error(`Route API error: ${data.messages || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('VietMap Route request was aborted');
        return { paths: [] };
      }

      throw error;
    }
  }

  async reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string> {
    if (!this.apiKey) {
      throw new Error('VietMap API key not configured');
    }

    const params = new URLSearchParams({
      apikey: this.apiKey,
      lat: lat.toString(),
      lng: lng.toString()
    });

    const response = await fetch(`https://maps.vietmap.vn/api/reverse/v3?${params}`, {
      signal
    });
    
    if (!response.ok) {
      throw new Error(`Reverse Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.label || data.features[0].properties.name || '';
    }

    return '';
  }

  private getMockAutocompleteResults(query: string): VietMapAutocompleteResult[] {
    const mockResults: VietMapAutocompleteResult[] = [
      {
        ref_id: 'mock_1',
        distance: Math.random() * 5,
        address: 'Phường Hải Châu 1,Thành Phố Đà Nẵng',
        name: `${query} Street`,
        display: `${query} Street Phường Hải Châu 1,Thành Phố Đà Nẵng`,
        boundaries: [
          {
            type: 2,
            id: 1001,
            name: 'Hải Châu 1',
            prefix: 'Phường',
            full_name: 'Phường Hải Châu 1'
          },
          {
            type: 0,
            id: 1,
            name: 'Đà Nẵng',
            prefix: 'Thành Phố',
            full_name: 'Thành Phố Đà Nẵng'
          }
        ],
        categories: [],
        entry_points: []
      },
      {
        ref_id: 'mock_2',
        distance: Math.random() * 5,
        address: 'Phường Thanh Khê Tây,Thành Phố Đà Nẵng',
        name: `${query} Avenue`,
        display: `${query} Avenue Phường Thanh Khê Tây,Thành Phố Đà Nẵng`,
        boundaries: [
          {
            type: 2,
            id: 1002,
            name: 'Thanh Khê Tây',
            prefix: 'Phường',
            full_name: 'Phường Thanh Khê Tây'
          },
          {
            type: 0,
            id: 1,
            name: 'Đà Nẵng',
            prefix: 'Thành Phố',
            full_name: 'Thành Phố Đà Nẵng'
          }
        ],
        categories: [],
        entry_points: []
      },
      {
        ref_id: 'mock_3',
        distance: Math.random() * 5,
        address: 'Phường Hòa Khánh Nam,Thành Phố Đà Nẵng',
        name: `${query} Boulevard`,
        display: `${query} Boulevard Phường Hòa Khánh Nam,Thành Phố Đà Nẵng`,
        boundaries: [
          {
            type: 2,
            id: 1003,
            name: 'Hòa Khánh Nam',
            prefix: 'Phường',
            full_name: 'Phường Hòa Khánh Nam'
          },
          {
            type: 0,
            id: 1,
            name: 'Đà Nẵng',
            prefix: 'Thành Phố',
            full_name: 'Thành Phố Đà Nẵng'
          }
        ],
        categories: [],
        entry_points: []
      }
    ];

    return mockResults.filter(result => 
      result.display.toLowerCase().includes(query.toLowerCase())
    );
  }

  private getMockGeocodeResults(query: string): VietMapGeocodeResult[] {
    const mockResults: VietMapGeocodeResult[] = [
      {
        ref_id: 'mock_1',
        distance: Math.random() * 5,
        address: 'Phường Hải Châu 1,Thành Phố Đà Nẵng',
        name: `${query} Street`,
        display: `${query} Street Phường Hải Châu 1,Thành Phố Đà Nẵng`,
        boundaries: [
          {
            type: 2,
            id: 1001,
            name: 'Hải Châu 1',
            prefix: 'Phường',
            full_name: 'Phường Hải Châu 1'
          },
          {
            type: 0,
            id: 1,
            name: 'Đà Nẵng',
            prefix: 'Thành Phố',
            full_name: 'Thành Phố Đà Nẵng'
          }
        ],
        categories: [],
        entry_points: []
      },
      {
        ref_id: 'mock_2',
        distance: Math.random() * 5,
        address: 'Phường Thanh Khê Tây,Thành Phố Đà Nẵng',
        name: `${query} Avenue`,
        display: `${query} Avenue Phường Thanh Khê Tây,Thành Phố Đà Nẵng`,
        boundaries: [
          {
            type: 2,
            id: 1002,
            name: 'Thanh Khê Tây',
            prefix: 'Phường',
            full_name: 'Phường Thanh Khê Tây'
          },
          {
            type: 0,
            id: 1,
            name: 'Đà Nẵng',
            prefix: 'Thành Phố',
            full_name: 'Thành Phố Đà Nẵng'
          }
        ],
        categories: [],
        entry_points: []
      },
      {
        ref_id: 'mock_3',
        distance: Math.random() * 5,
        address: 'Phường Hòa Khánh Nam,Thành Phố Đà Nẵng',
        name: `${query} Boulevard`,
        display: `${query} Boulevard Phường Hòa Khánh Nam,Thành Phố Đà Nẵng`,
        boundaries: [
          {
            type: 2,
            id: 1003,
            name: 'Hòa Khánh Nam',
            prefix: 'Phường',
            full_name: 'Phường Hòa Khánh Nam'
          },
          {
            type: 0,
            id: 1,
            name: 'Đà Nẵng',
            prefix: 'Thành Phố',
            full_name: 'Thành Phố Đà Nẵng'
          }
        ],
        categories: [],
        entry_points: []
      }
    ];

    return mockResults.filter(result => 
      result.display.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const vietmapService = new VietMapService();
