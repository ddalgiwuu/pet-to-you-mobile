import React, { useRef, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { colors, shadows, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface FullscreenMapModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  markers?: MapMarker[];
  appKey?: string;
}

const FullscreenMapModal: React.FC<FullscreenMapModalProps> = ({
  visible,
  onClose,
  latitude,
  longitude,
  markers = [],
  appKey = config.kakaoMapsAppKey,
}) => {
  const webViewRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const generateMapHTML = useCallback(() => {
    const markersJSON = JSON.stringify(markers);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Kakao Map</title>
    <script type="text/javascript" src="https://t1.daumcdn.net/mapjsapi/js/main/4.4.21/kakao.js"></script>
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}"></script>
    <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        function initMap() {
            if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined' || typeof kakao.maps.LatLng === 'undefined') {
                setTimeout(initMap, 100);
                return;
            }

            try {
                const container = document.getElementById('map');
                const options = {
                    center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                    level: 3
                };

                const map = new kakao.maps.Map(container, options);
                const markerArray = [];

                // Add zoom control
                const zoomControl = new kakao.maps.ZoomControl();
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                // Add markers
                const markerData = ${markersJSON};
                markerData.forEach(function(data) {
                    const marker = new kakao.maps.Marker({
                        position: new kakao.maps.LatLng(data.lat, data.lng),
                        title: data.name
                    });
                    marker.setMap(map);
                    markerArray.push(marker);

                    kakao.maps.event.addListener(marker, 'click', function() {
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'markerClick',
                                marker: data
                            }));
                        }
                    });
                });

                // Store map instance for message handling
                window.kakaoMapInstance = map;
                window.kakaoMarkers = markerArray;

                // Message handlers for React Native communication
                window.moveToLocation = function(lat, lng) {
                    const moveLatLon = new kakao.maps.LatLng(lat, lng);
                    map.setCenter(moveLatLon);
                };

                window.addMarkers = function(newMarkers) {
                    markerArray.forEach(m => m.setMap(null));
                    markerArray.length = 0;

                    newMarkers.forEach(function(data) {
                        const marker = new kakao.maps.Marker({
                            position: new kakao.maps.LatLng(data.lat, data.lng),
                            title: data.name
                        });
                        marker.setMap(map);
                        markerArray.push(marker);
                    });
                };

                // Listen for messages from React Native
                document.addEventListener('message', function(e) {
                    const data = JSON.parse(e.data);
                    if (data.type === 'moveToLocation') {
                        window.moveToLocation(data.lat, data.lng);
                    } else if (data.type === 'addMarkers') {
                        window.addMarkers(data.markers);
                    }
                });

                window.addEventListener('message', function(e) {
                    const data = JSON.parse(e.data);
                    if (data.type === 'moveToLocation') {
                        window.moveToLocation(data.lat, data.lng);
                    } else if (data.type === 'addMarkers') {
                        window.addMarkers(data.markers);
                    }
                });

                // Notify React Native
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapReady'
                    }));
                }
            } catch (error) {
                console.error('Map initialization error:', error);
            }
        }

        // Start initialization
        initMap();
    </script>
</body>
</html>`;
  }, [latitude, longitude, markers, appKey]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const handleCurrentLocation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'moveToLocation',
          lat: latitude,
          lng: longitude,
        })
      );
    }
  }, [latitude, longitude]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'markerClick') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Marker clicked:', data.marker);
      } else if (data.type === 'mapReady') {
        console.log('✅ Kakao Map ready');
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  }, []);

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const locationButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.View
        style={styles.container}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <Animated.View
          style={styles.mapContainer}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <WebView
            ref={webViewRef}
            source={{
              html: generateMapHTML(),
              baseUrl: 'https://localhost'
            }}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            mixedContentMode="always"
          />

          {/* Floating Back Button */}
          <Animated.View
            style={[styles.backButton, { top: insets.top + 16 }, backButtonStyle]}
          >
            <TouchableOpacity
              onPress={handleClose}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
              style={styles.buttonTouchable}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Floating Current Location Button */}
          <Animated.View
            style={[styles.locationButton, { bottom: insets.bottom + 24 }, locationButtonStyle]}
          >
            <TouchableOpacity
              onPress={handleCurrentLocation}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
              style={styles.buttonTouchable}
            >
              <Ionicons name="locate" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...shadows.medium,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4285F4',
    ...shadows.large,
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
});

export default FullscreenMapModal;
