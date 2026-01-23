import { useState, useCallback, useRef } from 'react';
import { MapMarker, MapCenter } from '../components/shared/KakaoMapView';

export interface UseKakaoMapReturn {
  markers: MapMarker[];
  center: MapCenter | undefined;
  isMapReady: boolean;
  addMarker: (marker: MapMarker) => void;
  addMarkers: (markers: MapMarker[]) => void;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
  setCenter: (center: MapCenter) => void;
  setMapReady: (ready: boolean) => void;
  getMarkerById: (id: string) => MapMarker | undefined;
  mapRef: React.MutableRefObject<any>;
}

export const useKakaoMap = (
  initialCenter?: MapCenter,
  initialMarkers?: MapMarker[]
): UseKakaoMapReturn => {
  const [markers, setMarkers] = useState<MapMarker[]>(initialMarkers || []);
  const [center, setCenter] = useState<MapCenter | undefined>(initialCenter);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  const addMarker = useCallback((marker: MapMarker) => {
    setMarkers((prev) => {
      // Check if marker already exists
      const existingIndex = prev.findIndex((m) => m.id === marker.id);
      if (existingIndex !== -1) {
        // Update existing marker
        const updated = [...prev];
        updated[existingIndex] = marker;
        return updated;
      }
      // Add new marker
      return [...prev, marker];
    });
  }, []);

  const addMarkers = useCallback((newMarkers: MapMarker[]) => {
    setMarkers((prev) => {
      const markerMap = new Map(prev.map((m) => [m.id, m]));
      
      // Update or add markers
      newMarkers.forEach((marker) => {
        markerMap.set(marker.id, marker);
      });
      
      return Array.from(markerMap.values());
    });
  }, []);

  const removeMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  const setCenterCallback = useCallback((newCenter: MapCenter) => {
    setCenter(newCenter);
  }, []);

  const setMapReadyCallback = useCallback((ready: boolean) => {
    setIsMapReady(ready);
  }, []);

  const getMarkerById = useCallback(
    (id: string): MapMarker | undefined => {
      return markers.find((m) => m.id === id);
    },
    [markers]
  );

  return {
    markers,
    center,
    isMapReady,
    addMarker,
    addMarkers,
    removeMarker,
    clearMarkers,
    setCenter: setCenterCallback,
    setMapReady: setMapReadyCallback,
    getMarkerById,
    mapRef,
  };
};

export default useKakaoMap;
