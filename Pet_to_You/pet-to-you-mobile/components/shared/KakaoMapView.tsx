import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

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

interface KakaoMapViewProps {
  markers?: MapMarker[];
  center?: MapCenter;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapReady?: () => void;
  onMapIdle?: (center: { lat: number; lng: number }, level: number) => void;
  style?: any;
  kakaoAppKey: string;
}

export const KakaoMapView: React.FC<KakaoMapViewProps> = ({
  markers = [],
  center,
  onMarkerPress,
  onMapReady,
  onMapIdle,
  style,
  kakaoAppKey,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load HTML template
  useEffect(() => {
    loadHtmlTemplate();
  }, [kakaoAppKey]);

  const loadHtmlTemplate = async () => {
    try {
      // Load the HTML file from assets
      const asset = Asset.fromModule(require('../../assets/kakao-map.html'));
      await asset.downloadAsync();
      
      if (asset.localUri) {
        const htmlString = await FileSystem.readAsStringAsync(asset.localUri);
        // Replace the API key placeholder
        const htmlWithKey = htmlString.replace('__KAKAO_APP_KEY__', kakaoAppKey);
        setHtmlContent(htmlWithKey);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading HTML template:', error);
      Alert.alert('Error', 'Failed to load map. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'mapReady':
            setIsMapReady(true);
            onMapReady?.();
            
            // Set initial center if provided
            if (center) {
              executeMapFunction('setCenter', [center.lat, center.lng, center.level]);
            }
            
            // Add initial markers if provided
            if (markers.length > 0) {
              executeMapFunction('addMarkers', [markers]);
            }
            break;

          case 'markerClick':
            const clickedMarker: MapMarker = {
              id: data.id,
              lat: data.lat,
              lng: data.lng,
              title: data.title,
              type: data.markerType,
              extra: data.extra,
            };
            onMarkerPress?.(clickedMarker);
            break;

          case 'idle':
            onMapIdle?.(data.center, data.level);
            break;

          case 'error':
            console.error('Map error:', data.message);
            break;

          default:
            // Handle other message types
            break;
        }
      } catch (error) {
        console.error('Error parsing WebView message:', error);
      }
    },
    [center, markers, onMarkerPress, onMapReady, onMapIdle]
  );

  // Execute JavaScript function in WebView
  const executeMapFunction = useCallback(
    (functionName: string, args: any[] = []) => {
      if (!isMapReady || !webViewRef.current) return;

      const argsString = args.map(arg => JSON.stringify(arg)).join(', ');
      const script = `window.${functionName}(${argsString}); true;`;

      webViewRef.current.injectJavaScript(script);
    },
    [isMapReady]
  );

  // Update markers when they change
  useEffect(() => {
    if (isMapReady && markers.length > 0) {
      // Clear existing markers and add new ones
      executeMapFunction('clearMarkers');
      executeMapFunction('addMarkers', [markers]);
    }
  }, [markers, isMapReady, executeMapFunction]);

  // Update center when it changes
  useEffect(() => {
    if (isMapReady && center) {
      executeMapFunction('setCenter', [center.lat, center.lng, center.level]);
    }
  }, [center, isMapReady, executeMapFunction]);

  // Map methods are controlled via props (markers, center)
  // For imperative control, use the executeMapFunction directly

  if (isLoading || !htmlContent) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#42A5F5" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
      />
      {!isMapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#42A5F5" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KakaoMapView;
