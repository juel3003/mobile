import * as Device from 'expo-device';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  // 1. Updated state variable for weather
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Fetch from Open-Meteo using specific coordinates
  const fetchWeather = async () => {
    try {
      // Coordinates set for Aguascalientes (Latitude 21.88, Longitude -102.28)
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=21.8823&longitude=-102.2826&current_weather=true';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      // The API returns the data inside a 'current_weather' object
      setWeatherData(data.current_weather);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };

  useEffect(() => {
    fetchWeather().finally(() => setIsLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeather().finally(() => setRefreshing(false));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ThemedView style={styles.heroSection}>
            <AnimatedIcon />
            <ThemedText type="title" style={styles.title}>
              Weather App
            </ThemedText>
            
            <ThemedView style={styles.apiCard}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#0a7ea4" />
              ) : weatherData ? (
                // 3. Display the parsed weather data
                <>
                  <ThemedText type="defaultSemiBold">Current Weather</ThemedText>
                  <ThemedText style={styles.temperature}>
                    {weatherData.temperature}°C
                  </ThemedText>
                  <ThemedText type="small">
                    Wind Speed: {weatherData.windspeed} km/h
                  </ThemedText>
                  <ThemedText type="small" style={styles.hintText}>
                    (Pull down to refresh)
                  </ThemedText>
                </>
              ) : (
                <ThemedText>Failed to load weather.</ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.stepContainer}>
            <HintRow
              title="Try editing"
              hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
            />
            <HintRow title="Dev tools" hint={getDevMenuHint()} />
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    width: '100%',
  },
  title: {
    textAlign: 'center',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    marginTop: 20,
  },
  apiCard: {
    marginTop: 16,
    padding: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    width: '100%',
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#0a7ea4',
  },
  hintText: {
    marginTop: 12,
    opacity: 0.6,
  }
});