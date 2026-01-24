/**
 * FullscreenMapModal Usage Example
 *
 * This component demonstrates how to use the FullscreenMapModal component
 * in your React Native application.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FullscreenMapModal } from '@/components/shared';

const ExampleScreen = () => {
  const [mapVisible, setMapVisible] = useState(false);

  // Example marker data
  const markers = [
    {
      id: '1',
      name: '펫투유 강남점',
      lat: 37.4979,
      lng: 127.0276,
    },
    {
      id: '2',
      name: '펫투유 홍대점',
      lat: 37.5563,
      lng: 126.9223,
    },
    {
      id: '3',
      name: '펫투유 판교점',
      lat: 37.3938,
      lng: 127.1119,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Open Map Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setMapVisible(true)}
      >
        <Text style={styles.buttonText}>지도 열기</Text>
      </TouchableOpacity>

      {/* Fullscreen Map Modal */}
      <FullscreenMapModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        latitude={37.5563}
        longitude={126.9223}
        markers={markers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ExampleScreen;

/**
 * Props Reference:
 *
 * @param visible - boolean: Controls modal visibility
 * @param onClose - () => void: Callback when modal closes
 * @param latitude - number: Center latitude coordinate
 * @param longitude - number: Center longitude coordinate
 * @param markers - MapMarker[] (optional): Array of markers to display
 * @param appKey - string (optional): Kakao Maps API key (defaults to config)
 *
 * MapMarker Interface:
 * {
 *   id: string;      // Unique identifier
 *   name: string;    // Marker display name
 *   lat: number;     // Latitude
 *   lng: number;     // Longitude
 * }
 *
 * Features:
 * - Fullscreen modal presentation
 * - Kakao Maps integration with WebView
 * - Floating back button (top left)
 * - Floating current location button (bottom right)
 * - Smooth slide-in/slide-out animations
 * - Haptic feedback on button presses
 * - Safe area insets support
 * - Marker click event handling
 * - Zoom controls
 *
 * Customization:
 * - Button colors can be modified in styles.locationButton
 * - Animation timing can be adjusted in entering/exiting props
 * - Shadow intensity can be changed in styles
 */
