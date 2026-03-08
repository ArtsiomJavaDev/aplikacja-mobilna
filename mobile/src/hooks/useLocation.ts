import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

interface LocationResult {
  latitude: number;
  longitude: number;
  status: LocationStatus;
  message?: string;
}

/** Hook do pobierania lokalizacji z obsługą uprawnień (w tym odmowy). */
export function useLocation(): {
  result: LocationResult | null;
  status: LocationStatus;
  requestLocation: () => Promise<void>;
} {
  const [result, setResult] = useState<LocationResult | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const requestLocation = useCallback(async () => {
    setStatus('loading');
    setResult(null);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        setResult({
          latitude: 0,
          longitude: 0,
          status: 'denied',
          message: 'Odmowa dostępu do lokalizacji',
        });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setStatus('granted');
      setResult({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        status: 'granted',
      });
    } catch (e) {
      setStatus('error');
      setResult({
        latitude: 0,
        longitude: 0,
        status: 'error',
        message: e instanceof Error ? e.message : 'Błąd lokalizacji',
      });
    }
  }, []);

  return { result, status, requestLocation };
}
