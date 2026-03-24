import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

type FadeInScreenProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  duration?: number;
  translateY?: number;
};

export default function FadeInScreen({
  children,
  style,
  duration = 280,
  translateY = 12,
}: FadeInScreenProps): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(new Animated.Value(translateY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(offsetY, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [duration, opacity, offsetY]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity,
          transform: [{ translateY: offsetY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});