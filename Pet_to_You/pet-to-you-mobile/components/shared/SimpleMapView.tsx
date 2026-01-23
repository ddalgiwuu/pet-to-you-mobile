/**
 * Simple Map View using react-native-maps (Expo Go compatible)
 * Temporary replacement for KakaoMapView
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: string;
  extra?: any;
}

export interface MapCenter {
  lat: number;
  lng: number;
  level?: number;
}

interface SimpleMapViewProps {
  markers?: MapMarker[];
  center?: MapCenter;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapReady?: () => void;
  style?: any;
}

export const SimpleMapView: React.FC<SimpleMapViewProps> = ({
  markers = [],
  center,
  onMarkerPress,
  onMapReady,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 300);
    }
  }, [center]);

  useEffect(() => {
    if (onMapReady) {
      setTimeout(onMapReady, 500);
    }
  }, [onMapReady]);

  const initialRegion = center
    ? {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 37.5665,
        longitude: 126.9780,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style]}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.lat,
            longitude: marker.lng,
          }}
          title={marker.title}
          onPress={() => onMarkerPress?.(marker)}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default SimpleMapView;
